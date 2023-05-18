const express = require('express');
const fs = require('fs').promises;

const app = express();
app.use(express.json());

const HTTP_OK_STATUS = 200;
const PORT = process.env.PORT || '3001';

// Gera um ID aleatorio
const randomId = (length) =>
  Math.random()
    .toString(36)
    .substring(2, length + 2);

const validateEmail = (req, res, next) => {
  const { email } = req.body;
  const emailRegex = /^[\w+.]+@\w+\.\w{2,}(?:\.\w{2})?$/.test(email);
  // console.log(emailRegex);
  if (!email) {
    return res.status(400).json({
      message: 'O campo "email" é obrigatório',
    });
  }
  if (!emailRegex) {
    return res.status(400).json({
      message: 'O "email" deve ter o formato "email@email.com"',
    });
  }
  return next();
};

const validatePassword = (req, res, next) => {
  const { password } = req.body;
  if (!password) {
    return res.status(400).json({
      message: 'O campo "password" é obrigatório',
    });
  }
  const checkLength = password.length > 5;
  // console.log(checkLength, password);
  if (password && !checkLength) {
    return res.status(400).json({
      message: 'O "password" deve ter pelo menos 6 caracteres',
    });
  }
  return next();
};

// não remova esse endpoint, e para o avaliador funcionar
app.get('/', (_request, response) => {
  response.status(HTTP_OK_STATUS).send();
});

// REQ 1:
app.get('/talker', async (req, res) => {
  const data = await fs.readFile('./src/talker.json', 'utf-8');
  const talkersList = JSON.parse(data);
  // console.log(data);
  // console.log(talkersList);
  res.status(HTTP_OK_STATUS).json(talkersList);
});

// REQ 2:
app.get('/talker/:id', async (req, res) => {
  const { id } = req.params;
  const data = await fs.readFile('./src/talker.json', 'utf-8');
  const talkersList = JSON.parse(data);
  const [filter] = talkersList.filter((t) => t.id === +id);
  // console.log(talkersList);
  // console.log(filter);
  if (filter) {
    res.status(HTTP_OK_STATUS).json(filter);
  } else {
    res.status(404).json({
      message: 'Pessoa palestrante não encontrada',
    });
  }
});

// REQ 3:
app.post('/login', validateEmail, validatePassword, async (req, res) => {
  // const { email, password } = req.body;
  const token = randomId(8) + randomId(8);
  res.status(200).json({ token });
});

app.listen(PORT, () => {
  console.log(`Online on port ${PORT}`);
});
