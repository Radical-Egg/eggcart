const dotenv = require('dotenv');


// Load environment variables from .env file
dotenv.config({
  path: '.env',
});

// Validate essential PostgreSQL environment variables
if (!process.env.POSTGRES_USERNAME || !process.env.POSTGRES_PASSWORD) {
  throw new Error('POSTGRES_USERNAME and POSTGRES_PASSWORD are required');
}

/**
 * Base configuration for PostgreSQL connection.
 * Includes default values and environment variable based settings.
 * @type {Object}
 */
const baseConfig = {
  username: process.env.POSTGRES_USERNAME,
  password: process.env.POSTGRES_PASSWORD,
  database: process.env.POSTGRES_DB_NAME || 'pgdb',
  port: process.env.POSTGRES_PORT || 5432,
  dialect: 'postgres'
};

/**
 * Database configurations for different environments (default, development, test, production).
 * Each configuration extends the base configuration with environment-specific overrides.
 * @type {Object}
 */
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
