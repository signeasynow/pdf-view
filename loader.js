// You may need to adjust the paths based on your directory structure
import * as pdfjs from 'pdfjs-dist';
import { EventBus, PDFLinkService, PDFViewer, PDFFindController, PDFScriptingManager } from "pdfjs-dist/web/pdf_viewer";
import 'pdfjs-dist/web/pdf_viewer.css';

import { h, render } from 'preact';
import App from './App';
pdfjs.GlobalWorkerOptions.workerSrc = `//cdnjs.cloudflare.com/ajax/libs/pdf.js/${pdfjs.version}/pdf.worker.js`

render(<App />, document.getElementById('app'));
