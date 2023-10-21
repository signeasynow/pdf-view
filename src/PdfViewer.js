/** @jsxImportSource @emotion/react */
import { css } from '@emotion/react';
import { useEffect, useRef } from 'preact/hooks';
import * as pdfjs from 'pdfjs-dist';
import { EventBus, PDFLinkService, PDFViewer, PDFFindController, PDFScriptingManager } from 'pdfjs-dist/web/pdf_viewer';
import 'pdfjs-dist/web/pdf_viewer.css';
import { heightOffset0, heightOffset1, heightOffset3, heightOffsetTabs } from "./constants";
import { retrievePDF, savePDF } from './utils/indexDbUtils';
import { extractAllTextFromPDF } from './utils/extractAllTextFromPdf';
import { addSandboxWatermark } from './utils/addSandboxWatermark';
import simpleHash from './utils/simpleHash';


const SANDBOX_BUNDLE_SRC = 'pdfjs-dist/build/pdf.sandbox.js';

const containerStyle = css`
  overflow-y: scroll;
  position: absolute;
  border-right: 1px solid #c6c6c6;
  border-left: 1px solid #c6c6c6;
  background: #282828;

  /* Custom scrollbar styles */
  &::-webkit-scrollbar {
    width: 10px;
  }
  &::-webkit-scrollbar-thumb {
    background: #888;
  }
`;

export const PdfViewer = ({
	activePageIndex,
	setPdfText,
	activePage,
	modifiedFiles,
	showHeader,
	showSubheader,
	setPdfProxyObj,
	setCurrentAiDocHash,
	tools,
	setPdfViewerObj,
	files,
	viewerContainerRef1,
	eventBusRef,
	setMatchesCount,
	setActivePage,
	onPagesLoaded,
	leftPanelEnabled,
	rightPanelEnabled,
	setFileLoadFailError,
	setDocumentLoading,
	isSandbox,
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

	const hasWatermarkAdded = useRef(false);


	const pdfLinkServiceRef = useRef(null);
	const pdfViewerRef = useRef(null);
	const pdfFindControllerRef = useRef(null);
	const pdfScriptingManagerRef = useRef(null);
	const annotationEditorUIManagerRef = useRef(null);

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
		});

		eventBus.on('pagesloaded', () => {
			setDocumentLoading(false);
			if (typeof activePage === "number") {
				pdfLinkServiceRef.current?.goToPage(activePage || 1);
			}
			window.parent.postMessage({
				type: "pages-loaded",
				message: new Date().toISOString()
			})
			onPagesLoaded();
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
		if (modifiedFiles[activePageIndex]) {
			modFile = await retrievePDF(`pdfId${activePageIndex}`);
		}
		if (!modFile) {
			try {
				modFile = await retrievePDF(`original${activePageIndex}`);
			} catch (err) {

			}
		}
		const loadingTask = pdfjs.getDocument(modFile || files[activePageIndex]?.url);

		loadingTask.promise.then(
			async (loadedPdfDocument) => {
				if (isSandbox) {
					const pdfData = new Uint8Array(await loadedPdfDocument.getData()).slice(0);
					const pdfWithWatermark = await addSandboxWatermark(new Uint8Array(pdfData));
					loadedPdfDocument = await pdfjs.getDocument({data: pdfWithWatermark}).promise;
					hasWatermarkAdded.current = true;
				}
				// If no modifiedFile, continue to set the loaded PDF document.
				setPdfProxyObj(loadedPdfDocument);
				console.log(eventBus, 'eventBus', eventBus.on, 'onn')

				annotationEditorUIManagerRef.current = new pdfjs.AnnotationEditorUIManager(
					viewerContainerRef1.current,
					pdfViewerRef.current,
					eventBus,
					loadedPdfDocument.annotationStorage
				);
				console.log(pdfjs.AnnotationEditorType.FREETEXT, 'pdfjs.AnnotationEditorType.FREETEXT')
				annotationEditorUIManagerRef.current.updateMode(pdfjs.AnnotationEditorType.FREETEXT);
				annotationEditorUIManagerRef.current.setEditingState(true);

				pdfViewerRef.current.setDocument(loadedPdfDocument);
				pdfLinkServiceRef.current.setDocument(loadedPdfDocument, null);
				
				if (!modifiedFiles[activePageIndex]) {
					savePDF(new Uint8Array(await loadedPdfDocument.getData()).slice(0), `original${activePageIndex}`);
				}
				const text = await extractAllTextFromPDF(loadedPdfDocument);
				setPdfText(text);
				setCurrentAiDocHash(simpleHash(JSON.stringify(text)));

		
			},
			reason => {
				setFileLoadFailError(reason?.message);
				console.error(JSON.stringify(reason), 'error.');
				window.parent.postMessage({ type: 'file-failed', message: reason?.message }, '*');
			}
		);
	}

	useEffect(() => {
    if (!files?.length || !viewerContainerRef1.current) return;
    const targetContainer = viewerContainerRef1;
    applyDocument(targetContainer.current); // assume applyDocument is async
	}, [files, modifiedFiles, activePageIndex]);


	useEffect(() => {
		function handleVisibilityChange() {
			if (document.hidden) {
				// Page is now hidden
			}
			else {
				// Page is now visible

				// You can put your logic here to re-render the PDF or perform some other actions
				// For example, you might call a function to reload the PDF:
				const targetContainer = viewerContainerRef1.current;
				applyDocument(targetContainer);
			}
		}
	
		document.addEventListener('visibilitychange', handleVisibilityChange);
		return () => document.removeEventListener('visibilitychange', handleVisibilityChange);
	}, [modifiedFiles, files]);

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
		} else if (!showHeader) {
			toolbarSpaceUsed = heightOffset3;
		} else {
			toolbarSpaceUsed = heightOffset1 + heightOffset3;
		}
		toolbarSpaceUsed += heightOffsetTabs;
		return `calc(100% - ${toolbarSpaceUsed}px)`;
	}

	return (
		<div>
			<div ref={viewerContainerRef1} id="viewerContainer" css={containerStyle} style={{ width: width(), height: height(), visibility: "visible" }}>
				<div id="viewer" class="pdfViewer" />
			</div>
		</div>
	);
};