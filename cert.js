const { asn1, random, pki, util, md } = require('node-forge')

const assertPositive = (hexstr) => {//RFC 4.1.2.2 must be signed positive integer
	var msb = parseInt(hexstr[0], 16)
	if (msb < 8) return hexstr
	msb -= 8
	return msb.toString() + hexstr.substring(1)
}

function verify(cert) {
	const CA = pki.createCaStore()
	CA.addCertificate(cert)
	pki.verifyCertificateChain(CA, [cert])
}

function createAuthorithy(keyPair, identity, extensions, years) {
	const auth = random.getBytesSync(9)
	const cert = pki.createCertificate()
	
	cert.serialNumber = assertPositive(util.bytesToHex(auth))
	cert.validity.notBefore = new Date();
	cert.validity.notAfter = new Date();
	cert.validity.notAfter.setFullYear(cert.validity.notBefore.getFullYear() + years)
	cert.setSubject(identity)
	cert.setIssuer(identity)
	cert.publicKey = keyPair.publicKey
	cert.setExtensions(extensions)
	cert.sign(keyPair.privateKey, md.sha256.create())
	
	const fingerprint = md.sha1.create()
	.update(asn1.toDer(pki.certificateToAsn1(cert)).getBytes()).digest().toHex()
	.match(/.{2}/g).join(':')
	
	try {
		verify(cert)
	} catch (error) {
		console.log(error)
	}
	
	return {
		["Cert"]: pki.certificateToPem(cert),
		["Private"]: pki.privateKeyToPem(keyPair.privateKey),
		["Public"]: pki.publicKeyToPem(keyPair.publicKey),
		["Fingerprint"]: fingerprint,
	}
}

function createCertificate(privateKey, identity, years, length) {
	const app = random.getBytesSync(9)
	const subkeyPair = pki.rsa.generateKeyPair(length)
	const cert = pki.createCertificate()
	cert.serialNumber = assertPositive(util.bytesToHex(app))
	cert.validity.notBefore = new Date()
	cert.validity.notAfter = new Date()
	cert.validity.notAfter.setFullYear(cert.validity.notBefore.getFullYear() + years)
	
	const sub_identity = identity.map(attr => attr.name === 'commonName' ? ({ name: "commonName", value: "app" }) : attr)
	cert.setSubject(sub_identity)
	cert.setIssuer(sub_identity)
	cert.publicKey = subkeyPair.publicKey
	
	cert.sign(privateKey, md.sha256.create())
	
	return pki.certificateToPem(cert)
}

module.exports = ({
	//required
	ca, sub, privateKey, protocol, host,
	//optional
	identity, extensions, years = 3, length = 2048
}) => {
	
	const baseIdentity = [
		{ name: 'commonName', value: host },
		{ name: 'countryName', value: 'MX' },
		{ shortName: 'ST', value: 'Jalisco' },
		{ name: 'localityName', value: 'Zapopan' },
		{ name: 'organizationName', value: 'BAP Corporativo' },
		{ shortName: 'OU', value: 'BAP' }
	]
	identity = identity || baseIdentity
	const baseExtentions = [
		{ name: 'basicConstraints', cA: true },
		{ name: 'keyUsage', keyCertSign: true, digitalSignature: true, nonRepudiation: true, keyEncipherment: true, dataEncipherment: true },
		{
			name: 'subjectAltName', altNames: [{ type: 6, value: `${protocol}://${host}` }]
		}]
		extensions = extensions || baseExtentions
		
		const data = {}
		const keyPair = pki.rsa.generateKeyPair(length)
		if (ca) data["Authority"] = createAuthorithy(keyPair, identity, extensions, years)
		if (sub) {
			privateKey = privateKey ? pki.privateKeyFromPem(privateKey) : keyPair.privateKey
			data["Client"] = createCertificate(privateKey, identity, years, length)
		}
		return data
	}