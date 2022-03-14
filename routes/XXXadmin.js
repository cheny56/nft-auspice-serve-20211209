var express = require("express");
var router = express.Router();
const { findall } = require("../utils/db");
const mysql = require("mysql2");
const env = process.env.NODE_ENV || "development"; //test 'developmentpc' //  // 'development'// 'production' //
const config = require("../configs/dbconfig.json")[env];
// const config = require("../configs/dbconfig.json")[env];

const connection = mysql.createConnection({
  host: config.host,
  user: config.username,
  password: config.password,
  database: config.database,
});

router.get("/member/state", (req, res) => {
  const column = "id,createdat,address,nickname";

  connection.query(`SELECT ${column} FROM users`, (err, results, fields) => {
    console.log(results);
    if (results) res.status(200).send(results).end();
    else res.status(404).end();
  });

  // findall("users").then((resp) => {
  //   if (resp) res.status(200).send(resp).end();
  //   else res.status(404).end();
  // });
});

router.get("/member/test", (req, res) => {
  const column = "id";

  connection.query(`SELECT ${column} FROM users`, (err, results, fields) => {
    console.log(results);
  });

  findall("users").then((resp) => {
    if (resp) res.status(200).send(resp).end();
    else res.status(404).end();
  });
});

module.exports = router;
