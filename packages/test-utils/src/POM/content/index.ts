import * as nock from 'nock';
import { join } from 'path';
import * as puppeteer from 'puppeteer';
import * as fs from 'fs-extra';

import { IPOMoptions } from '../interfaces';

const prefix = '../../../assets/content';

const setupContentPOM = (endpoint: string, options: IPOMoptions = {}) => {
  const assets = {
    index: join(__dirname, prefix, 'index.html'),
    placeholder: join(__dirname, prefix, 'placeholder.jpeg'),
    screenshot: join(__dirname, prefix, 'screenshot.jpeg'),
  };

  const prepare = () => {
    nock.disableNetConnect();
    nock.enableNetConnect('127.0.0.1')

    if (options.throwError) {
      nock(endpoint)
        .persist()
        .get('/')
        .query(true)
        .reply(options.throwError);
    } else if (options.redirectTo) {
      nock(endpoint)
        .persist()
        .get('/')
        .query(true)
        .reply(302, undefined, {
          Location: options.redirectTo,
        });

      nock(options.redirectTo)
        .persist()
        .get('/')
        .query(true)
        .replyWithFile(200, assets.index);
    } else {
      nock(endpoint)
        .persist()
        .get('/')
        .query(true)
        .replyWithFile(200, assets.index);
    }

    nock(options.redirectTo || endpoint) 
      .persist()
      .get('/placeholder.jpeg')
      .query(true)
      .replyWithFile(200, assets.placeholder);
  };

  const cleanUp = () => {
    nock.enableNetConnect();
    nock.cleanAll();
  };

  const mockPuppeter = async (page: puppeteer.Page) => {
    await page.setRequestInterception(true);
    page.on('request', async (request: puppeteer.Request) => {
      switch (request.url()) {
        case `${endpoint}/`: {
          return await request.respond({
            status: 200,
            contentType: 'text/html; charset=utf-8',
            body: await fs.readFile(assets.index),
          });
        }
        case `${endpoint}/placeholder.jpeg`: {
          return await request.respond({
            status: 200,
            contentType: 'image/jpeg',
            body: await fs.readFile(assets.placeholder),
          });
        }
        default: throw new Error(`Unmocked url: ${request.url()}`);
      }
    });
    return page;
  };

  return {
    cleanUp,
    info: {
      hash: '034094e4cd6711aaaec62cfcadafcc14603cd7ba7bc6e1c0465d3fcc30a23160',
      screenshot: () => fs.createReadStream(assets.screenshot),
    },
    mockPuppeter,
    prepare,
  };
};

export default setupContentPOM;
