import { expect } from 'chai';
import { extractFontFromLine } from '../removeTextHelpers.js';

describe('extractFontFromLine.test', () => {
  it('should correctly extract the font name from a standard PDF font setting line', () => {
    const line = "/C2_0 12 Tf";
    const font = extractFontFromLine(line);
    expect(font).to.equal('C2_0');
  });

  it('should return null for a line without a font setting', () => {
    const line = "BT 72 712 Td (Sample Text) Tj ET";
    const font = extractFontFromLine(line);
    expect(font).to.be.null;
  });

  it('should return null for an empty line', () => {
    const line = "";
    const font = extractFontFromLine(line);
    expect(font).to.be.null;
  });

  it('should handle lines with different font names and sizes', () => {
    const line = "/F1 18 Tf";
    const font = extractFontFromLine(line);
    expect(font).to.equal('F1');
  });
  it('should handle spaces', () => {
    const line = "/C2_0    12    Tf";
    const font = extractFontFromLine(line);
    expect(font).to.equal('C2_0');
  });
});