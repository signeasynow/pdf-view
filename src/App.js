/** @jsxImportSource @emotion/react */
import { css } from '@emotion/react';
import { useEffect, useRef, useState } from 'preact/hooks';
import 'pdfjs-dist/web/pdf_viewer.css';
import Header from './Header/Header';
import { useDebounce } from './utils/useDebounce';
import SearchBar from './SearchBar';
import { PdfViewer } from './PdfViewer';
import Panel from './Panel/Panel';

const Flex = css`
display: flex;
width: 100%;
height: 100%;
`;

const pdfViewerWrapper = css`
  height: 100%;
  width: 100%;
`;

const shortPdfViewerWrapper = css`
  height: 100%;
  width: calc(100% - 400px);
  background: red;
  position: relative;
`;
// relative

const WrapperStyle = css`
  height: calc(100vh - 50px);
  width: 100vw;
`;

const failWrap = css`
	font-family: Lato;
	margin: 0 8px;
	text-align: center;
`;

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

	const onSearchBtnClick = () => {
		setShowSearch(() => !showSearch);
	};

	const onPanelBtnClick = () => {
		setShowPanel(() => !showPanel);
	};

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
		return tools.includes("download") || tools.includes("thumbnails")
		|| tools.includes("zoom") || tools.includes("search")
		|| tools.includes("rotation")
	}

	const appRef = useRef(null);
	console.log(fileLoadFailError, 'fileLoadFailError');
	if (fileLoadFailError) {
		return (
			<div css={failWrap}>
				<h1>Failed to load the PDF.</h1>
				<p>{fileLoadFailError}</p>
			</div>
		);
	}

	return (
		<div ref={appRef} css={WrapperStyle}>
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
			<div css={Flex}>
				{
					tools.includes('thumbnails') && (
						<Panel
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