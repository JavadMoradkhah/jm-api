# jm-api

A library for developers that provides developers with a series of APIs to work with SQLite database. You can signup users, upload files, filter the results ...

> **Notice:** This library is in developing and testing state

## Configuration

To customize the configuration settings you desire you must create a **"jm-api.js"** file at the root of your project like this:

```
const path = require('path');
const dotenv = require('dotenv');

dotenv.config({ path: path.resolve(__dirname, '.env') });

module.exports = {
  port: 5000,
  jwtKey: process.env.JWT_SECRET_KEY,
  upload: {
    path: './uploads',
    maxUploadSize: 1024 * 400, // 400KB
  },
  userModel: {
    email: { min: 5, max: 30 },
    password: { min: 6, max: 20 },
    fields: [{ name: 'name', type: 'string', min: 2, max: 30, required: true }],
  },
  collections: [
    {
      colName: 'movies',
      fields: [
        { name: 'title', type: 'string', min: 3, max: 255, required: true },
        { name: 'rate', type: 'float', min: 0, max: 10, required: true },
        { name: 'year', type: 'integer', min: 1920, max: 2022, required: true },
      ],
    },
  ],
};
```

## Default Routes

- **POST /api/register:** Signup users
- **POST /api/login:** Login users
- **POST /api/upload:** Upload files
- **GET /uploads/\<YourFileName\>:** View uploaded files
