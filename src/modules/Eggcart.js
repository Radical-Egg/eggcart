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


function generateInlineKeyboard(items, currentPage = 0) {
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
          Markup.button.callback(item.item, `delete_item_${item.id}`));
    } else {
        buttons = items.map(item =>
          Markup.button.callback(item.item, `delete_item_${item.id}`));
    }
    
    if (paginated) {
        if (currentPage > 0) {
            buttons.push(Markup.button.callback('⬅️', `prev_page_${currentPage}`));
        }
        
        buttons.push(Markup.button.callback('↩️', 'go_back'));
        
        if (itemCount > currentPage * itemsPerPage) {
            buttons.push(Markup.button.callback('➡️', `next_page_${currentPage}`));
        }
    } else {
        buttons.push(Markup.button.callback('↩️', 'go_back'));
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
        this.bot.action(/prev_page_(\d+)/, async (ctx) => {
            const currentPageIndex = parseInt(ctx.match[1]);
            
            try {
                const items = await this.listController.getItems();
                const prevPageIndex = currentPageIndex - 1;
                
                if (prevPageIndex < 0) return;
                
                const newKeyboard = generateInlineKeyboard(items, prevPageIndex);
                
                await ctx.deleteMessage();
                await ctx.reply("Which one do you want to delete?", {
                    reply_markup: newKeyboard.reply_markup
                });
                
            } catch (error) {
                console.error("Error en prev_page:", error);
                await ctx.reply("An error occurred while trying to go to the previous page.");
            }
        });
        
        this.bot.action(/^delete_item_(\d+)$/, async (ctx) => {
            const itemId = ctx.match[1];
            
            try {
                const item = await this.listController.findItemById(itemId);
                if (item) {
                    await ctx.deleteMessage();
                    await this.performDeleteItem(item.item)(ctx);
                } else {
                    await ctx.reply("Item not found.");
                }
            } catch (error) {
                console.error("Error en delete_item:", error);
                await ctx.reply("An error occurred while trying to delete the item.");
            }
        });
        
        this.bot.action(/next_page_(\d+)/, async (ctx) => {
            const currentPageIndex = parseInt(ctx.match[1]);
            const itemsPerPage = 9;
            
            try {
                const items = await this.listController.getItems();
                const totalPages = Math.ceil(items.length / itemsPerPage);
                const nextPageIndex = currentPageIndex + 1;
                
                if (nextPageIndex >= totalPages) return;
                
                const newKeyboard = generateInlineKeyboard(items, nextPageIndex);
                
                await ctx.deleteMessage();
                await ctx.reply("Which one do you want to delete?", {
                    reply_markup: newKeyboard.reply_markup
                });
                
            } catch (error) {
                console.error("Error en next_page:", error);
                await ctx.reply("An error occurred while trying to go to the next page.");
            }
        });
        
        this.bot.action('go_back', async (ctx) => {
            try {
                await ctx.deleteMessage();
                await this.performGetList(ctx);
            } catch (error) {
                console.error("Error en go_back:", error);
                await ctx.reply("An error occurred while trying to go back.");
            }
        });
        
        this.bot.action('check_item', async (ctx) => {
            const currentPage = 0;
            try {
                await ctx.deleteMessage();
                
                const items = await this.listController.getItems();
                
                const keyboard = generateInlineKeyboard(items, currentPage);
                
                await ctx.reply("Which one do you want to delete?", keyboard);
                
            } catch (error) {
                console.error("Error en check_item:", error);
                await ctx.reply("An error occurred.");
            }
        });
        
        this.bot.action('ok', async (ctx) => {
            try {
                await ctx.editMessageReplyMarkup({
                    chat_id: ctx.chat.id,
                    message_id: ctx.update.callback_query.message.message_id,
                    reply_markup: { inline_keyboard: [] } });
                
            } catch (error) {
                console.error("Error editing message:", error);
            }
        });
        
        this.bot.action('clear', async (ctx) => {
            try {
                await ctx.deleteMessage();
                
            } catch (error) {
                console.error("Error deleting the message:", error);
            }
            
            const confirmButton = Markup.button.callback('✔️', 'confirm_clear');
            const cancelButton = Markup.button.callback('❌', 'cancel_clear');
            const confirmationKeyboard = Markup.inlineKeyboard([confirmButton, cancelButton]);
            
            ctx.reply("Are you sure you want to delete the whole list?", confirmationKeyboard);
        });
        
        this.bot.action('confirm_clear', async (ctx) => {
            console.log("Confirm clear action triggered");
            try {
                await ctx.deleteMessage();
                await this.performClearList(ctx);
                
            } catch (error) {
                console.error("Error en confirm_clear:", error);
            }
        });
        
        this.bot.action('cancel_clear', async (ctx) => {
            try {
                await ctx.deleteMessage();
                await this.performGetList(ctx);
                
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
                await this.performGetList(ctx);
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
    async performGetList(ctx) {
        const chatId = ctx.chat.id;
        
        try {
            // Obtener la lista de chat correspondiente a este chat_id
            const chatList = await this.chatListController.getChatList(chatId);
            
            let response;
            if (chatList) {
                // Obtener los elementos de la lista de este chat específico
                let items = await this.listController.getItems(chatList.id);
                
                response = '*Grocery List*\n';
                if (items.length === 0) {
                    response += "Nothing to shop for\\. \nTry adding eggs\\.";
                } else {
                    items.forEach((item, index) => {
                        response += `${index + 1}\\. ${escapeMarkdownV2Characters(item.item)}\n`;
                    });
                    
                    const keyboard = Markup.inlineKeyboard([
                        Markup.button.callback('✏️', 'check_item'),
                        Markup.button.callback('✔️', 'ok'),
                        Markup.button.callback('🔥', 'clear')
                    ]);
                    response += "\nSelect an option:";
                }
            } else {
                response = "No shopping list found for this chat\\. \nStart by adding some items\\.";
            }
            ctx.replyWithMarkdownV2(response);
        } catch (error) {
            console.error(error);
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
                await this.performClearList(ctx);
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
    async performClearList(ctx) {
        const chatId = ctx.chat.id; // Obtener chat_id
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

