const express = require('express');
const fs = require('fs').promises;

const app = express();
app.use(express.json());
const HTTP_OK_STATUS = 200;
const PORT = process.env.PORT || '3001';
const DB_PATH = './src/talker.json';

// Proximo ID
let nextId = 6;

// Leitura do arquivo talker.json
const readAll = async () => {
  const data = await fs.readFile(DB_PATH, 'utf-8');
  return JSON.parse(data);
};

// Leitura de um palestrante pelo ID
const findOne = async (id) => {
  const all = await readAll();
  return all.find((t) => t.id === id);
};

// Gera um ID aleatorio
const randomId = (length) =>
  Math.random()
    .toString(36)
    .substring(2, length + 2);

// Valida se for numero inteiro
const validateInteger = (num) => {
  const type = num === Number(num.toFixed(0));
  const gap = num > 0 && num < 6;
  // console.log(type, num, num.toFixed(0));
  return type && gap;
};

// Middleweres
// REQ 4:
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

// REQ 4:
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

// REQ 5:
const validateAuthorization = (req, res, next) => {
  const token = req.header('authorization');
  if (!token) return res.status(401).json({ message: 'Token não encontrado' });
  const validateToken = token.length === 16 && typeof token === 'string';
  if (!validateToken) return res.status(401).json({ message: 'Token inválido' });
  return next();
};

// REQ 5:
const validateName = (req, res, next) => {
  const { name } = req.body;
  if (!name) return res.status(400).json({ message: 'O campo "name" é obrigatório' });
  if (name.length < 3) {
    return res.status(400).json({ message: 'O "name" deve ter pelo menos 3 caracteres' });
  }
  return next();
};

// REQ 5:
const validateAge = (req, res, next) => {
  const { age } = req.body;
  if (!age) return res.status(400).json({ message: 'O campo "age" é obrigatório' });
  if (typeof age !== 'number' || +age < 18 || +age !== +age.toFixed(0)) {
    return res.status(400).json({ 
      message: 'O campo "age" deve ser um número inteiro igual ou maior que 18',
    });
  }
  return next();
};

// REQ 5:
const validateTalk = (req, res, next) => {
  const { talk } = req.body;
  if (!talk) return res.status(400).json({ message: 'O campo "talk" é obrigatório' });
  return next();
};

// REQ 5:
const validateWatchedAt = (req, res, next) => {
  const { watchedAt } = req.body.talk;
  if (!watchedAt) return res.status(400).json({ message: 'O campo "watchedAt" é obrigatório' });
  const checkDateFormat = /^([0-2][0-9]|(3)[0-1])(\/)(((0)[0-9])|((1)[0-2]))(\/)\d{4}$/i
  .test(watchedAt);
  if (!checkDateFormat) {
    return res.status(400).json({ 
      message: 'O campo "watchedAt" deve ter o formato "dd/mm/aaaa"',
    });
  }
  return next();
};

// REQ 5:
const validateRate = (req, res, next) => {
  const { rate } = req.body.talk;
  if (rate === undefined) return res.status(400).json({ message: 'O campo "rate" é obrigatório' });
  const checkInteger = validateInteger(rate);
  if (!checkInteger) {
    return res.status(400).json({ 
      message: 'O campo "rate" deve ser um número inteiro entre 1 e 5',
    });
  }
  return next();
};

// REQ 6:
const validateId = async (req, res, next) => {
  const id = Number(req.params.id);
  const talker = await findOne(id);

  if (!talker) return res.status(404).json({ message: 'Pessoa palestrante não encontrada' });

  return next();
};

// não remova esse endpoint, e para o avaliador funcionar
app.get('/', (_request, response) => {
  response.status(HTTP_OK_STATUS).send();
});

// REQ 1:
app.get('/talker', async (req, res) => {
  // const data = await fs.readFile('./src/talker.json', 'utf-8');
  // const talkersList = JSON.parse(data);
  const talkersList = await readAll();
  // console.log(data);
  // console.log(talkersList);
  res.status(HTTP_OK_STATUS).json(talkersList);
});

// REQ 8:
app.get('/talker/search', validateAuthorization, async (req, res) => {
  const { q } = req.query;
  console.log(q);
  const data = await readAll();
  if (!q) return res.status(HTTP_OK_STATUS).json(data);
  const queryData = data.filter((d) => d.name.includes(q));
  if (!queryData) return res.status(HTTP_OK_STATUS).json([]);
  return res.status(HTTP_OK_STATUS).json(queryData);
});

// REQ 2:
app.get('/talker/:id', async (req, res) => {
  const { id } = req.params;
  const data = await fs.readFile(DB_PATH, 'utf-8');
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
  res.status(HTTP_OK_STATUS).json({ token });
});

// REQ 5:
app.post('/talker', 
  validateAuthorization, 
  validateName, 
  validateAge, 
  validateTalk, 
  validateWatchedAt, 
  validateRate, 
  async (req, res) => {
    const data = await readAll();
    const newTalker = { id: nextId, ...req.body };
    data.push(newTalker);
    nextId += 1;
    await fs.writeFile(DB_PATH, JSON.stringify(data));
    return res.status(201).json(newTalker);
  });

// REQ 6:
app.put('/talker/:id', 
  validateAuthorization, 
  validateName, 
  validateAge, 
  validateTalk, 
  validateWatchedAt, 
  validateRate,
  validateId,
 async (req, res) => {
  const id = Number(req.params.id);
  const data = await readAll();
  const talker = data.find((t) => t.id === id);
  const index = data.indexOf(talker);
  const updatedTalker = { id, ...req.body };
  data.splice(index, 1, updatedTalker);
  await fs.writeFile(DB_PATH, JSON.stringify(data));
  return res.status(HTTP_OK_STATUS).json(updatedTalker);
 });

// REQ 7:
app.delete('/talker/:id', validateAuthorization, validateId, async (req, res) => {
  const id = Number(req.params.id);
  const data = await readAll();
  const newData = data.filter((d) => d.id !== id);
  await fs.writeFile(DB_PATH, JSON.stringify(newData));
  return res.sendStatus(204);
});

app.listen(PORT, () => {
  console.log(`Online on port ${PORT}`);
});
