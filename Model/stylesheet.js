const connection = require('./connection');

// --- GET ALL ---
async function getAll(parameters = {}) {
    let selectSql = `SELECT * FROM stylesheet`;
    where = [],
    queryParameters = [];

    // name
    if (typeof parameters.name !== 'undefined' && parameters.name.length > 0) {
        where.push('name LIKE ?');
        queryParameters.push(`%${parameters.name}%`);
    }
    // owner
    // I'm not sure if sqlString.escape() is necessary if someone tries to escape the number field, it's going throuhg a parseInt call so I would assume its fine
    if (typeof parameters.owner !== 'undefined' && parseInt(parameters.owner) > -1) {
        where.push('owner = ?');
        queryParameters.push(parameters.owner);
    }

    // Add statements together
    if (where.length > 0) {
        selectSql += ` WHERE ${where.join(' AND ')}`;
    }

    //console.log(selectSql);
    //console.log(queryParameters);
    return await connection.query(selectSql, queryParameters);
}

// --- GET BY ID ---
async function get(id, parameters = {}) {
    let selectSql = `SELECT * FROM stylesheet WHERE id = ?`, 
    queryParameters = [id];

    return await connection.query(selectSql, queryParameters);
}

// --- INSERT ---
async function insert(parameters = {}) {
    let selectSql = `INSERT INTO stylesheet (name, owner)
                    VALUES (?, ?)`, 
    queryParameters = [parameters.name, parameters.owner];
    
    return await connection.query(selectSql, queryParameters);
}

// --- EDIT ---
async function edit(id, parameters = {}) {
    let selectSql = `UPDATE stylesheet SET data = ? WHERE id = ?`, 
    queryParameters = [parameters.data, id];
    return await connection.query(selectSql, queryParameters);
}

// --- REMOVE ---
async function remove(id, parameters = {}) {
    let selectSql = `DELETE FROM stylesheet WHERE id = ?`, queryParameters = [id];
    return await connection.query(selectSql, queryParameters);
}

module.exports = { getAll, get, insert, edit, remove };