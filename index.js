const express = require('express');
const app = express();

app.use(express.json());

const CLIENT_DIR = process.cwd();
let CONFIG = {};
try {
  CONFIG = require(`${CLIENT_DIR}\\jm-api.config.js`);
} catch (error) {}

app.get('/api', (req, res) => {
  res.send('Hello World');
});

const PORT = CONFIG.port || 5000;
app.listen(PORT, () =>
  console.log(`Server is listening: http://localhost:${PORT}/api/`)
);
