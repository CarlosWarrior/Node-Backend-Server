const forge = require('node-forge')

const assertPositive = (hexstr)=>{//RFC 4.1.2.2 must be signed positive integer
	var msb = parseInt(hexstr[0], 16)
	if (msb < 8) return hexstr
	msb -= 8
	return msb.toString() + hexstr.substring(1)
}

function verify(cert){
	const CA = forge.pki.createCaStore()
	CA.addCertificate(cert)
	forge.pki.verifyCertificateChain(CA, [cert])
}

function createAuthorithy(keyPair, identity, extensions, years){
	const auth = forge.random.getBytesSync(9)
	const cert = forge.pki.createCertificate()
	
	cert.serialNumber = assertPositive(forge.util.bytesToHex(auth))
	cert.validity.notBefore = new Date();
	cert.validity.notAfter = new Date();
	cert.validity.notAfter.setFullYear(cert.validity.notBefore.getFullYear() + years)
	cert.setSubject(identity)
	cert.setIssuer(identity)
	cert.publicKey = keyPair.publicKey
	cert.setExtensions(extensions)
	cert.sign(keyPair.privateKey, forge.md.sha256.create())
	
	const fingerprint = forge.md.sha1.create()
		.update( forge.asn1.toDer(forge.pki.certificateToAsn1(cert)).getBytes() ).digest().toHex()
		.match(/.{2}/g).join(':')
	
	try {
		verify(cert)
	} catch (error) {
		console.log(error)
	}

	return{
		["Cert"]: forge.pki.certificateToPem(cert),
		["Private"]: forge.pki.privateKeyToPem(keyPair.privateKey),
		["Public"]: forge.pki.publicKeyToPem(keyPair.publicKey),
		["Fingerprint"]: fingerprint,
	}	
}

function createCertificate(privateKey, identity, years, length){
	const app = forge.random.getBytesSync(9)
	const subkeyPair = forge.pki.rsa.generateKeyPair(length)
	const cert = forge.pki.createCertificate()
	cert.serialNumber = assertPositive(forge.util.bytesToHex(app))
	cert.validity.notBefore = new Date()
	cert.validity.notAfter = new Date()
	cert.validity.notAfter.setFullYear(cert.validity.notBefore.getFullYear() + years)

	const sub_identity = identity.map(attr => attr.name === 'commonName'?({name:"commonName", value:"app"}):attr)
	cert.setSubject(sub_identity)
	cert.setIssuer(sub_identity)
	cert.publicKey = subkeyPair.publicKey

	cert.sign(privateKey, forge.md.sha256.create())

	return forge.pki.certificateToPem(cert)
}

module.exports = ({
	//required
	ca, sub, privateKey, protocol, host,
	//optional
	identity, extensions, years = 3, length = 2048
}) => {

	const baseIdentity = [
		{name: 'commonName', value: host}, 
		{name: 'countryName', value: 'MX'}, 
		{shortName: 'ST', value: 'Jalisco'}, 
		{name: 'localityName', value: 'Zapopan'}, 
		{name: 'organizationName', value: 'BAP Corporativo'}, 
		{shortName: 'OU', value: 'BAP'}
	]
	identity = identity || baseIdentity
	const baseExtentions =  [
		{ name: 'basicConstraints', cA: true }, 
		{ name: 'keyUsage', keyCertSign: true, digitalSignature: true, nonRepudiation: true, keyEncipherment: true, dataEncipherment: true },
		{ name: 'subjectAltName', altNames: [{ type: 6, value: `${protocol}://${host}` }]
	}]
	extensions = extensions || baseExtentions

	const data = {}
	const keyPair =  forge.pki.rsa.generateKeyPair(length)
	if(ca) data["Authority"] = createAuthorithy(keyPair, identity, extensions, years)
	if(sub){
		privateKey =  privateKey ? forge.pki.privateKeyFromPem(privateKey) : keyPair.privateKey
		data["Client"] = createCertificate(privateKey, identity, years, length)
	}
	return data
}