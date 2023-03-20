'use strict'
var User = require('../models/User');

function home(req, res) {
    res.status(200).send({
        message: 'Hello World!'
    });
}

function pruebas(req, res) {
    console.log(req.body);
    res.status(200).send({
        message: 'Pruebas!'
    });
}

module.exports = {
    home,pruebas
}