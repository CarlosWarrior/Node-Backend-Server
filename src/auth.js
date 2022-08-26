const { genSaltSync, hashSync, compareSync } = require('bcrypt')
const { sign, decode } = require("jsonwebtoken")
const raise = require('./middleware/raise')
const DB = require('./db')
const { builders } = require('./models')

module.exports = {
	middleware: async (req, res, next) => {
		let token = req.get('token')
		if (!token) token = req.query.token
		if (!token) return raise({ status: 404, message: 'token header missing' })
		let _token = false
		try {
			_token = decode(token, { complete: true }).payload
		}
		catch (error) {
			return raise({ status: 500, message: 'invalid token', error })
		}
		if (!_token || !_token.user || !_token.time) return raise({ status: 500, message: 'invalid token' })
		
		const now = new Date()
		const then = new Date(_token.time)
		const elapsed = Math.abs(now - then) / 36e5
		const expired = isNaN(elapsed) || elapsed >= 10
		if (expired) return raise({ status: 401, message: 'expired token' })
		
		//Future traveler
		const user = _token.user
		res.locals = { username: user.username, token, now }
		next()
	},
	login: async (req, res) => {
		const { user, errors } = builders.User.create({ username: req.body.username, password: req.body.password })
		if (Object.keys(errors).length > 0) return raise({ status: 400, message: "validation error", error: JSON.stringify(errors) })
		const username = user.username
		const password = user.password
		const users = await DB.client.read(`select count(username) as count from users u where u.username = ?;`, [username])
		if (users[0].count < 1) return raise({ status: 422, message: "user not found" })
		
		const passwords = await DB.client.read(`select * from users u where u.username = ?;`, [username])
		const userPassword = passwords[0].password
		const attempt = compareSync(password, userPassword)
		if (attempt) {
			console.log(username, "signing...")
			let token = await sign({ user: { username }, time: new Date().toISOString() }, process.env.app_key)
			res.set("x-user-token", token)
			res.send(token)
		}
		else return raise({ status: 400, message: "" })
	},
	register: async (req, res, next) => {
		if (req.body.username && req.body.password) {
			const username = req.body.username
			const users = await DB.client.read(`select count(username) as count from users u where u.username = ?;`, [username])
			if (users[0].count) return raise({ status: 422, message: "username exists" })
			
			const password = req.body.password
			const { user, errors } = builders.User.create({ username, password })
			if (Object.keys(errors).length > 0) return raise({ status: 400, message: "validation error", error: errors })
			
			user["password"] = hashSync(user.password, genSaltSync(16), null)
			
			const userCreationFailed = await DB.client.write(`insert into users (username, password) values (?, ?);`, [user.username, user.password])
			
			res.send(userCreationFailed)
		}
		else return raise({ status: 400, message: "username and password required" })
	}
}