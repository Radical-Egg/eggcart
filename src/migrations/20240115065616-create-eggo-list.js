'use strict';

/** @type {import('sequelize-cli').Migration} */
module.exports = {
  /**
   * Run the migration to create the table.
   * @param {import('sequelize').QueryInterface} queryInterface - The interface to handle SQL queries.
   * @param {import('sequelize').Sequelize} Sequelize - Sequelize library.
   */
  async up(queryInterface, Sequelize) {
    await queryInterface.createTable('EggoLists', {
      id: {
        allowNull: false,
        autoIncrement: true,
        primaryKey: true,
        type: Sequelize.INTEGER
      },
      item: {
        type: Sequelize.STRING,
        allowNull: false,
        unique: true
      },
      chatListId: {
        type: Sequelize.INTEGER,
        allowNull: false,
      },
      createdAt: {
        allowNull: false,
        type: Sequelize.DATE
      },
      updatedAt: {
        allowNull: false,
        type: Sequelize.DATE
      }
    });
  },
  
  /**
   * Revert the migration by dropping the 'EggoLists' table.
   * @param {import('sequelize').QueryInterface} queryInterface - The interface to handle SQL queries.
   * @param {import('sequelize').Sequelize} Sequelize - Sequelize library.
   */
  async down(queryInterface, Sequelize) {
    await queryInterface.dropTable('EggoLists');
  }
};