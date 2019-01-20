import { Comparator, MIN_COMPARATOR_SCORE, MAX_COMPARATOR_SCORE } from '../index';

describe('Base Comparator', () => {
  const comparator = new Comparator();

  it('should compare single items and return score equal to MAX_COMPARATOR_SCORE', () => {
    const object = { type: 'TEST', revisionObject: { value: '' } };

    const result = comparator.compare(object, object);

    expect(result).toEqual({ score: MAX_COMPARATOR_SCORE });
  });

  it('should compare sinlge items and return score equal to MIN_COMPARATOR_SCORE', () => {
    const object = { type: 'TEST', revisionObject: { value: '' } };

    const result = comparator.compare(object, { ...object, type: 'TYPE' });

    expect(result).toEqual({ score: MIN_COMPARATOR_SCORE });
  });

  it('should compare array of items and return score equal to MAX_COMPARATOR_SCORE', () => {
    const object = { type: 'TEST', revisionObject: { value: '' } };

    const result = comparator.compare([object], object);

    expect(result).toEqual({ score: MAX_COMPARATOR_SCORE });
  });

  it('should compare array of items and return score equal to MIN_COMPARATOR_SCORE', () => {
    const object = { type: 'TEST', revisionObject: { value: '' } };

    const result = comparator.compare([object], { ...object, type: 'TYPE' });

    expect(result).toEqual({ score: MIN_COMPARATOR_SCORE });
  });
});
