/** @jsxImportSource @emotion/react */
import { css } from '@emotion/react';
import { useEffect, useRef } from 'preact/hooks';
import * as pdfjs from 'pdfjs-dist';
import { EventBus, PDFLinkService, PDFViewer, PDFFindController, PDFScriptingManager } from "pdfjs-dist/web/pdf_viewer";
import 'pdfjs-dist/web/pdf_viewer.css';

const SANDBOX_BUNDLE_SRC = "pdfjs-dist/build/pdf.sandbox.js";

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

const InnerPdfViewer = ({ file, pdfViewerRef, viewerContainerRef }) => {
  
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

const PdfViewer = ({
  file,
  showSearch,
  viewerContainerRef
}) => {

  const pdfViewerRef = useRef(null);

  return (
    <div css={showSearch ? shortPdfViewerWrapper : pdfViewerWrapper}>
      <InnerPdfViewer viewerContainerRef={viewerContainerRef} pdfViewerRef={pdfViewerRef} file={file} />
    </div>
  );
};

export default PdfViewer;
