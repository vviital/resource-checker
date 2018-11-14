import * as fs from 'fs';
import * as path from 'path';

const importDefaultModules = (basepath: string, callback: (module: object) => void, skipFiles: Array<string> = []) => {
  const directories: string[] = fs
    .readdirSync(basepath)
    .filter((filename) => {
      const fullpath = path.join(basepath, filename);

      console.log(fullpath, fs.statSync(fullpath).isDirectory());

      return fs.statSync(fullpath).isDirectory();
    });

  directories
    .filter(directory => skipFiles.indexOf(directory) === -1)
    .forEach((directory) => {
      const module: object = require(path.join(basepath, directory)).default;

      callback(module);
    });
};

export {
  importDefaultModules,
}
