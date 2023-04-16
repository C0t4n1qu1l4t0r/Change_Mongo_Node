'use strict'

var express = require('express');
var md_auth = require('../middleware/authentication');

var UserController = require('../controllers/user');

var api = express.Router();

api.get('/home', UserController.home);
api.get('/pruebas', UserController.pruebas);
api.post('/register', UserController.saveUser);
api.get('/users/:page?', md_auth.ensureAuth, UserController.getUsers);
api.get('/me', md_auth.ensureAuth, UserController.getUser);
api.post('/login', UserController.login);
api.put('/user/:id/:update', md_auth.ensureAuth, UserController.updateUser);
api.delete('/user/:id', md_auth.ensure, AuthController.deleteUser);

module.exports = api;