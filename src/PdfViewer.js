/** @jsxImportSource @emotion/react */
import { css } from '@emotion/react';
import { useEffect, useRef } from 'preact/hooks';
import * as pdfjs from 'pdfjs-dist';
import { EventBus, PDFLinkService, PDFViewer, PDFFindController, PDFScriptingManager, PDFRenderingQueue } from 'pdfjs-dist/web/pdf_viewer';
import 'pdfjs-dist/web/pdf_viewer.css';
import { heightOffset0, heightOffset1, heightOffset3, heightOffsetTabs } from './constants';
import { extractAllTextFromPDF } from './utils/extractAllTextFromPdf';
import { addSandboxWatermark } from './utils/addSandboxWatermark';
import simpleHash from './utils/simpleHash';
import { AnnotationEditorParamsType } from 'pdfjs-dist/build/pdf';

const SANDBOX_BUNDLE_SRC = 'pdfjs-dist/build/pdf.sandbox.js';

const extractTextFromFirstPage = async (pdfDocument) => {
  try {
    const page = await pdfDocument.getPage(1); // Get the first page
    const textContent = await page.getTextContent();
    // Process textContent as needed, e.g., console.log or set state
    console.log(textContent, 'text content11');
  } catch (error) {
    console.error('Error extracting text from first page:', error);
  }
};

const containerStyle = css`
	overflow: auto;
	position: absolute;
	width: 100%;
	height: 100%;
	background: #141414;
`;

export const PdfViewer = ({
	storage,
	onEditOriginalTextSelected,
	activePageIndex,
	initialAnnotations,
	onAnnotationFocus,
	activeToolbarItemRef,
	annotations,
	annotationColor,
	updateAnnotation,
	resizeAnnotation,
	moveAnnotation,
	removeAnnotation,
	setPdfText,
	activePage,
	modifiedFiles,
	showHeader,
	showSubheader,
	setPdfProxyObj,
	pdfProxyObj,
	pdfLinkServiceRef,
	pdfFindControllerRef,
	pdfScriptingManagerRef,
	annotationEditorUIManagerRef,
	setCurrentAiDocHash,
	tools,
	setPdfViewerObj,
	files,
	viewerContainerRef1,
	eventBusRef,
	pdfViewerRef,
	setMatchesCount,
	setActivePage,
	onPagesLoaded,
	leftPanelEnabled,
	rightPanelEnabled,
	setFileLoadFailError,
	setDocumentLoading,
	isSandbox,
	updateCurrentScale,
	onTagClicked
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

	const annotationsRef = useRef(null);

	useEffect(() => {
		console.log(annotations, 'annotations 444')
		annotationsRef.current = annotations;
	}, [annotations]);


	const hasWatermarkAdded = useRef(false);

	const cleanupDocument = async () => {
		pdfViewerRef.current?.setDocument(null);
		pdfLinkServiceRef.current?.setDocument(null);
		try {
			await pdfScriptingManagerRef.current?.destroyPromise();
		}
		catch (err) {}
		pdfViewerRef.current?.cleanup();
	};

	useEffect(() => {
		if (!eventBusRef.current) {
			return;
		}
		console.log(annotationColor, 'annotationColor');
		eventBusRef.current.dispatch('switchannotationeditorparams', {
			type: AnnotationEditorParamsType.FREETEXT_COLOR,
			value: annotationColor
		});
	}, [annotationColor]);

	const refreshPage = async (pageNumber, textToRemove) => {
    const pdf = pdfViewerRef.current.pdfDocument;
    const page = await pdf.getPage(pageNumber);

    // Original size of the PDF page
    const originalViewport = page.getViewport({ scale: 1.0 });

    const canvas = pdfViewerRef.current._pages[pageNumber - 1].canvas;
    const ctx = canvas.getContext('2d');

    // Calculate the scale factor based on the current size of the canvas
    const scaleX = canvas.width / originalViewport.width;
    const scaleY = canvas.height / originalViewport.height;
    const scale = Math.min(scaleX, scaleY);  // Use the smaller scale to preserve aspect ratio

    const viewport = page.getViewport({ scale: scale });

    // Clear the existing canvas
    ctx.clearRect(0, 0, canvas.width, canvas.height);

    // Adjust canvas size if necessary
    canvas.width = viewport.width;
    canvas.height = viewport.height;

    // Render the page into the canvas context
    let renderContext = {
			canvasContext: ctx,
			viewport,
			textToRemove
    };

		await page.render(renderContext).promise;
	};

	const applyDocument = async (viewerContainer) => {
		
		await cleanupDocument();

		const eventBus = new EventBus();
		eventBusRef.current = eventBus;
		pdfLinkServiceRef.current = new PDFLinkService({ eventBus: eventBusRef.current, externalLinkTarget: 2 });
		pdfFindControllerRef.current = new PDFFindController({ eventBus: eventBusRef.current, linkService: pdfLinkServiceRef.current });
		pdfScriptingManagerRef.current = new PDFScriptingManager({ eventBus: eventBusRef.current, sandboxBundleSrc: SANDBOX_BUNDLE_SRC });
		// @ts-ignore
		// const pdfRenderingQueue = new PDFRenderingQueue();
		pdfViewerRef.current = new PDFViewer({
			container: viewerContainer,
			viewer: document.getElementById('viewer'),
			eventBus: eventBusRef.current,
			// renderingQueue: pdfRenderingQueue,
			linkService: pdfLinkServiceRef.current,
			findController: pdfFindControllerRef.current,
			scriptingManager: pdfScriptingManagerRef.current,
			annotationEditorMode: 0
		});
		
		// pdfViewerRef.current.currentScale = 0.2 // WIP
		setPdfViewerObj(pdfViewerRef.current);

		pdfLinkServiceRef.current.setViewer(pdfViewerRef.current);
		pdfScriptingManagerRef.current.setViewer(pdfViewerRef.current);

		eventBus.on('pagesinit', () => {
			pdfViewerRef.current.currentScaleValue = 'page-height';
			updateCurrentScale(Math.round(pdfViewerRef.current.currentScale * 100));
		});

		eventBus.on('pagesloaded', () => {
			setDocumentLoading(false);
			if (typeof activePage === 'number') {
				pdfLinkServiceRef.current?.goToPage(activePage || 1);
			}
			window.parent.postMessage({
				type: 'pages-loaded',
				message: new Date().toISOString()
			});
			if (activeToolbarItemRef.current === 'text') {
				pdfViewerRef.current.annotationEditorMode = {
					isFromKeyboard: false,
					mode: pdfjs.AnnotationEditorType.FREETEXT,
					source: null
				};
			}
			if (initialAnnotations && tools?.markers?.includes('clickable')) {
				pdfViewerRef.current.annotationEditorMode = {
					isFromKeyboard: false,
					mode: pdfjs.AnnotationEditorType.CLICKTAG,
					source: null
				};
			}
			onPagesLoaded();

		});

		eventBus.on('edit-original-text-selected', (event) => {
			console.log(event, 'details 77855');
			onEditOriginalTextSelected(event.detail);
			refreshPage(1, event.detail);

		});

		eventBus.on('tagclicked', (details) => {
			// console.log(details, 'details 778')
			onTagClicked(details);
		});

		eventBus.on('annotationfocused', ({ details }) => {
			// console.log(details, 'details r48')
			onAnnotationFocus(details.current.id, details.current);
		});

		eventBus.on('annotationchanged', ({ details }) => {
			// console.log(details, 'details r44', details.text)
			updateAnnotation(details.current, details.text);
		});

		eventBus.on('annotationeditorresized', (details) => {
			// console.log(details, 'details annotationeditorresized')
		  resizeAnnotation(details);
			// first, need initial width set.
		});

		eventBus.on('annotationeditormoved', (details) => {
			// console.log(details, 'details r455')
			moveAnnotation(details);
		});

		eventBus.on('annotationremoved', (details) => {
			// console.log(details, 'details r422')
			removeAnnotation(details.details);
		});

		eventBus.on('updatefindmatchescount', ({ matchesCount }) => {
			// console.log(matchesCount, 'matchesCount44')
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
			const container = document.getElementById('panel');
			
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
			modFile = await storage?.retrieve(`pdfId${activePageIndex}`);
		}
		if (!modFile) {
			try {
				modFile = await storage?.retrieve(`original${activePageIndex}`);
			}
			catch (err) {

			}
		}
		const loadingTask = pdfjs.getDocument(modFile || files[activePageIndex]?.url);
		// return;
		
		loadingTask.promise.then(
			async (loadedPdfDocument) => {
				if (isSandbox) {
					/* TODO:
					const pdfData = new Uint8Array(await loadedPdfDocument.getData()).slice(0);
					const pdfWithWatermark = await addSandboxWatermark(new Uint8Array(pdfData));
					loadedPdfDocument = await pdfjs.getDocument({data: pdfWithWatermark}).promise;
					hasWatermarkAdded.current = true;
					*/
				}
				// If no modifiedFile, continue to set the loaded PDF document.
				setPdfProxyObj(loadedPdfDocument);
				// console.log("setting doc2", annotationsRef.current)
				pdfViewerRef.current.setDocument(loadedPdfDocument, annotationsRef.current);
				pdfLinkServiceRef.current.setDocument(loadedPdfDocument, null);
				extractTextFromFirstPage(loadedPdfDocument);
				if (!modifiedFiles[activePageIndex]) {
					storage?.save(new Uint8Array(await loadedPdfDocument.getData()).slice(0), `original${activePageIndex}`);
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
	};

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
		if (!tools?.general?.includes('thumbnails')) {
			return '100%';
		}
		return `calc(100% - ${panelSpaceUsed()}px)`;
	};

	const height = () => {
		let toolbarSpaceUsed;
		if (!showHeader && !showSubheader) {
			toolbarSpaceUsed = heightOffset0;
		}
		else if (!showSubheader) {
			toolbarSpaceUsed = heightOffset1;
		}
		else if (!showHeader) {
			toolbarSpaceUsed = heightOffset3;
		}
		else {
			toolbarSpaceUsed = heightOffset1 + heightOffset3;
		}
		toolbarSpaceUsed += heightOffsetTabs;
		return `calc(100% - ${toolbarSpaceUsed}px)`;
	};

	return (
		<div>
			<div ref={viewerContainerRef1} id="viewerContainer" css={containerStyle} style={{ width: width(), height: height(), visibility: 'visible' }}>
				<div id="viewer" class="pdfViewer" />
			</div>
		</div>
	);
};