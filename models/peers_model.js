const mysql = require('mysql2');

// Create the connection to database
const connection = mysql.createConnection({
    host: process.env.database_host,
    port: process.env.database_port,
    user: process.env.database_user,
    password: process.env.database_password,
    database: process.env.database_name
});

module.exports.checkExisting_metainfo_peer = (info_hash, peer_id) => {
    return new Promise((resolve, reject) => {
        function func(err, results, fields) {
            if (err) reject(err);
            else {
                if (results.length) resolve(true);
                else resolve(false);
            }
        }
        connection.query(
            `SELECT *
            FROM metainfo_peer
            WHERE peer_id = '${peer_id}' AND info_hash = '${info_hash}'`,
            func
        )
    })
}

module.exports.checkExisting_peer = (peer_id) => {
    return new Promise((resolve, reject) => {
        function func(err, results, fields) {
            if (err) reject(err);
            else {
                if (results.length) resolve(true);
                else resolve(false);
            }
        }
        connection.query(
            `SELECT *
            FROM peer
            WHERE peer_id = '${peer_id}'`,
            func
        )
    })
}

module.exports.checkExisting_metainfo = (info_hash) => {
    return new Promise((resolve, reject) => {
        function func(err, results, fields) {
            if (err) reject(err);
            else {
                if (results.length) resolve(true);
                else resolve(false);
            }
        }
        connection.query(
            `SELECT *
            FROM metainfo
            WHERE info_hash = '${info_hash}'`,
            func
        )
    })
}

module.exports.add_metainfo = async (info_hash) => {
    await new Promise((resolve, reject) => {
        function func(err, results, fields) {
            if (err) reject(err);
            else resolve();
        }
        connection.query(
            `INSERT INTO metainfo
            VALUES ('${info_hash}')`,
            func
        )
    })
}

module.exports.add_metainfo_peer = async (info_hash, peer_id, downloaded, left, event) => {
    await new Promise((resolve, reject) => {
        function func(err, results, fields) {
            if (err) reject(err);
            else resolve();
        }
        connection.query(
            `INSERT INTO metainfo_peer
            VALUES ('${peer_id}', '${info_hash}', ${downloaded}, ${left}, '${event}' )`,
            func
        )
    })
}

module.exports.add_peer = async (peer_id, ip, port) => {
    await new Promise((resolve, reject) => {
        function func(err, results, fields) {
            if (err) reject(err);
            else resolve();
        }
        connection.query(
            `INSERT INTO peer
            VALUES ('${peer_id}', '${ip}', ${port})`,
            func
        )
    })
}

module.exports.get_metainfo_peer = (info_hash, peer_id) => {
    return new Promise((resolve, reject) => {
        function func(err, results, fields) {
            if (err) reject(err);
            else resolve(results);
        }
        connection.query(
            `SELECT *
            FROM metainfo_peer
            WHERE peer_id = '${peer_id}' AND info_hash = '${info_hash}'`,
            func
        )
    })
}

module.exports.getPeerList = (info_hash, peer_id) => {
    return new Promise((resolve, reject) => {
        function func(err, results, fields) {
            if (err) reject(err);
            else resolve(results);
        }
        connection.query(
            `WITH 
                a AS (
                    SELECT * 
                    FROM metainfo_peer
                    WHERE info_hash = '${info_hash}' AND event_now IN ('started', 'completed')
                )
            SELECT p.peer_id, p.ip, p.port
            FROM peer AS p JOIN a ON p.peer_id = a.peer_id
            WHERE p.peer_id <> '${peer_id}'
            ORDER BY rand()`,
            func
        )
    })
}

module.exports.update_metainfo_peer = async (info_hash, peer_id, port, downloaded, left, event) => {
    await new Promise((resolve, reject) => {
        function func(err, results, fields) {
            if (err) reject(err);
            else resolve(results);
        }
        connection.query(
            `UPDATE metainfo_peer
            SET 
                event_now = '${event}',
                data_downloaded = ${downloaded},
                data_left = ${left}
            WHERE peer_id = '${peer_id}' AND info_hash = '${info_hash}'`,
            func
        )
    })
}

module.exports.delete_metainfo_peer = async (peer_id, info_hash) => {
    await new Promise((resolve, reject) => {
        function func(err, results, fields) {
            if (err) reject();
            else resolve();
        }
        connection.query(
            `DELETE FROM metainfo_peer
            WHERE peer_id = '${peer_id}' AND info_hash = '${info_hash}'
            ;`,
            func
        )
    })
}

module.exports.testData = async (info_hash) => {
    let results_query;

    const queryPromise = new Promise((resolve, reject) => {
        function func(err, results, fields) {
            if (err) reject(err);
            else resolve(results);
        }
        connection.query(
            `SELECT * FROM test`,
            func
        )
    })

    await queryPromise.then(
        function save_result(results) {
            results_query = results;
        }
    )

    return results_query;
}

module.exports.testData2 = async (info_hash) => {
    await new Promise((resolve, reject) => {
        function func(err, results, fields) {
            if (err) {
                console.log("error");
                reject(err);
            }
            else {
                console.log(results);
                resolve(results);
            }
        }
        connection.query(
            `SELECT * FROM test`,
            func
        )
    })
}
    