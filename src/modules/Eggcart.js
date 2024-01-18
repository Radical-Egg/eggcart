const path = require('path');
const { Telegraf, Markup } = require('telegraf')

const config = require(path.join(__dirname, '..', 'config'));
const EggoListController = require(path.join(__dirname, '..', 'controllers', 'eggolist.js'));
const ChatListController = require(path.join(__dirname, '..', 'controllers', 'chatlist.js'));


/**
 * Escapes Markdown V2 characters in a given text.
 * @param {string} text - The text to escape.
 * @returns {string} The escaped text.
 */
function escapeMarkdownV2Characters(text) {
    return text.replace(/([_()*~`>#+-=|{}[\].!\\])/g, '\\$1');
}

function beautifyText(text) {
    let trimmedText = text.trim();
    
    if (trimmedText.endsWith('.')) {
        trimmedText = trimmedText.slice(0, -1);
    }
    
    trimmedText = trimmedText.trim();
    
    if (trimmedText.endsWith('.')) {
        trimmedText = trimmedText.slice(0, -1);
    }
    
    return trimmedText.replace(/^\w/, c => c.toUpperCase());
}


function generateInlineKeyboard(items, chatId, currentPage = 0) {
    const itemCount = items.length;
    let columns;
    let paginated = false;
    let buttons;
    
    if (itemCount < 9) {
        columns = [0, 1, 2, 4, 5].includes(itemCount) ? 2 : 3;
    } else {
        columns = 3;
        paginated = true;
    }
    
    const itemsPerPage = 9;
    
    if (paginated) {
        const pageStart = currentPage * itemsPerPage;
        const pageEnd = pageStart + itemsPerPage;
        buttons = items.slice(pageStart, pageEnd).map(item =>
          Markup.button.callback(item.item, `delete_item_${item.id}_${chatId}`));
    } else {
        buttons = items.map(item =>
          Markup.button.callback(item.item, `delete_item_${item.id}_${chatId}`));
    }
    
    buttons = items.map(item =>
      Markup.button.callback(item.item, `delete_item_${item.id}_${chatId}`));
    
    if (paginated) {
        if (currentPage > 0) {
            buttons.push(Markup.button.callback('⬅️', `prev_page_${currentPage}_${chatId}`));
        }
        
        buttons.push(Markup.button.callback('↩️', `go_back_${chatId}`));
        
        if (itemCount > currentPage * itemsPerPage) {
            buttons.push(Markup.button.callback('➡️', `next_page_${currentPage}_${chatId}`));
        }
    } else {
        buttons.push(Markup.button.callback('↩️', `go_back_${chatId}`));
    }
    
    return Markup.inlineKeyboard(buttons, {columns: columns});
}

class EggCart {
    constructor() {
        this.listController = new EggoListController();
        this.chatListController = new ChatListController();
        
        this.bot = new Telegraf(config.telegram.token);
        
        this.bot.telegram.getMe().then((botInfo) => {
            this.botName = botInfo.username;
        });
    }
    
    /**
     * Sets up event handlers for buttons in the Telegram bot.
     * This function defines the actions to be performed when specific
     * buttons in the bot's inline keyboard are pressed.
     */
    setupButtonHandlers() {
        this.bot.action(/^prev_page_(\d+)_(-?\d+)$/, async (ctx) => {
            const parts = ctx.match[0].split('_');
            const currentPageIndex = parseInt(parts[2]);
            const chatId = parseInt(parts[3]);
            console.log(`prev_page_${currentPageIndex}_${chatId}`);
            
            try {
                const items = await this.listController.getItems(chatId);
                const prevPageIndex = currentPageIndex - 1;
                
                if (prevPageIndex < 0) return;
                
                const newKeyboard = generateInlineKeyboard(items, chatId, prevPageIndex);
                
                await ctx.deleteMessage();
                await ctx.reply("Which one do you want to delete?", {
                    reply_markup: newKeyboard.reply_markup
                });
                
            } catch (error) {
                console.error("Error en prev_page:", error);
                await ctx.reply("An error occurred while trying to go to the previous page.");
            }
        });
        
        this.bot.action(/^delete_item_(\d+)_(-?\d+)$/, async (ctx) => {
            const parts = ctx.match[0].split('_');
            const itemId = parts[2];
            const chatId = parts[3];
            
            console.log(`delete_item_${itemId}_${chatId}`);
            
            try {
                const item = await this.listController.findItemById(itemId);
                if (item) {
                    await ctx.deleteMessage();
                    await this.performDeleteItem(chatId, item.item)(ctx);
                } else {
                    await ctx.reply("Item not found.");
                }
            } catch (error) {
                console.error("Error en delete_item:", error);
                await ctx.reply("An error occurred while trying to delete the item.");
            }
        });
        
        this.bot.action(/next_page_(\d+)_(-?\d+)$/, async (ctx) => {
            const parts = ctx.match[0].split('_');
            const currentPageIndex = parseInt(parts[2]);
            const chatId = parseInt(parts[3])
            const itemsPerPage = 9;
            
            console.log(`next_page_${currentPageIndex}_${chatId}`);
            
            try {
                const items = await this.listController.getItems(chatId);
                const totalPages = Math.ceil(items.length / itemsPerPage);
                const nextPageIndex = currentPageIndex + 1;
                
                if (nextPageIndex >= totalPages) return;
                
                const newKeyboard = generateInlineKeyboard(items, chatId, nextPageIndex);
                
                await ctx.deleteMessage();
                await ctx.reply("Which one do you want to delete?", {
                    reply_markup: newKeyboard.reply_markup
                });
                
            } catch (error) {
                console.error("Error en next_page:", error);
                await ctx.reply("An error occurred while trying to go to the next page.");
            }
        });
        
        this.bot.action(/go_back_(-?\d+)$/, async (ctx) => {
            const parts = ctx.match[0].split('_')
            const chatId = parseInt(parts[2]);
            ctx.chat.id = chatId
            
            console.log(`go_back_${chatId}`)
            
            try {
                await ctx.deleteMessage();
                await this.performGetList(ctx, chatId);
            } catch (error) {
                console.error("Error en go_back:", error);
                await ctx.reply("An error occurred while trying to go back.");
            }
        });
        
        this.bot.action(/check_item_(-?\d+)$/, async (ctx) => {
            const currentPage = 0;
            const parts = ctx.match[0].split('_')
            const chatId = parseInt(parts[2]);
            ctx.chat.id = chatId
            
            console.log(`check_item_${chatId}`)
            
            try {
                await ctx.deleteMessage();
                
                const items = await this.listController.getItems(chatId);
                
                const keyboard = generateInlineKeyboard(items, chatId, currentPage);
                
                await ctx.reply("Which one do you want to delete?", keyboard);
                
            } catch (error) {
                console.error("Error en check_item:", error);
                await ctx.reply("An error occurred.");
            }
        });
        
        this.bot.action(/ok_(-?\d+)$/, async (ctx) => {
            const parts = ctx.match[0].split('_')
            const chatId = parseInt(parts[1]);
            ctx.chat.id = chatId
            
            console.log(`ok_${chatId}`)
            
            try {
                await ctx.editMessageReplyMarkup({
                    chat_id: ctx.chat.id,
                    message_id: ctx.update.callback_query.message.message_id,
                    reply_markup: { inline_keyboard: [] } });
                
            } catch (error) {
                console.error("Error editing message:", error);
            }
        });
        
        this.bot.action(/clear_(-?\d+)$/, async (ctx) => {
            const parts = ctx.match[0].split('_')
            const chatId = parts[1]
            
            console.log(`clear_${chatId}`)
            
            try {
                await ctx.deleteMessage();
                
            } catch (error) {
                console.error("Error deleting the message:", error);
            }
            
            const confirmButton = Markup.button.callback('✔️', `confirm_clear_${chatId}`);
            const cancelButton = Markup.button.callback('❌', `cancel_clear_${chatId}`);
            const confirmationKeyboard = Markup.inlineKeyboard([confirmButton, cancelButton]);
            
            ctx.reply("Are you sure you want to delete the whole list?", confirmationKeyboard);
        });
        
        this.bot.action(/confirm_clear_(-?\d+)$/, async (ctx) => {
            const parts = ctx.match[0].split('_')
            const chatId = parts[2]
            ctx.chat.id = chatId
            
            console.log(`confirm_clear_${chatId}`)
            
            console.log("Confirm clear action triggered");
            try {
                await ctx.deleteMessage();
                await this.performClearList(ctx, chatId);
                
            } catch (error) {
                console.error("Error en confirm_clear:", error);
            }
        });
        
        this.bot.action(/cancel_clear_(-?\d+)$/, async (ctx) => {
            const parts = ctx.match[0].split('_')
            const chatId = parts[2]
            ctx.chat.id = chatId
            
            console.log(`confirm_cancel_${chatId}`)
            
            try {
                await ctx.deleteMessage();
                await this.performGetList(ctx, chatId);
                
            } catch (error) {
                console.error("Error deleting the message or showing the list:", error);
            }
        });
    }
    
    /**
     * Add an item to the shopping list via the bot command.
     */
    addItem() {
        this.bot.command('add', async (ctx) => {
            const chatId = ctx.chat.id;
            const messageText = ctx.update.message.text;
            const chatType = ctx.update.message.chat.type;
            
            if (messageText.includes(`@${this.botName}`) || chatType === 'private' || chatType === 'group') {
                let itemsToAdd = messageText.slice(messageText.indexOf(" ") + 1).split(",");
                let response = 'Okay\\! \n';
                
                for (let itemText of itemsToAdd) {
                    try {
                        const chatList = await this.chatListController.findOrCreateChatList(chatId);
                        await this.listController.addItem(chatList.id, beautifyText(itemText.trim()));
                        
                        response += `*${escapeMarkdownV2Characters(beautifyText(itemText.trim()))}*, `;
                        
                    } catch (error) {
                        console.error(error);
                    }
                }
                
                response = response.slice(0, -2) + ' is \\(are\\) now on the shopping list\\.';
                ctx.replyWithMarkdownV2(response);
            }
        });
    }
    
    /**
     * Remove an item from the shopping list via the bot command.
     */
    deleteItem() {
        this.bot.command('remove', async (ctx) => {
            const chatId = ctx.chat.id;
            const messageText = ctx.update.message.text;
            const chatType = ctx.update.message.chat.type;
            
            if (messageText.includes(`@${this.botName}`) || chatType === 'private' || chatType === 'group') {
                let itemsToRemove = messageText.slice(messageText.indexOf(" ") + 1).split(",");
                for (let itemName of itemsToRemove) {
                    await this.performDeleteItem(chatId, itemName.trim())(ctx);
                }
            }
        });
    }
    
    performDeleteItem(chatId, itemName) {
        itemName = beautifyText(itemName);
        
        return async (ctx) => {
            let response;
            
            try {
                // Primero, encontrar la lista de chat para este chat_id
                const chatList = await this.chatListController.getChatList(chatId);
                
                if (chatList) {
                    // Luego, buscar el artículo por nombre en esta lista de chat
                    const item = await this.listController.findItemByName(chatList.id, itemName);
                    if (item) {
                        // Si se encuentra, eliminar el artículo
                        await this.listController.removeItem(item.id);
                        response = `Okay\\! *${escapeMarkdownV2Characters(itemName)}* removed from the shopping list\\.`;
                    } else {
                        response = `Oh\\! *${escapeMarkdownV2Characters(itemName)}* not found in the shopping list\\.`;
                    }
                } else {
                    response = `Oh\\! Shopping list not found for this chat\\.`;
                }
            } catch (error) {
                console.error(error);
                response = `Oh\\! Error removing *${escapeMarkdownV2Characters(itemName)}* from the shopping list\\.`;
            }
            
            ctx.replyWithMarkdownV2(response);
        };
    }
    
    /**
     * Retrieve the shopping list via the bot command.
     */
    getList() {
        this.bot.command('list', async (ctx) => {
            const messageText = ctx.update.message.text;
            const chatType = ctx.update.message.chat.type;
            
            if (messageText.includes(`@${this.botName}`) || chatType === 'private' || chatType === 'group') {
                await this.performGetList(ctx, ctx.chat.id);
            }
        });
    }
    
    /**
     * Retrieves the current shopping list and sends it to the user.
     * This function queries all items in the shopping list and formats them
     * into a Markdown message to send to the user.
     *
     * @param {Object} ctx - The Telegraf context provided by the Telegram bot.
     */
    async performGetList(ctx, chatId) {
        
        console.log(chatId);
        try {
            // Obtener la lista de chat correspondiente a este chat_id
            const chatList = await this.chatListController.getChatList(chatId);
            
            let response;
            let keyboard = Markup.inlineKeyboard([]);
            
            console.log("chatList:", chatList);  // Agrega esta línea para diagnóstico
            
            if (chatList) {
                console.log("chatList.id:", chatList.id);  // Agrega esta línea para diagnóstico
                
                // Obtener los elementos de la lista de este chat específico
                let items = await this.listController.getItems(chatList.id);
                
                response = '*Grocery List*\n';
                if (items.length === 0) {
                    response += "Nothing to shop for\\. \nTry adding eggs\\.";
                    
                } else {
                    items.forEach((item, index) => {
                        response += `${index + 1}\\. ${escapeMarkdownV2Characters(item.item)}\n`;
                    });
                    
                    keyboard = Markup.inlineKeyboard([
                        Markup.button.callback('✏️', `check_item_${chatId}`),
                        Markup.button.callback('✔️', `ok_${chatId}`),
                        Markup.button.callback('🔥', `clear_${chatId}`)
                    ]);
                    
                    response += "\nSelect an option:";
                }
                
            } else {
                response = "No shopping list found for this chat\\. \nStart by adding some items\\.";
            }
            ctx.replyWithMarkdownV2(response, keyboard);
            
        } catch (error) {
            console.error('Error performing get list:', error);
            ctx.replyWithMarkdownV2("An error occurred while getting the list\\.");
        }
    }
    
    /**
     * Clear the shopping list via the bot command.
     */
    clearList() {
        this.bot.command('clear', async (ctx) => {
            const messageText = ctx.update.message.text;
            const chatType = ctx.update.message.chat.type;
            
            if (messageText.includes(`@${this.botName}`) || chatType === 'private' || chatType === 'group') {
                await this.performClearList(ctx, ctx.chat.id);
            }
        });
        
        this.setupButtonHandlers();
    }
    
    /**
     * Clears the shopping list by deleting all items.
     * This function removes all items from the shopping list and notifies the user.
     *
     * @param {Object} ctx - The Telegraf context provided by the Telegram bot.
     */
    async performClearList(ctx, chatId) {
        
        try {
            // Obtener la lista de chat correspondiente a este chat_id
            const chatList = await this.chatListController.getChatList(chatId);
            
            if (chatList) {
                // Eliminar todos los elementos de la lista de este chat específico
                await this.listController.clearItems(chatList.id);
                
                ctx.replyWithMarkdownV2("The shopping list has been cleared\\.");
            } else {
                ctx.replyWithMarkdownV2("No shopping list found for this chat\\.");
            }
        } catch (error) {
            console.error(error);
            ctx.replyWithMarkdownV2("An error occurred while clearing the list\\.");
        }
    }
    
    async clearItems(chatListId) {
        try {
            await EggoListModel.destroy({ where: { chatListId } });
            
        } catch (error) {
            console.error(error);
            throw error;
        }
    }
    
    start() {
        this.bot.command('start', async (ctx) => {
            const messageText = ctx.update.message.text;
            const chatType = ctx.update.message.chat.type;
            
            if (messageText.includes(`@${this.botName}`) || chatType === 'private' || chatType === 'group') {
                ctx.reply(
                  "Add an item: /add Eggs, Milk, Cream\n" +
                  "Remove an item: /remove Eggs, Milk\n" +
                  "Show the list: /list\n" +
                  "Clear the list: /clear\n" +
                  "This menu: /help"
                );
            }
        });
    }
    
    /**
     * Provide help information via the bot command.
     */
    help() {
        this.bot.help((ctx) => {
            const messageText = ctx.update.message.text;
            const chatType = ctx.update.message.chat.type;
            
            if (messageText.includes(`@${this.botName}`) || chatType === 'private' || chatType === 'group') {
                ctx.reply(
                  "Add an item: /add Eggs, Milk, Cream\n" +
                  "Remove an item: /remove Eggs, Milk\n" +
                  "Show the list: /list\n" +
                  "Clear the list: /clear"
                );
            }
        });
    }
    
    /**
     * Launch the Telegram bot.
     */
    connect() {
        this.bot.launch().then(() => {
            console.log('Bot launched successfully');
            
        }).catch(error => {
            console.error('Error launching bot:', error);
        });
    }

}

module.exports = EggCart;

