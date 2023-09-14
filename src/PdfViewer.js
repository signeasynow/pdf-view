/** @jsxImportSource @emotion/react */
import { css } from '@emotion/react';
import { useEffect, useRef, useState } from 'preact/hooks';
import * as pdfjs from 'pdfjs-dist';
import { EventBus, PDFLinkService, PDFViewer, PDFFindController, PDFScriptingManager } from 'pdfjs-dist/web/pdf_viewer';
import 'pdfjs-dist/web/pdf_viewer.css';
import { heightOffset0, heightOffset1, heightOffset2 } from "./constants";
import { retrievePDF, savePDF } from './utils/indexDbUtils';
import { invokePlugin } from './utils/pluginUtils';
import { addSandboxWatermark } from './utils/addSandboxWatermark';
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
	isSandbox,
	updateCurrentScale
}) => {

	const [isBufferReady, setIsBufferReady] = useState(false);

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

	const hasWatermarkAdded = useRef(false);


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
			updateCurrentScale(Math.round(pdfViewerRef.current.currentScale * 100));
			
			// pdfViewerRef.current.currentScaleValue = 'page-width';
		});

		eventBus.on('pagesloaded', () => {
			if (typeof activePage === "number") {
				pdfLinkServiceRef.current?.goToPage(activePage || 1);
			}
			// setIsBufferReady(true);
		});

		eventBus.on('updatefindmatchescount', ({ matchesCount }) => {
			setMatchesCount(matchesCount?.total);
		});

		eventBus.on('pagechanging', ({ pageNumber }) => {
			// Set the active page
			setActivePage(pageNumber);
		
			// Get the target thumbnail element
			const target = document.getElementById(`thumbnail-${pageNumber}`);
			if (!target) {
				return;
			}
		
			// Get the scroll container
			const container = document.getElementById("panel");
			
			// Calculate the visible area within the container
			const containerTop = container.scrollTop;
			const containerBottom = containerTop + container.clientHeight;
		
			// Calculate the position of the target element
			const targetTop = target.offsetTop;
			const targetBottom = targetTop + target.clientHeight;
		
			// Check if the target element is fully visible
			if (targetTop >= containerTop && targetBottom <= containerBottom) {
				// The target element is already visible, no need to scroll
				return;
			}
		
			// Scroll to make the target element visible
			container.scrollTop = target.offsetTop;
		});
		let modFile;
		if (modifiedFile) {
			modFile = await retrievePDF("pdfId1");
		}
		const loadingTask = pdfjs.getDocument(modFile || file);

		loadingTask.promise.then(
			async (loadedPdfDocument) => {
				console.log("doc loaded")
				if (isSandbox) {
					const pdfData = await loadedPdfDocument.getData();
					const pdfWithWatermark = await addSandboxWatermark(new Uint8Array(pdfData));
					loadedPdfDocument = await pdfjs.getDocument({data: pdfWithWatermark}).promise;
					hasWatermarkAdded.current = true;
				}
				// If no modifiedFile, continue to set the loaded PDF document.
				setPdfProxyObj(loadedPdfDocument);
				pdfViewerRef.current.setDocument(loadedPdfDocument);
				pdfLinkServiceRef.current.setDocument(loadedPdfDocument, null);

				if (!modifiedFile) {
					savePDF(await loadedPdfDocument.getData(), "original");
				}
			},
			reason => {
				setFileLoadFailError(reason?.message);
				console.error(JSON.stringify(reason), 'error.');
				window.parent.postMessage({ type: 'file-failed', message: reason?.message }, '*');
			}
		);
	}

	useEffect(() => {
    if (!file || !viewerContainerRef1.current || !viewerContainerRef2.current) return;
		setIsBufferReady(false);
    const targetContainer = viewerContainerRef1 // buffer === 1 ? viewerContainerRef2 : viewerContainerRef1;
    applyDocument(targetContainer.current); // assume applyDocument is async
	}, [file, modifiedFile]);

	useEffect(() => {
		if (isBufferReady) {
				switchBuffer();
				setIsBufferReady(false); // Reset for the next cycle
		}
	}, [isBufferReady]);

	useEffect(() => {
		function handleVisibilityChange() {
			if (document.hidden) {
				// Page is now hidden
			}
			else {
				// Page is now visible

				// You can put your logic here to re-render the PDF or perform some other actions
				// For example, you might call a function to reload the PDF:
				const targetContainer = viewerContainerRef1 // buffer === 1 ? viewerContainerRef2 : viewerContainerRef1;
				applyDocument(targetContainer.current).then(switchBuffer);
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
			<div ref={viewerContainerRef1} id="viewerContainer" css={containerStyle}
				style={{
					pointerEvents: buffer === 1 ? 'auto' : 'none',
					width: width(), height: height(), opacity: buffer === 1 ? 1 : 0
				}}>
				<div id="viewer" class="pdfViewer" />
			</div>
			<div ref={viewerContainerRef2} id="viewerContainer" css={containerStyle}
				style={{
					pointerEvents: buffer === 2 ? 'auto' : 'none',
					width: width(), height: height(), opacity: buffer === 2 ? 1 : 0 }}>
				<div id="viewer" class="pdfViewer" />
			</div>
		</div>
	);
};