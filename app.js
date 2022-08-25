require('dotenv').config()
const {readFileSync, existsSync, writeFileSync} = require('fs')
const express = require('express')
const app = express()
app.use(require('cors')({origin:'*'}))
app.use(express.json())
app.use(express.urlencoded({extended: true}))
app.use('/', require('./src/routes'))
async function init(){
  console.log('app running on port '+process.env.port_app)
}
if(process.env.production){
	const local_key = "./storage/local-private.key"
	const local_cert = "./storage/local-public.crt"
	let key = "./storage/private.key"
	let cert = "./storage/public.crt"
	const auth = "./storage/local-ca.json"
	if(existsSync(auth)){
		key = local_key
		cert = local_cert
	}
	if((!existsSync(key) || !existsSync(cert)) ){
		key = local_key
		cert = "./storage/local-public.crt"
		console.log("Certificate and Key missing, generating local ones...")
		const data = require("./cert")({ca:true, protocol:process.env.protocol, host:process.env.host})
		writeFileSync(cert, data["Authority"]["Cert"])
		writeFileSync(key, data["Authority"]["Private"])
		writeFileSync(auth, JSON.stringify(data["Authority"]))
	}

  const ssl = {
    key: readFileSync(key),
    cert: readFileSync(cert),
  }
  require('https')
    .createServer(ssl, app)
    .listen(process.env.port_app, init)
}
else  process.env.host ? app.listen(process.env.port_app, process.env.host, init) : app.listen(process.env.port_app, init)