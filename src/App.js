/** @jsxImportSource @emotion/react */
import { css } from '@emotion/react';
import { useEffect, useRef, useState } from 'preact/hooks';
import 'pdfjs-dist/web/pdf_viewer.css';
import Header from './Header/Header';
import Subheader from './Subheader';
import Tabs from './components/Tabs';
import { useDebounce } from './utils/useDebounce';
import SearchBar from './SearchBar';
import { PdfViewer } from './PdfViewer';
import Panel from './components/Panel';
import { heightOffset0, heightOffset1, heightOffset3, heightOffsetTabs } from "./constants";
import { remove_pages, move_page, rotate_pages, merge_pdfs, PdfMergeData } from '../lib/pdf_wasm_project.js';
import { retrievePDF, savePDF } from './utils/indexDbUtils';
import { invokePlugin, pendingRequests } from './utils/pluginUtils';
import { I18nextProvider } from 'react-i18next';
import i18n from "./utils/i18n";
import useInitWasm from './hooks/useInitWasm';
import { useMediaQuery } from './hooks/useMediaQuery';
import useDeclareIframeLoaded from './hooks/useDeclareIframeLoaded';
import useDownload from './hooks/useDownload';
import useListenForDownloadRequest from './hooks/useListenForDownloadRequest';
import usePropageClickEvents from './hooks/usePropagateClickEvents';
import {supabase} from './utils/supabase';
import * as amplitude from '@amplitude/analytics-browser';
import useListenForThumbnailFullScreenRequest from './hooks/useListenForThumbnailFullScreenRequest';
import useListenForThumbnailZoomRequest from './hooks/useListenForThumbnailZoomRequest';
import useListenForExtractPagesRequest from './hooks/useListenForExtractPagesRequest';
import useListenForMergeFilesRequest from './hooks/useListenForMergeFilesRequest';
import useListenForCombineFilesRequest from './hooks/useListForCombineFilesRequest';
import { PDFDocument } from 'pdf-lib';

amplitude.init("76825a74ed5e5f72bc6a75fd052e78ad")

const Flex = css`
display: flex;
width: 100%;
height: 100%;
`;

const pdfViewerWrapper = css`
  height: 100%;
  width: 100%;
`;

const failWrap = css`
	font-family: Lato;
	margin: 0 8px;
	text-align: center;
`;

const App = () => {

	const [activePageIndex, setActivePageIndex] = useState(0);
	const [matchesCount, setMatchesCount] = useState(0);

	const pdfId = `pdfId${activePageIndex}`;
	const originalPdfId = `original${activePageIndex}`;

	const [fileLoadFailError, setFileLoadFailError] = useState('');

	const [searchText, setSearchText] = useState('');

	const eventBusRef = useRef(null);

	const [pdfProxyObj, setPdfProxyObj] = useState(null);
	const [pdfViewerObj, setPdfViewerObj] = useState(null);

	const [buffer, setBuffer] = useState(1); // 1 for primary, 2 for secondary
	const viewerContainerRef1 = useRef(null);
	const viewerContainerRef2 = useRef(null);

	const [expandedViewThumbnailScale, setExpandedViewThumbnailScale] = useState(2);
	const [thumbnailScale, setThumbnailScale] = useState(2);

	const switchBuffer = () => setBuffer(buffer === 1 ? 2 : 1);

	const getTargetContainer = () => {
		return buffer === 1 ? viewerContainerRef2 : viewerContainerRef1;
	};
	const [isSandbox, setIsSandbox] = useState(false);

	const [file, setFile] = useState(null);
	const [fileName, setFileName] = useState('file.pdf');

	const [showSearch, setShowSearch] = useState(false);
	const [showPanel, setShowPanel] = useState(true);

	const [multiPageSelections, setMultiPageSelections] = useState([]);

	useEffect(() => {
		window.parent.postMessage({ type: 'multi-page-selection-change', message: multiPageSelections }, window.parent.origin);
	}, [multiPageSelections]);

	const [activePage, setActivePage] = useState(1);

	const [tools, setTools] = useState([]);

	const onSearchBtnClick = () => {
		setShowSearch(() => !showSearch);
	};

	const onPanelBtnClick = () => {
		setShowPanel(() => !showPanel);
	};

	const initAnalytics = () => {
		if (process.env.NODE_ENV === "development") {
			return;
		}
		amplitude.track('session_start');
	}

	useEffect(() => {
		initAnalytics();
	}, []);

	useInitWasm();

  const [modifiedFile, setModifiedFile] = useState(null);
	const [modifiedFiles, setModifiedFiles] = useState([]);
	const { triggerDownload: onDownload } = useDownload(pdfProxyObj, fileName, isSandbox);

	const [inputtedLicenseKey, setInputtedLicenseKey] = useState(null);
	const [files, setFiles] = useState([]);

	const initialRedoUndoObject = () => {
		const result = {};
		for (let i = 0; i < files.length; i ++) {
			result[i] = [];
		}
		return result;
	};
	
	const [operations, setOperations] = useState(initialRedoUndoObject());
	const [redoStack, setRedoStack] = useState(initialRedoUndoObject());

	useEffect(() => {
		setOperations(initialRedoUndoObject());
		setRedoStack(initialRedoUndoObject());
	}, [files]);

	useEffect(() => {
		window.addEventListener('message', (event) => {
			if (typeof event.data === 'object' && event.data.files?.length) {
				setFile(event.data.files[0].url);
				setFiles(event.data.files);
				event.source.postMessage({ type: 'file-received', success: true }, event.origin);
			}
			if (typeof event.data === 'object' && event.data.fileName) {
				setFileName(event.data.fileName);
			}
			if (typeof event.data === 'object' && event.data.tools) {
				setTools(event.data.tools);
			}
			if (typeof event.data === 'object' && event.data.locale) {
				i18n.changeLanguage(event.data.locale)
			}
			if (typeof event.data === 'object' && event.data.licenseKey) {
				setInputtedLicenseKey(event.data.licenseKey);
			}
			if (event.data?.type === 'fromCore') {
				const id = event.data.id;
				if (pendingRequests[id]) {
					// Resolve the promise with the result
					pendingRequests[id].resolve(event.data.result);
					// Remove the pending request
					delete pendingRequests[id];
				}
			}
		}, false);
	}, []);

	async function doMerge(pdfList) {
		const mergedPdf = await PDFDocument.create();
	
		for (const { pdfBuffer, pages, position } of pdfList) {
			const pdf = await PDFDocument.load(pdfBuffer);
			const copiedPages = await mergedPdf.copyPages(pdf, pages);
			for (const [i, page] of copiedPages.entries()) {
				mergedPdf.insertPage(position + i, page);
			}
		}
	
		return await mergedPdf.save();
	}

	const onMergeFiles = async (pdfList) => {
		// const buffer = await pdfProxyObj.getData();
		/*
		const pdfList = [
			{ pdfBuffer: buffer, pages: [0, 2], position: 0 },
			{ pdfBuffer: buffer, pages: [0, 2], position: 2 },
		];
		*/
		const modifiedPdfArray = await doMerge(pdfList);
		window.parent.postMessage({ type: "merge-files-completed", message: modifiedPdfArray});
	}

	const combinePDFs = async (pdfBuffers) => {
		const combinedPdf = await PDFDocument.create();
	
		for (const pdfBuffer of pdfBuffers) {
			const pdf = await PDFDocument.load(pdfBuffer);
			const pageCount = pdf.getPageCount();
			const pageIndices = Array.from({ length: pageCount }, (_, i) => i); // [0, 1, 2, ..., pageCount - 1]
	
			const copiedPages = await combinedPdf.copyPages(pdf, pageIndices);
	
			for (const page of copiedPages) {
				combinedPdf.addPage(page);
			}
		}
	
		return await combinedPdf.save();
	}

	const onCombinePdfs = async (pdfBuffers) => {
		const modifiedPdfArray = await combinePDFs(pdfBuffers);
		window.parent.postMessage({ type: "combine-files-completed", message: modifiedPdfArray});
	}

	usePropageClickEvents();
	useDeclareIframeLoaded();
	useListenForDownloadRequest(onDownload);
	useListenForMergeFilesRequest(onMergeFiles);
	useListenForCombineFilesRequest(onCombinePdfs);

	useEffect(() => {
		if (!files[activePageIndex]?.url) {
			return;
		}
		setFile(files[activePageIndex].url);
	}, [activePageIndex]);

	
	useListenForThumbnailFullScreenRequest((enable) => {
		if (enable === true) {
			onExpand();
		} else if (enable === false) {
			onMinimize();
		} else if (showFullScreenThumbnails) {
			onMinimize();
		} else {
			onExpand();
		}
	});
	useListenForThumbnailZoomRequest((v) => {
		setExpandedViewThumbnailScale(v);
		setThumbnailScale(v);
	})

	const [matchWholeWord, setMatchWholeWord] = useState(false);

	const [caseSensitive, setCaseSensitive] = useState(false);

	const _onSearchText = (e, _entireWord, _sensitive) => {
		eventBusRef.current?.dispatch('find', {
			// source: evt.source,
			type: '',
			query: e.target.value,
			caseSensitive: typeof _sensitive === 'boolean' ? _sensitive : caseSensitive,
			entireWord: typeof _entireWord === 'boolean' ? _entireWord : matchWholeWord,
			highlightAll: true,
			findPrevious: false,
			matchDiacritics: true
		});
		setSearchText(e.target.value);
	};

	const onSearchText = useDebounce(_onSearchText, 100);

	const onToggleWholeWord = () => {
		const newState = !matchWholeWord;
		onSearchText({
			target: {
				value: searchText
			}
		}, newState);
		setMatchWholeWord(() => newState);
	};

	const onToggleCaseSensitive = () => {
		const newState = !caseSensitive;
		onSearchText({
			target: {
				value: searchText
			}
		}, undefined, newState);
		setCaseSensitive(() => newState);
	};

	const onNext = () => {
		eventBusRef.current?.dispatch('find', {
			// source: evt.source,
			type: 'again',
			query: searchText,
			caseSensitive,
			entireWord: matchWholeWord,
			highlightAll: true,
			findPrevious: false,
			matchDiacritics: true
		});
	};

	const onPrev = () => {
		eventBusRef.current?.dispatch('find', {
			// source: evt.source,
			type: 'again',
			query: searchText,
			caseSensitive,
			entireWord: matchWholeWord,
			highlightAll: true,
			findPrevious: true,
			matchDiacritics: true
		});
	};

	const onClearSearch = () => {
		onSearchText({
			target: {
				value: ''
			}
		});
	};

	const onClickTestHandler = async () => {
		try {
			const result = await invokePlugin({
				pluginName: "myPlugin",
				funcName: "sayHello",
				args: []
			});
			console.log('Received data:', result);
		} catch (err) {
			console.log('Error:', err);
		}
	};

	const [isOnline, setIsOnline] = useState(navigator.onLine);

	const [hasValidLicense, setHasValidLicense] = useState(null);
	const [isInValidDomain, setIsInValidDomain] = useState(null);

	const checkLicense = async () => {
		const { data, error } = await supabase.functions.invoke('verify-license-key', {
      body: { licenseKey: inputtedLicenseKey, origin: window.origin },
    });
		if (error) {
			if (error.message === "Invalid license key") {
				setHasValidLicense(false);
			}
			// we'll take the blame here
			return;
		}
		if (data.message === "Unauthorized domain") {
			setIsInValidDomain(false);
			return;
		}
		if (data.error === "Unauthorized domain") {
			setIsInValidDomain(false);
			return;
		}
		if (data.error === "Invalid license key") {
			setIsInValidDomain(false);
			return;
		}
		if (data.message === "License and domain are valid") {
			setHasValidLicense(true);
		} else {
			// not sure what this is actually
			setHasValidLicense(false);
		}
	}

	useEffect(() => {
		if (!isOnline) {
			return;
		}
		if (hasValidLicense === true) {
			return;
		}
		if (!inputtedLicenseKey) {
			return;
		}
		if (inputtedLicenseKey.toLowerCase() === "sandbox") {
			setIsSandbox(true);
			return;
		}
		checkLicense();
	}, [isOnline, inputtedLicenseKey]);

  useEffect(() => {
    const updateOnlineStatus = () => {
      setIsOnline(navigator.onLine);
    };

    window.addEventListener('online', updateOnlineStatus);
    window.addEventListener('offline', updateOnlineStatus);

    return () => {
      window.removeEventListener('online', updateOnlineStatus);
      window.removeEventListener('offline', updateOnlineStatus);
    };
  }, []);

	const showHeader = () => {
		return tools?.general?.includes("download") || tools?.general?.includes("panel-toggle")
		|| tools?.general?.includes("zoom") || tools?.general?.includes("search")
		|| tools?.editing?.includes("rotation")
	}

	const showSubheader = () => {
		return !!tools?.editing?.length
	}

	const undoLastAction = async () => {
		if (operations[activePageIndex]?.length === 0) return;
		const lastOperation = operations[activePageIndex]?.[operations[activePageIndex].length - 1];
		// Start with the original PDF
		let buffer = await retrievePDF(originalPdfId);
	
		// Replay all operations except for the last one
		for (let i = 0; i < operations[activePageIndex]?.length - 1; i++) {
			const operation = operations[activePageIndex][i];
			buffer = await applyOperation(operation, buffer); // Assuming applyOperation returns the updated buffer
		}
	
		// Save the buffer after undo as the current state
		await savePDF(buffer, pdfId);
		let newModifiedPayload = JSON.parse(JSON.stringify(modifiedFiles));
		newModifiedPayload[activePageIndex] = new Date().toISOString();
		setModifiedFiles(newModifiedPayload);
		// Update undo and redo stacks
		const newUndoStack = operations[activePageIndex]?.slice(0, -1);
		// setRedoStack(prevRedoStack => [...prevRedoStack, lastOperation]);
		setRedoStack({
			...redoStack,
			[activePageIndex]: [...redoStack[activePageIndex], lastOperation]
		});
		setOperations({
			...operations,
			[activePageIndex]: newUndoStack
		});
	};
	
	const redoLastAction = async () => {
		if (redoStack[activePageIndex]?.length === 0) return;
	
		const lastRedoOperation = redoStack[activePageIndex]?.[redoStack[activePageIndex].length - 1];
		// Start with the original PDF
		let buffer = await retrievePDF(originalPdfId);
		// Replay all operations including the redo operation
		const allOperationsUpToRedo = [...operations[activePageIndex], lastRedoOperation];
		for (const operation of allOperationsUpToRedo) {
			buffer = await applyOperation(operation, buffer); // Assuming applyOperation returns the updated buffer
		}
	
		// Save the buffer after redo as the current state
		await savePDF(buffer, pdfId);
		let newModifiedPayload = JSON.parse(JSON.stringify(modifiedFiles));
		newModifiedPayload[activePageIndex] = new Date().toISOString();
		setModifiedFiles(newModifiedPayload);
	
		// Update undo and redo stacks
		setOperations({
			...operations,
			[activePageIndex]: [...operations[activePageIndex], lastRedoOperation]
		});
		setRedoStack({
			...redoStack,
			[activePageIndex]: redoStack[activePageIndex].slice(0, -1)
		});
	};

	const doDrag = async (start, end, buffer) => {
		try {
			const modifiedPdfArray = await move_page(new Uint8Array(buffer), start, end);
			return modifiedPdfArray.buffer;
		} catch (error) {
			console.error('Error modifying PDF:', error);
			return buffer;
		}
	}

	const appliedSandox = useRef(false);

	const [watermarkQueue, setWatermarkQueue] = useState(false);
  const appliedSandbox = useRef(false);

	async function addWatermark(pdfBytes) {
		// Load a PDFDocument from the existing PDF bytes
		const pdfDoc = await PDFDocument.load(pdfBytes);

		// Embed the Helvetica font
		const helveticaFont = await pdfDoc.embedFont(StandardFonts.Helvetica);
	
		// Get all the pages in the PDF
		const pages = pdfDoc.getPages();
	
		// Draw a watermark on each page
		for (const page of pages) {
			const { width, height } = page.getSize();
			page.drawText('Watermark Text Here', {
				x: 50,
				y: height - 4 * 12,
				size: 12,
				font: helveticaFont,
				color: rgb(0.95, 0.1, 0.1),
			});
		}
	
		// Serialize the PDF
		let result = await pdfDoc.save();
	
		return result;
	}
  
	const doDelete = async (pages, buffer) => {
		try {
			const modifiedPdfArray = await remove_pages(new Uint8Array(buffer), pages);
			return modifiedPdfArray.buffer;
		} catch (error) {
			console.error('Error modifying PDF:', error);
		}
		return;
	}

	const doRotate = async (pages, buffer, clockwise = true) => {
		try {
			const modifiedPdfArray = await rotate_pages(new Uint8Array(buffer), pages, clockwise);
			return modifiedPdfArray.buffer;
		} catch (error) {
			console.error('Error modifying PDF:', error);
		}
		return;
	}

	const applyOperation = async (operation, buffer) => {
		switch (operation.action) {
			case "delete": {
				return await doDelete(operation.pages, buffer);
			}
			case "drag": {
				return await doDrag(operation.start, operation.end, buffer);
			}
			case "rotate": {
				return await doRotate(operation.pages, buffer, operation.clockwise);
			}
		}
	}

	const onRotateFullScreenThumbnails = async (clockwise) => {
		if (!pdfProxyObj) {
			console.log('No PDF loaded to download');
			return;
		}

		const buffer = await pdfProxyObj.getData();
		const pagesToRotate = multiPageSelections?.length ? multiPageSelections : [activePage];
		if (!pagesToRotate.length) {
			return;
		}
		const operation = { action: "rotate", pages: pagesToRotate, clockwise};
		setMultiPageSelections([]);
		const bufferResult = await applyOperation(operation, buffer);
		await savePDF(bufferResult, pdfId);
		let newModifiedPayload = JSON.parse(JSON.stringify(modifiedFiles));
		newModifiedPayload[activePageIndex] = new Date().toISOString();
		setModifiedFiles(newModifiedPayload);
	
		setOperations({
			...operations,
			[activePageIndex]: [...operations[activePageIndex], operation]
		});
		setOperations([...operations, operation]);
		setRedoStack([]);
	}

	const onRotate = async (clockwise) => {
		if (!pdfProxyObj) {
			console.log('No PDF loaded to download');
			return;
		}

		const buffer = await pdfProxyObj.getData();
		const numPages = pdfProxyObj?.numPages;
		const pagesToRotate = Array.from({length: numPages}).map((_, i) => i + 1);
		const operation = { action: "rotate", pages: pagesToRotate, clockwise};
		setMultiPageSelections([]);
		const bufferResult = await applyOperation(operation, buffer);
		await savePDF(bufferResult, pdfId);
		let newModifiedPayload = JSON.parse(JSON.stringify(modifiedFiles));
		newModifiedPayload[activePageIndex] = new Date().toISOString();
		setModifiedFiles(newModifiedPayload);
	
		setOperations([...operations, operation]);
		setRedoStack([]);
	}

	const onRotateThumbnail = async (clockwise, pageNum) => {
		if (!pdfProxyObj) {
			console.log('No PDF loaded to download');
			return;
		}

		const buffer = await pdfProxyObj.getData();
		const pagesToRotate = multiPageSelections?.length ? Array.from(new Set([...multiPageSelections, pageNum])) : [pageNum];
		const operation = { action: "rotate", pages: pagesToRotate, clockwise};
		const bufferResult = await applyOperation(operation, buffer);
		await savePDF(bufferResult, pdfId);
		let newModifiedPayload = JSON.parse(JSON.stringify(modifiedFiles));
		newModifiedPayload[activePageIndex] = new Date().toISOString();
		setModifiedFiles(newModifiedPayload);
	
		setOperations([...operations, operation]);
		setRedoStack([]);
	}

	const canDelete = () => {
		if (showFullScreenThumbnails) {
			return !!multiPageSelections?.length
		}
		return !!multiPageSelections?.length || !!activePage
	}
	
	const canExtract = (override) => {
		if (Array.isArray(override)) {
			return !!override?.length;
		}
		if (showFullScreenThumbnails) {
			return !!multiPageSelections?.length
		}
		return !!multiPageSelections?.length || !!activePage
	}

	const onExtract = async (override) => {
    if (!canExtract(override)) {
        return;
    }
    if (!pdfProxyObj) {
        console.log('No PDF loaded to download');
        return;
    }

    const buffer = await pdfProxyObj.getData();
    const totalPages = pdfProxyObj.numPages;
    let selectedPages = multiPageSelections?.length ? new Set(multiPageSelections) : new Set([activePage]);
		if (override?.length) {
			selectedPages = new Set(override);
		}
    // Use Set for O(1) lookup, then generate the pagesToRemove array in O(n) time
    const pagesToRemove = Array.from({ length: totalPages }, (_, i) => i + 1).filter((pageNum) => !selectedPages.has(pageNum));

    const operation = { action: "delete", pages: pagesToRemove };
    setMultiPageSelections([]);
    const bufferResult = await applyOperation(operation, buffer);
    await savePDF(bufferResult, pdfId);
		window.parent.postMessage({ type: "extract-pages-completed", success: true});
    let newModifiedPayload = JSON.parse(JSON.stringify(modifiedFiles));
		newModifiedPayload[activePageIndex] = new Date().toISOString();
		setModifiedFiles(newModifiedPayload);

		setOperations({
			...operations,
			[activePageIndex]: [...operations[activePageIndex], operation]
		});
    setRedoStack(initialRedoUndoObject());
	};

	useListenForExtractPagesRequest((v) => {
		onExtract(v);
	})

	const onDelete = async () => {
		if (!canDelete()) {
			return;
		}
		if (!pdfProxyObj) {
			console.log('No PDF loaded to download');
			return;
		}

		const buffer = await pdfProxyObj.getData();
		const pagesToRemove = multiPageSelections?.length ? multiPageSelections : [activePage];
		const operation = { action: "delete", pages: pagesToRemove};
		setMultiPageSelections([]);
		const bufferResult = await applyOperation(operation, buffer);
		await savePDF(bufferResult, pdfId);
		let newModifiedPayload = JSON.parse(JSON.stringify(modifiedFiles));
		newModifiedPayload[activePageIndex] = new Date().toISOString();
		setModifiedFiles(newModifiedPayload);
	
		setOperations([...operations, operation]);
		setRedoStack([]);
	}

	const onExtractThumbnail = async (page) => {
    if (!pdfProxyObj) {
        console.log('No PDF loaded to download');
        return;
    }

    const buffer = await pdfProxyObj.getData();
    const totalPages = pdfProxyObj.numPages;
    let selectedPages = multiPageSelections?.length ? new Set([...multiPageSelections, page]) : new Set([page]);
    // Use Set for O(1) lookup, then generate the pagesToRemove array in O(n) time
    const pagesToRemove = Array.from({ length: totalPages }, (_, i) => i + 1).filter((pageNum) => !selectedPages.has(pageNum));

    const operation = { action: "delete", pages: pagesToRemove };
    setMultiPageSelections([]);
    const bufferResult = await applyOperation(operation, buffer);
    await savePDF(bufferResult, pdfId);
		window.parent.postMessage({ type: "extract-pages-completed", success: true});
    let newModifiedPayload = JSON.parse(JSON.stringify(modifiedFiles));
		newModifiedPayload[activePageIndex] = new Date().toISOString();
		setModifiedFiles(newModifiedPayload);

    setOperations([...operations, operation]);
    setRedoStack([]);
	}

	const onDeleteThumbnail = async (page) => {
		if (!pdfProxyObj) {
			console.log('No PDF loaded to download');
			return;
		}

		const buffer = await pdfProxyObj.getData();
		const pagesToRemove = multiPageSelections?.length ? Array.from(new Set([...multiPageSelections, page])) : [page];
		const operation = { action: "delete", pages: pagesToRemove};
		setMultiPageSelections([]);
		const bufferResult = await applyOperation(operation, buffer);
		await savePDF(bufferResult, pdfId);
		let newModifiedPayload = JSON.parse(JSON.stringify(modifiedFiles));
		newModifiedPayload[activePageIndex] = new Date().toISOString();
		setModifiedFiles(newModifiedPayload);
	
		setOperations([...operations, operation]);
		setRedoStack([]);
	}

	const mainHeight = () => {
		let myHeight;
		if (!showHeader() && !showSubheader()) {
			myHeight = heightOffset0;
		} else if (!showSubheader()) {
			myHeight = heightOffset1;
		} else if (!showHeader()) {
			myHeight = heightOffset3;
		} else {
			myHeight = heightOffset1 + heightOffset3;
		}
		myHeight += heightOffsetTabs;
		return `calc(100vh - ${myHeight}px)`;
	}

	const onDragEnd = async (start, end) => {
		if (!pdfProxyObj) {
			console.log('No PDF loaded to download');
			return;
		}
	
		if (start === end) {
			return;
		}
	
		const buffer = await pdfProxyObj.getData();
		const operation = { action: "drag", start, end };
	
		// Apply the drag and drop operation
		const newBuffer = await applyOperation(operation, buffer);
	
		// Save and update state
		await savePDF(newBuffer, pdfId);
		let newModifiedPayload = JSON.parse(JSON.stringify(modifiedFiles));
		newModifiedPayload[activePageIndex] = new Date().toISOString();
		setModifiedFiles(newModifiedPayload);
		
		// Update undo and redo stacks
		setOperations([...operations, operation]);
		setRedoStack([]);
	}

	const [showFullScreenThumbnails, setShowFullScreenThumbnails] = useState(false);

	const onExpand = () => {
		setShowFullScreenThumbnails(true);
	}

	const [defaultZoom, setDefaultZoom] = useState(null);

	const updateCurrentScale = (num) => {
		setDefaultZoom(num);
	}

	const isSmallScreen = useMediaQuery('(max-width: 550px)');

	const onChangeActivePageIndex = (idx) => {
		setActivePageIndex(idx);
	}

	const forceFullThumbnailsView = () => {
		return isSmallScreen && showPanel;
	}

	const onMinimize = () => {
		setShowFullScreenThumbnails(false);
		if (isSmallScreen) {
			setShowPanel(false);
		}
	}
	
	if (fileLoadFailError) {
		return (
			<div css={failWrap}>
				<h1>Failed to load the PDF.</h1>
				<p>{fileLoadFailError}</p>
			</div>
		);
	}

	if (!isOnline) {
		return (
			<div style={{fontFamily: "Lato", margin: 4}}>
				<h1>Connection Issue Detected</h1>
				<p>We couldn't find an active internet connection. Please ensure you're connected to the internet to continue.</p>
			</div>
		)
	}

	if (hasValidLicense === false) {
		return (
			<div style={{fontFamily: "Lato", margin: 4}}>
				<h1>License Key Invalid</h1>
				<p>Your provided license key appears to be invalid. To resolve this issue, please reach out to your account administrator.</p>
			</div>
		)
	}

	if (isInValidDomain === false) {
		return (
			<div style={{fontFamily: "Lato", margin: 4}}>
				<h1>Invalid domain</h1>
				<p>This domain ({window.origin}) is not permitted to render the PDF Web SDK. If this is a mistake, please update the Authorized Domains list in your Account portal.</p>
			</div>
		)
	}

	if (!inputtedLicenseKey) {
		return (
			<div></div>
		)
	}

	return (
		<I18nextProvider i18n={i18n}>
			{/*<button onClick={onClickTestHandler}>Crazy btn</button>*/}
			<div style={{height: mainHeight()}}>
				{
					showHeader() && (
						<Header
							showFullScreenThumbnails={showFullScreenThumbnails}
							defaultZoom={defaultZoom}
							tools={tools}
							onDownload={onDownload}
							pdfProxyObj={pdfProxyObj}
							onRotate={onRotate}
							viewerContainerRef={getTargetContainer()}
							pdfViewerObj={pdfViewerObj}
							onSearch={onSearchBtnClick}
							onPanel={onPanelBtnClick}
							leftPanelEnabled={showPanel}
						/>
					)
				}
				{
					showSubheader() && (
						<Subheader
							canExtract={canExtract()}
							onExtract={onExtract}
							tools={tools}
							canDelete={canDelete()}
							undoStackLength={operations[activePageIndex]?.length}
							redoStackLength={redoStack[activePageIndex]?.length}
							setExpandedViewThumbnailScale={setExpandedViewThumbnailScale}
							expandedViewThumbnailScale={expandedViewThumbnailScale}
							setMultiPageSelections={setMultiPageSelections}
							multiPageSelections={multiPageSelections}
						  showFullScreenThumbnails={showFullScreenThumbnails || forceFullThumbnailsView()}
						  onMinimize={onMinimize}
							undoLastAction={undoLastAction}
							redoLastAction={redoLastAction}
							onDownload={onDownload}
							onDelete={onDelete}
							onRotate={onRotateFullScreenThumbnails}
						/>
					)
				}
				<Tabs
					onClick={onChangeActivePageIndex}
					activePageIndex={activePageIndex}
					fileNames={files.map((e) => e.name)}
				/>
				<div css={Flex}>
					{
						tools?.general?.includes('thumbnails') && (
							<Panel
								thumbnailScale={thumbnailScale}
								setThumbnailScale={setThumbnailScale}
								expandedViewThumbnailScale={expandedViewThumbnailScale}
								onRotate={onRotateThumbnail}
								onDeleteThumbnail={onDeleteThumbnail}
								onExtractThumbnail={onExtractThumbnail}
								multiPageSelections={multiPageSelections}
								setMultiPageSelections={setMultiPageSelections}
								onExpand={onExpand}
								onDragEnd={onDragEnd}
								tools={tools}
								setActivePage={setActivePage}
								activePage={activePage}
								pdfProxyObj={pdfProxyObj}
								pdf={pdfViewerObj}
								showPanel={showPanel}
								showFullScreenThumbnails={showFullScreenThumbnails || forceFullThumbnailsView()}
							/>
						)
					}
					<div css={pdfViewerWrapper}>
						<PdfViewer
							setModifiedFiles={setModifiedFiles}
							modifiedFiles={modifiedFiles}
							activePageIndex={activePageIndex}
							isSandbox={inputtedLicenseKey?.toLowerCase() === "sandbox"}
							addWatermark={addWatermark}
							updateCurrentScale={updateCurrentScale}
							buffer={buffer}
							switchBuffer={switchBuffer}
							activePage={activePage}
							modifiedFile={modifiedFile}
							showHeader={showHeader()}
							showSubheader={showSubheader()}
							tools={tools}
							fileLoadFailError={fileLoadFailError}
							setFileLoadFailError={setFileLoadFailError}
							rightPanelEnabled={showSearch}
							leftPanelEnabled={showPanel}
							setActivePage={setActivePage}
							setPdfProxyObj={setPdfProxyObj}
							setMatchesCount={setMatchesCount}
							eventBusRef={eventBusRef}
							viewerContainerRef1={viewerContainerRef1}
							viewerContainerRef2={viewerContainerRef2}
							setPdfViewerObj={setPdfViewerObj}
							file={file}
						/>
					</div>
					<SearchBar
						onClear={onClearSearch}
						onToggleWholeWord={onToggleWholeWord}
						searchText={searchText}
						onNext={onNext}
						onPrev={onPrev}
						matchesCount={matchesCount}
						matchWholeWord={matchWholeWord}
						onChange={onSearchText}
						showSearch={showSearch}
						caseSensitive={caseSensitive}
						onToggleCaseSensitive={onToggleCaseSensitive}
					/>
				</div>
			</div>
		</I18nextProvider>
	);
};

export default App;