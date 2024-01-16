const dotenv = require('dotenv');

// Configure dotenv to read the .env file
dotenv.config({
  path: '.env',
});

/**
 * Base configuration object containing common configuration values.
 * Currently, it includes only the Telegram token.
 * @type {Object}
 */
const baseConfig = {
  token: process.env.TELEGRAM_TOKEN
};

/**
 * Complete configuration object for different environments.
 * This object contains separate configurations for default, development,
 * testing, and production environments. Each environment configuration
 * extends the base configuration.
 * @type {Object}
 */
const config = {
  default: {
    // Default environment configuration
    ...baseConfig
  },
  development: {
    // Development environment configuration
    ...baseConfig
  },
  testing: {
    // Testing environment configuration
    ...baseConfig
  },
  production: {
    // Production environment configuration
    ...baseConfig
  }
};

// Exporto las configs
module.exports = config;
