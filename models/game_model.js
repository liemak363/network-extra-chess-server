const mysql = require('mysql2');

// Create the connection to database
const connection = mysql.createConnection({
    host: process.env.database_host,
    port: process.env.database_port,
    user: process.env.database_user,
    password: process.env.database_password,
    database: process.env.database_name
});

module.exports.createGame = (name, tag, ip, port) => {
    return new Promise((resolve, reject) => {
        function func(err, results, fields) {
            if (err) reject(err);
            else resolve();
        }
        connection.query(
            `INSERT INTO GAME (tag, name, IP, Port)
            VALUES ('${tag}', '${name}', '${ip}', ${port})`,
            func
        )
    })
}

module.exports.getAllGame = () => {
    return new Promise((resolve, reject) => {
        function func(err, results, fields) {
            if (err) reject(err);
            else resolve(results);
        }
        connection.query(
            `SELECT tag, name, IP, Port FROM GAME`,
            func
        )
    })
}

module.exports.finishGame = (tag) => {
    return new Promise((resolve, reject) => {
        function func(err, results, fields) {
            if (err) reject(err);
            else resolve();
        }
        connection.query(
            `DELETE FROM GAME
            WHERE tag = '${tag}'`,
            func
        )
    })
}