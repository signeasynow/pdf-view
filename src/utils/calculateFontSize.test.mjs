import { expect } from 'chai';
import { calculateFontSize } from './calculateFontSize.js';

describe('calculateFontSize.test', () => {
  it('should work', () => {
      const input = 0.024488723241590214;
      expect(calculateFontSize(input)).to.equal(16);
  });

});