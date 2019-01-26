import { isEqual } from 'lodash';

import { Revision } from '@resource-checker/base/dest/clients/subscriptions';

export const MAX_SCORE = 1;
export const MIN_SCORE = 0;

export type ComparationResult = {
  // the more score, the more likely pages are similar.
  score: number,
  weight: number,
}

class Comparator {
  protected _weight: number;

  protected compareArrayOfResults(array: Revision[], second: Revision): ComparationResult {
    if (array.length === 0) return { score: MAX_SCORE, weight: this.weight };

    const first = array[array.length - 1];
    
    return this.compareTwoResults(first, second);
  }

  get weight() {
    return this._weight || 1;
  }

  set weight(value: number) {
    if (value > 0) this._weight = value;
    else this._weight = 1;
  }

  protected compareTwoResults(first: Revision, second: Revision): ComparationResult {
    if (isEqual(first, second)) return { score: MAX_SCORE, weight: this.weight };

    return { score: MIN_SCORE, weight: this.weight };
  }

  public compare(first: Revision|Revision[], second: Revision): ComparationResult {
    if (Array.isArray(first)) {
      return this.compareArrayOfResults(first, second);
    }

    return this.compareTwoResults(first, second);
  }
}

export default Comparator;
