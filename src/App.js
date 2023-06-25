/** @jsxImportSource @emotion/react */
import { css } from '@emotion/react'
import { h, Component } from 'preact';
import { useEffect, useRef, useState } from 'preact/hooks';
import * as pdfjs from 'pdfjs-dist';
import { EventBus, PDFLinkService, PDFViewer, PDFFindController, PDFScriptingManager } from "pdfjs-dist/web/pdf_viewer";
import 'pdfjs-dist/web/pdf_viewer.css';
import Header from './Header';
import { useDebounce } from "./utils/useDebounce";

const SANDBOX_BUNDLE_SRC = "pdfjs-dist/build/pdf.sandbox.js";

function webViewerFindFromUrlHash(evt) {
  PDFViewerApplication.eventBus.dispatch("find", {
    source: evt.source,
    type: "",
    query: evt.query,
    caseSensitive: false,
    entireWord: false,
    highlightAll: true,
    findPrevious: false,
    matchDiacritics: true,
  });
}

const containerStyle = css`
  overflow: auto;
  position: absolute;
  width: 100%;
  height: calc(100% - 50px);
`;

const PdfViewer = ({ file, pdfViewerRef, viewerContainerRef }) => {
  


  useEffect(() => {
    if (!file || !viewerContainerRef.current) return;

    const viewerContainer = viewerContainerRef.current;

    const eventBus = new EventBus();
    const pdfLinkService = new PDFLinkService({ eventBus, externalLinkTarget: 2 });
    const pdfFindController = new PDFFindController({ eventBus, linkService: pdfLinkService });
    const pdfScriptingManager = new PDFScriptingManager({ eventBus, sandboxBundleSrc: SANDBOX_BUNDLE_SRC });
    const pdfViewer = new PDFViewer({ container: viewerContainer, eventBus, linkService: pdfLinkService, findController: pdfFindController, scriptingManager: pdfScriptingManager });
    pdfViewerRef.current = pdfViewer;
    
    pdfLinkService.setViewer(pdfViewer);
    pdfScriptingManager.setViewer(pdfViewer);

    eventBus.on("pagesinit", function () {
      pdfViewer.currentScaleValue = "page-width";
    });

    eventBus.dispatch("find", {
      // source: evt.source,
      type: "",
      query: "are",
      caseSensitive: false,
      entireWord: false,
      highlightAll: true,
      findPrevious: false,
      matchDiacritics: true,
    });

    eventBus.on("updatefindmatchescount", ({ matchesCount }) => {
      console.log(matchesCount, 'matchescount');
    })

    const loadingTask = pdfjs.getDocument(file);

    loadingTask.promise.then(
      loadedPdfDocument => {
        pdfViewer.setDocument(loadedPdfDocument);
        pdfLinkService.setDocument(loadedPdfDocument, null);
      },
      reason => {
        console.error(reason);
      }
    );
  }, [file]);

  return (
    <div ref={viewerContainerRef} id="viewerContainer" css={containerStyle}>
      <div id="viewer" class="pdfViewer"></div>
    </div>
  )
};

const ZOOM_FACTOR = 0.1;

const App = () => {

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


  useEffect(() => {
    window.addEventListener('message', function(event) {
      if (typeof event.data === 'object' && event.data.file) {
        setFile(event.data.file);
      }
    }, false);
  }, []);

  return (
    <div>
      <Header onZoomIn={onZoomIn} onZoomOut={onZoomOut} viewerContainerRef={viewerContainerRef} pdfViewerRef={pdfViewerRef} />
      <PdfViewer viewerContainerRef={viewerContainerRef} pdfViewerRef={pdfViewerRef} file={file} />
    </div>
  );
};

export default App;