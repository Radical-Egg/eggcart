'use strict';

const fs = require('fs');
const path = require('path');
const { Sequelize } = require('sequelize');

const config = require(path.join(__dirname, '..', 'config'));

const basename = path.basename(__filename);
const db = {};

let sequelize;

//// Does some funky wonky business
// if (config.use_env_variable) {
//   sequelize = new Sequelize(process.env[config.use_env_variable], config);
// } else {
//   sequelize = new Sequelize(config.db.database, config.db.username, config.db.password, config.db);
// }
sequelize = new Sequelize(config.db.database, config.db.username, config.db.password, config.db);

// Read all files in the current directory and import them as models
fs
  .readdirSync(__dirname)
  .filter(file => {
    // Exclude non-JavaScript files, this file, and test files
    return (
      file.indexOf('.') !== 0 &&
      file !== basename &&
      file.slice(-3) === '.js' &&
      file.indexOf('.test.js') === -1
    );
  })
  .forEach(file => {
    // Import each model file and add it to the db object
    const model = require(path.join(__dirname, file))(sequelize, Sequelize.DataTypes);
    db[model.name] = model;
  });

// Invoke the associate method on each model if it exists
Object.keys(db).forEach(modelName => {
  if (db[modelName].associate) {
    db[modelName].associate(db);
  }
});

// Add the Sequelize instance and Sequelize class to the db object
db.sequelize = sequelize;
db.Sequelize = Sequelize;

module.exports = db;
