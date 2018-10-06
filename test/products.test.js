let app = require('../app')
let chai = require('chai')
let request = require('supertest')

let config = require('../properties/config.properties')

let expect = chai.expect

describe('Products API Integration Test', function(){

    describe('GET /api/items', function(){

        it('should get a code 200', function(done){
            request(app).get(`/api/items/search?q=test`)
            .end(function(err, res){
                expect(res.statusCode).to.equal(200)
                done()
            })
        })

        it('should get an array', function(done){
            request(app).get(`/api/items/search?q=test`)
            .end(function(err, res){
                expect(res.body).to.be.an('array')
                done()
            })
        })

        it('should get most 4 items', function(done){
            request(app).get(`/api/items/search?q=test`)
            .end(function(err, res){
                expect(res.body.length).to.be.most(4)
                done()
            })
        })

    })

    describe('GET /api/items/:id', function(){

        it('should get a code 200', function(done){
            request(app).get(`/api/items/MLA672691704`)
            .end(function(err, res){
                expect(res.statusCode).to.equal(200)
                done()
            })
        })

        it('should get an object', function(done){
            request(app).get(`/api/items/MLA672691704`)
            .end(function(err, res){
                expect(res.body).to.be.an('object')
                done()
            })
        })

        it('should have all properties', function(done){
            request(app).get(`/api/items/MLA672691704`)
            .end(function(err, res){
                expect(res.body).to.include.all.keys('item', 'price', 'author');
                done()
            })
        })

        it('item should have all properties', function(done){
            request(app).get(`/api/items/MLA672691704`)
            .end(function(err, res){
                expect(res.body.item).to.include.all.keys('id', 'title', 'picture', 'condition', 'free_shipping', 'sold_quantity');
                done()
            })
        })

        it('price should have all properties', function(done){
            request(app).get(`/api/items/MLA672691704`)
            .end(function(err, res){
                expect(res.body.price).to.include.all.keys('amount');
                done()
            })
        })

        // TODO: traer las propiedades de author name y lastname
        // it('author should have all properties', function(done){
        //     request(app).get(`/api/items/MLA672691704`)
        //     .end(function(err, res){
        //         expect(res.body.author).to.include.all.keys('name', 'lastname');
        //         done()
        //     })
        // })

    })

})