const path = require('path');
const { Telegraf } = require('telegraf')

const config = require(path.join(__dirname, '..', 'config'));
const EggoListController = require(path.join(__dirname, '..', 'controllers', 'EggoList.js'));

class EggCart {
    constructor() {
        this.listController = new EggoListController();
        this.bot = new Telegraf(config.telegram.token);
    }
    
    addItem() {
        this.bot.command('add', async (ctx) => {
            let messageText = ctx.update.message.text;
            let itemsToAdd = messageText.slice(messageText.indexOf(" ") + 1).split(",");
            let response = 'Okay! \n';
            
            for (let itemText of itemsToAdd) {
                try {
                    await this.listController.addItem({ item: itemText.trim() });
                    response += `${itemText.trim()}, `;
                } catch (error) {
                    console.error(error);
                }
            }
            response = response.slice(0, -2) + ' are on the shopping list!';
            ctx.reply(response);
        });
    }
    
    deleteItem() {
        this.bot.command('remove', async (ctx) => {
            let messageText = ctx.update.message.text;
            let itemsToRemove = messageText.slice(messageText.indexOf(" ") + 1).split(",");
            let response = 'Okay! \n';
            
            for (let itemText of itemsToRemove) {
                try {
                    await this.listController.removeItem(itemText.trim());
                    response += `${itemText.trim()}, `;
                } catch (error) {
                    console.error(error);
                }
            }
            response = response.slice(0, -2) + ' is no longer on the shopping list!';
            ctx.reply(response);
        });
    }
    
    getList() {
        this.bot.command('list', async (ctx) => {
            try {
                let items = await this.listController.getItems();
                let response = 'Grocery List\n';
                items.forEach((item, index) => {
                    response += `${index + 1}. ${item.item}\n`;
                });
                if (items.length === 0) {
                    response = "Nothing to shop for :o - try adding eggs";
                }
                ctx.reply(response);
            } catch (error) {
                console.error(error);
                ctx.reply("An error occurred while getting the list.");
            }
        });
    }
    
    clearList() {
        this.bot.command('clear', async (ctx) => {
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
        });
    }
    
    help() {
        this.bot.help((ctx) => {
            ctx.reply(
              "Add an item: /add eggs, milk\n" +
              "Remove an item: /remove eggs, milk\n" +
              "Show the list: /list\n" +
              "Clear the list: /clear"
            
            );
        });
    }
    
    connect() {
        this.bot.launch().then(() => {
            console.log('Bot launched successfully');
        }).catch(error => {
            console.error('Error launching bot:', error);
        });
    }

}

module.exports = EggCart;

