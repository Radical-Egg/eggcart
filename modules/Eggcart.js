const Supermarket = require('./Database.js')
const { Telegraf } = require('telegraf')

/* TODO 
    set up logging 
    delete function works but even if the item isn't on the list
    it still provides the generic remove message
*/
class EggCart {
    constructor(fp) {
        this.store = new Supermarket(fp)
        this.bot = new Telegraf(process.env.API_TOKEN)
    }
    addItem() {
        this.bot.command('add', (ctx) => {
            let ilist = ctx.update.message.text
            let remove_add = ilist.substr(ilist.indexOf(" ") + 1)
            let item_list = remove_add.split(",")
            let response = 'Okay! \n'
            for (let i = 0; i < item_list.length; i++) {
                let item = {"item": item_list[i].trim()}
                if (this.store.create(item) !== false) {
                    response += `${item_list[i]},`
                }
            }
            response = response.substr(0, response.length - 1)
            response += ' are on the shopping list!'
            ctx.reply(response)
        })
    }
    deleteItem() {
        this.bot.command('remove', (ctx) => {
            let ilist = ctx.update.message.text
            let remove_add = ilist.substr(ilist.indexOf(" ") + 1)
            let item_list = remove_add.split(",")
            let response = 'Okay! \n'
            for (let i = 0; i < item_list.length; i++) {
                this.store.delete(item_list[i].trim())
                response += `${item_list[i]},`
            }
            response = response.substr(0, response.length - 1)
            response += ' is no longer on the shopping list!\n'
            ctx.reply(response)

        })
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
        this.bot.command('clear', (ctx) => {
            let list = this.store.getTable().then((items) => {
                items.forEach((item) => {
                    this.store.delete(item)
                })
            })
        })
    }
    help() {
        this.bot.help((ctx) => {
            ctx.reply(
                "Add an item : /add eggs, milk\nRemove an item : /remove eggs, milk\n Show the list : /list\nClear the list : /clear"
            )
        })
    }
    connect() { this.bot.launch() }
}

module.exports = EggCart