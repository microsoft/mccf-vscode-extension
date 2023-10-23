import * as cose from 'cose-js';
import * as jsrsasign from 'jsrsasign';
import * as fs from 'fs';
import * as crypto from 'crypto';

export async function coseSign(
  payload: Uint8Array,
  certPath: string,
  keyPath:string,
  msgType: string,
  proposalId: string,
  createdAt: number
) {
  const pemData = fs.readFileSync(certPath, 'utf8');
  const cert = new jsrsasign.X509();
  cert.readCertPEM(pemData);

  const sigAlg = cert.getSignatureAlgorithmName();
  const certFingerprint = jsrsasign.KJUR.crypto.Util.hashHex(cert.hex, 'sha256');
  var algName: string; 
  switch (sigAlg) {
    case "SHA256withECDSA":
      algName = "ES256";
      break;
    case "SHA384withECDSA":
      algName = "ES384";
      break;
    case "SHA512withECDSA":
      algName = "ES512";
      break;
    default:
      throw new Error("Invalid signature algorithm");
  }

  const protectedHeader = { alg: algName, kid: certFingerprint };
  const extraValue = { "ccf.gov.msg.type" : msgType, "ccf.gov.msg.proposal_id": proposalId, "ccf.gov.msg.created_at": createdAt };
  const mergeHeader = { ...protectedHeader, ...extraValue };
  
  const header = { p: mergeHeader };

  const keyData = fs.readFileSync(keyPath, 'utf8');
  const privateKeyData = keyData.match(/-----BEGIN EC PRIVATE KEY-----(.*)-----END EC PRIVATE KEY-----/s);
  let privateKeyHex;
  if (privateKeyData != null) {
    const privateKeyBase64 = privateKeyData[1].replace(/\n/g, '');

    privateKeyHex = Buffer.from(privateKeyBase64, 'base64');
  } else {
    throw new Error("Invalid private key");
  }

  const signer = {
    key: {
      d: new Uint8Array(privateKeyHex),
    }
  };

  const msg = await cose.sign.create(header, payload, signer);
  return msg;
}