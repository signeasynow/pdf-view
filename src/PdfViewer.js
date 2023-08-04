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
	rightPanelEnabled
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
				console.error(reason);
			}
		);
	}, [file]);

	return (
		<div ref={viewerContainerRef} id="viewerContainer" css={containerStyle} style={{ width: `calc(100% - ${panelSpaceUsed()}px)` }}>
			<div style="background: #eaecee;position:absolute" id="viewer" class="pdfViewer" />
		</div>
	);
};