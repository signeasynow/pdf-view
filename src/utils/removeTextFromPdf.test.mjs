import { expect } from 'chai';
import {replaceTextWithSpacesInTJCommand} from './removeTextHelpers.js';

describe('replaceTextWithSpacesInTJCommand', () => {

  it('should replace text with equivalent spaces', () => {
    const innerText = "Hello World";
    const line = `(${innerText}) Tj`;
    const expected = "(           )";
    const result = replaceTextWithSpacesInTJCommand(line);
    expect(result).to.equal(expected);
    expect(result.length - 2).to.equal(innerText.length);
  });

  it('should handle empty strings', () => {
    const line = "";
    const expected = "";
    expect(replaceTextWithSpacesInTJCommand(line)).to.equal(expected);
  });

  it('should handle very long strings', () => {
    const longString = 'A'.repeat(10000); // 10,000 characters
    const line = `(${longString}) Tj`;
    const result = replaceTextWithSpacesInTJCommand(line);
    expect(result.length - 2).to.equal(longString.length);
  });

  it('should handle empty parentheses', () => {
    const line = "() Tj";
    const result = replaceTextWithSpacesInTJCommand(line);
    expect(result).to.equal("()");
  });
});