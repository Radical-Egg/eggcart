'use strict';
const {
  Model
} = require('sequelize');
module.exports = (sequelize, DataTypes) => {
  class ChatList extends Model {
    /**
     * Helper method for defining associations.
     * This method is not a part of Sequelize lifecycle.
     * The `models/index` file will call this method automatically.
     */
    static associate(models) {
      ChatList.hasMany(models.EggoList, {
        foreignKey: 'chatListId',
        as: 'eggolists'
      });
    }
  }
  ChatList.init({
    chat_id: DataTypes.BIGINT
  }, {
    sequelize,
    modelName: 'ChatList',
  });
  return ChatList;
};