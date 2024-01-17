const path = require('path');
const db = require(path.join(__dirname, '..', 'models'));

// Reference to the EggoList model from the database models
const EggoListModel = db.EggoList;

class EggoList {
  constructor() {
  }
  
  /**
   * Add an item to the list.
   * @param {string} itemText - Text of the item to add.
   * @returns {Promise<Object>} The created item.
   */
  async addItem(itemText) {
    
    try {
      return await EggoListModel.create({ item: itemText });
      
    } catch (error) {
      console.error(error);
      throw error;
    }
  }
  
  /**
   * Find an item by its name.
   * @param {string} itemName - Name of the item to find.
   * @returns {Promise<Object|null>} The found item or null if not found.
   */
  async findItemByName(itemName) {
    try {
      return await EggoListModel.findOne({ where: { item: itemName } });
    } catch (error) {
      console.error(error);
      throw error;
    }
  }
  
  /**
   * Remove an item from the list.
   * @param {number} itemId - ID of the item to remove.
   * @returns {Promise<number>} Number of items removed.
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
   * Get all items from the list.
   * @returns {Promise<Array>} List of items.
   */
  async getItems() {
    try {
      return await EggoListModel.findAll();
      
    } catch (error) {
      console.error(error);
      throw error;
    }
  }
  
  /**
   * Finds an item in the database by its ID.
   * This function queries the EggoList model to find a single item that matches the given ID.
   *
   * @param {number} itemId - The ID of the item to be found.
   * @returns {Promise<Object|null>} A promise that resolves to the found item or null if no item is found.
   */
  async findItemById(itemId) {
    return await EggoListModel.findOne({
      where: {id: itemId}
    });
  }
  
  /**
   * Update an item in the list.
   * @param {number} itemId - ID of the item to update.
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
