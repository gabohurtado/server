const express = require('express');

// Controllers
const productsController = require('../controllers/products.controller')

const api = express.Router()

api.get('/items/search', productsController.getProductsBySeach)
api.get('/items/:id', productsController.getProductById)

module.exports = api