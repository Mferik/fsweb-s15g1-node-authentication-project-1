const router = require("express").Router();

const middleware = require("../auth/auth-middleware");
const UserModel = require("./users-model");

// `sinirli` middleware'ını `auth-middleware.js` dan require edin. Buna ihtiyacınız olacak!

/**
  [GET] /api/users

  Bu uç nokta SINIRLIDIR: sadece kullanıcı girişi yapmış kullanıcılar
  ulaşabilir.

  response:
  status: 200
  [
    {
      "user_id": 1,
      "username": "bob"
    },
    // etc
  ]

  response giriş yapılamadıysa:
  status: 401
  {
    "message": "Geçemezsiniz!"
  }
 */

  router.get("/", middleware.sinirli, async (req, res, next) => {
    try {
      const allUsers = await UserModel.bul();
      res.json(allUsers);
    } catch (error) {
      next(error);
    }
  });

// Diğer modüllerde kullanılabilmesi için routerı "exports" nesnesine eklemeyi unutmayın.

module.exports = router;
