'use strict';
const { Model } = require('sequelize');

/**
 * Sequelize model for the EggoList.
 * @param {import('sequelize').Sequelize} sequelize - Sequelize instance.
 * @param {import('sequelize').DataTypes} DataTypes - Data types for model properties.
 * @returns {typeof Model} The EggoList model.
 */
module.exports = (sequelize, DataTypes) => {
  class EggoList extends Model {
    /**
     * Helper method for defining associations.
     * This method is not a part of Sequelize lifecycle.
     * The `models/index` file will call this method automatically.
     */
    static associate(models) {
      // define association here
    }
  }
  EggoList.init({
    item: {
      type: DataTypes.STRING,
      unique: true,
      allowNull: false
    }
  }, {
    sequelize,
    modelName: 'EggoList',
  });
  return EggoList;
};