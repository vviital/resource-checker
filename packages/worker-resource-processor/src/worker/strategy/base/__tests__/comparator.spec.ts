import { Comparator, MIN_COMPARATOR_SCORE, MAX_COMPARATOR_SCORE } from '../index';

describe('Base Comparator', () => {
  const comparator = new Comparator();
  const baseRevisionObject = {
    created: new Date(),
    id: '1',
    revisionObject: { value: '' },
    type: 'TEST',
  };

  it('should compare single items and return score equal to MAX_COMPARATOR_SCORE', () => {
    const result = comparator.compare(baseRevisionObject, baseRevisionObject);

    expect(result).toEqual({ score: MAX_COMPARATOR_SCORE, weight: 1 });
  });

  it('should compare sinlge items and return score equal to MIN_COMPARATOR_SCORE', () => {
    const result = comparator.compare(baseRevisionObject, { ...baseRevisionObject, type: 'TYPE' });

    expect(result).toEqual({ score: MIN_COMPARATOR_SCORE, weight: 1 });
  });

  it('should compare array of items and return score equal to MAX_COMPARATOR_SCORE', () => {
    const result = comparator.compare([baseRevisionObject], baseRevisionObject);

    expect(result).toEqual({ score: MAX_COMPARATOR_SCORE, weight: 1 });
  });

  it('should compare array of items and return score equal to MIN_COMPARATOR_SCORE', () => {
    const result = comparator.compare([baseRevisionObject], { ...baseRevisionObject, type: 'TYPE' });

    expect(result).toEqual({ score: MIN_COMPARATOR_SCORE, weight: 1 });
  });
});
