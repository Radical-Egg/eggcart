const path = require('path');

const config = require(path.join(__dirname, '..', 'config'));

const EggCart = require(path.join(__dirname, 'modules', 'Eggcart'))
const eggCart = new EggCart(String(process.env.DATABASE_LOCATION));

eggCart.addItem()
eggCart.getList()
eggCart.deleteItem()
eggCart.clearList()
eggCart.help()
eggCart.connect()
