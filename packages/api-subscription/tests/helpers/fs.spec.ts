import { join } from 'path';

import { fs } from '../../src/helpers';

describe('importDefaultModules', () => {
  const path = join(__dirname, 'fixtures', 'dir1');

  it('should process all modules', () => {
    const modules: Object[] = [];
    fs.importDefaultModules(path, module => modules.push(module));

    expect(modules).toEqual([{
      test: 1,
    }, {
      test: 2,
    }]);
  });

  it('should process all modules except skipped', () => {
    const modules: Object[] = [];
    fs.importDefaultModules(path, module => modules.push(module), ['dir1']);

    expect(modules).toEqual([{
      test: 2,
    }]);
  });
});
