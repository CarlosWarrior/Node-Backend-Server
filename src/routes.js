const { Router } = require('express')
const _catch = require('./middleware/catch')
const log = require('./middleware/log')
const auth = require('./auth')
const controller = require('./controller')

const AuthRouter = Router()
	.get("/", (req, res) => res.send("."))
	.post("/login", _catch(auth.login))
	.post("/register", _catch(auth.register))

const AppRouter = Router()
	.use("/tasks", Router()
		.get("/", (req, res) => res.send(".."))
		.get("/brief", _catch(controller.brief))
		.get("/:tid", _catch(controller.read))
		.post("/", _catch(controller.create))
		.put("/:tid", _catch(controller.update))
		.delete("/:tid", _catch(controller.remove))
	)

const Root = Router()
	.use(log)
	.use("/auth", AuthRouter)
	.use(_catch(auth.middleware))
	.use("/app", AppRouter)

module.exports = Root