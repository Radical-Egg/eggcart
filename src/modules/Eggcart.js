const path = require('path');
const { Telegraf, Markup } = require('telegraf')

const config = require(path.join(__dirname, '..', 'config'));
const EggoListController = require(path.join(__dirname, '..', 'controllers', 'EggoList.js'));

/**
 * Escapes Markdown V2 characters in a given text.
 * @param {string} text - The text to escape.
 * @returns {string} The escaped text.
 */
function escapeMarkdownV2Characters(text) {
    return text.replace(/([_()*~`>#+-=|{}[\].!\\])/g, '\\$1');
}

function beautifyText(text) {
    // Remove leading and trailing whitespace
    let trimmedText = text.trim();
    
    // Remove a trailing period if present
    if (trimmedText.endsWith('.')) {
        trimmedText = trimmedText.slice(0, -1);
    }
    
    trimmedText = trimmedText.trim();
    
    if (trimmedText.endsWith('.')) {
        trimmedText = trimmedText.slice(0, -1);
    }
    
    // Capitalize the first letter
    return trimmedText.replace(/^\w/, c => c.toUpperCase());
}


function generateInlineKeyboard(items, currentPage = 0) {
    // Determinar el número de elementos y el número de columnas
    const itemCount = items.length;
    let columns;
    let paginated = false;
    let buttons = [];
    
    if (itemCount < 9) {
        columns = [0, 1, 2, 4, 5].includes(itemCount) ? 2 : 3;
    } else {
        columns = 3;
        paginated = true;
    }
    
    // Añadir los botones de los elementos
    const itemsPerPage = 9;
    
    if (paginated) {
        const pageStart = currentPage * itemsPerPage;
        const pageEnd = pageStart + itemsPerPage;
        buttons = items.slice(pageStart, pageEnd).map(item =>
          Markup.button.callback(item.item, `delete_item_${item.id}`));
    } else {
        buttons = items.map(item =>
          Markup.button.callback(item.item, `delete_item_${item.id}`));
    }
    
    // Agregar botones de navegación si es necesario
    if (paginated) {
        // Agregar botón para ir a la página anterior si no estamos en la primera página
        if (currentPage > 0) {
            buttons.push(Markup.button.callback('⬅️', `prev_page_${currentPage - 1}`));
        }
        
        // Agregar botón de retorno al menú principal
        buttons.push(Markup.button.callback('↩️', 'go_back'));
        
        // Agregar botón para ir a la próxima página si hay más elementos
        if (itemCount > (currentPage + 1) * itemsPerPage) {
            buttons.push(Markup.button.callback('➡️', `next_page_${currentPage + 1}`));
        }
    } else {
        // Solo añadir botón de retorno al menú principal
        buttons.push(Markup.button.callback('↩️', 'go_back'));
    }
    
    // Crear el teclado con la cantidad de columnas determinada por la lógica anterior
    const keyboard = Markup.inlineKeyboard(buttons, { columns: columns });
    return keyboard;
}

class EggCart {
    constructor() {
        this.listController = new EggoListController();
        this.bot = new Telegraf(config.telegram.token);
        
        this.bot.telegram.getMe().then((botInfo) => {
            this.botName = botInfo.username;
        });
    }
    
    setupButtonHandlers() {
        this.bot.action(/prev_page_(\d+)/, async (ctx) => {
            const currentPage = parseInt(ctx.match[1]); // Obtener el número de página del callback
            try {
                const items = await this.listController.getItems();
                const keyboard = generateInlineKeyboard(items, currentPage);
                
                // Aquí puedes editar el mensaje actual o enviar uno nuevo con el teclado actualizado
                await ctx.editMessageText("Which one do you want to delete?", { reply_markup: keyboard });
                
            } catch (error) {
                console.error("Error en prev_page:", error);
                await ctx.reply("An error occurred.");
            }
        });
        
        this.bot.action(/next_page_(\d+)/, async (ctx) => {
            const currentPage = parseInt(ctx.match[1]); // Obtener el número de página del callback
            
            try {
                const items = await this.listController.getItems();
                const keyboard = generateInlineKeyboard(items, currentPage);
                
                // Aquí puedes editar el mensaje actual o enviar uno nuevo con el teclado actualizado
                await ctx.editMessageText("Which one do you want to delete?", { reply_markup: keyboard });
                
            } catch (error) {
                console.error("Error en next_page:", error);
                await ctx.reply("An error occurred.");
            }
        });
        
        this.bot.action('check_item', async (ctx) => {
            const currentPage = 0;
            try {
                // Eliminar el mensaje actual con la lista de compras
                await ctx.deleteMessage();
                
                // Consultar la lista de compras actual
                const items = await this.listController.getItems();
                
                const keyboard = generateInlineKeyboard(items, currentPage);
                
                // Responder con un nuevo mensaje y el teclado
                await ctx.reply("Which one do you want to delete?", keyboard);
                
            } catch (error) {
                console.error("Error en check_item:", error);
                await ctx.reply("An error occurred.");
            }
        });
        
        this.bot.action('ok', async (ctx) => {
            try {
                await ctx.editMessageReplyMarkup({
                    chat_id: ctx.chat.id,
                    message_id: ctx.update.callback_query.message.message_id,
                    reply_markup: { inline_keyboard: [] } });
                
            } catch (error) {
                console.error("Error editing message:", error);
            }
        });
        
        this.bot.action('clear', async (ctx) => {
            // Borrar el mensaje de la lista y mostrar el mensaje de confirmación
            try {
                await ctx.deleteMessage();
                
            } catch (error) {
                console.error("Error deleting the message:", error);
            }
            
            const confirmButton = Markup.button.callback('✔️', 'confirm_clear');
            const cancelButton = Markup.button.callback('❌', 'cancel_clear');
            const confirmationKeyboard = Markup.inlineKeyboard([confirmButton, cancelButton]);
            
            ctx.reply("Are you sure you want to delete the whole list?", confirmationKeyboard);
        });
        
        this.bot.action('confirm_clear', async (ctx) => {
            console.log("Confirm clear action triggered"); // Registro de depuración
            try {
                await ctx.deleteMessage();
                await this.performClearList(ctx);
                
            } catch (error) {
                console.error("Error en confirm_clear:", error);
            }
        });
        
        this.bot.action('cancel_clear', async (ctx) => {
            try {
                await ctx.deleteMessage();
                await this.performGetList(ctx);
                
            } catch (error) {
                console.error("Error deleting the message or showing the list:", error);
            }
        });
    }
    
    /**
     * Add an item to the shopping list via the bot command.
     */
    addItem() {
        this.bot.command('add', async (ctx) => {
            const messageText = ctx.update.message.text;
            const chatType = ctx.update.message.chat.type;
            
            if (messageText.includes(`@${this.botName}`) || chatType === 'private' || chatType === 'group') {
                let itemsToAdd = messageText.slice(messageText.indexOf(" ") + 1).split(",");
                let response = 'Okay\\! \n';
                
                for (let itemText of itemsToAdd) {
                    try {
                        await this.listController.addItem(beautifyText(itemText.trim()));
                        response += `*${escapeMarkdownV2Characters(beautifyText(itemText.trim()))}*, `;
                        
                    } catch (error) {
                        console.error(error);
                    }
                }
                
                response = response.slice(0, -2) + ' is \\(are\\) now on the shopping list\\.';
                ctx.replyWithMarkdownV2(response);
            }
        });
    }
    
    /**
     * Remove an item from the shopping list via the bot command.
     */
    deleteItem() {
        this.bot.command('remove', async (ctx) => {
            const messageText = ctx.update.message.text;
            const chatType = ctx.update.message.chat.type;
            
            if (messageText.includes(`@${this.botName}`) || chatType === 'private' || chatType === 'group') {
                let itemsToRemove = messageText.slice(messageText.indexOf(" ") + 1).split(",");
                let response = '';
                
                for (let itemName of itemsToRemove) {
                    let escapedItemName = escapeMarkdownV2Characters(beautifyText(itemName.trim()));
                    
                    try {
                        const item = await this.listController.findItemByName(beautifyText(itemName.trim()));
                        if (item) {
                            await this.listController.removeItem(item.id);
                            response += `Okay\\!\n*${escapedItemName}* removed from the shopping list\\.\n`;
                            
                        } else {
                            response += `Oh\\!\n*${escapedItemName}* not found in the shopping list\\.\n`;
                        }
                        
                    } catch (error) {
                        console.error(error);
                        response += `Oh\\!\nError removing *${escapedItemName}* from the shopping list\\.\n`;
                    }
                }
                
                if (response === '') {
                    response = "No items specified for removal\\.";
                }
                
                ctx.replyWithMarkdownV2(response);
                }
        });
    }
    
    /**
     * Retrieve the shopping list via the bot command.
     */
    getList() {
        this.bot.command('list', async (ctx) => {
            const messageText = ctx.update.message.text;
            const chatType = ctx.update.message.chat.type;
            
            if (messageText.includes(`@${this.botName}`) || chatType === 'private' || chatType === 'group') {
                await this.performGetList(ctx);
            }
        });
    }
    
    async performGetList(ctx) {
        try {
            let items = await this.listController.getItems();
            let response = '*Grocery List*\n';
            
            if (items.length === 0) {
                response = "Nothing to shop for\\. \nTry adding eggs\\.";
                ctx.replyWithMarkdownV2(response);
                
            } else {
                items.forEach((item, index) => {
                    response += `${index + 1}\\. ${escapeMarkdownV2Characters(item.item)}\n`;
                });
                
                const keyboard = Markup.inlineKeyboard([
                    Markup.button.callback('✏️', 'check_item'),
                    Markup.button.callback('✔️', 'ok'),
                    Markup.button.callback('🔥', 'clear')
                ]);
                
                ctx.replyWithMarkdownV2(response, keyboard);
            }
            
            
        } catch (error) {
            console.error(error);
            ctx.replyWithMarkdownV2("An error occurred while getting the list\\.");
        }
    }
    
    /**
     * Clear the shopping list via the bot command.
     */
    clearList() {
        this.bot.command('clear', async (ctx) => {
            const messageText = ctx.update.message.text;
            const chatType = ctx.update.message.chat.type;
            
            if (messageText.includes(`@${this.botName}`) || chatType === 'private' || chatType === 'group') {
                await this.performClearList(ctx);
            }
        });
        
        this.setupButtonHandlers();
    }
    
    async performClearList(ctx) {
        try {
            let items = await this.listController.getItems();
            for (const item of items) {
                await this.listController.removeItem(item.id);
            }
            
            ctx.replyWithMarkdownV2("The shopping list has been cleared\\.");
            
        } catch (error) {
            console.error(error);
            ctx.replyWithMarkdownV2("An error occurred while clearing the list\\.");
        }
    }
    
    
    /**
     * Provide help information via the bot command.
     */
    help() {
        this.bot.help((ctx) => {
            const messageText = ctx.update.message.text;
            const chatType = ctx.update.message.chat.type;
            
            if (messageText.includes(`@${this.botName}`) || chatType === 'private' || chatType === 'group') {
                ctx.reply(
                  "Add an item: /add Eggs, Milk\n" +
                  "Remove an item: /remove Eggs, Milk\n" +
                  "Show the list: /list\n" +
                  "Clear the list: /clear"
                );
            }
        });
    }
    
    /**
     * Launch the Telegram bot.
     */
    connect() {
        this.bot.launch().then(() => {
            console.log('Bot launched successfully');
            
        }).catch(error => {
            console.error('Error launching bot:', error);
        });
    }

}

module.exports = EggCart;

