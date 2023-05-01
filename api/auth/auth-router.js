// `checkUsernameFree`, `checkUsernameExists` ve `checkPasswordLength` gereklidir (require)
// `auth-middleware.js` deki middleware fonksiyonları. Bunlara burda ihtiyacınız var!
const router = require("express").Router();
const middleware = require("./auth-middleware");
const userModel = require("../users/users-model");
const bcryptjs = require("bcryptjs");

/**
  1 [POST] /api/auth/register { "username": "sue", "password": "1234" }

  response:
  status: 201
  {
    "user_id": 2,
    "username": "sue"
  }

  response username alınmış:
  status: 422
  {
    "message": "Username kullaniliyor"
  }

  response şifre 3 ya da daha az karakterli:
  status: 422
  {
    "message": "Şifre 3 karakterden fazla olmalı"
  }
 */

router.post(
  "/register",
  middleware.sifreGecerlimi,
  middleware.usernameBostami,
  async (req, res, next) => {
    try {
      let hashedPassword = bcryptjs.hashSync(req.body.password);
      let userInfo = { username: req.body.username, password: hashedPassword };
      let insertedUser = await userModel.ekle(userInfo);
      res.status(201).json(insertedUser);
    } catch (error) {
      next(error);
    }
  }
);

/**
  2 [POST] /api/auth/login { "username": "sue", "password": "1234" }

  response:
  status: 200
  {
    "message": "Hoşgeldin sue!"
  }

  response geçersiz kriter:
  status: 401
  {
    "message": "Geçersiz kriter!"
  }
 */

router.post("/login", middleware.usernameVarmi, async (req, res, next) => {
  try {
    const { username, password } = req.body;
        const [registeredUser] = await userModel.goreBul({username});
        if(registeredUser && bcryptjs.compareSync(password, registeredUser.password)){
            req.session.user = registeredUser;
            res.json({message: `Hoşgeldin ${registeredUser.username}`});
    } else {
      next({
        status: 401,
        message: "Geçersiz kriter!",
      });
    }
  } catch (error) {
    next(error);
  }
});

/**
  3 [GET] /api/auth/logout

  response giriş yapmış kullanıcılar için:
  status: 200
  {
    "message": "Çıkış yapildi"
  }

  response giriş yapmamış kullanıcılar için:
  status: 200
  {
    "message": "Oturum bulunamadı!"
  }
 */

router.get("/logout", (req, res, next) => {
  try {
    if (req.session && req.session.user) {
      req.session.destroy((error) => {
        if (error) {
          next({
            message: "Burası Samiyen burdan çıkış yok!...",
          });
        } else {
          res.set(
            "Set-Cookie",
            "titan=; Path=/; Expires=Mon, 01 Jan 1970 00:00:00"
          );
          res.json({
            message: `Çıkış yapildi`,
          });
        }
      });
    } else {
      res.status(200).json({
        message: "Oturum bulunamadı!",
      });
    }
  } catch (error) {}
});

// Diğer modüllerde kullanılabilmesi için routerı "exports" nesnesine eklemeyi unutmayın.

module.exports = router;
