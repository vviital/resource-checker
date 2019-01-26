import { IConfiguration } from '@resource-checker/configurations';

import RedirectStrategy from './redirect/redirect';
import ContentHashStrategy from './contentHash/contentHash';
import ScreenShotStrategy from './screenshot/screenshot';
import { IStrategyClass, StrategyOptions, IStrategy, StrategyBaseOptions } from './base';

export interface IStrategyManager {
  getStrategies(types: string[], options: StrategyOptions): IStrategy[];
  getStrategies(options: StrategyOptions): IStrategy[];
}

export default class StrategyManager implements IStrategyManager {
  protected strategies: IStrategyClass[];

  constructor(protected config: IConfiguration) {
    this.strategies = [RedirectStrategy, ContentHashStrategy, ScreenShotStrategy];
  }

  protected applyStrategies(strategies: IStrategyClass[], options: StrategyOptions) {
    return strategies.map(Strategy => new Strategy(this.config, options));
  }

  getStrategies(types: string[]|StrategyOptions, options?: StrategyBaseOptions) {
    const opts: StrategyOptions = {
      type: 'FallbackType',
      ...(options || { revisions: [] }),
    }

    if (!Array.isArray(types) || !types.length) {
      return this.applyStrategies(this.strategies, opts);
    }

    const strategies = this.strategies.filter((strategy: IStrategyClass) => types.includes(strategy.name));

    if (strategies.length) {
      return this.applyStrategies(strategies, opts);
    }

    return this.applyStrategies(this.strategies, opts);
  }
}
