const dotenv = require('dotenv');


// Trae las variables de entorno
dotenv.config({
  path: '.env',
});

if (!process.env.POSTGRES_USERNAME || !process.env.POSTGRES_PASSWORD) {
  throw new Error('POSTGRES_USERNAME and POSTGRES_PASSWORD are required');
}

// "Clase" de datos con configuraciones por defecto
const baseConfig = {
  username: process.env.DB_USERNAME,
  password: process.env.DB_PASSWORD,
  database: process.env.DB_NAME || 'pgdb',
  port: process.env.DB_PORT || 5432,
  dialect: 'postgres'
};

const config = {
  default: {
    ...baseConfig
  },
  development: {
    ...baseConfig,
    port: process.env.POSTGRES_PORT,
    host: process.env.POSTGRES_HOST || 'localhost',
    database: `${process.env.POSTGRES_DB_NAME}`,
  },
  test: {
    ...baseConfig,
    port: process.env.POSTGRES_PORT,
    host: process.env.POSTGRES_HOST || 'localhost',
    database: `${process.env.POSTGRES_DB_NAME}`,
  },
  production: {
    ...baseConfig,
    port: process.env.POSTGRES_PORT,
    database: `${process.env.POSTGRES_DB_NAME}`,
    host: process.env.POSTGRES_HOST
  }
};

module.exports = config;
