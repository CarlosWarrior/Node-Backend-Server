function Catch(fn) {
	return (req, res, next) => {
		fn(req, res, next)
		.catch((e) => {
			return res.status(e.statusCode ? e.statusCode : 500).send({ message: e.message, status: e.statusCode, errors: e.errors })
		})
	}
}
module.exports = Catch