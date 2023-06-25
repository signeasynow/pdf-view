/** @jsxImportSource @emotion/react */
import { css } from '@emotion/react'

import { h, Component } from 'preact';
import 'pdfjs-dist/web/pdf_viewer.css';
import Hand from '../assets/hand-svgrepo-com.svg';
import ZoomOut from '../assets/zoom-out-svgrepo-com.svg';
import ZoomIn from '../assets/zoom-in-svgrepo-com.svg';
import Search from '../assets/search-svgrepo-com.svg';
import Hamburger from '../assets/hamburger-md-svgrepo-com.svg';
import Gear from '../assets/gear-svgrepo-com.svg';
import Comment from '../assets/comment-svgrepo-com.svg';
import Panel from '../assets/panel-left-svgrepo-com.svg';
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
  <img css={css({ width: 28, height: 28, cursor: "pointer"})} src={src} alt="" />
)

const VerticalDivider = () => (
  <div css={css`
    height: 24px;
    width: 1px;
    background-color: #ccc;
    margin: 0 12px;
  `} />
);

const Wrapper = ({ children }) => (
  <div css={css({
    display: "flex"
  })}>
    {children}
  </div>
)

const Header = () => {

  return (
    <Wrapper>
      <Tooltip title="Menu">
        <HeaderIcon src={Hamburger} alt="Menu" />
      </Tooltip>
      
      <VerticalDivider />
      <Tooltip title="Panel">
        <HeaderIcon src={Panel} alt="Panel" />
      </Tooltip>
      <Tooltip title="View controls">
        <HeaderIcon src={Gear} alt="View controls" />
      </Tooltip>
      <VerticalDivider />
      <Tooltip title="Zoom in">
        <HeaderIcon src={ZoomIn} alt="Zoom in" />
      </Tooltip>
      <Tooltip title="Zoom out">
        <HeaderIcon src={ZoomOut} alt="Zoom out" />
      </Tooltip>
      <Tooltip title="Pan">
        <HeaderIcon src={Hand} alt="Pan" />
      </Tooltip>
      

      <select>
        <option>View</option>
        <option>Annotate</option>
      </select>
      <Tooltip title="Search">
        <HeaderIcon src={Search} alt="Search" />
      </Tooltip>
      <Tooltip title="Comments">
        <HeaderIcon src={Comment} alt="Comments" />
      </Tooltip>
    </Wrapper>
  );
};

export default Header;