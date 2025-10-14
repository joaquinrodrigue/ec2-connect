const mysql = require('mysql2/promise');

let connection = null;

async function query(sql, params) {
    // Singleton connection
    if (connection === null) connection = await mysql.createConnection({
        host: "student-databases.cvode4s4cwrc.us-west-2.rds.amazonaws.com",
        user: "joaquinrodriguez",
        password: "0dgkR2ZcJfZmwOsekWKDjv4ioGoze0L8l9F",
        database: 'joaquinrodriguez'
    });

    const [results, ] = await connection.execute(sql, params);

    return results;
}

module.exports = { query };