import * as puppeteer from 'puppeteer';
import { promisify } from 'util';
import { createReadStream, unlink, mkdir, exists } from 'fs';
import { join } from 'path';
import { generate } from 'shortid';
import { ErrorObject } from '@resource-checker/base';

const fs = {
  exists: promisify(exists),
  mkdir: promisify(mkdir),
  unlink: promisify(unlink),
}

type RemoteFileIdentifier = {
  id: string;
};

export interface IExternalFSDriver {
  save(filename: string, stream: NodeJS.ReadableStream): Promise<RemoteFileIdentifier|ErrorObject>;
}

export interface IChromeConfig {
  maxPages: number,
  externalFSDriver: IExternalFSDriver,
  directory?: string,
}

export default class Chrome {
  private static instance: Chrome;
  private client: puppeteer.Browser;
  private _initialized: boolean;
  private pages: number;
  private directory: string;

  constructor(private config: IChromeConfig) {
    if (Chrome.instance) return Chrome.instance;

    this._initialized = false;
    this.pages = 0;
    this.directory = config.directory || 'tmp';
  }

  get initialized() {
    return this._initialized;
  }

  get activePages() {
    return this.pages;
  }

  private getPageProxy(page: puppeteer.Page) {
    this.pages += 1;

    return new Proxy(page, {
      get: (target, prop: keyof puppeteer.Page) => {
        if (prop === 'close') {
          return async (...args: any) => {
            await target.close(...args);

            this.pages -= 1;
          };
        }
        return target[prop];
      },
    });
  }

  get core() {
    return new Proxy(this.client, {
      get: (target, prop: keyof puppeteer.Browser) => {
        if (prop === 'newPage') {
          return async () => {
            // use pub/sub here
            do {
              await new Promise(r => setTimeout(r, 100));
            } while(this.pages === this.config.maxPages);

            const page = await target.newPage();
            
            return this.getPageProxy(page);
          };
        }

        return target[prop];
      }
    });
  }

  private async createDirectoryForScreenshotsIfNotExists() {
    const dir = join(process.cwd(), this.directory);

    if (!await fs.exists(dir)) {
      await fs.mkdir(dir);
    } 
  }

  async initialize(): Promise<void|ErrorObject> {
    if (this._initialized) return;

    this._initialized = true;

    try {
      // TODO: find safer option
      this.client = await puppeteer.launch({
        args: ['--disable-dev-shm-usage', '--no-sandbox'],
        executablePath: '/usr/bin/chromium-browser',
      });

      await this.createDirectoryForScreenshotsIfNotExists();
    } catch (error) {
      this._initialized = false;
      return new ErrorObject(error.message, { stack: error.stack });
    }
  }

  protected async saveToLocalFS(page: puppeteer.Page) {
    const filename = `screenshot_${generate()}.jpeg`;
    let filepath = `./${this.directory}/${filename}`;

    await page.screenshot({
      fullPage: true,
      omitBackground: true,
      path: filepath,
      quality: 20,
      type: 'jpeg',
    });

    filepath = join(process.cwd(), filepath);

    return {
      createStream: () => createReadStream(filepath),
      delete: () => fs.unlink(filepath),
      filename,
    };
  }

  public async savePage(page: puppeteer.Page) {
    try {
      const descriptor = await this.saveToLocalFS(page);

      const file = await this.config.externalFSDriver.save(descriptor.filename, descriptor.createStream());
  
      await descriptor.delete();
  
      if (file instanceof ErrorObject) return file;
  
      return file.id;
    } catch (error) {
      return new ErrorObject(error.message, { source: Chrome.name, stack: error.stack });
    }
  }
}
