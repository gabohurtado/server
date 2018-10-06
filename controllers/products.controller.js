// Modules
const axios = require('axios');

// Settings
const config = require('../properties/config.properties')
const log4jsProperties = require('../properties/log4js.properties')

// Logger
const log4js = require('log4js')
log4js.configure(log4jsProperties.products)
const logger = log4js.getLogger('products')

getProductsBySeach = (req, res) => {
    const criteria = req.query.q;

    axios.get(`${config.url_ML_api}search?q=${criteria}&limit=${config.limit_result}`, {
            method: 'get',
        })
        .then(response => {
            console.log(response.data);

            // schema = {
            //         id: response.data.id,
            //         title: response.data.title,
            //         picture: response.data.pictures[0].url,
            //         condition: response.data.condition,
            //         price: response.data.price
            //     }

            logger.info(`Request: ${config.url_ML_api}search?q=${criteria}&limit=${config.limit_result}&attributes=results`, `Result: ${JSON.stringify(response.data, undefined, 4)}`);
            return res.status(200).send(response.data.results)
        })
        .catch(err => {
            logger.error(`Request: ${config.url_ML_api}search?q=${criteria}&limit=${config.limit_result}&attributes=results`, `getProducts error: ${err.message}`)
            return res.status(500).send({
                message: 'Server error'
            })
        })
}

getProductById = async (req, res) => {
    const id = req.params['id'];
    try {
        var schema = await getProduct(id)
        var description = await obtainDescription(id)
        var currency = await obtainCurrency(schema.price.currency)
        schema = {
            ...schema,
            item: {
                ...schema.item,
                description
            },
            price: {
                ...schema.price,
                currency: currency.description,
                decimals: currency.decimal_places
            }
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

const formatProduct = respItem => {
    let schema = {
        author: config.author,
        item: {
            id: respItem.id,
            title: respItem.title,
            picture: respItem.pictures[0].url,
            condition: respItem.condition,
            free_shipping: respItem.shipping.free_shipping,
            sold_quantity: respItem.sold_quantity,
        },
        price: {
            amount: respItem.price,
            currency: respItem.currency_id
        }
    }

    console.log(schema);


    return schema

}
const obtainDescription = async id => await axios.get(`${config.url_ML_api_items}${id}/description`, {
        method: 'get'
    })
    .then(responseDescription => responseDescription.data.plain_text)

const obtainCurrency = async currency_id => await axios.get(`${config.url_ML_api_currencies}${currency_id}`, {
        method: 'get'
    })
    .then(responseCurrency => responseCurrency.data)

module.exports = {
    getProductsBySeach,
    getProductById
}