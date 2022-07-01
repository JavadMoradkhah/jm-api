const uploadRoutes = require('./routes/UploadRoutes');
const generateRoutes = require('./routes/routes');
const express = require('express');
const app = express();

app.use(express.urlencoded({ extended: true }));
app.use(express.json());

try {
  const CLIENT_DIR = process.cwd();
  const CONFIG = require(`${CLIENT_DIR}\\jm-api.js`);

  app.use('/uploads', express.static(`${CLIENT_DIR}\\uploads`));

  app.use('/api', uploadRoutes);
  app.use('/api', generateRoutes(CONFIG.collections));

  app.get('/api', (req, res) => {
    res.send('Hello World');
  });

  const PORT = CONFIG.port || 5000;
  app.listen(PORT, () =>
    console.log(`Server is listening: http://localhost:${PORT}/api/`)
  );
} catch (error) {
  if (error.code === 'MODULE_NOT_FOUND') {
    console.log('The "jm-api.js" file does not exist!');
  } else {
    console.log(error);
  }
}
