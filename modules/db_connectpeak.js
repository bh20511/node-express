const mysql = require('mysql2');

const pool = mysql.createPool({
    host: '192.168.35.148',
    user: 'mountains',
    password: '1214',
    database: 'hiking',
    waitForConnections: true,
    connectionLimit: 5,
    queryFormat: 0,
});


module.exports = pool.promise();