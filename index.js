import dotenv from 'dotenv';
dotenv.config({ path: '/mnt/data/eggcart/.env' });

import EggCart from './modules/Eggcart.js';
const eggCart = new EggCart(String(process.env.DATABASE_LOCATION));

eggCart.addItem()
eggCart.getList()
eggCart.deleteItem()
eggCart.clearList()
eggCart.help()
eggCart.connect()
