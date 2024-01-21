import { expect } from 'chai';
import { extractTextFromLine } from '../removeTextHelpers.js';

describe('extractTextFromLine', () => {
  it('should extract text from single set of parentheses', () => {
    const line = '(Hello World)';
    expect(extractTextFromLine(line)).to.equal('Hello World');
  });
  it('should concatenate text from multiple sets of parentheses', () => {
    const line = '(Hello) ( World)';
    expect(extractTextFromLine(line)).to.equal('Hello World');
  });
  it('should return an empty string if no parentheses are present', () => {
    const line = 'Hello World';
    expect(extractTextFromLine(line)).to.equal('');
  });
  it('should handle empty parentheses', () => {
    const line = '()';
    expect(extractTextFromLine(line)).to.equal('');
  });
  it('should handle lines with special characters and spaces', () => {
    const line = '(Hello, World!) ( How are you? )';
    expect(extractTextFromLine(line)).to.equal('Hello, World! How are you? ');
  });
  it('should handle spaces on either end', () => {
    const line = '( How are you? )';
    expect(extractTextFromLine(line)).to.equal(' How are you? ');
  });
});