const path = require('path');
const db = require(path.join(__dirname, '..', 'models'));

const EggoListModel = db.EggoList;

class EggoList {
  constructor() {
  }
  
  async addItem(itemText) {
    
    try {
      return await EggoListModel.create({ item: itemText });
      
    } catch (error) {
      console.error(error);
      throw error;
    }
  }
  
  async findItemByName(itemName) {
    try {
      return await EggoListModel.findOne({ where: { item: itemName } });
    } catch (error) {
      console.error(error);
      throw error;
    }
  }
  
  async removeItem(itemId) {
    try {
      return await EggoListModel.destroy({ where: { id: itemId } });
    } catch (error) {
      console.error(error);
      throw error;
    }
  }
  
  async getItems() {
    try {
      return await EggoListModel.findAll();
      
    } catch (error) {
      console.error(error);
      throw error;
    }
  }
  
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
