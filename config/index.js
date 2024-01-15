import dotenv from 'dotenv';

dotenv.config({
  path: '.env',
});

if (!process.env.DB_USERNAME || !process.env.DB_PASSWORD) {
  throw new Error('DB_USERNAME and DB_PASSWORD are required');
}

const env = process.env.NODE_ENV || 'development';

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
