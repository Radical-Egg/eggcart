const path = require("path");
const dotenv = require('dotenv');

const dbConfig = require(path.join(__dirname, 'config'));
const bot = require(path.join(__dirname, 'bot'));

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
  telegram: {
    default: bot.default,
    development: bot.development,
    test: bot.test,
    production: bot.production
  }
};

const config = {
  db: generalConfig.db[env],
  telegram: generalConfig.telegram[env],
};

console.log(config);

module.exports = config;
