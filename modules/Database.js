const path = require('path');
const orm = require(path.join(__dirname, 'models'));


class Supermarket {
    async create(data) {
        try {
        
        
        } catch (e) {
        
        }
    }
    
    async retrieve(key) {
        try {
        
        
        } catch (e) {
        
        }
    }
    
    async update(item, newData) {
        try {
        
        
        } catch (e) {
        
        }
    }
    
    async delete(key) {
        try {
        
        
        } catch (e) {
        
        }
    }
    
    async getTable() {
        try {
        
        
        } catch (e) {
        
        }
    }
}

class Supermarket_old {
    async create(data) {
        try {
            const newItem = await orm.EggoList.create(data);
            return newItem; // Retorna el ítem creado
        } catch (error) {
            console.error('Error al crear un ítem:', error);
            throw error; // Propaga el error
        }
    }
    
    async retrieve(key) {
        try {
            const item = await orm.EggoList.findOne({ where: { item: key } });
            return item; // Retorna el ítem encontrado
        } catch (error) {
            console.error('Error al recuperar un ítem:', error);
            throw error; // Propaga el error
        }
    }
    
    async update(item, newData) {
        try {
            const updatedItem = await orm.EggoList.update(newData, { where: { item: item } });
            return updatedItem; // Retorna el ítem actualizado
        } catch (error) {
            console.error('Error al actualizar un ítem:', error);
            throw error; // Propaga el error
        }
    }
    
    async delete(key) {
        try {
            const deletedItem = await orm.EggoList.destroy({ where: { item: key } });
            return deletedItem; // Retorna el resultado de la eliminación
        } catch (error) {
            console.error('Error al eliminar un ítem:', error);
            throw error; // Propaga el error
        }
    }
    
    async getTable() {
        try {
            const items = await orm.EggoList.findAll();
            return items.map(item => item.item); // Retorna una lista de ítems
        } catch (error) {
            console.error('Error al obtener la tabla:', error);
            throw error; // Propaga el error
        }
    }
}

module.exports = Supermarket;
