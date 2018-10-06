module.exports = {
    // Author
    author: {
        name: 'Gabo',
        lastname: 'Hurtado'
    },

    // Port from server or 3001
    port: process.env.PORT || 3001,
    url_ML_api: `https://api.mercadolibre.com/sites/MLA/`,
    url_ML_api_items: `https://api.mercadolibre.com/items/`,
    url_ML_api_sellers: `https://api.mercadolibre.com/users/`,
    url_ML_api_currencies: `https://api.mercadolibre.com/currencies/`,
    url_ML_api_categories: `https://api.mercadolibre.com/categories/`,
    limit_result: 4,
    logger: {
        appenders: {
            cheese: {
                type: 'file',
                filename: 'app-mercadilibre.log'
            }
        },
        categories: {
            default: {
                appenders: ['cheese'],
                level: 'error'
            }
        }
    }

}