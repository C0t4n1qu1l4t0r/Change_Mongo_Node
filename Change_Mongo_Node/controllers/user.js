'use strict'

var User = require('../models/user');

//routes
function home(req,res){
    res.status(200).send({
        message: 'Hello World!'
    });
}
function pruebas (req,res){
    console.log(req.body);
    res.status(200).send({
        message: 'Test  action'
    });
}    
module.exports = (
    home,pruebas
)