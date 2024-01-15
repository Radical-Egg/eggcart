# eggcart
## Grocery List Telegram Bot

<img alt="AppLogo" src="assets/eggcart_profile.png" width="256">

## Description
eggcart is a Telegram Bot designed to manage your grocery list efficiently. Built with Node.js, SQLite, and Telegraf, it offers a simple and interactive way to add, remove, and manage items on your grocery list through Telegram.

## Features
- Add items to your grocery list with a simple Telegram command.
- Remove items from the list as you purchase them.
- View the entire list at any time.
- Clear the list with one command.

<img src=https://github.com/ljgonzalez1/eggcart/blob/master/assets/egg_cart_screenshot.png height=800>

## Installation
To get eggcart up and running, follow these steps:

1. Clone the repository

    ```bash
    git clone https://github.com/ljgonzalez1/eggcart.git eggcart
    ```

2. Install the dependencies:
    ```bash
    cd eggcart
    yarn install
    ```
   
3. Create a `.env` file in the root directory and add your Telegram Bot API key and other required environment variables.
   
    3.1 updated approvedShoppers function on line 114 (EggCart.js) with your process.env.user variable
 
4. Start the bot:
    ```bash
    yarn start
    ```

## Usage
Once the bot is running, you can interact with it on Telegram using the following commands:
- `/add [item1, item2, ...]` - Add items to your grocery list.
- `/remove [item1, item2, ...]` - Remove items from your grocery list.
- `/list` - Display the current grocery list.
- `/clear` - Clear the grocery list.

## Contributing
Contributions to eggcart are welcome! Please read our [Contributing Guidelines](CONTRIBUTING.md) for more information on how to report issues, suggest features, or submit pull requests.

## Credits
- Original Author: Radical_Egg
- Primary Contributor and Maintainer: ljgonzalez1

## License
eggcart is released under the [ISC License](LICENSE). See the LICENSE file for more details.
