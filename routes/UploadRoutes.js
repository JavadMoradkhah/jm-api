const fs = require('fs');
const multer = require('multer');
const express = require('express');

function generateUploadRoute(uploadPath, maxUploadSize) {
  const router = express.Router();

  const storage = multer.diskStorage({
    destination: function (req, file, cb) {
      fs.mkdirSync(uploadPath, { recursive: true });
      cb(null, uploadPath);
    },
    filename: function (req, file, cb) {
      const extension = file.mimetype.split('/')[1];
      const fileName = `${Date.now().toString(16)}.${extension}`;
      cb(null, fileName);
    },
  });

  const upload = multer({
    storage,
    limits: {
      fileSize: maxUploadSize,
    },
  }).single('file');

  router.post('/upload', (req, res, next) => {
    upload(req, res, function (err) {
      if (err) {
        if (err.code === 'LIMIT_FILE_SIZE') {
          return res.status(400).send({ status: 'BadRequest', message: err.message });
        }
        return res.status(500).send({ status: 'Error', message: err.message });
      }

      res.status(200).send({ status: 'OK', message: '', result: req.file });
    });
  });

  return router;
}

module.exports = generateUploadRoute;
