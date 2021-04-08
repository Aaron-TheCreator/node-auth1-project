// Require `checkUsernameFree`, `checkUsernameExists` and `checkPasswordLength`
// middleware functions from `auth-middleware.js`. You will need them here!
const router =require('express').Router();

const bcrypt = require('bcryptjs');

const Users = require('../users/users-model.js');

const {checkUsernameFree} = require('./auth-middleware.js');
const {checkUsernameExists} = require('./auth-middleware.js');
const {checkPasswordLength} = require('./auth-middleware.js');



/**
  1 [POST] /api/auth/register { "username": "sue", "password": "1234" }

  response:
  status 200
  {
    "user_id": 2,
    "username": "sue"
  }

  response on username taken:
  status 422
  {
    "message": "Username taken"
  }

  response on password three chars or less:
  status 422
  {
    "message": "Password must be longer than 3 chars"
  }
 */



router.post('/register', checkUsernameFree, checkPasswordLength, async (req, res, next) => {
  const user = req.body;

  // hashSync() method takes string to hash and salt, defualts to 10 if excluded
  const hash = bcrypt.hashSync(user.password, 8);
  user.password = hash;

  try {
    const saved = await Users.add(user);
    res.status(201).json(saved);
  } catch (err) {
    next(err);
  }
})
/**
  2 [POST] /api/auth/login { "username": "sue", "password": "1234" }

  response:
  status 200
  {
    "message": "Welcome sue!"
  }

  response on invalid credentials:
  status 401
  {
    "message": "Invalid credentials"
  }
 */
router.post('/login', checkUsernameExists, async (req, res, next) => {
  let { username, password } = req.body;

  try {
    const user = await Users.findBy({ username }).first();

    if (user && bcrypt.compareSync(password, user.password)) {
      req.session.user = user;
      res.status(200).json({ message: `Welcome ${username}`});
    } else {
      res.status(401).json({ message: 'invalid credentials'});
    }
  } catch (err) {
    next(err);
  }
});

/**
  3 [GET] /api/auth/logout

  response for logged-in users:
  status 200
  {
    "message": "logged out"
  }

  response for not-logged-in users:
  status 200
  {
    "message": "no session"
  }
 */

router.get('/logout', (req, res) => {
  if (req.session) {
    // req.session = null;
    // req.session.destroy((err) => {
    //   if (err) {
    //     res.status(400).json({ message: "error logging out" });
    //   } else {
    //     res.status(200).json({ message: "logged out" });
    //   }
    // });
  } else {
    // res.status(200).json({ message: 'no session' });
    res.end();
  }
}); 

router.get('/', (req, res) => {
  res.status(200).json({
    message: "Soooo...you wanna see what's inside, don't you?"
  })
})
// Don't forget to add the router to the `exports` object so it can be required in other modules
module.exports = router;