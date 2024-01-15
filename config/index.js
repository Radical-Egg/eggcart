const path = require("path");
const dotenv = require('dotenv');

const dbConfig = require(path.join(__dirname, 'config'));

const env = process.env.NODE_ENV || 'default';

dotenv.config({
  path: '.env',
});

if (!process.env.POSTGRES_USERNAME || !process.env.POSTGRES_PASSWORD) {
  throw new Error('DB_USERNAME and DB_PASSWORD are required');
}


const generalConfig = {
  db: {
    default: dbConfig.default,
    development: dbConfig.development,
    test: dbConfig.test,
    production: dbConfig.production
  },
  server: {
    default: serverEnvironment.default,
    development: serverEnvironment.development,
    test: serverEnvironment.test,
    production: serverEnvironment.production
  },
  settings: appSettings
};


const config = {
  database: {
    host: process.env.POSTGRES_HOST || 'localhost',
    username: process.env.POSTGRES_USERNAME,
    password: process.env.POSTGRES_PASSWORD,
    database: process.env.POSTGRES_DB_NAME || 'postgres',
    port: process.env.POSTGRES_PORT || 5432,
    dialect: 'postgres'
  },
  env: env,
  telegram: {
    token: process.env.TELEGRAM_TOKEN
  }
  
}

console.log(config);

module.exports = config;
