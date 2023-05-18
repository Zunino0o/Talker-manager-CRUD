const express = require('express');
const fs = require('fs').promises;

const app = express();
app.use(express.json());

const HTTP_OK_STATUS = 200;
const PORT = process.env.PORT || '3001';

// Proximo ID
let nextId = 6;

// Leitura do arquivo talker.json
const readAll = async () => {
  const data = await fs.readFile('./src/talker.json', 'utf-8');
  return JSON.parse(data);
};
// Gera um ID aleatorio
const randomId = (length) =>
  Math.random()
    .toString(36)
    .substring(2, length + 2);

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
// const validateKeys = (req, res, next) => {
//   const reqProps = ['name', 'age', 'talk'];
//   const reqTalkProps = ['watchedAt', 'rate'];
//   if (reqProps.every((p) => p in req.body)) {
//     if (reqTalkProps.every((rp) => rp in req.body.talk)) {
//       next();
//     } else {
//       res.sendStatus(400);
//     }
//   } else {
//     res.sendStatus(400);
//   }
// };

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

const validateAge = (req, res, next) => {
  const { age } = req.body;
  if (!age) return res.status(400).json({ message: 'O campo "age" é obrigatório' });
  if (typeof age !== 'number' || +age < 18) {
    return res.status(400).json({ 
      message: 'O campo "age" deve ser um número inteiro igual ou maior que 18',
    });
  }
  return next();
};

const validateTalk = (req, res, next) => {
  const { talk } = req.body;
  if (!talk) return res.status(400).json({ message: 'O campo "talk" é obrigatório' });
  return next();
};

const validateWatchedAt = (req, res, next) => {
  const { watchedAt } = req.body.talk;
  if (!watchedAt) return res.status(400).json({ message: 'O campo "watchedAt" é obrigatório' });
  const checkDateFormat = /^([0-2][0-9]|(3)[0-1])(\/)(((0)[0-9])|((1)[0-2]))(\/)\d{4}$/i;
  if (!checkDateFormat) {
    return res.status(400).json({ 
      message: 'O campo "watchedAt" deve ter o formato "dd/mm/aaaa"',
    });
  }
  return next();
};

const validateRate = (req, res, next) => {
  const { rate } = req.body.talk;
  if (!rate) return res.status(400).json({ message: 'O campo "rate" é obrigatório' });
  const checkRate = rate >= 1 && rate <= 5;
  if (!checkRate || rate === 0) {
    return res.status(400).json({ 
      message: 'O campo "rate" deve ser um número inteiro entre 1 e 5',
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
  // const data = await fs.readFile('./src/talker.json', 'utf-8');
  // const talkersList = JSON.parse(data);
  const talkersList = await readAll();
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

// REQ 5:
app.post('/talker', 
  // validateKeys, 
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
    await fs.writeFile('./src/talker.json', JSON.stringify(data));
    return res.status(201).json(newTalker);
  });

app.listen(PORT, () => {
  console.log(`Online on port ${PORT}`);
});
