const express = require('express');
const fs = require('fs').promises;

const app = express();
app.use(express.json());

const HTTP_OK_STATUS = 200;
const PORT = process.env.PORT || '3001';

// não remova esse endpoint, e para o avaliador funcionar
app.get('/', (_request, response) => {
  response.status(HTTP_OK_STATUS).send();
});

app.get('/talker', async (req, res) => {
  const data = await fs.readFile('./src/talker.json', 'utf-8');
  const talkersList = JSON.parse(data);
  console.log(data);
  console.log(talkersList);
  res.status(HTTP_OK_STATUS).json(talkersList);
})

app.listen(PORT, () => {
  console.log(`Online on port ${PORT}`);
});
