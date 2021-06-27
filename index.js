require('dotenv').config();
const bot = require(__dirname + '/modules/Eggcart.js')

const eggCart = new bot("/Users/jaymenluther/git/eggcart/shopping.db")
eggCart.addItem()
eggCart.getList()
eggCart.deleteItem()
eggCart.connect()



