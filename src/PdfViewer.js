/** @jsxImportSource @emotion/react */
import { css } from '@emotion/react';
import { useContext, useEffect, useRef } from 'preact/hooks';
import * as pdfjs from 'pdfjs-dist';
import { EventBus, PDFLinkService, PDFViewer, PDFFindController, PDFScriptingManager, PDFRenderingQueue } from 'pdfjs-dist/web/pdf_viewer';
import 'pdfjs-dist/web/pdf_viewer.css';
import { heightOffset0, heightOffset1, heightOffset3, heightOffsetTabs } from './constants';
import { extractAllTextFromPDF } from './utils/extractAllTextFromPdf';
import { addSandboxWatermark } from './utils/addSandboxWatermark';
import simpleHash from './utils/simpleHash';
import { AnnotationEditorParamsType } from 'pdfjs-dist/build/pdf';
import { useAnnotations } from './hooks/useAnnotations';
import { AnnotationsContext } from './Contexts/AnnotationsContext';

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
	annotationsRef,
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
	pdfLinkServiceRef,
	pdfFindControllerRef,
	pdfScriptingManagerRef,
	editorMode,
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
        onTagClicked,
        onEnableTextEditMode
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

	const { activeSignerId } = useContext(AnnotationsContext);

        const hasWatermarkAdded = useRef(false);
        const enableTextEditModeRef = useRef(onEnableTextEditMode);

        useEffect(() => {
                enableTextEditModeRef.current = onEnableTextEditMode;
        }, [onEnableTextEditMode]);

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
		eventBusRef.current.dispatch('switchannotationeditorparams', {
			type: AnnotationEditorParamsType.FREETEXT_COLOR,
			value: annotationColor
		});
	}, [annotationColor]);

        const applyDocument = async (viewerContainer) => {

                console.log('[PdfViewer] applyDocument called', {
                        hasViewerContainer: !!viewerContainer,
                        editorMode,
                        activeSignerId,
                        annotationCount: annotationsRef.current?.length,
                        annotationIds: annotationsRef.current?.map((annot) => annot.id)
                });

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
			pdfViewerRef.current.currentScaleValue = 'page-width';
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
				console.log(initialAnnotations, 'initialAnnotations2')
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
			onEditOriginalTextSelected(event.detail, event.pageNumber);

		});

		eventBus.on('tagclicked', (details) => {
			onTagClicked(details);
		});

		eventBus.on('annotationfocused', ({ details }) => {
			onAnnotationFocus(details.current.id, details.current);
		});

		eventBus.on('annotationchanged', ({ details }) => {
			updateAnnotation(details.current, details.text);
		});

		eventBus.on('annotationeditorresized', (details) => {
		  resizeAnnotation(details);
		});

		eventBus.on('annotationeditormoved', (details) => {
			moveAnnotation(details);
		});

		eventBus.on('annotationremoved', (details) => {
			removeAnnotation(details.details);
		});

		eventBus.on('updatefindmatchescount', ({ matchesCount }) => {
			setMatchesCount(matchesCount?.total);
		});

		eventBus.on('pagechanging', ({ pageNumber }) => {
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
                                console.log('[PdfViewer] preparing annotations for viewer', {
                                        editorMode,
                                        activeSignerId,
                                        totalAnnotations: annotationsRef.current?.length,
                                        annotations: annotationsRef.current
                                });
                                let filteredBySignerAnnotations = annotationsRef.current;
                                if (editorMode !== 'add-clickable-markers' && activeSignerId) {
                                        filteredBySignerAnnotations = annotationsRef.current.filter((annot) => {
                                                if (!annot.overlayText) {
                                                        return true;
                                                }
                                                if (!annot.userId) {
                                                        return true;
                                                }
                                                return annot.userId === activeSignerId;
                                        });
                                }
                                console.log('[PdfViewer] filtered annotations for viewer', {
                                        editorMode,
                                        activeSignerId,
                                        filteredCount: filteredBySignerAnnotations?.length,
                                        annotations: filteredBySignerAnnotations
                                });
				pdfViewerRef.current.setDocument(loadedPdfDocument, filteredBySignerAnnotations);
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
	}, [files, modifiedFiles, activePageIndex, activeSignerId]);


	useEffect(() => {
                function handleVisibilityChange() {
                        if (document.hidden) {
                                // Page is now hidden
                        }
                        else {
                                // Page is now visible

                                // You can put your logic here to re-render the PDF or perform some other actions
                                // For example, you might call a function to reload the PDF:
                                console.log('Hello focus');
                                const targetContainer = viewerContainerRef1.current;
                                if (targetContainer) {
                                        applyDocument(targetContainer);
                                }
                                if (rightPanelEnabled && editorMode === 'add-clickable-markers') {
                                        enableTextEditModeRef.current?.();
                                }
                        }
                }

                document.addEventListener('visibilitychange', handleVisibilityChange);
                return () => document.removeEventListener('visibilitychange', handleVisibilityChange);
        }, [modifiedFiles, files, activeSignerId, rightPanelEnabled, editorMode]);

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