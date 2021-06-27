const Supermarket = require('./Database.js')
const { Telegraf } = require('telegraf')

class EggCart {
    constructor(fp) {
        this.store = new Supermarket(fp)
        this.bot = new Telegraf(process.env.API_TOKEN)
    }
    addItem() {
        this.bot.command('add', (ctx) => {
            let item_list = ctx.update.message.text.split(" ")
            let response = 'Okay! \n'
            for(let i = 1; i < item_list.length; i++) {
                let item = {"item": item_list[i]}
                if (this.store.create(item) !== false) {
                    response += `${item_list[i]}\n`
                }
            }
            response += 'are on the shopping list!'
            ctx.reply(response)
        })
    }
    deleteItem() {
        this.bot.command('remove', (ctx) => {
            let item_list = ctx.update.message.text.split(" ")
            let response = 'Okay! \n'
            let itemCount = 0
            for(let i = 1; i < item_list.length; i++) {
                this.store.delete(item_list[i])
                response += `${item_list[i]}\n`
            }
            response += 'no longer on the shopping list!'
            
            if (itemCount > 0) {
                ctx.reply("That item(s) are not on the list ?")
            } else {
                ctx.reply(response)
            }
            
        })
    }
    getList() {
        this.bot.command('list', (ctx) => {
        let list = this.store.getTable().then((items) => {
            let response = 'Grocery List\n'
            
            let i = 1
            items.forEach((item) => {
                response += `${i}. ${item}\n`
                i++
            })
            ctx.reply(response)
        })
        })

    }
    connect() { this.bot.launch() }
}

module.exports = EggCart

// let item = {"item":"eggs"}

// const store = new Supermarket("/Users/jaymenluther/git/eggcart/shopping.db")

// //store.create(item)

// //store.retreive("eggs").then((item) => console.log(`found: ${item.item}`))
// store.printTable()
