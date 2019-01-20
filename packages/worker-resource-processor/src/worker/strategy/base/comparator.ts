import { isEqual } from 'lodash';

import { IProcessorResult } from './base';

export const MAX_SCORE = 1;
export const MIN_SCORE = 0;

export interface IComparationResult {
  // the more score, the more likely pages are similar.
  score: number,
}

class Comparator {
  protected compareArrayOfResults(array: IProcessorResult[], second: IProcessorResult): IComparationResult {
    if (array.length === 0) return { score: MAX_SCORE };

    const first = array[array.length - 1];
    
    return this.compareTwoResults(first, second);
  }

  protected compareTwoResults(first: IProcessorResult, second: IProcessorResult): IComparationResult {
    if (isEqual(first, second)) return { score: MAX_SCORE };

    return { score: MIN_SCORE };
  }

  public compare(first: IProcessorResult|IProcessorResult[], second: IProcessorResult): IComparationResult {
    if (Array.isArray(first)) {
      return this.compareArrayOfResults(first, second);
    }

    return this.compareTwoResults(first, second);
  }
}

export default Comparator;
