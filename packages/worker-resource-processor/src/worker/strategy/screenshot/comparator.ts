import { Comparator, IProcessorResult } from '../base';

class DefaultScreenshotComparator extends Comparator {

}

class PixelScreenshotComparator extends Comparator {
  // compareTwoResults(first: IProcessorResult, second: IProcessorResult) {
  //   const { revisionObject } = first;
  // }
}

export {
  DefaultScreenshotComparator,
  PixelScreenshotComparator,
};
