/** @jsxImportSource @emotion/react */
import { css } from '@emotion/react';

import { useRef } from 'preact/hooks';
import 'pdfjs-dist/web/pdf_viewer.css';
// import Pan from "./assets/pan.svg";

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

  console.log(searchText, 'searchTextRef.current')

  return (
    <div css={showSearch ? visibleSearchWrapper : invisibleSearchWrapper}>
      <input ref={searchTextRef} onChange={onChange} placeholder="Search document" />
      <button onClick={onClickClear}>X</button>
      <input value={caseSensitive} onClick={onToggleCaseSensitive} type="checkbox" id="caseSensitive"/>
      <label htmlFor="caseSensitive">Case sensitive</label>
      <input value={matchWholeWord} onClick={onToggleWholeWord} type="checkbox" id="wholeWord"/>
      <label htmlFor="wholeWord">Whole word</label>
      {
        !!searchText && (
          <>
            <div>
              {matchesCount} total matches
            </div>
            <button onClick={onPrev}>Prev</button>
            <button onClick={onNext}>Next</button>
          </>
        )
      }
    </div>
  );
};

export default SearchBar;