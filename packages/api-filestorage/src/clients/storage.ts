import * as admin from 'firebase-admin';
import { IConfiguration } from '@resource-checker/configurations';

let instance: FirebaseStorage;

const MINUTE = 60000;
const HOUR = 60 * MINUTE;
const DAY = 24 * HOUR;

export interface IStorageObject {
  data?: string|Buffer;
  stream?: NodeJS.ReadableStream;
  filename: string;
}

export interface IStorageClient {
  insert(object: IStorageObject): Promise<void>;
  getPublicUrl(filename: string, days?: number): Promise<{ url: string }>;
  delete(filename: string): Promise<void>;
  exists(filename: string): Promise<boolean>;
}

class FirebaseStorage implements IStorageClient {
  private client: admin.app.App;

  constructor(private config: IConfiguration) {
    if (instance) return instance;

    this.client = admin.initializeApp({
      projectId: this.config.get('projectId'),
      credential: admin.credential.cert({
        clientEmail: this.config.get('clientEmail'),
        privateKey: this.config.get('privateKey'),
        projectId: this.config.get('projectId'),
      }),
      storageBucket: this.config.get('storageBucket'),
    });

    instance = this;
  }

  private writeFileViaStream = (source: NodeJS.ReadableStream, destination: NodeJS.WritableStream) => {
    return new Promise((resolve, reject) => {
      source
        .pipe(destination)
        .on('finish', resolve)
        .on('error', reject);
    });
  }

  async insert(object: IStorageObject): Promise<void> {
    if (!object.stream && !object.data) throw new Error('Please provide file via stream or data field');

    const bucket = this.client.storage().bucket();
    const file = bucket.file(object.filename);

    if (object.stream) {
      const stream: NodeJS.ReadableStream  = object.stream;

      await this.writeFileViaStream(stream, file.createWriteStream());
    }

    if (object.data) {
      await file.save(object.data);
    }
  }

  async getPublicUrl(filename: string, days: number = 14 * DAY): Promise<{ url: string }> {
    const config = { 
      action: 'read',
      expires: new Date().getTime() + days,
    };

    const bucket = this.client.storage().bucket();
    const response = await bucket.file(filename).getSignedUrl(config);

    return { url: response[0] };
  }

  async delete(filename: string) {
    const bucket = this.client.storage().bucket();

    await bucket.file(filename).delete();
  }

  async exists(filename: string): Promise<boolean> {
    const bucket = this.client.storage().bucket();
    const file = bucket.file(filename);

    const [exists] = await file.exists();

    return exists;
  }
}

export default FirebaseStorage;
