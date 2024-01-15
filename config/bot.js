const dotenv = require('dotenv');


// Trae las variables de entorno
dotenv.config({
  path: '.env',
});

const baseConfig = {
  token: process.env.TELEGRAM_TOKEN
};

/**
 * Configuraciones de la aplicación, utilizando variables de entorno cuando estén disponibles.
 * Las claves de nivel superior representan diferentes entornos
 * (por ejemplo, 'default', 'production', 'development', etc.).
 * Las claves de segundo nivel son las configuraciones específicas para ese entorno.
 * @type {Object.<string, Object.<string, string | number>>}
 * -- ChatGPT
 */
// Configuraciones usando vars de entorno
const config = {
  default: {
    ...baseConfig
  },
  development: {
    ...baseConfig
  },
  testing: {
    ...baseConfig
  },
  production: {
    ...baseConfig
  }
};

// Exporto las configs
module.exports = config;
