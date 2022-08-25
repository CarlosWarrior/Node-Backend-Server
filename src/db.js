const mysql = require('mysql')
const {promisify} = require("es6-promisify")

class DB {
  init() {
    this.__connection = mysql.createConnection({
      host : process.env.db_host,
      user : process.env.db_user,
      password : process.env.db_password,
      database : process.env.db_database
    })
    this.__connection.connect()
    this.__query = promisify(this.__connection.query.bind(this.__connection))

    return this
  }
  query(query){ return this.__query(query) }
  end(){ this.__connection.end()}
}

module.exports = new DB().init()