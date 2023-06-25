import { h, Component } from 'preact';
import { useEffect, useRef, useState } from 'preact/hooks';
import * as pdfjs from 'pdfjs-dist';
import { EventBus, PDFLinkService, PDFViewer, PDFFindController, PDFScriptingManager } from "pdfjs-dist/web/pdf_viewer";
import 'pdfjs-dist/web/pdf_viewer.css';
import Header from './Header';

const SANDBOX_BUNDLE_SRC = "pdfjs-dist/build/pdf.sandbox.js";

const PdfViewer = ({ file }) => {
  const viewerContainerRef = useRef(null);

  useEffect(() => {
    if (!file || !viewerContainerRef.current) return;

    const viewerContainer = viewerContainerRef.current;

    const eventBus = new EventBus();
    const pdfLinkService = new PDFLinkService({ eventBus, externalLinkTarget: 2 });
    const pdfFindController = new PDFFindController({ eventBus, linkService: pdfLinkService });
    const pdfScriptingManager = new PDFScriptingManager({ eventBus, sandboxBundleSrc: SANDBOX_BUNDLE_SRC });
    const pdfViewer = new PDFViewer({ container: viewerContainer, eventBus, linkService: pdfLinkService, findController: pdfFindController, scriptingManager: pdfScriptingManager });

    pdfLinkService.setViewer(pdfViewer);
    pdfScriptingManager.setViewer(pdfViewer);

    eventBus.on("pagesinit", function () {
      pdfViewer.currentScaleValue = "page-width";
    });

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
    <div ref={viewerContainerRef} id="viewerContainer">
      <div id="viewer" class="pdfViewer"></div>
    </div>
  )
};

const App = () => {
  const [file, setFile] = useState(null);

  useEffect(() => {
    window.addEventListener('message', function(event) {
      if (typeof event.data === 'object' && event.data.file) {
        setFile(event.data.file);
      }
    }, false);
  }, []);

  return (
    <div>
      <Header />
      <PdfViewer file={file} />
    </div>
  );
};

export default App;