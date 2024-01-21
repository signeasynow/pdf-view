import { expect } from 'chai';
import { findHexColor } from '../removeTextHelpers.js';

describe('findHexColor', () => {
  it('should find and convert a valid color definition to hex', () => {
    const lines = ['0.5 0.5 0.5 scn'];
    const startIndex = 1;
    expect(findHexColor(lines, startIndex)).to.equal('#7f7f7f');
  });
  it('should find the color definition above the startIndex', () => {
    const lines = ['1 0 0 scn', '0.5 0.5 0.5 scn'];
    const startIndex = 1;
    expect(findHexColor(lines, startIndex)).to.equal('#ff0000');
  });
});