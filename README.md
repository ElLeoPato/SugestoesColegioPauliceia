# App de Sugestões em Express.js
_This repository will not be translated into other languages_

Este é um projeto de aplicativo de feedback simples usando o framework Express.js. O aplicativo permite que os usuários enviem sugestões, que podem ser futuramente vistas no painel Admin.

## Instalação
```
git clone https://github.com/ElLowLeo/SugestoesColegioPauliceia.git
cd SugestoesColegioPauliceia
npm install
npm start
```
O servidor começará a rodar na porta indicada na sessão do terminal.
## Bugs conhecidos
- Possível exploração do client-side para spam.

## TODO:
- [ ] Testes
- [ ] Corrigir os bugs conhecidos

## Utilização
### URL's
- / : Página principal, para adicionar sugestões
- /admin/login : Página de login, senha padrão = "sua_senha" (sem as aspas)
- /admin : Página para gerenciar as sugestões enviadas, requer login, é possível fazer download de todas as sugestões em txt. 
- /config : Página para configuração, requer login prévio, acesse essa página para mudar a senha padrão.
### Após levantar o servidor
Você deve primeiro fazer login para que seja possível alterar a senha. Não mantenha a senha padrão, preserve a sua segurança.
### Estou com problemas
Crie uma [issue](https://github.com/ElLowLeo/SugestoesColegioPauliceia/issues), quando puder irei te ajudar.

# LICENÇA:
Código distribuido na licença [ISC](https://github.com/ElLowLeo/SugestoesColegioPauliceia/blob/main/LICENSE)
