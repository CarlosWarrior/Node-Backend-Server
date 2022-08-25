class AppError extends Error {
  constructor({status, message}) {
    super(message)
    this.name = this.constructor.name
    this.statusCode = status
    Error.captureStackTrace(this, this.constructor)
  }
}
function Raise ({status, message}){throw new AppError({status, message})}
module.exports = Raise