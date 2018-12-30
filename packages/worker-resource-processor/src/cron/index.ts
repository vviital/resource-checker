export interface ICronConfig {
  repeat: number,
  [key: string]: any,
}

export interface ICronInterface {
  operation(): Promise<object|void>;
  execute(): Promise<object|void>;
}

const logger = console;

abstract class CronJob implements ICronInterface {
  constructor(protected config: ICronConfig) {
  }

  // Placeholder for operation which should be ovveride in child class
  public operation(): Promise<object|void> {
    return Promise.resolve(undefined);
  }

  private scheduleNextCall(): void {
    const { repeat } = this.config;

    setTimeout(this.execute.bind(this), repeat);;
  }

  public execute(): Promise<object|void> {
    return this.operation()
      .then(result => logger.info('processed finished', JSON.stringify(result)))
      .catch(error => logger.error('process failed with error', error))
      .finally(() => this.scheduleNextCall());
  }
}

export default CronJob;
