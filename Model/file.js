const connection = require('./connection');

async function getAll(parameters = {}) {
    let selectSql = ``, queryParameters = [];
    return await connection.query(selectSql, queryParameters);
}

async function get(id, parameters = {}) {
    let selectSql = ``, queryParameters = [];
    return await connection.query(selectSql, queryParameters);
}

async function insert(parameters = {}) {
    let selectSql = ``, queryParameters = [];
    return await connection.query(selectSql, queryParameters);
}

async function edit(id, parameters = {}) {
    let selectSql = ``, queryParameters = [];
    return await connection.query(selectSql, queryParameters);
}

async function remove(id, parameters = {}) {
    let selectSql = ``, queryParameters = [];
    return await connection.query(selectSql, queryParameters);
}

module.exports = { getAll, get, insert, edit, remove };