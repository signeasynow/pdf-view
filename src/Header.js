/** @jsxImportSource @emotion/react */
import { css } from '@emotion/react'

import { h, Component } from 'preact';
import 'pdfjs-dist/web/pdf_viewer.css';
import Hand from '../assets/hand.svg';
// import Pan from "./assets/pan.svg";

const HeaderIcon = ({ src, alt }) => (
  <img css={css({ width: 24, height: 24, cursor: "pointer"})} src={src} alt={alt} />
)

const Header = () => {

  return (
    <div id="controls">
      <button>Menu</button>
      |
      <button>Panel</button>
      <button>View controls</button>
      |
      <button id="zoomIn">Zoom In</button>
      <button id="zoomOut">Zoom Out</button>
      <button>Pan</button>
      <HeaderIcon src={Hand} alt="Pan" />

      <select>
        <option>View</option>
        <option>Annotate</option>
      </select>
      <button>Search</button>
      <button>Comments</button>
    </div>
  );
};

export default Header;