const path = require('path');
const db = require(path.join(__dirname, '..', 'models'));

// Reference to the Eggolist model from the database models
const EggoListModel = db.EggoList;

class EggoList {
  constructor() {
  }
  
  /**
   * Añade un artículo a la lista de un chat específico.
   * @param {number} chatListId - ID de la lista de chat.
   * @param {string} itemText - Texto del artículo a añadir.
   * @returns {Promise<Object>} El artículo creado.
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
   * Encuentra un artículo por su nombre en una lista de chat específica.
   * @param {number} chatListId - ID de la lista de chat.
   * @param {string} itemName - Nombre del artículo a encontrar.
   * @returns {Promise<Object|null>} El artículo encontrado o null si no se encuentra.
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
   * Elimina un artículo de la lista de un chat específico.
   * @param {number} itemId - ID del artículo a eliminar.
   * @returns {Promise<number>} Número de artículos eliminados.
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
   * Obtiene todos los artículos de la lista de un chat específico.
   * @param {number} chatListId - ID de la lista de chat.
   * @returns {Promise<Array>} Lista de artículos.
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
   * Encuentra un artículo en la base de datos por su ID.
   * @param {number} itemId - ID del artículo a encontrar.
   * @returns {Promise<Object|null>} El artículo encontrado o null si no se encuentra.
   */
  async findItemById(itemId) {
    return await EggoListModel.findOne({ where: { id: itemId } });
  }
  
  /**
   * Actualiza un artículo en la lista.
   * @param {number} itemId - ID del artículo a actualizar.
   * @param {Object} newItemData - Nuevos datos para el artículo.
   * @returns {Promise<Object>} El artículo actualizado.
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
