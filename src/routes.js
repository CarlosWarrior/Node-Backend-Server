const {Router} = require('express')
const _catch = require('./middleware/catch')
const throttle = require('./middleware/throttle')
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
		.get("/list", _catch(controller.list))
		.post("/create", _catch(controller.create))
		.put("/update/:tid", _catch(controller.update))
		.delete("/remove/:tid", _catch(controller.remove))
	)

const Root = Router()
	.use(log)
	.use(throttle)
	.use("/auth", AuthRouter)
	.use(_catch(auth.middleware))
	.use("/app", AppRouter)

module.exports = Root