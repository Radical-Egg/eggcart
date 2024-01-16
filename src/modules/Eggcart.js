const path = require('path');
const { Telegraf } = require('telegraf')

const config = require(path.join(__dirname, '..', 'config'));
const EggoListController = require(path.join(__dirname, '..', 'controllers', 'EggoList.js'));

/**
 * Escapes Markdown V2 characters in a given text.
 * @param {string} text - The text to escape.
 * @returns {string} The escaped text.
 */
function escapeMarkdownV2Characters(text) {
    return text.replace(/([_()*~`>#+-=|{}[\].!\\])/g, '\\$1');
}

class EggCart {
    constructor() {
        this.listController = new EggoListController();
        this.bot = new Telegraf(config.telegram.token);
        
        this.bot.telegram.getMe().then((botInfo) => {
            this.botName = botInfo.username;
        });
    }
    
    /**
     * Add an item to the shopping list via the bot command.
     */
    addItem() {
        this.bot.command('add', async (ctx) => {
            const messageText = ctx.update.message.text;
            const chatType = ctx.update.message.chat.type;
            
            if (messageText.includes(`@${this.botName}`) || chatType === 'private' || chatType === 'group') {
                let itemsToAdd = messageText.slice(messageText.indexOf(" ") + 1).split(",");
                let response = 'Okay\\! \n';
                
                for (let itemText of itemsToAdd) {
                    try {
                        await this.listController.addItem(itemText.trim());
                        response += `${escapeMarkdownV2Characters(itemText.trim())}, `;
                        
                    } catch (error) {
                        console.error(error);
                    }
                }
                response = response.slice(0, -2) + ' are on the shopping list\\.';
                ctx.replyWithMarkdownV2(response);
            }
        });
    }
    
    /**
     * Remove an item from the shopping list via the bot command.
     */
    deleteItem() {
        this.bot.command('remove', async (ctx) => {
            const messageText = ctx.update.message.text;
            const chatType = ctx.update.message.chat.type;
            
            if (messageText.includes(`@${this.botName}`) || chatType === 'private' || chatType === 'group') {
                let itemsToRemove = messageText.slice(messageText.indexOf(" ") + 1).split(",");
                let response = '';
                
                for (let itemName of itemsToRemove) {
                    let escapedItemName = escapeMarkdownV2Characters(itemName.trim());
                    try {
                        const item = await this.listController.findItemByName(itemName.trim());
                        if (item) {
                            await this.listController.removeItem(item.id);
                            response += `Okay\\!\n*${escapedItemName}* removed from the shopping list\\.\n`;
                        } else {
                            response += `Oh\\!\n*${escapedItemName}* not found in the shopping list\\.\n`;
                        }
                    } catch (error) {
                        console.error(error);
                        response += `Oh\\!\nError removing *${escapedItemName}*\\.\n`;
                    }
                }
                
                if (response === '') {
                    response = "No items specified for removal\\.";
                }
                
                ctx.replyWithMarkdownV2(response);
                }
        });
    }
    
    /**
     * Retrieve the shopping list via the bot command.
     */
    getList() {
        this.bot.command('list', async (ctx) => {
            const messageText = ctx.update.message.text;
            const chatType = ctx.update.message.chat.type;
            
            if (messageText.includes(`@${this.botName}`) || chatType === 'private' || chatType === 'group') {
                try {
                    let items = await this.listController.getItems();
                    let response = '*Grocery List*\n';
                    
                    items.forEach((item, index) => {
                        response += `${index + 1}\\. ${escapeMarkdownV2Characters(item.item)}\n`;
                    });
                    
                    if (items.length === 0) {
                        response = "Nothing to shop for\\. \nTry adding eggs\\.";
                    }
                    ctx.replyWithMarkdownV2(response);
                } catch (error) {
                    console.error(error);
                    ctx.replyWithMarkdownV2("An error occurred while getting the list\\.");
                }
            }
        });
    }
    
    /**
     * Clear the shopping list via the bot command.
     */
    clearList() {
        this.bot.command('clear', async (ctx) => {
            const messageText = ctx.update.message.text;
            const chatType = ctx.update.message.chat.type;
            
            if (messageText.includes(`@${this.botName}`) || chatType === 'private' || chatType === 'group') {
                try {
                    let items = await this.listController.getItems();
                    for (const item of items) {
                        await this.listController.removeItem(item.id);
                    }
                    ctx.reply("The shopping list has been cleared!");
                } catch (error) {
                    console.error(error);
                    ctx.reply("An error occurred while clearing the list.");
                }
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
                  "Add an item: /add eggs, milk\n" +
                  "Remove an item: /remove eggs, milk\n" +
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

