/** @jsxImportSource @emotion/react */
import { css } from '@emotion/react';
import './index.css';
import { useContext, useEffect, useRef, useState } from 'preact/hooks';
import 'pdfjs-dist/web/pdf_viewer.css';
import Header from './Header/Header';
import Subheader from './Subheader';
import Tabs from './components/Tabs';
import { useDebounce } from './utils/useDebounce';
import SearchBar from './components/Searchbar';
import { PdfViewer } from './PdfViewer';
import Panel from './components/Panel';
import { heightOffset0, heightOffset1, heightOffset3, heightOffsetTabs } from "./constants";
// import { remove_pages, move_page, move_pages, rotate_pages, merge_pdfs, PdfMergeData, start } from '../lib/pdf_wasm_project.js';
import { deletePDF, retrievePDF, savePDF } from './utils/indexDbUtils';
import { invokePlugin, pendingRequests } from './utils/pluginUtils';
import fetchBuffers from './utils/fetchBuffers';
import { I18nextProvider } from 'react-i18next';
import i18n from "./utils/i18n";
import useInitWasm from './hooks/useInitWasm';
import { useMediaQuery } from './hooks/useMediaQuery';
import useDeclareIframeLoaded from './hooks/useDeclareIframeLoaded';
import useDownload from './hooks/useDownload';
import useListenForDownloadRequest from './hooks/useListenForDownloadRequest';
import usePropageClickEvents from './hooks/usePropagateClickEvents';
import {supabase} from './utils/supabase';
import generateRandomKey from './utils/generateRandomKey';
import simpleHash from './utils/simpleHash';
import * as amplitude from '@amplitude/analytics-browser';
import useListenForThumbnailFullScreenRequest from './hooks/useListenForThumbnailFullScreenRequest';
import useListenForThumbnailZoomRequest from './hooks/useListenForThumbnailZoomRequest';
import useListenForExtractPagesRequest from './hooks/useListenForExtractPagesRequest';
import useListenForMergeFilesRequest from './hooks/useListenForMergeFilesRequest';
import useListenForCombineFilesRequest from './hooks/useListForCombineFilesRequest';
import useListenForSplitPagesRequest from './hooks/useListenForSplitPagesRequest';
import useListenForRemoveChatHistoryRequest from './hooks/useListenForRemoveChatHistoryRequest';
import { PDFDocument, degrees } from 'pdf-lib';
import { extractAllTextFromPDF } from './utils/extractAllTextFromPdf';
import { ModalProvider } from './Contexts/ModalProvider';
import { AnnotationsContext, AnnotationsProvider } from './Contexts/AnnotationsContext';
import useListenForSearchbarRequest from './hooks/useListenForSearchbarRequest';
import * as pdfjs from 'pdfjs-dist';
import { useAnnotations } from './hooks/useAnnotations';
import { AnnotationEditorParamsType } from 'pdfjs-dist/build/pdf';
import { FilesContext } from './Contexts/FilesContext';
import { UndoRedoContext } from './Contexts/UndoRedoContext';
import { ActivePageContext } from './Contexts/ActivePageContext';

async function splitPdfPages(pdfBytes, splitIndices) {
  const originalPdfDoc = await PDFDocument.load(pdfBytes);
  const numPages = originalPdfDoc.getPageCount();
  // Sort the split indices in ascending order
  const sortedIndices = [...splitIndices, numPages].sort((a, b) => a - b);
  const allPdfBuffers = [];
  let start = 0;

  for (const end of sortedIndices) {
    // Create a new PDF document for each split index
    const newPdfDoc = await PDFDocument.create();

    // Copy and add pages from the original PDF document
		const copiedPages = await newPdfDoc.copyPages(originalPdfDoc, Array.from({ length: end - start }, (_, i) => i + start));
    for (const page of copiedPages) {
      newPdfDoc.addPage(page);
    }

    // Save the new PDF document to a buffer
    const newPdfBuffer = await newPdfDoc.save();
    allPdfBuffers.push(newPdfBuffer);

    start = end;
  }

  return allPdfBuffers;
}

async function removePdfPages(pdfBuffer, pageIndices) {
  // Load the PDF document from the buffer
  const pdfDoc = await PDFDocument.load(pdfBuffer);

  // Sort indices in descending order so that removal doesn't affect subsequent indices
  const sortedIndices = pageIndices.sort((a, b) => b - a);

  // Loop through the sorted indices array to remove specified pages
  sortedIndices.forEach((pageIndex) => {
    pdfDoc.removePage(pageIndex);
  });

  // Serialize the PDF back to a buffer
  const modifiedPdfBuffer = await pdfDoc.save();
  
  return modifiedPdfBuffer;
}

async function rotatePdfPages(pdfBuffer, pageIndices, angle) {
  // Load the PDF document from the buffer
  const pdfDoc = await PDFDocument.load(pdfBuffer);

  // Loop through the indices array to rotate specified pages
  pageIndices.forEach((pageIndex) => {
    const page = pdfDoc.getPages()[pageIndex];
    if (page) {
      // Get current rotation angle
      const currentRotation = page.getRotation().angle;

      // Calculate the new rotation angle
      const newRotation = (currentRotation + angle) % 360;

      // Use the 'degrees' function to set the new rotation
      page.setRotation(degrees(newRotation));
    }
  });

  // Serialize the PDF back to a buffer
  const rotatedPdfBuffer = await pdfDoc.save();
  
  return rotatedPdfBuffer;
}

function markIndexes(numPages, startIndexes) {
	const initialOrder = Array.from({ length: numPages }, (_, i) => i);
	return initialOrder.map((item, index) => 
		startIndexes.includes(index) ? `m${item}` : item
	);
}

function placeIndexesInPlace(array, startIndexes, end) {
  if (end === 0) {
    array.splice(0, 0, ...startIndexes);  // Insert at the beginning
  } else {
    array.splice(end + 1, 0, ...startIndexes);  // Insert after the "end" element
  }
  return array;
}

function removeIndexPlaceholders(array) {
	return array.filter((e) => typeof e !== "string")
}

function getArrayOrder(numPages, startIndexes, end) {
	const marked = markIndexes(numPages, startIndexes);
	const update = placeIndexesInPlace(marked, startIndexes, end);
	return removeIndexPlaceholders(update);
}

async function reorderPages(pdfBytes, newOrder) {
  const originalPdfDoc = await PDFDocument.load(pdfBytes);
  const newPdfDoc = await PDFDocument.create();

  const numPages = originalPdfDoc.getPageCount();
  const pages = Array.from({ length: numPages }, (_, i) => originalPdfDoc.getPage(i));

  // Reorder pages based on newOrder
  for (const oldIndex of newOrder) {
    if (oldIndex < numPages) {
      const [copiedPage] = await newPdfDoc.copyPages(originalPdfDoc, [oldIndex]);
      newPdfDoc.addPage(copiedPage);
    }
  }

  // Fill in the gaps with pages that were not reordered
  for (let i = 0; i < numPages; i++) {
    if (!newOrder.includes(i)) {
      const [copiedPage] = await newPdfDoc.copyPages(originalPdfDoc, [i]);
      newPdfDoc.addPage(copiedPage);
    }
  }

  const newPdfBytes = await newPdfDoc.save();
  return newPdfBytes;
}


export async function movePages(pdfBytes, fromIndexes, toIndex) {
  const pdfDoc = await PDFDocument.load(pdfBytes);
  const originalPages = pdfDoc.getPages();

  if (originalPages.length === 0) {
    throw new Error('The PDF document has no pages.');
  }

  // Sort fromIndexes for easier manipulation
  fromIndexes.sort((a, b) => a - b);

  // Adjust toIndex based on the direction of the move
  let adjustedToIndex = toIndex;
  for (const index of fromIndexes) {
    if (index < adjustedToIndex) adjustedToIndex--;
  }

  const newPdfDoc = await PDFDocument.create();
  
  // Copy over the rearranged pages to the new document
  const indicesToCopy = [];
  for (let i = 0; i < originalPages.length; i++) {
    if (!fromIndexes.includes(i)) {
      indicesToCopy.push(i);
    }
  }

  // Insert the pages to be moved at the new index
  for (const index of fromIndexes) {
    indicesToCopy.splice(adjustedToIndex++, 0, index);
  }

  const copiedPages = await newPdfDoc.copyPages(pdfDoc, indicesToCopy);
  for (const page of copiedPages) {
    newPdfDoc.addPage(page);
  }

  // Serialize the new PDF to bytes and return
  const newPdfBytes = await newPdfDoc.save();
  return newPdfBytes;
}

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
	margin: 0 8px;
	text-align: center;
`;

const App = () => {

	const {activePageIndex, setActivePageIndex} = useContext(ActivePageContext)
	const [matchesCount, setMatchesCount] = useState(0);

	const pdfId = `pdfId${activePageIndex}`;
	const originalPdfId = `original${activePageIndex}`;

	const [fileLoadFailError, setFileLoadFailError] = useState('');

	const [searchText, setSearchText] = useState('');
	const [isSplitting, setIsSplitting] = useState(false);
	const eventBusRef = useRef(null);
	const pdfLinkServiceRef = useRef(null);
	const pdfFindControllerRef = useRef(null);
	const pdfScriptingManagerRef = useRef(null);
	const pdfViewerRef = useRef(null);

	const [pdfProxyObj, setPdfProxyObj] = useState(null);
	const [pdfViewerObj, setPdfViewerObj] = useState(null);

	const [buffer, setBuffer] = useState(1); // 1 for primary, 2 for secondary
	const viewerContainerRef1 = useRef(null);
	const viewerContainerRef2 = useRef(null);
	const [searchBarView, setSearchBarView] = useState("chat");

	const [pdfText, setPdfText] = useState("");

	const [expandedViewThumbnailScale, setExpandedViewThumbnailScale] = useState(2);
	const [thumbnailScale, setThumbnailScale] = useState(2);

	const [conversation, setConversation] = useState(JSON.parse(localStorage.getItem('conversation')) || []);

	const [aiLimitReached, setAiLimitReached] = useState(false);
	const activeAnnotationRef = useRef(null);
	const [editableAnnotationId, setEditableAnnotationId] = useState(null);
	const [fontSizeValue, setFontSizeValue] = useState(12);
	const [fontFamilyValue, setFontFamilyValue] = useState({
    value: "helvetica",
    label: "Helvetica"
  });
	const [annotationColor, setAnnotationColor] = useState('#fff');


	const hasConsumerSubscription = async () => {
		if (!inputtedUuid) {
			return true; // weird state. will allow it.
		}
		const { data, error } = await supabase.functions.invoke('verify-consumer-subscription', {
      body: { user_id: inputtedUuid },
    });
		if (error) {
			return true; // we'll take the heat
		}
		return data.message === "Active subscription found";
	}

	const isThrottled = useRef(false);

	const checkConsumerSubscription = async () => {
		if (isThrottled.current) {
			return;
		}
		isThrottled.current = true;
	
		const result = await hasConsumerSubscription();
		setAiLimitReached(!result);
		if (result) {
			window.localStorage.setItem("timestamps", "[]");
		}
		setTimeout(() => {
			isThrottled.current = false;
		}, 1000);
	};
	
	useEffect(() => {
		const currentTime = new Date().getTime();
		let timestamps = JSON.parse(window.localStorage.getItem("timestamps") || "[]");
	
		// Filter out timestamps older than 24 hours
		timestamps = timestamps.filter(ts => currentTime - ts < 24 * 60 * 60 * 1000);
	
		// Save the filtered timestamps back to localStorage
		window.localStorage.setItem("timestamps", JSON.stringify(timestamps));
	
		// Check if more than 10 questions have been asked in the past 24 hours
		if (timestamps.length > 10) {
			checkConsumerSubscription();
		}
	
		// Add a new timestamp for the current question
		timestamps.push(currentTime);
		window.localStorage.setItem("timestamps", JSON.stringify(timestamps));
		
	}, [conversation]);
	
	const switchBuffer = () => setBuffer(buffer === 1 ? 2 : 1);

	const getTargetContainer = () => {
		return buffer === 1 ? viewerContainerRef2 : viewerContainerRef1;
	};
	const [isSandbox, setIsSandbox] = useState(false);

	const [showSearch, setShowSearch] = useState(false);
	const [showPanel, setShowPanel] = useState(true);

	const isSmallScreen = useMediaQuery('(max-width: 550px)');

	const showFullScreenSearch = () => {
		return isSmallScreen && showSearch;
	}
	
	const shouldShowPanel = () => {
		return showPanel && !showFullScreenSearch();
	}

	const [multiPageSelections, setMultiPageSelections] = useState([]);

	useEffect(() => {
		window.parent.postMessage({ type: 'multi-page-selection-change', message: multiPageSelections }, window.parent.origin);
	}, [multiPageSelections]);

	const [activePage, setActivePage] = useState(1);

	const [tools, setTools] = useState([]);


	useEffect(() => {
		if (!tools) {
			return;
		}
		console.log(tools?.general?.includes("chat"), 'inclee', tools)
		setSearchBarView(tools?.general?.includes("chat") ? "chat" : "search");
	}, [tools]);

	const onSearchBtnClick = () => {
		setShowSearch((prev) => !prev);
	};

	const onPanelBtnClick = () => {
		setShowPanel(() => !shouldShowPanel());
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

	const [inputtedLicenseKey, setInputtedLicenseKey] = useState(null);
	const {files, setFiles} = useContext(FilesContext)

	const [fileNames, setFileNames] = useState([]);
	const { triggerDownload: onDownload } = useDownload(files, isSandbox, fileNames);


	const initialRedoUndoObject = () => {
		const result = {};
		for (let i = 0; i < files.length; i ++) {
			result[i] = [];
		}
		return result;
	};
	
	const [documentLoading, setDocumentLoading] = useState(true);

	const {operations, setOperations, redoStack, setRedoStack, addOperation} = useContext(UndoRedoContext)
	// console.log(redoStack, 'redoStack', operations)
	const [activeToolbarItem, setActiveToolbarItem] = useState("");
	const activeToolbarItemRef = useRef(null);

	useEffect(() => {
		activeToolbarItemRef.current = activeToolbarItem;
	}, [activeToolbarItem]);

	useEffect(() => {
		try {
			setOperations(initialRedoUndoObject());
			setRedoStack(initialRedoUndoObject());
		} catch (err) {}
	}, [files]);

	const addInitialFiles = async (event) => {
		event.source.postMessage({ type: 'file-received', success: true }, event.origin);
		const doRemove = async () => {
			try {
				const arr = Array.from({ length: event.data.files.length }).fill(null);
				const tasks = arr.map((_, idx) => deletePDF(`original${idx}`) && deletePDF(`pdfId${idx}`));
	
				const results = await Promise.allSettled(tasks);
	
				results.forEach((result, idx) => {
					if (result.status === "fulfilled") {
						console.log(`Successfully deleted pdfId${idx}`);
					} else {
						console.warn(`Failed to delete pdfId${idx}: ${result.reason}`);
					}
				});
	
			} catch (err) {
				console.error("An error occurred while deleting PDFs:", err);
			}
		};
	
		await doRemove();
		setFiles(event.data.files);
		setFileNames(event.data.files.map((each) => each.name))
	}

	const [inputtedUuid, setInputtedUuid] = useState("");

	useEffect(() => {
		window.addEventListener('message', (event) => {
			if (typeof event.data === 'object' && event.data.files?.length) {
				addInitialFiles(event);
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
			if (typeof event.data === 'object' && !!event.data.mode) {
				setIsSplitting(event.data.mode === "split");
			}
			if (typeof event.data === 'object' && !!event.data.uuid) {
				setInputtedUuid(event.data.uuid);
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

	async function doSplit(buffer, splits) {
		try {
			const modifiedPdfArrays = await splitPdfPages(new Uint8Array(buffer), splits);
			const result = modifiedPdfArrays.map((each, idx) => {
				return {
					name: `document-${idx + 1}.pdf`,
					url: each.slice(0)
				}
			})
			setFiles(result);
			setFileNames(result.map((each) => each.name));
			return result;
		} catch (error) {
			console.error('Error modifying PDF:', error);
		}
		return;
	}

	const onSplitPages = async () => {
		const buffer = await pdfProxyObj.getData();
		
		const results = await doSplit(buffer, splitMarkers);
		const tasks = results.map((each, idx) => savePDF(each.url.buffer, `original${idx}`));
		await Promise.all(tasks);

		let newModifiedPayload = {};
		for (let i = 0; i < results.length; i ++) {
			newModifiedPayload[i] = new Date().toISOString();
		}
		// setModifiedFiles(newModifiedPayload);
		// setFileNames([fileNames[0].replace('.pdf', '-split.pdf')]);
		setSplitMarkers([]);
		window.parent.postMessage({ type: "split-pages-completed"});

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

	useEffect(() => {
		if (!files?.length) {
			return;
		}
	
		const doRemove = async () => {
			try {
				const arr = Array.from({ length: files.length }).fill(null);
				const tasks = arr.map((_, idx) => deletePDF(`pdfId${idx}`));
	
				const results = await Promise.allSettled(tasks);
	
				results.forEach((result, idx) => {
					if (result.status === "fulfilled") {
						console.log(`Successfully deleted pdfId${idx}`);
					} else {
						console.warn(`Failed to delete pdfId${idx}: ${result.reason}`);
					}
				});
	
			} catch (err) {
				console.error("An error occurred while deleting PDFs:", err);
			}
		};
	
		doRemove();

		return () => {
			doRemove();
		}
	}, [files]);

	const onCombinePdfs = async () => {

		const errors = [];
	
		const successfulBuffers = await fetchBuffers(files);
		if (successfulBuffers.length > 0) {
			const modifiedPdfArray = await combinePDFs(successfulBuffers);
			await savePDF(modifiedPdfArray.buffer, pdfId);
			let newModifiedPayload = JSON.parse(JSON.stringify(modifiedFiles));
			newModifiedPayload[activePageIndex] = new Date().toISOString();
			setModifiedFiles(newModifiedPayload);
			setFileNames([fileNames[0].replace('.pdf', '-merged.pdf')]);

			window.parent.postMessage({ type: "combine-files-completed", message: modifiedPdfArray });
		} else {
			// Handle case where no PDFs were successfully retrieved
		}
	
		if (errors.length > 0) {
			// Handle errors differently here
		}
	};

	usePropageClickEvents();
	useDeclareIframeLoaded();
	useListenForDownloadRequest(onDownload);
	useListenForMergeFilesRequest(onMergeFiles);
	useListenForSplitPagesRequest(onSplitPages);
	useListenForCombineFilesRequest(onCombinePdfs);
	
	useListenForThumbnailFullScreenRequest((enable) => {
		if (enable === true) {
			onExpand();
		} else if (enable === false) {
			onMinimize();
		} else if (shouldShowFullScreenThumbnails()) {
			onMinimize();
		} else {
			onExpand();
		}
	});
	useListenForSearchbarRequest((enable) => {
		if (enable === true) {
			setShowSearch(true);
		} else if (enable === false) {
			setShowSearch(false);
		} else {
			setShowSearch((prev) => !prev);
		}
	})
	useListenForThumbnailZoomRequest((v) => {
		setExpandedViewThumbnailScale(v);
		setThumbnailScale(v);
	})

	const [matchWholeWord, setMatchWholeWord] = useState(false);

	const [caseSensitive, setCaseSensitive] = useState(false);

	const isFindingCitationRef = useRef(false);

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

	const annotationEditorUIManagerRef = useRef(null);

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
		return (!!tools?.editing?.length || tools?.general?.includes("thumbnails")) && !showFullScreenSearch()
	}


	const undoLastAction = async () => {
		if (operations[activePageIndex]?.length === 0) return;
		const lastOperation = operations[activePageIndex]?.[operations[activePageIndex].length - 1];
		// Start with the original PDF
		let buffer = await retrievePDF(originalPdfId);
		setAnnotations([]);
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

	const doDrag = async (_start, end, buffer) => {
		const start = _start?.length ? _start : [_start];
		const order = getArrayOrder(pdfProxyObj.numPages, start, end);
		const modifiedPdfArray = await reorderPages(new Uint8Array(buffer), order);
		return modifiedPdfArray;
	}

	useEffect(() => {
		setDocumentLoading(true);
	}, [activePageIndex]);

	const [aiDocHash, setAiDocHash] = useState(localStorage.getItem("aiDocHash") || "");
	const [currentAiDocHash, setCurrentAiDocHash] = useState("");
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
			const modifiedPdfArray = await removePdfPages(new Uint8Array(buffer), pages.map((each) => each - 1));
			return modifiedPdfArray.buffer;
		} catch (error) {
			console.error('Error modifying PDF:', error);
		}
		return;
	}

	const doRotate = async (pages, buffer, clockwise = true) => {
		try {
			const modifiedPdfArray = await rotatePdfPages(new Uint8Array(buffer), pages.map((each) => each - 1), clockwise ? 90 : -90);
			return modifiedPdfArray.buffer;
		} catch (error) {
			console.error('Error modifying PDF:', error);
		}
		return;
	}

	const doUpdateAnnotations = async (data) => {
		updateAnnotation(data);
		return await pdfProxyObj.getData();
	}

	const doMoveAnnotations = async (data) => {
		moveAnnotation(data, () => {});
		return await pdfProxyObj.getData();
	}

	const doRemoveAnnotations = async (data) => {
		removeAnnotation(data);
		return await pdfProxyObj.getData();
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
			case "update-annotation": {
				return await doUpdateAnnotations(operation.data);
			}
			case "move-annotation": {
				return await doMoveAnnotations(operation.data);
			}
			case "remove-annotation": {
				return await doRemoveAnnotations(operation.data);
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
		// setMultiPageSelections([]);
		const bufferResult = await applyOperation(operation, buffer);
		await savePDF(bufferResult, pdfId);
		let newModifiedPayload = JSON.parse(JSON.stringify(modifiedFiles));
		newModifiedPayload[activePageIndex] = new Date().toISOString();
		setModifiedFiles(newModifiedPayload);
	
		addOperation(operation);
	}

	const {updateAnnotation, moveAnnotation, updateAnnotationParam, resizeAnnotation, removeAnnotation} = useAnnotations(activeAnnotationRef);
	const { annotations, setAnnotations } = useContext(AnnotationsContext);
	useEffect(() => {
    let allAnnotations = [{
      id: "abc",
      pageNumber: 1,
      content: "dFruityy5",
      x: 0.1,
      y: 0.1,
      color: "#008000",
      fontSize: 28,
			fontFamily: "courier",
			name: "freeTextEditor"
    }];
    // allAnnotations = [];
    // setAnnotations(allAnnotations);
  }, []);

	const onRotate = async (clockwise) => {
		if (!pdfProxyObj) {
			console.log('No PDF loaded to download');
			return;
		}

		const buffer = await pdfProxyObj.getData();
		const numPages = pdfProxyObj?.numPages;
		const pagesToRotate = Array.from({length: numPages}).map((_, i) => i + 1);
		const operation = { action: "rotate", pages: pagesToRotate, clockwise};
		// setMultiPageSelections([]);
		const bufferResult = await applyOperation(operation, buffer);
		await savePDF(bufferResult, pdfId);
		let newModifiedPayload = JSON.parse(JSON.stringify(modifiedFiles));
		newModifiedPayload[activePageIndex] = new Date().toISOString();
		setModifiedFiles(newModifiedPayload);
	
		addOperation(operation);
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
	
		addOperation(operation);
	}

	const canDelete = () => {
		if (shouldShowFullScreenThumbnails()) {
			return !!multiPageSelections?.length
		}
		return !!multiPageSelections?.length || !!activePage
	}
	
	const canExtract = (override) => {
		if (Array.isArray(override)) {
			return !!override?.length;
		}
		if (shouldShowFullScreenThumbnails()) {
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

		addOperation(operation);
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
	
		addOperation(operation);
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

		addOperation(operation);
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
	
		addOperation(operation);
	}

	const handleChooseColor = (color) => {
		pdfViewerRef.current.annotationEditorParams = {
			type: AnnotationEditorParamsType.FREETEXT_COLOR,
			value: color
		}
		updateAnnotationParam(activeAnnotationRef.current, {
			color
		})
	}

	const [annotationMode, setAnnotationMode] = useState("none");

	const onEnableFreeTextMode = async () => {
		pdfViewerRef.current.annotationEditorMode = {
			isFromKeyboard: false,
			mode: pdfjs.AnnotationEditorType.FREETEXT,
			source: null
		};
		setAnnotationMode("freetext");
	}

	const onDisableEditorMode = async () => {
		pdfViewerRef.current.annotationEditorMode = {
			isFromKeyboard: false,
			mode: pdfjs.AnnotationEditorType.NONE,
			source: null
		};
		setAnnotationMode("none");
		// const bufferResult = await pdfProxyObj.getData();
		// await savePDF(bufferResult, pdfId);
		// setModifiedFiles(new Date().toISOString());
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
		let startToUse = start;
		if (multiPageSelections?.length) {
			startToUse = Array.from(new Set([...multiPageSelections.map((e) => e - 1), startToUse])).sort();
		} else if (start === end) {
			return;
		}
		const buffer = await pdfProxyObj.getData();
		const operation = { action: "drag", start: startToUse, end };
	
		// Apply the drag and drop operation
		const newBuffer = await applyOperation(operation, buffer);
	
		// Save and update state
		await savePDF(newBuffer, pdfId);
		let newModifiedPayload = JSON.parse(JSON.stringify(modifiedFiles));
		newModifiedPayload[activePageIndex] = new Date().toISOString();
		/*
		if (Array.isArray(startToUse)) {
			const order = getArrayOrder(pdfProxyObj.numPages, startToUse, end);
			console.log(order, 'order225', startToUse)
			const newOrderSet = new Set(order);
			const startToUseSet = new Set(startToUse);
			const newIndexes = [];
			for (let i = 0; i < order.length; i ++) {
				if (startToUseSet.has(order[i])) {
					newIndexes.push(i);
				}
			}
			console.log(newIndexes, 'newIndexes')
			// TODO: continue to consider benefit. especially when doing undo. setMultiPageSelections(newIndexes.map((e) => e + 1));
		}
		*/
		setMultiPageSelections([]);
		setModifiedFiles(newModifiedPayload);
		
		// Update undo and redo stacks
		addOperation(operation);
	}

	const [splitMarkers, setSplitMarkers] = useState([]);

	const onClickSplit = (idx) => {
		if (splitMarkers.includes(idx)) {
			setSplitMarkers(splitMarkers.filter((each) => each !== idx));
		} else {
			setSplitMarkers(Array.from(new Set([...splitMarkers, idx])));
		}
	}

	const [showFullScreenThumbnails, setShowFullScreenThumbnails] = useState(false);

	const shouldShowFullScreenThumbnails = () => {
		return showFullScreenThumbnails && !showFullScreenSearch();
	}

	const onExpand = () => {
		setShowFullScreenThumbnails(true);
	}

	const [defaultZoom, setDefaultZoom] = useState(null);

	const updateCurrentScale = (num) => {
		setDefaultZoom(num);
	}

	const onChangeActivePageIndex = (idx) => {
		setActivePageIndex(idx);
	}

	const forceFullThumbnailsView = () => {
		return isSmallScreen && shouldShowPanel() && !showSearch && !showFullScreenSearch();
	}
	// console.log(pdfText, 'pdfText', inputtedUuid)
	const [aiDocId, setAiDocId] = useState(localStorage.getItem("aiDocId") || "");

	const [embeddingKey, setEmbeddingKey] = useState(localStorage.getItem("embeddingKey") || "");
	const onEmbed = async () => {
		const { data, error } = await supabase.functions.invoke('embed', {
      body: { user_id: inputtedUuid, paragraphs: pdfText },
    });
		if (error) {
			alert("Something went wrong. Please try again later.");
			console.error(`Error embedding: ${error}`);
			return;
		}
		const newEmbeddingKey = data?.embeddingKey || "";
		setEmbeddingKey(newEmbeddingKey);
		localStorage.setItem("embeddingKey", newEmbeddingKey);
		const docId = data?.docId || "";
		setAiDocId(docId);
		localStorage.setItem("aiDocId", docId);
		const hash = simpleHash(JSON.stringify(pdfText));
		setAiDocHash(hash);
		localStorage.setItem("aiDocHash", hash);
		return;
	}

	const onNoToAiWarning = () => {
		const hash = simpleHash(JSON.stringify(pdfText));
		setAiDocHash(hash);
		setCurrentAiDocHash(hash);
		window.localStorage.setItem("aiDocHash", hash);
	}

	const onFreeTextAnnotationFocus = (id, data) => {
		activeAnnotationRef.current = id;
		setEditableAnnotationId(id);
		setFontSizeValue(data.fontSize)
		const map = {
			courier: {
				value: "courier",
				label: "Courier"
			},
			helvetica: {
				value: "helvetica",
				label: "Helvetica"
			},
		}
		setAnnotationColor(data.color)
		if (!map[data.fontFamily]) {
			return;
		}
		setFontFamilyValue(map[data.fontFamily])
	}

	const onSignatureAnnotationFocus = (id, data) => {
		// console.log(id, data, 'id, data', isManuallyAddingImageRef)
		activeAnnotationRef.current = id;
		setEditableAnnotationId(id);
		updateAnnotation(data);
		const payload = {
			height: data.height,
			width: data.width,
			id: data.id,
			pageIndex: data.pageIndex,
			pageNumber: data.pageIndex + 1,
			x: data.x,
			y: data.y,
			urlPath: data.urlPath,
			name: data.name,
			content: data.content,
			color: data.color,
			fontSize: data.fontSize
		}
		const operation = { action: "update-annotation", data: payload };
		// we are adding an excessive operation here when it's due to a redo
		
		if (isManuallyAddingImageRef.current) {
			addOperation(operation);
			isManuallyAddingImageRef.current = false;
		}
		// addOperation(operation);
	}

	const onAnnotationFocus = (id, data) => {
		switch (data.name) {
			case "freeTextEditor": {
				onFreeTextAnnotationFocus(id, data);
				break;
			}
			case "stampEditor": {
				onSignatureAnnotationFocus(id, data);
				break;
			}
		}
		
	}

	const onRemoveChatHistory = async () => {
		setConversation([]);
		localStorage.setItem('conversation', '[]');
		if (!aiDocId) {
			return;
		}
		const { data, error } = await supabase.functions.invoke('remove_ai_from_doc', {
      body: { docId: aiDocId },
    });
		if (error) {
			alert("Something went wrong. Please try again later.");
			console.error(`Error embedding: ${error}`);
			return;
		}
		setAiDocId("");
		localStorage.setItem("aiDocId", "");
	}

	const handleChangeActiveToolbarItem = (v) => {
		setActiveToolbarItem(v);
	}

	useListenForRemoveChatHistoryRequest(onRemoveChatHistory)

	const onAskQuestion = async (question, prevQuestions) => {
		const { data, error } = await supabase.functions.invoke('ask_ai', {
      body: { doc_id: aiDocId, question_text: question, last_questions: prevQuestions, embedding_key: embeddingKey},
    });
		if (error) {
			alert("Something went wrong. Please try again later.");
			console.error(`Error embedding: ${error}`);
			return;
		}
		return data;
	}

	const onMinimize = () => {
		setShowFullScreenThumbnails(false);
		if (isSmallScreen) {
			setShowPanel(false);
		}
	}

	const onUpdateFontSize = (v) => {
		updateAnnotationParam(activeAnnotationRef.current, {
			fontSize: v
		})
	}

	const onUpdateFontFamily = (v) => {
		updateAnnotationParam(activeAnnotationRef.current, {
			fontFamily: v
		})
	}

	const isManuallyAddingImageRef = useRef(false);

	const onAddImage = (localStorageName) => {
		isManuallyAddingImageRef.current = true;
		pdfViewerRef.current.annotationEditorMode = {
			isFromKeyboard: false,
			mode: pdfjs.AnnotationEditorType.STAMP,
			source: null
		};
		pdfViewerRef.current.annotationEditorParams = {
			type: AnnotationEditorParamsType.CREATE,
			value: {
				bitmapUrl: localStorage.getItem(localStorageName),
				// initialWidth: 0.1,
				initialHeight: 0.08
			}
		}
		setAnnotationMode("signature");
	}

	const onMoveAnnotation = (data) => {
		moveAnnotation(data, () => {
			const payload = {
				// ...data.source,
				height: data.source.height,
				width: data.source.width,
				id: data.source.id,
				pageIndex: data.source.pageIndex,
				pageNumber: data.source.pageIndex + 1,
				x: data.source.x,
				y: data.source.y,
				urlPath: data.source.urlPath,
				name: data.source.name,
				content: data.source.content,
				color: data.source.color,
				fontSize: data.source.fontSize,
				source: {
					pageIndex: data.source.pageIndex
					// TODO Uncaught (in promise) TypeError: Cannot read properties of undefined (reading 'pageIndex')
//      pageNumber: data.source.pageIndex + 1,

				}
			}
			const operation = { action: "move-annotation", data: payload };
			addOperation(operation);
		});
	}

	const onRemoveAnnotation = (data) => {
		// console.log(data, 'data here3')
		removeAnnotation(data);
		const operation = { action: "remove-annotation", data };
		addOperation(operation);

	}

	const onUpdateAnnotation = (data, text) => {
		// console.log(data, 'data643')
		updateAnnotation(data, text);

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
			<div style={{margin: 4}}>
				<h1>Connection Issue Detected</h1>
				<p>We couldn't find an active internet connection. Please ensure you're connected to the internet to continue.</p>
			</div>
		)
	}

	if (hasValidLicense === false) {
		return (
			<div style={{margin: 4}}>
				<h1>License Key Invalid</h1>
				<p>Your provided license key appears to be invalid. To resolve this issue, please reach out to your account administrator.</p>
			</div>
		)
	}

	if (isInValidDomain === false) {
		return (
			<div style={{margin: 4}}>
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
		<>
			{/*<button onClick={onClickTestHandler}>Crazy btn</button>*/}
			<div style={{height: mainHeight()}}>
				{
					showHeader() && (
						<Header
							showFullScreenSearch={showFullScreenSearch()}
							showSearch={showSearch}
							showFullScreenThumbnails={shouldShowFullScreenThumbnails() || forceFullThumbnailsView()}
							defaultZoom={defaultZoom}
							tools={tools}
							onDownload={onDownload}
							pdfProxyObj={pdfProxyObj}
							onRotate={onRotate}
							viewerContainerRef={getTargetContainer()}
							pdfViewerObj={pdfViewerObj}
							onSearch={onSearchBtnClick}
							onPanel={onPanelBtnClick}
							leftPanelEnabled={shouldShowPanel()}
						/>
					)
				}
				{
					showSubheader() && (
						<Subheader
							annotationMode={annotationMode}
							onAddImage={onAddImage}
							annotationColor={annotationColor}
							fontSizeValue={fontSizeValue}
							setFontSizeValue={setFontSizeValue}
							fontFamilyValue={fontFamilyValue}
							setFontFamilyValue={setFontFamilyValue}
							activeToolbarItem={activeToolbarItem}
							handleChangeActiveToolbarItem={handleChangeActiveToolbarItem}
							editableAnnotationId={editableAnnotationId}
							activeAnnotationRef={activeAnnotationRef}
							onUpdateFontSize={onUpdateFontSize}
							onUpdateFontFamily={onUpdateFontFamily}
							pdfViewerRef={pdfViewerRef}
							handleChooseColor={handleChooseColor}
							setAnnotationColor={setAnnotationColor}
							onDisableEditorMode={onDisableEditorMode}
							onEnableFreeTextMode={onEnableFreeTextMode}
							pdfProxyObj={pdfProxyObj}
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
							showFullScreenThumbnails={shouldShowFullScreenThumbnails() || forceFullThumbnailsView()}
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
					fileNames={fileNames}
				/>
				<div css={Flex}>
					{
						tools?.general?.includes('thumbnails') && (
							<Panel
								showSearch={showSearch}
								splitMarkers={splitMarkers}
								onClickSplit={onClickSplit}
								isSplitting={isSplitting}
								documentLoading={documentLoading}
								fileName={fileNames[activePageIndex]}
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
								showPanel={shouldShowPanel()}
								showFullScreenThumbnails={shouldShowFullScreenThumbnails() || forceFullThumbnailsView()}
							/>
						)
					}
					<div css={pdfViewerWrapper}>
						<PdfViewer
							activeToolbarItemRef={activeToolbarItemRef}
							onAnnotationFocus={onAnnotationFocus}
							annotationColor={annotationColor}
							moveAnnotation={onMoveAnnotation}
							removeAnnotation={onRemoveAnnotation}
							updateAnnotation={onUpdateAnnotation}
							resizeAnnotation={resizeAnnotation}
							annotations={annotations}
							pdfViewerRef={pdfViewerRef}
							pdfScriptingManagerRef={pdfScriptingManagerRef}
							pdfFindControllerRef={pdfFindControllerRef}
							pdfLinkServiceRef={pdfLinkServiceRef}
							annotationEditorUIManagerRef={annotationEditorUIManagerRef}
							setCurrentAiDocHash={setCurrentAiDocHash}
							setPdfText={setPdfText}
							onPagesLoaded={() => {}}
							setDocumentLoading={setDocumentLoading}
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
							leftPanelEnabled={shouldShowPanel()}
							setActivePage={setActivePage}
							setPdfProxyObj={setPdfProxyObj}
							pdfProxyObj={pdfProxyObj}
							setMatchesCount={setMatchesCount}
							eventBusRef={eventBusRef}
							viewerContainerRef1={viewerContainerRef1}
							viewerContainerRef2={viewerContainerRef2}
							setPdfViewerObj={setPdfViewerObj}
							files={files}
						/>
					</div>
					<SearchBar
						showFullScreenSearch={showFullScreenSearch()}
						tools={tools}
						aiLimitReached={aiLimitReached}
						onNoToAiWarning={onNoToAiWarning}
						aiDocHash={aiDocHash}
						currentAiDocHash={currentAiDocHash}
						conversation={conversation}
						setConversation={setConversation}
						aiDocId={aiDocId}
						onRemoveChatHistory={onRemoveChatHistory}
						onAskQuestion={onAskQuestion}
						onEmbed={onEmbed}
						searchBarView={searchBarView}
						setSearchBarView={setSearchBarView}
						onClear={onClearSearch}
						onToggleWholeWord={onToggleWholeWord}
						searchText={searchText}
						onNext={onNext}
						onPrev={onPrev}
						matchesCount={matchesCount}
						matchWholeWord={matchWholeWord}
						onChange={onSearchText}
						onFindCitation={onSearchText}
						showSearch={showSearch}
						caseSensitive={caseSensitive}
						onToggleCaseSensitive={onToggleCaseSensitive}
					/>
				</div>
			</div>
		</>
	);
};

export default App;