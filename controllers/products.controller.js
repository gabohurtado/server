// Modules
const axios = require('axios');

// Settings
const config = require('../properties/config.properties')
const log4jsProperties = require('../properties/log4js.properties')

// Logger
const log4js = require('log4js')
log4js.configure(log4jsProperties.products)
const logger = log4js.getLogger('products')

getProductsBySeach = async (req, res) => {
    try {
        var queryResult = await getProducts(req.query.q)

        var items = await queryResult.results.map(item => formatProduct(item).item)
        var categories = getCategories(queryResult);

        var schema = {
            author: config.author,
            categories,
            items
            
        }
    }catch (err){
        logger.error(`Request: ${config.url_ML_api}search?q=${req.query.q}&limit=${config.limit_result}`, `getProductsBySearch error: ${err.message}`)
        return res.status(500).send({
            message: 'Server error'
        })
    }

    return res.status(200).send(schema)
}

const getProducts = async criteria => await axios.get(`${config.url_ML_api}search?q=${criteria}&limit=${config.limit_result}`, {
    method: 'get',
})
.then(response => response.data)

// Get item in following format:
// {
//     author: {
//         name: String
//         lastname: String
//     },
//     item: {
//         id: String,
//         title: String,
//         price: {
//             currency: String,
//             amount: Number,
//             decimals: Number,
//         },
//         picture: String,
//         condition: String,
//         free_shipping: Boolean,
//         sold_quantity,
//         Number
//         description: String
//     }
// }
getProductById = async (req, res) => {
    const id = req.params['id'];
    try {
        var schema = await getProduct(id)
        var description = await obtainDescription(id)
        var currency = await obtainCurrency(schema.item.price.currency)
        schema = {
            author: config.author,
            ...schema,
            item: {
                ...schema.item,
                price: {
                    currency: currency.description,
                    ...schema.item.price,
                    decimals: currency.decimal_places
                },
                description
            },
        }
    } catch (err){
        logger.error(`Request: ${config.url_ML_api_items}${id}`, `getProductById error: ${err.message}`)
            return res.status(500).send({
                message: 'Server error'
            })
    }

    console.log(schema);
    console.log(description);

    return res.status(200).send(schema)
}

const getProduct = async id => await axios.get(`${config.url_ML_api_items}${id}`, {
        method: 'get'
    })
    .then(respItem => formatProduct(respItem.data))

const formatProduct = respItem => schema = {
    item: {
        id: respItem.id,
        title: respItem.title,
        price: {
            currency: respItem.currency_id,
            amount: respItem.price,
        },
        picture: respItem.picture?respItem.pictures[0].url:respItem.thumbnail,
        condition: respItem.condition,
        free_shipping: respItem.shipping.free_shipping,
        sold_quantity: respItem.sold_quantity,
    }
}

const obtainDescription = async id => await axios.get(`${config.url_ML_api_items}${id}/description`, {
        method: 'get'
    })
    .then(responseDescription => responseDescription.data.plain_text)

const obtainCurrency = async currency_id => await axios.get(`${config.url_ML_api_currencies}${currency_id}`, {
        method: 'get'
    })
    .then(responseCurrency => responseCurrency.data)

 const getCategories = queryResult => {
    let categoryFilter = queryResult.available_filters.filter(filter => filter.id === 'category')
    let categories = categoryFilter.length !== 0 ? categoryFilter[0].values.map(category => category.name):{}
    return categories;
 }

module.exports = {
    getProductsBySeach,
    getProductById
}