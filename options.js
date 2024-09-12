module.exports = {
    // телеграм API вимагає, щоб дані для reply_markup(кнопок) були передані в форматі json
    gameOptions: {
        reply_markup: JSON.stringify ({
            inline_keyboard: [
                [
                    {text: '1', callback_data: '1'}, 
                    {text: '4', callback_data: '4'}, 
                    {text: '7', callback_data: '7'}
                ], 
                [
                    {text: '2', callback_data: '2'}, 
                    {text: '5', callback_data: '5'}, 
                    {text: '8', callback_data: '8'}
                ], 
                [
                    {text: '3', callback_data: '3'}, 
                    {text: '6', callback_data: '6'}, 
                    {text: '9', callback_data: '9'}
                ]
                // [
                //     {text: '0', callback_data: '0'}
                // ]
            ]
        })
    },

    againOptions: {
        reply_markup: JSON.stringify ({
            inline_keyboard: [
                [
                    {text: 'Play Again 👾', callback_data: '/again'}
                ]
            ]
        })
    }
}