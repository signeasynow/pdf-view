/** @jsxImportSource @emotion/react */
import { css } from '@emotion/react'
import { h, Component } from 'preact';
import { useEffect, useRef, useState } from 'preact/hooks';
import * as pdfjs from 'pdfjs-dist';
import { EventBus, PDFLinkService, PDFViewer, PDFFindController, PDFScriptingManager } from "pdfjs-dist/web/pdf_viewer";
import 'pdfjs-dist/web/pdf_viewer.css';
import Header from './Header';
import { useDebounce } from "./utils/useDebounce";
import SearchBar from './SearchBar';
import { PdfViewer } from './PdfViewer';

const SANDBOX_BUNDLE_SRC = "pdfjs-dist/build/pdf.sandbox.js";

const Flex = css`
display: flex;
width: 100%;
height: 100%;
`


const containerStyle = css`
  overflow: auto;
  position: absolute;
  width: 100%;
  height: calc(100% - 50px);
`;

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
    console.log(pdfViewerRef.current, 'pdfViewerRef.current')
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


  /*
  useEffect(() => {
      const viewerContainer = viewerContainerRef.current;

      // Other setup code...

      /*
      document.body.addEventListener("wheel", e=>{
          if(e.ctrlKey)
            e.preventDefault();//prevent zoom
        }, {passive: false});
        const debouncedHandleWheel = (event) => {
          // prevent the default zooming behavior in the browser
          if (event.ctrlKey) {
            event.preventDefault();
          }
          if (event.deltaX !== 0) {
              if (event.deltaY < 0) {
                // Wheel scrolled up, zoom in
                onZoomIn();
            } else if (event.deltaY > 0) {
                // Wheel scrolled down, zoom out
                onZoomOut();
            }
          }
      };
      console.log(viewerContainer, 'viewerContainer')
      viewerContainer.addEventListener('wheel', debouncedHandleWheel, { passive: false });
      return () => {
          // Cleanup - remove the event listener when the component unmounts
          viewerContainer.removeEventListener('wheel', debouncedHandleWheel);
      };
  }, []);
  */

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

  const _onSearchText = (e) => {
    console.log(e.target.value, 'e value')
    eventBusRef.current?.dispatch("find", {
      // source: evt.source,
      type: "",
      query: e.target.value,
      caseSensitive: false,
      entireWord: false,
      highlightAll: true,
      findPrevious: false,
      matchDiacritics: true,
    });
    setSearchText(e.target.value);
  }

  const onSearchText = useDebounce(_onSearchText, 100);

  const onNext = () => {
    eventBusRef.current?.dispatch("find", {
      // source: evt.source,
      type: "again",
      query: searchText,
      caseSensitive: false,
      entireWord: false,
      highlightAll: true,
      findPrevious: false,
      matchDiacritics: true,
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
        <SearchBar searchText={searchText} onNext={onNext} matchesCount={matchesCount} onChange={onSearchText} showSearch={showSearch} />
      </div>
    </div>
  );
};

export default App;