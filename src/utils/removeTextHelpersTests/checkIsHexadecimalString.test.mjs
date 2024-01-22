import { expect } from 'chai';
import { checkIsHexadecimalString } from '../removeTextHelpers.js';

describe('checkIsHexadecimalString.test', () => {
  it('should return true for a valid hexadecimal string in a PDF text drawing command', () => {
      const line = "[<0049004800440057005800550048000300550048005400580048005600570056001E000300450058004C004F0047004C0051004A00030057004C005000480010004C00510057004800510056004C0059>13.3 <004800030044005100470003>]TJ";
      expect(checkIsHexadecimalString(line)).to.be.true;
  });

  it('should return false for a string without hexadecimal content', () => {
      const line = "BT /F1 12 Tf 72 712 Td (Sample Text) Tj ET";
      expect(checkIsHexadecimalString(line)).to.be.false;
  });

  it('should return false for an empty string', () => {
      const line = "";
      expect(checkIsHexadecimalString(line)).to.be.false;
  });

});