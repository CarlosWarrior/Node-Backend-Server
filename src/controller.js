const { escape } = require('sqlstring')
const raise = require('./middleware/raise')
const DB = require('./db')
const { schemas, builders } = require("./models")

async function brief(req, res, next) {
	const query = `select * from briefs;`
	const data = await DB.client.read(query)
	res.send(data)
}
async function list(req, res, next) {
	const query = `select * from tasks;`
	const data = await DB.client.read(query)
	res.send(data)
}
async function read(req, res, next) {
	const task = await find(req)
	if (!task) return raise({ status: 404, message: "task not found" })
	res.send(task)
}
async function create(req, res, next) {
	const { task, errors } = builders.Task.create(req.body)
	if (Object.keys(errors).length > 0) return raise({ status: 400, message: "validation error", errors: JSON.stringify(errors) })
	const cols = Object.keys(schemas.Task.attrs)
	const values = cols.map(c => task[c])
	const query = `insert into tasks (${cols.join(',')}) values(${values.map(() => '?').join(',')});`
	const data = await DB.client.write(query, values)
	res.send(data)
}
async function update(req, res, next) {
	const existingTask = await find(req)
	if (!existingTask) raise({ status: 404, message: 'not found' })
	const { task, errors } = builders.Task.update(existingTask, req.body)
	if (Object.keys(errors).length > 0) return raise({ status: 400, message: "validation error", error: JSON.stringify(errors) })
	if (Object.keys(task).length == 0) return res.send()
	const modifiedCols = Object.keys(task)
	const cols = Object.keys(schemas.Task.attrs).filter(attr => modifiedCols.includes(attr))
	const values = cols.map(c => task[c])
	values.push(existingTask.id)
	const query = `update tasks set ${cols.map((c, i) => `${c}=?`).join(",")} where id=?;`
	const data = await DB.client.write(query, values)
	res.send(data)
}
async function remove(req, res, next) {
	const existingTask = await find(req)
	if (!existingTask) raise({ status: 404, message: 'not found' })
	const data = await DB.client.remove(`delete from tasks where id = ?`, [existingTask.id])
	res.send(data)
}
async function find(req) {
	const tid = req.params.tid
	if (!tid) return null
	const existingTasks = await DB.client.read(`select * from tasks where id = ?`, [tid])
	if (existingTasks.length < 1) return null
	return existingTasks[0]
}
module.exports = {
	brief,
	read,
	create,
	update,
	remove,
}