const express = require('express');
const bodyParser = require('body-parser');
const session = require('express-session');
const fs = require('fs');
const path = require('path');
const app = express();
const multer = require('multer');

app.set('view engine', 'ejs');
app.set('views', path.join(__dirname, 'views'));

const PORT = process.env.PORT || 3000;
const DATA_FILE = path.join(__dirname, 'data.toml');
let ADMIN_PASSWORD = 'sua_senha'; // Senha padrão

app.use(bodyParser.urlencoded({
   extended: true
}));
app.use(express.static('public'));

app.use(session({
   secret: 'sua_chave_secreta', // Chave de sessão
   resave: false,
   saveUninitialized: true
}));

app.post('/submit-feedback', (req, res) => {
   const feedback = req.body.feedback;

   let data = [];
   if (fs.existsSync(DATA_FILE)) {
      const rawData = fs.readFileSync(DATA_FILE, 'utf-8');
      data = parseTOMLLike(rawData);
   }

   data.push({
      content: feedback
   });

   const string = formatTOMLLike(data);
   fs.writeFileSync(DATA_FILE, string);

   res.redirect('/');
});

app.get('/admin/login', (req, res) => {
   res.render('admin-login');
});

app.post('/admin', (req, res) => {
   const password = req.body.password;

   if (password === ADMIN_PASSWORD) {
      req.session.authenticated = true;
      res.redirect('/admin');
   } else {
      res.send('Login negado.');
   }
});

app.post('/logout', (req, res) => {
   req.session.destroy((err) => {
      if (err) {
         console.error('Erro finalizando a sessão: ', err);
      }
      res.redirect('/admin');
   });
});

app.use((req, res, next) => {
   if (req.session && req.session.authenticated) {
      res.locals.authenticated = true;
   } else {
      res.locals.authenticated = false;
   }
   next();
});

app.get('/admin', (req, res) => {
   if (req.session && req.session.authenticated) {
      let feedbacks = [];
      if (fs.existsSync(DATA_FILE)) {
         const rawData = fs.readFileSync(DATA_FILE, 'utf-8');
         feedbacks = parseTOMLLike(rawData);
      }
      res.render('admin', {
         feedbacks
      });
   } else {
      res.send('Não autorizado.\n Caso isso esteja aparecendo após o logout, significa que você finalizou a sua sessão.');
   }
});

function formatTOMLLike(data) {
   let string = '';

   data.forEach(item => {
      if (item.content) {
         string += `sugestão : "${item.content}"\n\n`;
      }
   });

   return string;
}

function parseTOMLLike(data) {
   const lines = data.split('\n');
   let feedbacks = [];
   let feedback = {};

   lines.forEach(line => {
      if (line.startsWith('sugestão : ')) {
         const content = line.replace('sugestão : "', '').replace('"', '');
         if (content && content !== 'undefined') {
            feedback.content = content;
         }
      } else if (line === '' && feedback.content) {
         feedbacks.push(feedback);
         feedback = {};
      }
   });

   return feedbacks;
}

app.post('/delete-feedback', (req, res) => {
   if (req.session && req.session.authenticated) {
      const index = parseInt(req.body.index);

      if (!isNaN(index) && index >= 0) {
         let feedbacks = [];
         if (fs.existsSync(DATA_FILE)) {
            const rawData = fs.readFileSync(DATA_FILE, 'utf-8');
            feedbacks = parseTOMLLike(rawData);
         }

         if (index < feedbacks.length) {
            feedbacks.splice(index, 1);
            const string = formatTOMLLike(feedbacks);
            fs.writeFileSync(DATA_FILE, string);
         }
      }

      res.redirect('/admin');
   };
});

app.get('/download-suggestions', (req, res) => {
   if (req.session && req.session.authenticated) {
      if (fs.existsSync(DATA_FILE)) {
         const rawData = fs.readFileSync(DATA_FILE, 'utf-8');
         const feedbacks = parseTOMLLike(rawData);

         const suggestionsText = feedbacks.map((feedback, index) => {
            return `Sugestão ${index + 1}: ${feedback.content}`;
         }).join('\n');

         res.setHeader('Content-Disposition', 'attachment; filename="sugestões.txt"');
         res.setHeader('Content-Type', 'text/plain');

         res.send(suggestionsText);
      } else {
         res.status(404).send('Arquivo de dados não encontrado.');
      }
   } else {
      res.status(401).send('Não autorizado. Por favor faça log in para o download de sugestões.');
   }
});

const storage = multer.diskStorage({
   destination: 'public',
   filename: (req, file, callback) => {
      callback(null, 'logo.png');
   }
});

const upload = multer({ storage });

app.get('/config', (req, res) => {
   if (req.session && req.session.authenticated) {
      res.render('config');
   } else {
      res.send('Não autorizado.\n Caso isso esteja aparecendo após o logout, significa que você finalizou a sua sessão.');
   }
});

app.post('/configure', upload.single('logo'), (req, res) => {
   if (req.session && req.session.authenticated) {
      const newPassword = req.body.password;

      ADMIN_PASSWORD = newPassword;

      res.redirect('/admin');
   }
});

app.listen(PORT, () => {
   console.log(`Server is running on port ${PORT}`);
});