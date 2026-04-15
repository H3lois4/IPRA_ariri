"""Gera certificado SSL auto-assinado para o servidor IPRA no Ariri."""
import os
from OpenSSL import crypto

CERT_DIR = os.path.join(os.path.dirname(os.path.abspath(__file__)), 'backend', 'certs')
CERT_FILE = os.path.join(CERT_DIR, 'cert.pem')
KEY_FILE = os.path.join(CERT_DIR, 'key.pem')


def generate_cert():
    if os.path.isfile(CERT_FILE) and os.path.isfile(KEY_FILE):
        print('Certificados já existem em', CERT_DIR)
        return CERT_FILE, KEY_FILE

    os.makedirs(CERT_DIR, exist_ok=True)

    # Gerar chave privada
    key = crypto.PKey()
    key.generate_key(crypto.TYPE_RSA, 2048)

    # Gerar certificado
    cert = crypto.X509()
    cert.get_subject().C = 'BR'
    cert.get_subject().ST = 'SP'
    cert.get_subject().O = 'IPRA no Ariri'
    cert.get_subject().CN = 'ipra-ariri.local'
    cert.set_serial_number(1000)
    cert.gmtime_adj_notBefore(0)
    cert.gmtime_adj_notAfter(365 * 24 * 60 * 60)  # 1 ano
    cert.set_issuer(cert.get_subject())
    cert.set_pubkey(key)

    # Adicionar SAN para aceitar qualquer IP local
    san = 'DNS:localhost,DNS:ipra-ariri.local,IP:127.0.0.1,IP:192.168.0.0/16,IP:10.0.0.0/8'
    # OpenSSL SAN precisa ser individual
    san_ext = crypto.X509Extension(
        b'subjectAltName', False,
        b'DNS:localhost,DNS:ipra-ariri.local,IP:127.0.0.1'
    )
    cert.add_extensions([san_ext])

    cert.sign(key, 'sha256')

    # Salvar
    with open(CERT_FILE, 'wb') as f:
        f.write(crypto.dump_certificate(crypto.FILETYPE_PEM, cert))
    with open(KEY_FILE, 'wb') as f:
        f.write(crypto.dump_privatekey(crypto.FILETYPE_PEM, key))

    print('Certificados gerados em', CERT_DIR)
    return CERT_FILE, KEY_FILE


if __name__ == '__main__':
    generate_cert()
