const path = require('path');
const db = require(path.join(__dirname, '..', 'models'));

// Reference to the Eggolist model from the database models
const EggoListModel = db.EggoList;

class EggoList {
  constructor() {
  }
  
  /**
   * Adds an item to a specific chat list.
   * @param {number} chatListId - The ID of the chat list.
   * @param {string} itemText - The text of the item to add.
   * @returns {Promise<Object>} The created item.
   */
  async addItem(chatListId, itemText) {
    try {
      return await EggoListModel.create({ chatListId, item: itemText });
    } catch (error) {
      console.error(error);
      throw error;
    }
  }
  
  
  /**
   * Finds an item by its name in a specific chat list.
   * @param {number} chatListId - The ID of the chat list.
   * @param {string} itemName - The name of the item to find.
   * @returns {Promise<Object|null>} The found item or null if not found.
   */
  async findItemByName(chatListId, itemName) {
    try {
      return await EggoListModel.findOne({ where: { chatListId, item: itemName } });
    } catch (error) {
      console.error(error);
      throw error;
    }
  }
  
  /**
   * Removes an item from a specific chat list.
   * @param {number} itemId - The ID of the item to remove.
   * @returns {Promise<number>} The number of items removed.
   */
  async removeItem(itemId) {
    try {
      return await EggoListModel.destroy({ where: { id: itemId } });
    } catch (error) {
      console.error(error);
      throw error;
    }
  }
  
  /**
   * Gets all items from a specific chat list.
   * @param {number} chatListId - The ID of the chat list.
   * @returns {Promise<Array>} The list of items.
   */
  async getItems(chatListId) {
    try {
      return await EggoListModel.findAll({ where: { chatListId } });
    } catch (error) {
      console.error(error);
      throw error;
    }
  }
  
  /**
   * Finds an item in the database by its ID.
   * @param {number} itemId - The ID of the item to be found.
   * @returns {Promise<Object|null>} The found item or null if no item is found.
   */
  async findItemById(itemId) {
    return await EggoListModel.findOne({ where: { id: itemId } });
  }
  
  /**
   * Updates an item in the list.
   * @param {number} itemId - The ID of the item to update.
   * @param {Object} newItemData - New data for the item.
   * @returns {Promise<Object>} The updated item.
   */
  async updateItem(itemId, newItemData) {
    try {
      const item = await EggoListModel.findByPk(itemId);
      if (!item) {
        throw new Error('Item not found');
      }
      
      item.item = newItemData.item;
      await item.save();
      return item;
    } catch (error) {
      console.error(error);
      throw error;
    }
  }
}

module.exports = EggoList;
