/** @jsxImportSource @emotion/react */
import { css } from '@emotion/react';
import { useEffect } from 'preact/hooks';
import * as pdfjs from 'pdfjs-dist';
import { EventBus, PDFLinkService, PDFViewer, PDFFindController, PDFScriptingManager } from 'pdfjs-dist/web/pdf_viewer';
import 'pdfjs-dist/web/pdf_viewer.css';

const SANDBOX_BUNDLE_SRC = 'pdfjs-dist/build/pdf.sandbox.js';

const containerStyle = css`
  overflow: auto;
  position: absolute;
  height: calc(100% - 50px);
	border-right: 1px solid #c6c6c6;
	border-left: 1px solid #c6c6c6;
	background: #eaecee;
`;

export const PdfViewer = ({
	setPdfProxyObj,
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
  
	useEffect(() => {
		if (!file || !viewerContainerRef.current) return;

		const viewerContainer = viewerContainerRef.current;

		const eventBus = new EventBus();
		eventBusRef.current = eventBus;
		const pdfLinkService = new PDFLinkService({ eventBus, externalLinkTarget: 2 });
		const pdfFindController = new PDFFindController({ eventBus, linkService: pdfLinkService });
		const pdfScriptingManager = new PDFScriptingManager({ eventBus, sandboxBundleSrc: SANDBOX_BUNDLE_SRC });
		const pdfViewer = new PDFViewer({ container: viewerContainer, eventBus, linkService: pdfLinkService, findController: pdfFindController, scriptingManager: pdfScriptingManager });
		setPdfViewerObj(pdfViewer);
    
		pdfLinkService.setViewer(pdfViewer);
		pdfScriptingManager.setViewer(pdfViewer);

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
    
		const loadingTask = pdfjs.getDocument(file);

		loadingTask.promise.then(
			loadedPdfDocument => {
				console.log(loadedPdfDocument, 'loadedPdfDocument', loadedPdfDocument.numPages);
				
				setPdfProxyObj(loadedPdfDocument);
				pdfViewer.setDocument(loadedPdfDocument);
				pdfLinkService.setDocument(loadedPdfDocument, null);
			},
			reason => {
				setFileLoadFailError(reason?.message);
				console.error(reason, 'error man');
			}
		);
	}, [file]);

	const reloadPdf = () => {
		if (!file || !viewerContainerRef.current) return;
	
		const viewerContainer = viewerContainerRef.current;

		const eventBus = new EventBus();
		eventBusRef.current = eventBus;
		const pdfLinkService = new PDFLinkService({ eventBus, externalLinkTarget: 2 });
		const pdfFindController = new PDFFindController({ eventBus, linkService: pdfLinkService });
		const pdfScriptingManager = new PDFScriptingManager({ eventBus, sandboxBundleSrc: SANDBOX_BUNDLE_SRC });
		const pdfViewer = new PDFViewer({ container: viewerContainer, eventBus, linkService: pdfLinkService, findController: pdfFindController, scriptingManager: pdfScriptingManager });
		setPdfViewerObj(pdfViewer);
    
		pdfLinkService.setViewer(pdfViewer);
		pdfScriptingManager.setViewer(pdfViewer);

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
    
		const loadingTask = pdfjs.getDocument(file);

		loadingTask.promise.then(
			loadedPdfDocument => {
				console.log(loadedPdfDocument, 'loadedPdfDocument', loadedPdfDocument.numPages);
				
				setPdfProxyObj(loadedPdfDocument);
				pdfViewer.setDocument(loadedPdfDocument);
				pdfLinkService.setDocument(loadedPdfDocument, null);
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

	return (
		<div>
			<div ref={viewerContainerRef} id="viewerContainer" css={containerStyle} style={{ width: `calc(100% - ${panelSpaceUsed()}px)` }}>
				<div id="viewer" class="pdfViewer" />
			</div>
		</div>
	);
};