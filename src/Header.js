/** @jsxImportSource @emotion/react */
import { css } from '@emotion/react'

import { h, Component } from 'preact';
import 'pdfjs-dist/web/pdf_viewer.css';
import Hand from '../assets/hand.svg';
// import Pan from "./assets/pan.svg";


const tooltip = css`
  position: relative;
  display: inline-block;
  border-bottom: 1px dotted black;

  &:hover::after {
    content: attr(title);
    position: absolute;
    z-index: 1;
    top: 120%;
    left: 50%;
    transform: translateX(-50%);
    padding: 5px;
    color: #fff;
    background-color: #333;
    border-radius: 3px;
    white-space: nowrap;
  }
`;

const Tooltip = ({ children, title }) => (
  <div css={tooltip} title={title}>
    {children}
  </div>
);

const HeaderIcon = ({ src, alt }) => (
  <img css={css({ width: 24, height: 24, cursor: "pointer"})} src={src} alt="" />
)

const Header = () => {

  return (
    <div id="controls">
      <Tooltip title="Hello there">
        <button>Menu</button>
      </Tooltip>
      
      |
      <button>Panel</button>
      <button>View controls</button>
      |
      <button id="zoomIn">Zoom In</button>
      <button id="zoomOut">Zoom Out</button>
      <Tooltip title="Pan">
        <HeaderIcon src={Hand} alt="Pan" />
      </Tooltip>
      

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