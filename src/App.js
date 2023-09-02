/** @jsxImportSource @emotion/react */
import { css } from '@emotion/react';
import { useEffect, useRef, useState } from 'preact/hooks';
import 'pdfjs-dist/web/pdf_viewer.css';
import Header from './Header/Header';
import Subheader from './Subheader/Subheader';
import { useDebounce } from './utils/useDebounce';
import SearchBar from './SearchBar';
import { PdfViewer } from './PdfViewer';
import Panel from './Panel/Panel';
import { heightOffset0, heightOffset1, heightOffset2 } from "./constants";
import __wbg_init, { greet, remove_pages, move_page } from '../lib/pdf_wasm_project.js';
import { retrievePDF, savePDF } from './utils/indexDbUtils';

const Flex = css`
display: flex;
width: 100%;
height: 100%;
`;

const pdfViewerWrapper = css`
  height: 100%;
  width: 100%;
`;

// relative

const WrapperStyle = css`
  width: 100vw;
`;

const failWrap = css`
	font-family: Lato;
	margin: 0 8px;
	text-align: center;
`;

const MAX_STACK_SIZE = 50;

const App = () => {

	const [matchesCount, setMatchesCount] = useState(0);

	const [fileLoadFailError, setFileLoadFailError] = useState('');

	const [searchText, setSearchText] = useState('');

	const eventBusRef = useRef(null);

	const [pdfProxyObj, setPdfProxyObj] = useState(null);
	const [pdfViewerObj, setPdfViewerObj] = useState(null);
	const viewerContainerRef = useRef(null);

	const [file, setFile] = useState(null);
	const [fileName, setFileName] = useState('');

	const [showSearch, setShowSearch] = useState(false);
	const [showPanel, setShowPanel] = useState(true);

	const [activePage, setActivePage] = useState(1);

	const [tools, setTools] = useState([]);

	const [hiddenPages, setHiddenPages] = useState([]);

	const onSearchBtnClick = () => {
		setShowSearch(() => !showSearch);
	};

	const onPanelBtnClick = () => {
		setShowPanel(() => !showPanel);
	};

	/*
	const onDownload = (name) => {
		console.log(pdfProxyObj, 'pdfProxyObj');
		if (!pdfProxyObj) {
			console.log('No PDF loaded to download');
			return;
		}
	
		pdfProxyObj.getData().then(buffer => {
			const blob = new Blob([new Uint8Array(buffer)], { type: 'application/pdf' });
			const url = URL.createObjectURL(blob);
			const link = document.createElement('a');
			link.href = url;
			link.download = name || fileName || 'file.pdf'; // You might want to provide a more meaningful filename
			link.click();
		});
	};
	*/

	useEffect(() => {
		async function initWasmAsync() {
			const response = await fetch('lib/pdf_wasm_project_bg.wasm');
			const bufferSource = await response.arrayBuffer();
			
			// Use async init function
			await __wbg_init(bufferSource);
		}
		initWasmAsync();
}, []);

  const [modifiedFile, setModifiedFile] = useState(null);
/*
	const onDownload = async (name) => {
		if (!pdfProxyObj) {
			console.log('No PDF loaded to download');
			return;
		}

		const buffer = await pdfProxyObj.getData();
		const pagesToDelete = hiddenPages.map(page => page); // Convert 1-indexed to 0-indexed
		console.log(pagesToDelete, 'pagesToDelete')
		try {
			// Call the remove_pages function from the WASM module
			const modifiedPdfArray = await move_page(new Uint8Array(buffer), 0, 3);
			setModifiedFile(modifiedPdfArray.buffer);
			// Convert result to Blob and download
			const blob = new Blob([modifiedPdfArray.buffer], { type: 'application/pdf' });
			const url = URL.createObjectURL(blob);
			const link = document.createElement('a');
			link.href = url;
			link.download = name || fileName || 'file.pdf';
			link.click();
		} catch (error) {
			console.error('Error modifying PDF:', error);
		}
		
	};
*/
	const onDownload = async (name) => {
		if (!pdfProxyObj) {
			console.log('No PDF loaded to download');
			return;
		}
	
		const buffer = await pdfProxyObj.getData();
		// const pagesToDelete = hiddenPages.map(page => page); // Convert 1-indexed to 0-indexed
		// console.log(pagesToDelete, 'pagesToDelete')
		try {
			// Call the remove_pages function from the WASM module
			// const modifiedPdfArray = await remove_pages(new Uint8Array(buffer), pagesToDelete);
			// const newBuffer = modifiedPdfArray.buffer.slice(0);
			// await savePDF(modifiedPdfArray.buffer, 'pdfId1');

			// setModifiedFile(new Date().toISOString());
			// Convert result to Blob and download
			const blob = new Blob([buffer], { type: 'application/pdf' });
			const url = URL.createObjectURL(blob);
			const link = document.createElement('a');
			link.href = url;
			link.download = name || fileName || 'file.pdf';
			link.click();
		} catch (error) {
			console.error('Error modifying PDF:', error);
		}
		
	};
		
	const [operations, setOperations] = useState([]);
	const [redoStack, setRedoStack] = useState([]);

	console.log(tools, 'tools');

	useEffect(() => {
		window.addEventListener('message', (event) => {
			if (typeof event.data === 'object' && event.data.file) {
				setFile(event.data.file);
				event.source.postMessage({ type: 'file-received', success: true }, event.origin);
			}
			if (typeof event.data === 'object' && event.data.fileName) {
				setFileName(event.data.fileName);
			}
			if (typeof event.data === 'object' && event.data.tools) {
				setTools(event.data.tools);
			}
		}, false);

		window.addEventListener('click', (event) => {
			// Create a new event
			const newEvent = new MouseEvent('click', {
				bubbles: true,
				cancelable: true,
				view: window.parent
			});
    
			// Dispatch the event to the parent document
			window.parent.document.dispatchEvent(newEvent);
		});
	}, []);

	useEffect(() => {
		window.onload = function() {
			console.log('sending iframe-loaded');
			window.parent.postMessage({ type: 'iframe-loaded', success: true }, '*');
		};
	}, []);

	useEffect(() => {
		const messageFunc =  (event) => {
			if (event.data && event.data.type === 'download') {
				onDownload(event.data.name);
    	}
		};
		window.addEventListener('message', messageFunc, false);
		return () => {
			window.removeEventListener('message', messageFunc);
		};
	}, [onDownload]);

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

	const showHeader = () => {
		return tools?.general?.includes("download") || tools?.general?.includes("thumbnails")
		|| tools?.general?.includes("zoom") || tools?.general?.includes("search")
		|| tools?.editing?.includes("rotation")
	}

	const showSubheader = () => {
		return tools?.editing?.includes("remove")
	}

	const undoLastAction = async () => {
		if (operations.length === 0) return;
	
		const lastOperation = operations[operations.length - 1];
		// Start with the original PDF
		let buffer = await retrievePDF("original");
		// console.log(buffer, 'undo buffer')
	
		// Replay all operations except for the last one
		for (let i = 0; i < operations.length - 1; i++) {
			const operation = operations[i];
			buffer = await applyOperation(operation, buffer); // Assuming applyOperation returns the updated buffer
		}
	
		// Save the buffer after undo as the current state
		await savePDF(buffer, 'pdfId1');
		setModifiedFile(new Date().toISOString());
	
		// Update undo and redo stacks
		const newUndoStack = operations.slice(0, -1);
		setRedoStack(prevRedoStack => [...prevRedoStack, lastOperation]);
		setOperations(newUndoStack);
	};
	
	const redoLastAction = async () => {
		console.log(redoStack, 'redoStack')
		if (redoStack.length === 0) return;
	
		const lastRedoOperation = redoStack[redoStack.length - 1];
		
		// Start with the original PDF
		let buffer = await retrievePDF("original");
		// console.log(buffer, 'buffer')
		// Replay all operations including the redo operation
		const allOperationsUpToRedo = [...operations, lastRedoOperation];
		// console.log(allOperationsUpToRedo, 'allOperationsUpToRedo')
		for (const operation of allOperationsUpToRedo) {
			buffer = await applyOperation(operation, buffer); // Assuming applyOperation returns the updated buffer
		}
	
		// Save the buffer after redo as the current state
		await savePDF(buffer, 'pdfId1');
		setModifiedFile(new Date().toISOString());
	
		// Update undo and redo stacks
		setOperations(prevOperations => [...prevOperations, lastRedoOperation]);
		setRedoStack(redoStack.slice(0, -1));
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

	const doDelete = async (pages, buffer) => {
		try {
			const modifiedPdfArray = await remove_pages(new Uint8Array(buffer), pages);
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
		}
	}

	const onDelete = async () => {
		if (!pdfProxyObj) {
			console.log('No PDF loaded to download');
			return;
		}

		const buffer = await pdfProxyObj.getData();
		const operation = { action: "delete", pages: [activePage]};
		const bufferResult = await applyOperation(operation, buffer);
		await savePDF(bufferResult, 'pdfId1');
		setModifiedFile(new Date().toISOString());
	
		setOperations([...operations, operation]);
		setRedoStack([]);
	}

	const appRef = useRef(null);

	const mainHeight = () => {
		let myHeight;
		if (!showHeader() && !showSubheader()) {
			myHeight = heightOffset0;
		} else if (!showSubheader()) {
			myHeight = heightOffset1;
		} else {
			myHeight = heightOffset2;
		}
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
		await savePDF(newBuffer, 'pdfId1');
		setModifiedFile(new Date().toISOString());
		
		// Update undo and redo stacks
		setOperations([...operations, operation]);
		setRedoStack([]);
	}	
	
	if (fileLoadFailError) {
		return (
			<div css={failWrap}>
				<h1>Failed to load the PDF.</h1>
				<p>{fileLoadFailError}</p>
			</div>
		);
	}

	return (
		<div ref={appRef} css={WrapperStyle} style={{height: mainHeight()}}>
			{
				showHeader() && (
					<Header
						tools={tools}
						onDownload={onDownload}
						pdfProxyObj={pdfProxyObj}
						appRef={appRef}
						eventBusRef={eventBusRef}
						viewerContainerRef={viewerContainerRef}
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
						undoLastAction={undoLastAction}
						redoLastAction={redoLastAction}
						onDownload={onDownload}
						onDelete={onDelete}
					/>
				)
			}
			<div css={Flex}>
				{
					tools?.general?.includes('thumbnails') && (
						<Panel
						  onDragEnd={onDragEnd}
						  hiddenPages={hiddenPages}
							tools={tools}
							setActivePage={setActivePage}
							activePage={activePage}
							pdfProxyObj={pdfProxyObj}
							pdf={pdfViewerObj}
							showPanel={showPanel}
						/>
					)
				}
				<div css={pdfViewerWrapper}>
					<PdfViewer
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
						viewerContainerRef={viewerContainerRef}
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
	);
};

export default App;