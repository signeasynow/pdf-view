// You may need to adjust the paths based on your directory structure
import * as pdfjs from 'pdfjs-dist';
import { EventBus, PDFLinkService, PDFViewer, PDFFindController, PDFScriptingManager } from "pdfjs-dist/web/pdf_viewer";
import 'pdfjs-dist/web/pdf_viewer.css';

const SANDBOX_BUNDLE_SRC = "pdfjs-dist/build/pdf.sandbox.js";

pdfjs.GlobalWorkerOptions.workerSrc = `//cdnjs.cloudflare.com/ajax/libs/pdf.js/${pdfjs.version}/pdf.worker.js`

// Function to load PDF 
function loadPdf(file) {
  // Select the container in the iframe
  const viewerContainer = document.getElementById('viewerContainer');
  const eventBus = new EventBus();

  // PDFJS related setup
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
}

// Call function to load PDF
window.addEventListener('message', function(event) {
  // Check the origin of the data!
  if (typeof event.data === 'object' && event.data.file) {
      const file = event.data.file;
      console.log(file ,'file! doggg')
      loadPdf(file);
      // Initialize your PDF viewer here with file
  }
}, false);
