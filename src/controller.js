const raise = require('./middleware/raise')
const db_client = require('./db')

function brief(req, res, next){
    const query = ``
    const data = await db_client.query(query)
    res.send({data})
}
function list(req, res, next){
    const query = ``
    const data = await db_client.query(query)
    res.send({data})
}
function create(req, res, next){
    const query = ``
    const data = await db_client.query(query)
    res.send({data})
}
function update(req, res, next){
    const query = ``
    const data = await db_client.query(query)
    res.send({data})
}
function remove(req, res, next){
    const query = ``
    const data = await db_client.query(query)
    res.send({data})
}
module.exports = {
    brief,
    list,
    create,
    update,
    remove,
}