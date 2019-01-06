import { IConfiguration } from '@resource-checker/configurations';
import { ErrorObject } from '@resource-checker/base';
import { generate } from 'shortid';

export interface IProcessorResult {
  type: string;
  revisionObject: object;
}

export interface IRevision extends IProcessorResult {
  created: Date;
}

export interface IStrategyBaseOptions {
  readonly revisions: ReadonlyArray<Readonly<IRevision>>;
}

export interface IStrategyOptions extends IStrategyBaseOptions {
  readonly type: string;
}

export interface IStrategy {
  handle(url: string): Promise<IProcessorResult | ErrorObject>;
}

export interface IStrategyClass {
  new (config: IConfiguration, options: IStrategyOptions): IStrategy,
}

abstract class BaseStrategy implements IStrategy {
  constructor(protected config: IConfiguration, protected options: IStrategyOptions) {

  }

  protected formatResponse(data: object) {
    return {
      id: generate(),
      revisionObject: data,
      type: this.options.type,
    }
  }

  protected get previousRevisions(): ReadonlyArray<IRevision> {
    return this.options.revisions.filter(revision => revision.type === this.options.type);
  }

  async handle(url: string): Promise<IProcessorResult | ErrorObject> {
    return {
      type: 'Placeholder',
      revisionObject: {
        url,
      },
    };
  }
}

export default BaseStrategy;
