const path = require('path');
const db = require(path.join(__dirname, '..', 'models'));

class ChatListController {
  async findOrCreateChatList(chatId) {
    try {
      const [chatList, created] = await db.ChatList.findOrCreate({
        where: { chat_id: chatId }
      });
      return chatList;
    } catch (error) {
      console.error(error);
      throw error;
    }
  }
  
  async getChatList(chatId) {
    try {
      return await db.ChatList.findOne({
        where: { chat_id: chatId }
      });
    } catch (error) {
      console.error(error);
      throw error;
    }
  }
  
  // Otros métodos según sea necesario
}

module.exports = ChatListController;
