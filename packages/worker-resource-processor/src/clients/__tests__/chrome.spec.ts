import { existsSync } from 'fs';
import { join } from 'path';
import * as rimraf from 'rimraf';
import * as puppeteer from 'puppeteer';
import { POM } from '@resource-checker/test-utils';
import * as getStream from 'get-stream';

import Chrome from '../chrome';

describe('Chrome', () => {
  const chrome = new Chrome({ maxPages: 2, directory: 'test_tmp' });
  const directory = join(process.cwd(), 'test_tmp');
  const url = 'https://example.com';
  const pom = POM.content(url);

  beforeAll(() => {
    pom.prepare();
  });

  afterAll(async () => {
    pom.cleanUp();
    await chrome.core.close();
    rimraf.sync(directory);
  });

  describe('initialize', () => {
    it('should be uninitialized in the very beging', () => {
      expect(chrome.initialized).toBeFalsy();
      expect(existsSync(directory)).toBeFalsy();
    });

    it('should initialize chrome', async () => {
      const result = await chrome.initialize();
      expect(result).toBeFalsy();
    })

    it('should be initialized', () => {
      expect(chrome.initialized).toBeTruthy();
      expect(existsSync(directory)).toBeTruthy();
    });
  });

  describe('core', () => {
    const autoClose = (page: puppeteer.Page, timeout: number = 1000) => setTimeout(() => page.close(), timeout);

    it('should open no more pages than specified in configurations', async () => {
      const page1 = await chrome.core.newPage();
      const page2 = await chrome.core.newPage();
      const pagePromise3 = chrome.core.newPage();

      expect(chrome.activePages).toEqual(2);

      autoClose(page1);
      autoClose(page2);

      const page3 = await pagePromise3;

      expect(page3.isClosed()).toBeFalsy();
      expect(chrome.activePages).toBeLessThan(3);

      await page3.close();
    });
  });

  describe('savePage', () => {
    it('should return page descriptor', async () => {
      const page = await pom.mockPuppeter(await chrome.core.newPage());
      await page.goto(url);

      const descriptor = await chrome.savePage(page);

      const actualScreenshot = await getStream(descriptor.createStream());
      const expectedStreenshot = await getStream(pom.info.screenshot());

      expect(actualScreenshot).toEqual(expectedStreenshot);
    });
  });
});
