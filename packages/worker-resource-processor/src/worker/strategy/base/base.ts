import { IConfiguration } from '@resource-checker/configurations';
import { ErrorObject } from '@resource-checker/base';
import { generate } from 'shortid';

import { Revision } from '@resource-checker/base/dest/clients/subscriptions';

import Comparator, { ComparationResult } from './comparator';

export type ProcessorResult = {
  revision: Revision,
  score: ComparationResult,
};

export type StrategyBaseOptions = {
  readonly revisions: ReadonlyArray<Readonly<Revision>>;
};

export type StrategyOptions = StrategyBaseOptions & {
  readonly type: string;
};

export interface IStrategy {
  handle(url: string): Promise<ProcessorResult | ErrorObject>;
}

export interface IStrategyClass {
  new (config: IConfiguration, options: StrategyOptions): IStrategy,
}

abstract class BaseStrategy implements IStrategy {
  protected comparators: Comparator[];

  constructor(protected config: IConfiguration, protected options: StrategyOptions) {
    this.comparators = [];
  }

  protected createRevisionObject(data: object) {
    return {
      id: generate(),
      revisionObject: data,
      type: this.options.type || 'Placeholder',
      created: new Date(),
    };
  }

  protected formatResponse(data: object, score: ComparationResult) {
    return {
      revision: this.createRevisionObject(data),
      score,
    }
  }

  protected get previousRevisions(): ReadonlyArray<Revision> {
    return this.options.revisions.filter(revision => revision.type === this.options.type);
  }

  protected normalizeScores(scores: ComparationResult[]) {
    const totalWeight = scores.reduce((total, score) => {
      total += score.weight;
      return total;
    }, 0);

    return scores.map(score => ({ ...score, weight: score.weight / totalWeight }));
  }

  protected async calculateScore(revision: Revision): Promise<ComparationResult> {
    const previousRevisions = this.previousRevisions;
    const latestRevision = previousRevisions[previousRevisions.length - 1];

    if (!latestRevision) {
      return { score: 1, weight: 1 };
    }

    let scores = await Promise.all(this.comparators.map(comparator => comparator.compare(latestRevision, revision)));
    scores = this.normalizeScores(scores);
    
    return scores.reduce((previous, current) => ({
      ...previous,
      score: previous.score + current.score * current.weight, 
    }), { score: 0, weight: 1 });
  }

  protected async abstract createRevision(url: string): Promise<Revision | ErrorObject>;

  async handle(url: string): Promise<ProcessorResult | ErrorObject> {
    const revision = await this.createRevision(url);

    if (revision instanceof ErrorObject) return revision;

    const score = await this.calculateScore(revision);

    return { score, revision };
  }
}

export default BaseStrategy;
