function Log(req, res, next){
    console.log(`${req.ip} ${req.ips} ->\t ${req.method}@${req.get} ${req.originalUrl}`)
    return next()
}
module.exports = Log