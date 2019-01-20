import { IConnectable } from './declarations';

const connected = () => {
  return (target: IConnectable, propertyName: string, descriptor: TypedPropertyDescriptor<Function>) => {
    if (!descriptor.value) return;
    const fn = descriptor.value;
    descriptor.value = async function (...args: any[]) {
      await this.connect();
      return fn.apply(this, args);
    };
  };
};

export { connected };
