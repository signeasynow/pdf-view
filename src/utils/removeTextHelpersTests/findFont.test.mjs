import { expect } from 'chai';
import { findFont } from '../removeTextHelpers.js';

describe('findFont', () => {
  it('should correctly find the font name in a list of lines', () => {
    const lines = [
      "BT",
      "/F1 12 Tf",
      "(Sample text) Tj",
      "ET"
    ];
    const font = findFont(lines, lines.length);
    expect(font).to.equal('F1');
  });

  it('should return null if no font setting is present', () => {
    const lines = [
        "BT",
        "(Sample text) Tj",
        "ET"
    ];
    const font = findFont(lines, lines.length);
    expect(font).to.be.null;
  });

  it('should handle multiple spaces and different fonts', () => {
    const lines = [
        "BT",
        "/C2_0    18    Tf",
        "(More text) Tj",
        "/F1 12 Tf",
        "(Sample text) Tj",
        "ET"
    ];
    const font = findFont(lines, lines.length - 1);
    expect(font).to.equal('F1');
  });

  it('should return null for an empty lines array', () => {
    const lines = [];
    const font = findFont(lines, 0);
    expect(font).to.be.null;
  });
});