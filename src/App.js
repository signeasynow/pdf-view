/** @jsxImportSource @emotion/react */
import { css } from '@emotion/react'
import { useEffect, useRef, useState } from 'preact/hooks';
import 'pdfjs-dist/web/pdf_viewer.css';
import Header from './Header/Header';
import { useDebounce } from "./utils/useDebounce";
import SearchBar from './SearchBar';
import { PdfViewer } from './PdfViewer';

const Flex = css`
display: flex;
width: 100%;
height: 100%;
`

const pdfViewerWrapper = css`
  height: 100%;
  width: 100%;
`

const shortPdfViewerWrapper = css`
  height: 100%;
  width: calc(100% - 400px);
  background: red;
  position: relative;
`
// relative 

const WrapperStyle = css`
  height: calc(100vh - 40px);
  width: 100vw;
`

const ZOOM_FACTOR = 0.1;

const App = () => {

  const [matchesCount, setMatchesCount] = useState(0);


  const [searchText, setSearchText] = useState("");

  const eventBusRef = useRef(null);

  const pdfViewerRef = useRef(null);
  const viewerContainerRef = useRef(null);

  const [file, setFile] = useState(null);

  const _onZoomOut = () => {
    if (pdfViewerRef.current && pdfViewerRef.current.currentScale > ZOOM_FACTOR) { // minimum scale 0.1
        pdfViewerRef.current.currentScale -= ZOOM_FACTOR;
    }
  };

  const _onZoomIn = () => {
    if (pdfViewerRef.current && pdfViewerRef.current.currentScale < (10 - ZOOM_FACTOR)) { // maximum scale 10
        pdfViewerRef.current.currentScale += ZOOM_FACTOR;
    }
  };

  const onZoomIn = useDebounce(_onZoomIn, 5);
    const onZoomOut = useDebounce(_onZoomOut, 5);

  const [showSearch, setShowSearch] = useState(true);

  const onSearchBtnClick = () => {
    setShowSearch(() => !showSearch);
  }

  useEffect(() => {
    window.addEventListener('message', function(event) {
      if (typeof event.data === 'object' && event.data.file) {
        setFile(event.data.file);
      }
    }, false);
  }, []);

  const [matchWholeWord, setMatchWholeWord] = useState(false);

  const [caseSensitive, setCaseSensitive] = useState(false);

  const _onSearchText = (e, _entireWord, _sensitive) => {
    eventBusRef.current?.dispatch("find", {
      // source: evt.source,
      type: "",
      query: e.target.value,
      caseSensitive: typeof _sensitive === "boolean" ? _sensitive : caseSensitive,
      entireWord: typeof _entireWord === "boolean" ? _entireWord : matchWholeWord,
      highlightAll: true,
      findPrevious: false,
      matchDiacritics: true,
    });
    setSearchText(e.target.value);
  }

  const onSearchText = useDebounce(_onSearchText, 100);

  const onToggleWholeWord = () => {
    const newState = !matchWholeWord;
    onSearchText({
      target: {
        value: searchText
      }
    }, newState);
    setMatchWholeWord(() => newState);
  }

  const onToggleCaseSensitive = () => {
    const newState = !caseSensitive;
    onSearchText({
      target: {
        value: searchText
      }
    }, undefined, newState);
    setCaseSensitive(() => newState);
  }

  const onNext = () => {
    eventBusRef.current?.dispatch("find", {
      // source: evt.source,
      type: "again",
      query: searchText,
      caseSensitive: caseSensitive,
      entireWord: matchWholeWord,
      highlightAll: true,
      findPrevious: false,
      matchDiacritics: true,
    });
  }

  const onPrev = () => {
    eventBusRef.current?.dispatch("find", {
      // source: evt.source,
      type: "again",
      query: searchText,
      caseSensitive: caseSensitive,
      entireWord: matchWholeWord,
      highlightAll: true,
      findPrevious: true,
      matchDiacritics: true,
    });
  }

  const onClearSearch = () => {
    onSearchText({
      target: {
        value: ""
      }
    });
  }

  return (
    <div css={WrapperStyle}>
      <Header
        onZoomIn={onZoomIn}
        onZoomOut={onZoomOut}
        viewerContainerRef={viewerContainerRef}
        pdfViewerRef={pdfViewerRef}
        onSearch={onSearchBtnClick}
      />
      <div css={Flex}>
        <div css={showSearch ? shortPdfViewerWrapper : pdfViewerWrapper}>
          <PdfViewer setMatchesCount={setMatchesCount} eventBusRef={eventBusRef} viewerContainerRef={viewerContainerRef} pdfViewerRef={pdfViewerRef} file={file} />
        </div>
        <SearchBar
          onClear={onClearSearch}
          onToggleWholeWord={onToggleWholeWord}
          searchText={searchText}
          onNext={onNext}
          onPrev={onPrev}
          matchesCount={matchesCount}
          matchWholeWord={matchWholeWord}
          onChange={onSearchText}
          showSearch={showSearch}
          caseSensitive={caseSensitive}
          onToggleCaseSensitive={onToggleCaseSensitive}
        />
      </div>
    </div>
  );
};

export default App;