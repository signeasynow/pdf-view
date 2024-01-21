// [(6 Import)21.1 (ant F)36 (ac)10 (t)16 (or)6 (s when )]TJ
// 6 Important Factors when

import { expect } from 'chai';
import {processLinesSingleCommand} from '../removeTextHelpers.js';

describe('processLinesSingleCommand', () => {

  it('should process line ending with TJ', () => {
    const lines = ['[(6 Import)21.1 (ant F)36 (ac)10 (t)16 (or)6 (s when )]TJ'];
    const clickedTextString = '6 Important Factors when';
    // Mock or use real 'processSingleTJCommand' and 'findHexColor' as needed
    const result = processLinesSingleCommand(lines, clickedTextString);
    expect(result.foundMatch).to.equal(true);
    expect(result.lines[0]).to.equal("(        ) 21.1(     ) 36(  ) 10( ) 16(  ) 6(       ) TJ");
    // Add more assertions based on expected behavior of 'processSingleTJCommand' and 'findHexColor'
  });
  it('should work with hexadecimal', () => {
    const lines = ['[<0049004800440057005800550048000300550048005400580048005600570056001E000300450058004C004F0047004C0051004A00030057004C005000480010004C00510057004800510056004C0059>13.3 <004800030044005100470003>]TJ']
  })
});