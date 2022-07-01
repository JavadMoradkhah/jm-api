const multer = require('multer');
const express = require('express');

const router = express.Router();
const CLIENT_DIR = process.cwd();
const UPLOADS_PATH = `${CLIENT_DIR}\\uploads`;

const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, UPLOADS_PATH);
  },
  filename: function (req, file, cb) {
    const extension = file.mimetype.split('/')[1];
    const fileName = `${Date.now().toString(16)}.${extension}`;
    cb(null, fileName);
  },
});

const upload = multer({ storage });

router.post('/upload', upload.single('file'), (req, res, next) => {
  res.status(200).send({ status: 'OK', message: '', result: req.file });
});

module.exports = router;
