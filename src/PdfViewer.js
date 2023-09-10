/** @jsxImportSource @emotion/react */
import { css } from '@emotion/react';
import { useEffect, useRef } from 'preact/hooks';
import * as pdfjs from 'pdfjs-dist';
import { EventBus, PDFLinkService, PDFViewer, PDFFindController, PDFScriptingManager } from 'pdfjs-dist/web/pdf_viewer';
import 'pdfjs-dist/web/pdf_viewer.css';
import { heightOffset0, heightOffset1, heightOffset2 } from "./constants";
import { retrievePDF, savePDF } from './utils/indexDbUtils';
import { invokePlugin } from './utils/pluginUtils';
const SANDBOX_BUNDLE_SRC = 'pdfjs-dist/build/pdf.sandbox.js';

const containerStyle = css`
  overflow: auto;
  position: absolute;
	border-right: 1px solid #c6c6c6;
	border-left: 1px solid #c6c6c6;
	background: #282828;
`;

export const PdfViewer = ({
	activePage,
	modifiedFile,
	showHeader,
	showSubheader,
	setPdfProxyObj,
	tools,
	setPdfViewerObj,
	file,
	viewerContainerRef,
	viewerContainerRef1,
	viewerContainerRef2,
	eventBusRef,
	setMatchesCount,
	setActivePage,
	leftPanelEnabled,
	rightPanelEnabled,
	setFileLoadFailError,
	switchBuffer,
	buffer,
	updateCurrentScale
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

	const cleanupDocument = async () => {
		pdfViewerRef.current?.setDocument(null);
		pdfLinkServiceRef.current?.setDocument(null);
		try {
			await pdfScriptingManagerRef.current?.destroyPromise();
		} catch (err) {}
		pdfViewerRef.current?.cleanup();

	}

	const applyDocument2 = async (viewerContainer) => {
		await invokePlugin({
			pluginName: "PdfViewPlugin",
			funcName: "applyDocument",
			args: [{
				viewerContainer,
				eventBusRef,
				pdfLinkServiceRef,
				pdfFindControllerRef,
				pdfScriptingManagerRef,
				pdfViewerRef,
				setPdfViewerObj,
				modifiedFile,
				file,
				activePage,
				setMatchesCount,
				setActivePage,
				retrievePDF,
				setPdfProxyObj,
				savePDF,
				setFileLoadFailError
			}]
		});
	}

	const applyDocument = async (viewerContainer) => {
		await cleanupDocument();

		const eventBus = new EventBus();
		eventBusRef.current = eventBus;
		pdfLinkServiceRef.current = new PDFLinkService({ eventBus: eventBusRef.current, externalLinkTarget: 2 });
		pdfFindControllerRef.current = new PDFFindController({ eventBus: eventBusRef.current, linkService: pdfLinkServiceRef.current });
		pdfScriptingManagerRef.current = new PDFScriptingManager({ eventBus: eventBusRef.current, sandboxBundleSrc: SANDBOX_BUNDLE_SRC });
		pdfViewerRef.current = new PDFViewer({ container: viewerContainer, eventBus: eventBusRef.current, linkService: pdfLinkServiceRef.current, findController: pdfFindControllerRef.current, scriptingManager: pdfScriptingManagerRef.current });
		// pdfViewerRef.current.currentScale = 0.2 // WIP
		setPdfViewerObj(pdfViewerRef.current);
    
		pdfLinkServiceRef.current.setViewer(pdfViewerRef.current);
		pdfScriptingManagerRef.current.setViewer(pdfViewerRef.current);

		eventBus.on('pagesinit', () => {
			pdfViewerRef.current.currentScaleValue = "page-height";
			updateCurrentScale(Math.round(pdfViewerRef.current.currentScale * 100))
			// pdfViewerRef.current.currentScaleValue = 'page-width';
		});

		eventBus.on('pagesloaded', () => {
			console.log(pdfViewerRef.current, 'pdfViewerRef.current')
			if (typeof activePage === "number") {
				pdfLinkServiceRef.current?.goToPage(activePage || 1);
			}
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
			const container = document.getElementById("panel");
			container.scrollTop = target.offsetTop;

			// target.scrollIntoView({ block: 'start', inline: 'start' });
		});
		let modFile;
		if (modifiedFile) {
			modFile = await retrievePDF("pdfId1");
		}
		const loadingTask = pdfjs.getDocument(modFile || file);

		loadingTask.promise.then(
			async (loadedPdfDocument) => {
				// console.log(loadedPdfDocument, 'loadedPdfDocumentmod', loadedPdfDocument.numPages);
				// If no modifiedFile, continue to set the loaded PDF document.
				setPdfProxyObj(loadedPdfDocument);
				pdfViewerRef.current.setDocument(loadedPdfDocument);
				pdfLinkServiceRef.current.setDocument(loadedPdfDocument, null);
				
				if (!modifiedFile) {
					savePDF(await loadedPdfDocument.getData(), "original");
					// console.log("updating original", loadedPdfDocument.getData())
				}
			},
			reason => {
				setFileLoadFailError(reason?.message);
				console.error(JSON.stringify(reason), 'error man.');
				window.parent.postMessage({ type: 'file-failed', message: reason?.message }, '*');
			}
		);
	}

	useEffect(() => {
    if (!file || !viewerContainerRef1.current || !viewerContainerRef2.current) return;
    const targetContainer = buffer === 1 ? viewerContainerRef2 : viewerContainerRef1;
    applyDocument(targetContainer.current).then(switchBuffer); // assume applyDocument is async
	}, [file, modifiedFile]);

	
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
				const targetContainer = buffer === 1 ? viewerContainerRef2.current : viewerContainerRef1.current;
				applyDocument(targetContainer).then(switchBuffer);
			}
		}
	
		document.addEventListener('visibilitychange', handleVisibilityChange);
		return () => document.removeEventListener('visibilitychange', handleVisibilityChange);
	}, [modifiedFile, file]);

	const width = () => {
		if (!tools?.general?.includes("thumbnails")) {
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
			<div ref={viewerContainerRef1} id="viewerContainer" css={containerStyle} style={{ width: width(), height: height(), visibility: buffer === 1 ? "visible" : "hidden" }}>
				<div id="viewer" class="pdfViewer" />
			</div>
			<div ref={viewerContainerRef2} id="viewerContainer" css={containerStyle} style={{ width: width(), height: height(), visibility: buffer === 2 ? "visible" : "hidden" }}>
				<div id="viewer" class="pdfViewer" />
			</div>
		</div>
	);
};