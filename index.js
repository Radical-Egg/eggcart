require('dotenv').config();
const bot = require(__dirname + '/modules/Eggcart.js')

const eggCart = new bot(String(process.env.DATABASE_LOCATION))

eggCart.addItem()
eggCart.getList()
eggCart.deleteItem()
eggCart.clearList()
eggCart.help()
eggCart.connect()