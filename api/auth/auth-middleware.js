const UserModel = require("../users/users-model");
const bcryptjs = require("bcryptjs");

/*
  Kullanıcının sunucuda kayıtlı bir oturumu yoksa

  status: 401
  {
    "message": "Geçemezsiniz!"
  }
*/
function sinirli(req, res, next) {
  try {
    if (req.session && req.session.user_id > 0) {
      next();
    } else {
      next({
        status: 401,
        message: "Geçemezsiniz!",
      });
    }
  } catch (error) {
    next(error);
  }
}

/*
  req.body de verilen username halihazırda veritabanında varsa

  status: 422
  {
    "message": "Username kullaniliyor"
  }
*/
async function usernameBostami(req, res, next) {
  try {
    let existUsername = await UserModel.goreBul({
      username: req.body.username,
    });

    if (existUsername && existUsername.length > 0) {
      next({
        status: 422,
        message: "Username kullaniliyor",
      });
    } else {
      next();
    }
  } catch (error) {
    next(error);
  }
}

/*
  req.body de verilen username veritabanında yoksa

  status: 401
  {
    "message": "Geçersiz kriter"
  }
*/
async function usernameVarmi(req, res, next) {
  try {
    const existUsername = await UserModel.goreBul({
      username: req.body.username,
    });
    if (!existUsername || existUsername.length == 0) {
      next({
        status: 401,
        message: "Geçersiz kriter",
      });
    } else {
      req.existUsername = existUsername[0];
      next();
    }
  } catch (error) {
    next(error);
  }
}

/*
  req.body de şifre yoksa veya 3 karakterden azsa

  status: 422
  {
    "message": "Şifre 3 karakterden fazla olmalı"
  }
*/
function sifreGecerlimi(req, res, next) {
  try {
    let { password } = req.body;
    if (!password || password.length < 3) {
      next({
        status: 422,
        message: "Şifre 3 karakterden fazla olmalı",
      });
    } else {
      next();
    }
  } catch (error) {
    next(error);
  }
}

// Diğer modüllerde kullanılabilmesi için fonksiyonları "exports" nesnesine eklemeyi unutmayın.

module.exports = {
  usernameBostami,
  usernameVarmi,
  sifreGecerlimi,
  sinirli,
};
