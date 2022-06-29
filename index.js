const express = require('express');
const app = express();

app.use(express.json());

app.get('/api', (req, res) => {
  res.send('Hello World');
});

app.listen(5000, () =>
  console.log('Server is listening http://localhost:5000/api/...')
);
