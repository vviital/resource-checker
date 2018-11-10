import * as nconf from 'nconf';

interface IEnv {
  key: string;
  value: string|number;
};

nconf
  .use('memory')
  .env({
    transform(obj: IEnv) {
      if (typeof obj.value !== 'string') {
        return false;
      }

      obj.value = obj.value.trim();
      return obj;
    }
  });

export default nconf;
