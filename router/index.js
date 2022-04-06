const express = require('express');
const router = express.Router();
const config = require('../config.js');
const sql = require('mysql');

// add some middleware to parse out our post request data
router.use(express.json());
router.use(express.urlencoded({ 'extended' : false }));

// create a connection to our sql database using our user credentials
// that were stored in config.js
let pool = sql.createPool({
    connectionLimit: 20,
    host : config.host,
    user : config.user,
    password : config.password,
    database : config.database,
    port: 3306
})

// a route with /:text is a dynamic route
// what comes after the colon is a route paramater
// can be used like a variable in your JS code

router.post('/signup', (req, res) => {
    console.log('hit add user route');

    let user = req.body;

    pool.getConnection((err, connection) => {
        if (err) throw err;

        let query = `INSERT INTO user(first_name, last_name, password, role, permissions, avatar) VALUES('${user.username}', 'test', '${user.password}', 0, 3, '')`;

        connection.query(query, (err, result) => {
            connection.release();

            if (err) throw err;

            console.log(result);

            res.json({action: 'added'});
        })
    })
});

// router.post('/getone', (req, res) => {
//     console.log(`hit the user route: the user is ${req.body}`);

router.post('/getone', (req, res) => {
    pool.getConnection((err, connection) => {
        if (err) throw err;

        let currentUser = req.body,
            loginResult = {};

        let query = `SELECT first_name, password FROM user WHERE first_name="${currentUser.username}"`;

        connection.query(query, function(error, user) {
            connection.release();

            if (error) throw error;
            if (!user[0]) {
                loginResult.action = "add";
            } else if (user[0].password !== currentUser.password) {
                loginResult.field = "password"; 
                loginResult.action = "retry";
            } else {
                loginResult.action = "authenticate";
            }        
            res.json(loginResult);
        })
    })
})


// this route handler will match with any /users api call

router.get('/getall', (req, res) => {
    // connect to the database
    pool.getConnection((err, connection) => {
    // report an error if one happens
    if (err) throw err;
    // if no error, run a query and get results
    connection.query('SELECT * from user', function (error, results) {
    // release the connection
    connection.release();
    
    if (error) throw error;
    
    // log the data to the terminal window
    results.forEach(result => {
    delete result.password;
    delete result.last_name;
    
    if (!result.avatar) { result.avatar = "temp_avatar.jpg"; }
    })
    
    console.log(results);
    res.json(results);
    });
  });
})    

module.exports = router;