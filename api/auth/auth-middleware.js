const db = require('../../data/db-config.js');
/*
  If the user does not have a session saved in the server

  status 401
  {
    "message": "You shall not pass!"
  }
*/
const restricted = (req, res, next) => {
  
  if (!req.session) {
    res.status(401).json({
      message: "You shall not pass!"
    })
  } else {
    next();
  }
};

/*
  If the username in req.body already exists in the database

  status 422
  {
    "message": "Username taken"
  }
*/
const checkUsernameFree = async (req, res, next) => {
  const user = await db('users').where('username', req.body.username);
  if (user) {
    next();
  } else {
    res.status(422).json({ message: "username is taken"});
  }
}

/*
  If the username in req.body does NOT exist in the database

  status 401
  {
    "message": "Invalid credentials"
  }
*/
const checkUsernameExists = async (req, res, next) => {
  const user = await db('users').where('username', req.body.username);
  if (user) {
    next();
  } else {
    res.status(401).json({ message: "invalid credentials"});
  }
}

/*
  If password is missing from req.body, or if it's 3 chars or shorter

  status 422
  {
    "message": "Password must be longer than 3 chars"
  }
*/
const checkPasswordLength = (req, res, next) => {
  const check = req.body;
  if (check.password.length < 3 || !check.password.length) {
    res.status(422).json({ message: "password must be longer than 3 characters"})
  } else {
    next();
  }
}

// Don't forget to add these to the `exports` object so they can be required in other modules
module.exports = {
  restricted,
  checkUsernameFree,
  checkUsernameExists,
  checkPasswordLength,
}