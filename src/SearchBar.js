/** @jsxImportSource @emotion/react */
import { css } from '@emotion/react'

import { h, Component } from 'preact';
import { useEffect, useRef, useState } from 'preact/hooks';
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

const HeaderIcon = ({ src, alt, onClick }) => (
  <img onClick={onClick} css={css({ width: 28, height: 28, cursor: "pointer"})} src={src} alt="" />
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
    display: "flex",
    background: "grey",
    height: 30
  })}>
    {children}
  </div>
)

const ZOOM_FACTOR = 0.1;

const visibleSearchWrapper = css`
  background: green;
  width: 400px;
`

const invisibleSearchWrapper = css`
  background: orange;
  display: none;
`

const SearchBar = ({
  showSearch,
  searchText,
  onChange,
  matchesCount,
  onNext,
  onPrev,
  onToggleWholeWord,
  matchWholeWord,
  onToggleCaseSensitive,
  caseSensitive,
  onClear
}) => {

  const searchTextRef = useRef("");

  const onClickClear = () => {
    searchTextRef.current.value = "";
    onClear();
  }

  return (
    <div css={showSearch ? visibleSearchWrapper : invisibleSearchWrapper}>
      <input ref={searchTextRef} onChange={onChange} placeholder="Search document" />
      <button onClick={onClickClear}>X</button>
      <input value={caseSensitive} onClick={onToggleCaseSensitive} type="checkbox" id="caseSensitive"/>
      <label htmlFor="caseSensitive">Case sensitive</label>
      <input value={matchWholeWord} onClick={onToggleWholeWord} type="checkbox" id="wholeWord"/>
      <label htmlFor="wholeWord">Whole word</label>
      <div>
        {matchesCount} total matches
      </div>
      <button onClick={onPrev}>Prev</button>
      <button onClick={onNext}>Next</button>
    </div>
  );
};

export default SearchBar;