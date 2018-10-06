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

    axios.get(`${config.url_ML_api}search?q=${criteria}&limit=${config.limit_result}&attributes=results`, {
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

getProductById = (req, res) => {
    const id = req.params['id'];

    var schema = {}
    var responses = [];

    axios.get(`${config.url_ML_api_items}${id}`, {
            method: 'get'
        })
        .then(respItem => {

            schema = formatProduct(respItem);

            
            
            
            logger.info(`Request: ${config.url_ML_api_items}${id}, Result: ${JSON.stringify(respItem.data, undefined, 4)}`);
            
            
            // Obtain currency 
            var currency_id=schema.price.currency_id;
            
            schema = populateCurrency(currency_id, schema)

            
            schema = populateDescription(id);
            
            console.log(schema);

            // axios.get(`${config.url_ML_api_currencies}${currency_id}`, {
            //     method: 'get'
            // })
            // .then(responseCurrency => {
            //     schema = {
            //         ...schema,
            //         price: {
            //             ...schema.price,
            //             currency: responseCurrency.data.plain_text,
            //             decimals: responseCurrency.data.decimal_places,
            //             currency: responseCurrency.data.description,
            //         }
            //     }
                
                
            //     console.log(schema);

            //     logger.info(`Request: ${config.url_ML_api_currencies}${currency_id}, Result: ${JSON.stringify(responseCurrency.data, undefined, 4)}`);

            // })
            // .catch(err => {
            //     logger.error(`${config.url_ML_api_currencies}${currency_id}, getProductById::currency error: ${err.message}`)
            //     return res.status(500).send({
            //         message: 'Server error'
            //     })
            // })

            // // Obtain description 
            // axios.get(`${config.url_ML_api_items}${id}/description`, {
            //         method: 'get'
            //     })
            //     .then(responseDescription => {
            //         schema = {
            //             ...schema,
            //             item: {
            //                 ...schema.item,
            //                 description: responseDescription.data.plain_text
            //             }
            //         }

            //         logger.info(`Request: ${config.url_ML_api_items}${id}/description, Result: ${JSON.stringify(responseDescription.data, undefined, 4)}`);
            //         return res.status(200).send(schema)
            //     })
            //     .catch(err => {
            //         logger.error(`Request: ${config.url_ML_api_items}${id}/description, getProductById::description error: ${err.message}`)
            //         return res.status(500).send({
            //             message: 'Server error'
            //         })
            //     })

        })
        .catch(err => {
            logger.error(`Request: ${config.url_ML_api_items}${id}, getProductById error: ${err.message}`)
            return res.status(500).send({
                message: 'Server error'
            })
        })
}

const populateCurrency= async (currency_id, schema) => {
    await axios.get(`${config.url_ML_api_currencies}${currency_id}`, {
        method: 'get'
    })
    .then(responseCurrency => {
        schema = {
            ...schema,
            price: {
                ...schema.price,
                currency: responseCurrency.data.plain_text,
                decimals: responseCurrency.data.decimal_places,
                currency: responseCurrency.data.description,
            }
        }
        
        logger.info(`Request: ${config.url_ML_api_currencies}${currency_id}, Result: ${JSON.stringify(responseCurrency.data, undefined, 4)}`);

        return schema;
    })

    return schema;
}

const populateDescription = async (id, schema) => {
    // Obtain description 
    await axios.get(`${config.url_ML_api_items}${id}/description`, {
        method: 'get'
    })
        .then(responseDescription => {
            schema = {
                ...schema,
                item: {
                    ...schema.item,
                    description: responseDescription.data.plain_text
                }
            }

            logger.info(`Request: ${config.url_ML_api_items}${id}/description, Result: ${JSON.stringify(responseDescription.data, undefined, 4)}`);
            return schema
        })
}

const formatProduct = respItem => {
    let  schema = {};

    schema = {
        author: config.author,
        item: {
            id: respItem.data.id,
            title: respItem.data.title,
            picture: respItem.data.pictures[0].url,
            condition: respItem.data.condition,
            free_shipping: respItem.data.shipping.free_shipping,
            sold_quantity: respItem.data.sold_quantity,
        },
        price: {
            amount: respItem.data.price,
            currency_id: respItem.data.currency_id
        }
    }

    return schema

}

module.exports = {
    getProductsBySeach,
    getProductById
}