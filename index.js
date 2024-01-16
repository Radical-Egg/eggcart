const path = require('path');

const config = require(path.join(__dirname, 'config'));

const EggCart = require(path.join(__dirname, 'modules', 'Eggcart'))
/**
 * Initialize the EggCart with the database location.
 * @type {EggCart}
 */
const eggCart = new EggCart(String(process.env.DATABASE_LOCATION));

// Set up the EggCart functionalities
eggCart.addItem()
eggCart.getList()
eggCart.deleteItem()
eggCart.clearList()
eggCart.help()
eggCart.connect()
