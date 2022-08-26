const mysql = require('mysql2/promise')
const {schemas} = require("./models")

const client = {
  host : process.env.db_host,
  user : process.env.db_user,
  password : process.env.db_password,
  database : process.env.db_database,
  waitForConnections: true,
  connectionLimit: 0,
  queueLimit: 0
}
const admin = {
  host : process.env.db_host,
  user : process.env.db_admin,
  password : process.env.db_admin_password,
  database : process.env.db_admin_database,
}

function data(err, data, meta, resolve, reject) {
  if(err) return reject(err)
  data.forEach(console.log)
}

async function init(){
  const admin_client = await mysql.createConnection(admin)

  const [records, meta] = await admin_client.query("show tables;")
  const tables = records.map(r => r["Tables_in_bap"])
  await Object.keys(schemas).reduce(async(pv, sk) => {
    const previous = await pv
    if(previous){
      const [records, meta] = previous
      console.log({records, meta})
    }
    return tables.includes(schemas[sk].name)? delay(1): admin_client.query(schemas[sk].setup)
  }, delay(1))
  return admin_client.end()
}
function delay (interval){
  return new Promise((resolve) => setTimeout(resolve, interval))
}

const _connection = mysql.createConnection(client)
async function read(query, values){
  const connection = await _connection
  const [records, meta] = await connection.execute(query, values)
  return records
}
async function write(query, values){
  const connection = await _connection
  const successfull = await connection.execute(query, values)
  return successfull > 0
}
async function remove(query, values){
  const connection = await _connection
  const successfull = await connection.execute(query, values)
  return successfull > 0
}

module.exports = {
  init,
  client:{
    read,
    write,
    remove,
  },
}