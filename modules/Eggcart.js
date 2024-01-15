const path = require('path');
const { Telegraf } = require('telegraf')

const config = require(path.join(__dirname, '..', 'config'));
const EggoListController = require(path.join(__dirname, '..', 'controllers', 'EggoList.controller.js'));


/* TODO 
    set up logging 
    delete function works but even if the item isn't on the list
    it still provides the generic remove message
*/
class EggCart {
    constructor(fp) {
        this.store = new Supermarket(fp)
        this.bot = new Telegraf(config.telegram.token)
    }
    addItem() {
        this.bot.command('add', async (ctx) => {
            let iList = ctx.update.message.text;
            let remove_add = iList.slice(iList.indexOf(" ") + 1);
            let item_list = remove_add.split(",");
            let response = 'Okay! \n';
            
            for (let i = 0; i < item_list.length; i++) {
                let item = {"item": item_list[i].trim()};
                try {
                    let success = await this.store.create(item);
                    if (success) {
                        response += `${item_list[i].trim()}, `;
                    }
                } catch (error) {
                    console.error(error);
                }
            }
            response = response.slice(0, response.length - 2); // Eliminar la última coma y espacio
            response += ' are on the shopping list!';
            ctx.reply(response);
        });
    }
    
    deleteItem() {
        this.bot.command('remove', async (ctx) => {
            let iList = ctx.update.message.text;
            let remove_add = iList.slice(iList.indexOf(" ") + 1);
            let item_list = remove_add.split(",");
            let response = 'Okay! \n';
            
            for (let i = 0; i < item_list.length; i++) {
                try {
                    await this.store.delete(item_list[i].trim());
                    response += `${item_list[i].trim()}, `;
                } catch (error) {
                    console.error(error);
                }
            }
            response = response.slice(0, response.length - 2);
            response += ' is no longer on the shopping list!\n';
            ctx.reply(response);
        });
    }
    
    getList() {
        this.bot.command('list', (ctx) => {
            let list = this.store.getTable().then((items) => {
                let response = 'Grocery List\n'
                let itemCount = 0
                let i = 1
                items.forEach((item) => {
                    response += `${i}. ${item}\n`
                    i++
                    itemCount++
                })
                if (itemCount === 0) {
                    ctx.reply("Nothing to shop for :o - try adding eggs")
                } else {
                    ctx.reply(response)
                }
            })
        })
    }
    clearList() {
        this.bot.command('clear', async (ctx) => {
            try {
                let items = await this.store.getTable();
                for (const item of items) {
                    await this.store.delete(item);
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
                "Add an item : /add eggs, milk\n" +
              "Remove an item : /remove eggs, milk\n" +
              "Show the list : /list\n" +
              "Clear the list : /clear"
            )
        })
    }
    connect() { this.bot.launch() }
}

module.exports = EggCart
