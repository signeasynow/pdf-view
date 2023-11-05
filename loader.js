// You may need to adjust the paths based on your directory structure
import * as pdfjs from 'pdfjs-dist';
import 'pdfjs-dist/web/pdf_viewer.css';

import { render } from 'preact';
import AppRoot from './src/AppRoot';
pdfjs.GlobalWorkerOptions.workerSrc = "lib/pdf.worker.js" // || `https://cdnjs.cloudflare.com/ajax/libs/pdf.js/${pdfjs.version}/pdf.worker.js`;

render(<AppRoot />, document.getElementById('app'));
