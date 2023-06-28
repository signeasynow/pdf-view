/** @jsxImportSource @emotion/react */
import { css } from '@emotion/react';
import { useEffect } from 'preact/hooks';
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

export const PdfViewer = ({ file, pdfViewerRef, viewerContainerRef, eventBusRef, setMatchesCount }) => {
  
  useEffect(() => {
    if (!file || !viewerContainerRef.current) return;

    const viewerContainer = viewerContainerRef.current;

    const eventBus = new EventBus();
    eventBusRef.current = eventBus;
    const pdfLinkService = new PDFLinkService({ eventBus, externalLinkTarget: 2 });
    const pdfFindController = new PDFFindController({ eventBus, linkService: pdfLinkService });
    const pdfScriptingManager = new PDFScriptingManager({ eventBus, sandboxBundleSrc: SANDBOX_BUNDLE_SRC });
    const pdfViewer = new PDFViewer({ container: viewerContainer, eventBus, linkService: pdfLinkService, findController: pdfFindController, scriptingManager: pdfScriptingManager });
    pdfViewerRef.current = pdfViewer;
    
    pdfLinkService.setViewer(pdfViewer);
    pdfScriptingManager.setViewer(pdfViewer);

    eventBus.on("pagesinit", function () {
      pdfViewer.currentScaleValue = 1 || "page-width";
    });

    eventBus.on("updatefindmatchescount", ({ matchesCount }) => {
      console.log(matchesCount, 'matchescount');
      setMatchesCount(matchesCount?.total);
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