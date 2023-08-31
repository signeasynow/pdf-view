/** @jsxImportSource @emotion/react */
import { css } from '@emotion/react';
import { useEffect, useRef } from 'preact/hooks';
import * as pdfjs from 'pdfjs-dist';
import { EventBus, PDFLinkService, PDFViewer, PDFFindController, PDFScriptingManager } from 'pdfjs-dist/web/pdf_viewer';
import 'pdfjs-dist/web/pdf_viewer.css';
import { heightOffset0, heightOffset1, heightOffset2 } from "./constants";
const SANDBOX_BUNDLE_SRC = 'pdfjs-dist/build/pdf.sandbox.js';

const containerStyle = css`
  overflow: auto;
  position: absolute;
	border-right: 1px solid #c6c6c6;
	border-left: 1px solid #c6c6c6;
	background: #282828;
`;

export const PdfViewer = ({
	modifiedFile,
	showHeader,
	showSubheader,
	setPdfProxyObj,
	tools,
	setPdfViewerObj,
	file,
	viewerContainerRef,
	eventBusRef,
	setMatchesCount,
	setActivePage,
	leftPanelEnabled,
	rightPanelEnabled,
	setFileLoadFailError
}) => {

	const panelSpaceUsed = () => {
		let result = 0;
		if (leftPanelEnabled) {
			result += 300;
		}
		if (rightPanelEnabled) {
			result += 300;
		}
		return result;
	};


	const pdfLinkServiceRef = useRef(null);
	const pdfViewerRef = useRef(null);
	const pdfFindControllerRef = useRef(null);
	const pdfScriptingManagerRef = useRef(null);

	useEffect(() => {
		if (!file || !viewerContainerRef.current) return;

		const viewerContainer = viewerContainerRef.current;

		const eventBus = new EventBus();
		eventBusRef.current = eventBus;
		pdfLinkServiceRef.current = new PDFLinkService({ eventBus, externalLinkTarget: 2 });
		pdfFindControllerRef.current = new PDFFindController({ eventBus, linkService: pdfLinkServiceRef.current });
		pdfScriptingManagerRef.current = new PDFScriptingManager({ eventBus, sandboxBundleSrc: SANDBOX_BUNDLE_SRC });
		pdfViewerRef.current = new PDFViewer({ container: viewerContainer, eventBus, linkService: pdfLinkServiceRef.current, findController: pdfFindControllerRef.current, scriptingManager: pdfScriptingManagerRef.current });
		setPdfViewerObj(pdfViewerRef.current);
    
		pdfLinkServiceRef.current.setViewer(pdfViewerRef.current);
		pdfScriptingManagerRef.current.setViewer(pdfViewerRef.current);

		eventBus.on('pagesinit', () => {
			pdfViewerRef.current.currentScaleValue = 'page-width';
			// document
		});

		eventBus.on('updatefindmatchescount', ({ matchesCount }) => {
			console.log(matchesCount, 'matchescount');
			setMatchesCount(matchesCount?.total);
		});

		eventBus.on('pagechanging', ({
			pageNumber
		}) => {
			// console.log(pageNumber, 'page 111f')
			setActivePage(pageNumber);
			const target = document.getElementById(`thumbnail-${pageNumber}`);
			if (!target) {
				return;
			}
			target.scrollIntoView();
		});
    console.log(modifiedFile, 'modifiedFile')
		const loadingTask = pdfjs.getDocument(modifiedFile || file);

		loadingTask.promise.then(
			async (loadedPdfDocument) => {
				console.log(loadedPdfDocument, 'loadedPdfDocumentmod', loadedPdfDocument.numPages);
				
				if (pdfViewerRef.current && modifiedFile) {
					pdfViewerRef.current.setDocument(null);
					pdfLinkServiceRef.current.setDocument(null);
					// await pdfScriptingManager.destroyPromise();
					pdfViewerRef.current.cleanup();
					const viewerElement = document.getElementById('viewer');
					if (viewerElement) {
						// viewerElement.innerHTML = '';
					}
				}
		
				// If no modifiedFile, continue to set the loaded PDF document.
				setPdfProxyObj(loadedPdfDocument);
				pdfViewerRef.current.setDocument(loadedPdfDocument);
				pdfLinkServiceRef.current.setDocument(loadedPdfDocument, null);
			},
			reason => {
				setFileLoadFailError(reason?.message);
				console.error(JSON.stringify(reason), 'error man.');
				window.parent.postMessage({ type: 'file-failed', message: reason?.message }, '*');
			}
		);
	}, [file, modifiedFile]);

	const reloadPdf = () => {
		if (!file || !viewerContainerRef.current) return;
	
		const viewerContainer = viewerContainerRef.current;

		const eventBus = new EventBus();
		eventBusRef.current = eventBus;
		pdfLinkServiceRef.current = new PDFLinkService({ eventBus, externalLinkTarget: 2 });
		pdfFindControllerRef.current = new PDFFindController({ eventBus, linkService: pdfLinkServiceRef.current });
		pdfScriptingManagerRef.current = new PDFScriptingManager({ eventBus, sandboxBundleSrc: SANDBOX_BUNDLE_SRC });
		const pdfViewer = new PDFViewer({ container: viewerContainer, eventBus, linkService: pdfLinkServiceRef.current, findController: pdfFindControllerRef.current, scriptingManager: pdfScriptingManagerRef.current });
		setPdfViewerObj(pdfViewer);
    
		pdfLinkServiceRef.current.setViewer(pdfViewer);
		pdfScriptingManagerRef.current.setViewer(pdfViewer);

		eventBus.on('pagesinit', () => {
			pdfViewer.currentScaleValue = 'page-width';
			// document
		});

		eventBus.on('updatefindmatchescount', ({ matchesCount }) => {
			console.log(matchesCount, 'matchescount');
			setMatchesCount(matchesCount?.total);
		});

		eventBus.on('pagechanging', ({
			pageNumber
		}) => {
			// console.log(pageNumber, 'page 111f')
			setActivePage(pageNumber);
			const target = document.getElementById(`thumbnail-${pageNumber}`);
			if (!target) {
				return;
			}
			target.scrollIntoView();
		});
    
		const loadingTask = pdfjs.getDocument(modifiedFile || file);

		loadingTask.promise.then(
			async loadedPdfDocument => {
				console.log(loadedPdfDocument, 'loadedPdfDocument', loadedPdfDocument.numPages);
				
				if (pdfViewer && modifiedFile) {
					pdfViewer.setDocument(null);
					pdfLinkServiceRef.current.setDocument(null);
					// await pdfScriptingManager.destroyPromise();
					pdfViewer.cleanup();
					const viewerElement = document.getElementById('viewer');
					if (viewerElement) {
						// viewerElement.innerHTML = '';
					}
				}

				setPdfProxyObj(loadedPdfDocument);
				pdfViewer.setDocument(loadedPdfDocument);
				pdfLinkServiceRef.current.setDocument(loadedPdfDocument, null);
			},
			reason => {
				setFileLoadFailError(reason?.message);
				console.error(reason, 'reason', reason?.message);
			}
		);
	};

	useEffect(() => {
		console.log('start change');
		function handleVisibilityChange() {
			if (document.hidden) {
				// Page is now hidden
				console.log('Page is hidden');
			}
			else {
				console.log('page is showing');
				// Page is now visible

				// You can put your logic here to re-render the PDF or perform some other actions
				// For example, you might call a function to reload the PDF:
				reloadPdf();
			}
		}
	
		document.addEventListener('visibilitychange', handleVisibilityChange);
		return () => document.removeEventListener('visibilitychange', handleVisibilityChange);
	}, []);

	const width = () => {
		if (!tools.includes("thumbnails")) {
			return "100%"
		}
		return `calc(100% - ${panelSpaceUsed()}px)`;
	}

	const height = () => {
		let toolbarSpaceUsed;
		if (!showHeader && !showSubheader) {
			toolbarSpaceUsed = heightOffset0;
		} else if (!showSubheader) {
			toolbarSpaceUsed = heightOffset1;
		} else {
			toolbarSpaceUsed = heightOffset2;
		}
		return `calc(100% - ${toolbarSpaceUsed}px)`;
	}

	return (
		<div>
			<div ref={viewerContainerRef} id="viewerContainer" css={containerStyle} style={{ width: width(), height: height() }}>
				<div id="viewer" class="pdfViewer" />
			</div>
		</div>
	);
};