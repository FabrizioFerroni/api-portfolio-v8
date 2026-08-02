import { Injectable } from '@nestjs/common';
import * as Forge from 'node-forge';
import { ConfigService } from '@nestjs/config';

@Injectable()
export class DecryptCredentialsService {
  private cipher: string;
  private randomKey: string;
  private iv: string;
  private credentialsUser: string;
  private privateKey: string;

  constructor(private configService: ConfigService) {}

  public main(credentials: string) {
    this.cipher = credentials;

    this.splitStringCipher();
    this.decodeBase64Fields();
    this.readPrivateKey();
    this.decryptRandomKey();
    this.decryptCredentialsUser();

    return this.credentialsUser;
  }

  private splitStringCipher() {
    const cipherSplit = this.cipher.split('.');

    if (cipherSplit.length !== 3) {
      throw new Error('Formato de payload inválido: se esperaban 3 segmentos');
    }

    this.randomKey = cipherSplit[0];
    this.iv = cipherSplit[1];
    this.credentialsUser = cipherSplit[2];
  }

  private decodeBase64Fields() {
    this.randomKey = Forge.util.decode64(this.randomKey);
    this.iv = Forge.util.decode64(this.iv);
  }

  private readPrivateKey() {
    const privateKeyB64 = this.configService.get<string>('PRIVATE_KEY');
    this.privateKey = Buffer.from(privateKeyB64, 'base64').toString('utf-8');
  }

  private decryptRandomKey() {
    const pem: string = this.privateKey;
    const passphrase: string = this.configService.get<string>(
      'PASSWORD_PRIVATE_KEY',
    );
    const keydecrypt = Forge.pki.decryptRsaPrivateKey(pem, passphrase);
    this.randomKey = keydecrypt.decrypt(this.randomKey, 'RSA-OAEP');
  }

  private decryptCredentialsUser() {
    const combined = Forge.util.decode64(this.credentialsUser);
    const tag = combined.slice(-16);
    const cipherText = combined.slice(0, -16);

    const decipher = Forge.cipher.createDecipher('AES-GCM', this.randomKey);
    decipher.start({ iv: this.iv, tag: Forge.util.createBuffer(tag) });
    decipher.update(Forge.util.createBuffer(cipherText));
    const success = decipher.finish();

    if (!success) {
      throw new Error('Credenciales alteradas o clave incorrecta');
    }

    this.credentialsUser = JSON.parse(decipher.output.toString());
  }

  get splitCipher() {
    return this.splitStringCipher();
  }
}
