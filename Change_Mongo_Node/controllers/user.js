"use strict";
const User = require("../models/User");
const jwt = require("../services/jwt");
const bcrypt = require('bcrypt');
const paginate = require('mongoose-paginate')

function home(req, res) {
  console.log(req.body)
  res.status(200).send({
    message: "Hello World!",
  });
}

function pruebas(req, res) {
  console.log(req.body);
  res.status(200).send({
    message: "Pruebas!",
  });
}

function saveUser(req, res) {
  var params = req.body;
  var user = new User();
  if (params.name && params.password && params.email) {
    user.name = params.name;
    user.email = params.email;
    user.role = "ROLE_USER";
    user.image = null;
    //Control if duplicate users exist
    User.find({
      $or: [
        {
          email: user.email.toLowerCase(),
        },
      ],
    }).exec((err, users) => {
      console.log(users);
      if (err) {
        res.status(500).send({
          message: "Error en la petición",
        });
      }
      if (users && users.length >= 1) {
        return res.status(400).send({
          message: "El usuario que intenta registrar ya existe",
        });
      } else {
        //In case no duplicate users it will encrypt the password
        bcrypt.genSalt(10, function (err, salt) {
          bcrypt.hash(params.password, salt, function (err, hash) {
            user.password = hash;
            user.save((err, userStored) => {
              //o tendrá un error o un usuario guardado
              if (err) {
                return res.status(500).send({
                  message: "Error al guardar el usuario",
                });
              }
              if (userStored) {
                res.status(200).send({
                  message: "User successfully registered",
                  user: userStored,
                });
              } else {
                res.status(404).send({
                  message: "No se ha registrado el usuario",
                });
              }
            });
          });
        });
      }
    });
  } else {
    //without return if just one possible return
    res.status(200).send({
      message: "Rellena todos los campos",
    });
  }
}

function getUsers(req, res) {
  //id of the authenticated user
  //var identity_user_id = req.user.sub;
  var page = 1;
  if (req.params.page) {
    page = req.params.page;
  }
  var items_per_page = 5;
  User.find()
    .sort("_id")
    .paginate(page, items_per_page, (err, users, total) => {
      if (err) {
        return res.status(500).send({
          message: "Error en la petición",
        });
      }
      if (!users) {
        return res.status(404).send({
          message: "No hay usuarios disponibles",
        });
      }
      return res.status(200).send({
        users,
        pages: Math.ceil(total / items_per_page),
      });
    });
}

function getUser(req, res) {
  var identity_user_id = req.user.sub;
  User.findById(identity_user_id).exec((err, user) => {
    if (err) {
      return res.status(500).send({
        message: "Error en la petición",
      });
    }
    if (!user) {
      return res.status(404).send({
        message: "Usuario no encontrado",
      });
    }
    return res.status(200).send({
      user,
    });
  });
}

function login(req, res) {
  var params = req.body;
  var email = params.email;
  var password = params.password;

  User.findOne(
    {
      email: email,
    },
    (err, user) => {
      if (err) {
        return res.status(500).send({ message: "Error en la peticion" });
      }
      if (user) {
        bcrypt.compare(password, user.password, (err, check) => {
          if (check) {
            user.password = undefined;
            res.status(200).send({ token: jwt.createToken(user) });
          } else {
            return res.status(404).send({
              message: "El usuario no se ha podido identificar correctamente",
            });
          }
        });
      } else {
        return res.status(404).send({
          message: "El usuario no se ha podido identificar correctamente",
        });
      }
    }
  );
}

function updateUser(req, res) {
  var userId = req.user.sub;
  var update = req.body; //all the object with the information I want toupdate, except from pw
  //delete the pw property
  delete update.password;
  console.log(update);

  User.findByIdAndUpdate(
    userId,
    update,
    {
      new: true, //returns the modified object, not the original without the update
    },
    (error, userUpdated) => {
      if (error) {
        return res.status(500).send({
          message: "Error en la petición",
        });
      }
      if (!userUpdated) {
        return res.status(404).send({
          message: "No se ha podido actualizar el usuario",
        });
      }
      return res.status(200).send({
        user: userUpdated,
      });
    }
  );
}

function deleteUser(req, res) {
  var userId = req.user.sub;
  User.find({
    _id: userId,
  }).remove((err) => {
    if (err) {
      return res.status(500).send({
        message: "Error al borrar el usuario",
      });
    }
    return res.status(200).send({
      message: "Usuario eliminado correctamente",
    });
  });
}

module.exports = {
  home,
  pruebas,
  saveUser,
  getUsers,
  getUser,
  login,
  updateUser,
  deleteUser
};
