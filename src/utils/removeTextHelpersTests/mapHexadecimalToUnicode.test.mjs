import { expect } from 'chai';
import { mapHexadecimalToUnicode } from '../removeTextHelpers.js';

const map = {"0000":"￿","0001":" ","0003":"B","0005":"D","0205":"’","0007":"F","0207":"”","000A":"I","020E":"-","0011":"P","0211":"—","0015":"T","001C":"a","001D":"b","001E":"c","001F":"d","0020":"e","0021":"f","0022":"g","0023":"h","0024":"i","0025":"j","0026":"k","0027":"l","0028":"m","0029":"n","002A":"o","002B":"p","002C":"q","002D":"r","002E":"s","002F":"t","0030":"u","0031":"v","0032":"w","0033":"x","0034":"y","0357":"i","0199":"f","029E":"%","01D1":"0","01D2":"1","01F9":".","01FA":",","01FC":";"};

describe('mapHexadecimalToUnicode', () => {
  it ("works with 2 sections", () => {
    const input = "[<0001000300050007>13.3 <020E00110211>]TJ";
    expect(mapHexadecimalToUnicode(input, map)).to.equal('[( BDF)13.3 (-P—)]TJ');
  })
});
