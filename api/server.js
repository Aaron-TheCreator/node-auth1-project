const session = require('express-session');

const knexSessionStore = require('connect-session-knex')(session);

const express = require("express");
const helmet = require("helmet");
const cors = require("cors");

// express routers
const userRouter = require('./users/users-router.js');
const authRouter = require('./auth/auth-router.js');
/**
  Do what needs to be done to support sessions with the `express-session` package!
  To respect users' privacy, do NOT send them a cookie unless they log in.
  This is achieved by setting 'saveUninitialized' to false, and by not
  changing the `req.session` object unless the user authenticates.

  Users that do authenticate should have a session persisted on the server,
  and a cookie set on the client. The name of the cookie should be "chocolatechip".

  The session can be persisted in memory (would not be adecuate for production)
  or you can use a session store like `connect-session-knex`.
 */
// initialize express
const server = express();

// configs express-session, passed into session
const sessionConfig = {
  name: 'session',
  secret: 'abantiquomauro',
  resave: false,
  cookie: {
    maxAge: 1000 * 60 * 60,
    secure: false, //should be 'true' for https
    httpOnly: true
  },
  saveUninitialized: false,

  store: new knexSessionStore(
    {
      knex: require('../data/db-config.js'),
      tablename: 'sessions',
      sidfieldname: 'sid',
      createTable: true,
      clearInterval: 1000 * 60 * 60
    }
  )
}

// global middleware
server.use(helmet());
server.use(express.json());
server.use(cors());

server.use(session(sessionConfig));

server.use('/api/users', userRouter);
server.use('/api/auth', authRouter);

server.get("/", (req, res) => {
  res.json({ api: "up" });
});

server.use((err, req, res, next) => { // eslint-disable-line
  res.status(500).json({
    message: err.message,
    stack: err.stack,
  });
});

module.exports = server;
