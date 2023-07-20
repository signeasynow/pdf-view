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
  height: calc(100vh - 66px);
  width: 100vw;
`;

const App = () => {

	const [matchesCount, setMatchesCount] = useState(0);


	const [searchText, setSearchText] = useState('');

	const eventBusRef = useRef(null);

	const [pdfProxyObj, setPdfProxyObj] = useState(null);
	const [pdfViewerObj, setPdfViewerObj] = useState(null);
	const viewerContainerRef = useRef(null);

	const [file, setFile] = useState(null);

	const [showSearch, setShowSearch] = useState(false);
	const [showPanel, setShowPanel] = useState(true);

	const [activePage, setActivePage] = useState(1);

	const onSearchBtnClick = () => {
		setShowSearch(() => !showSearch);
	};

	const onPanelBtnClick = () => {
		setShowPanel(() => !showPanel);
	};

	useEffect(() => {
		window.addEventListener('message', (event) => {
			if (typeof event.data === 'object' && event.data.file) {
				setFile(event.data.file);
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

	return (
		<div css={WrapperStyle}>
			<Header
				eventBusRef={eventBusRef}
				viewerContainerRef={viewerContainerRef}
				pdfViewerObj={pdfViewerObj}
				onSearch={onSearchBtnClick}
				onPanel={onPanelBtnClick}
			/>
			<div css={Flex}>
				<Panel
					setActivePage={setActivePage}
					activePage={activePage}
					pdfProxyObj={pdfProxyObj}
					pdf={pdfViewerObj}
					showPanel={showPanel}
				/>
				<div css={showSearch ? shortPdfViewerWrapper : pdfViewerWrapper}>
					<PdfViewer
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