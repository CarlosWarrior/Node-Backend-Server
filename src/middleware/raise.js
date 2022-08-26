class AppError extends Error {
	constructor({ status, message, errors }) {
		super(message)
		this.name = this.constructor.name
		this.statusCode = status
		if (errors)
		this.errors = errors
		Error.captureStackTrace(this, this.constructor)
	}
}
function Raise({ status, message, errors }) { throw new AppError({ status, message, errors }) }
module.exports = Raise