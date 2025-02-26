/** @jsxImportSource @emotion/react */
import { css } from '@emotion/react';
// import Pan from "./assets/pan.svg";
import { useState } from 'preact/hooks';
import ThumbnailsSection from './ThumbnailsSection';
import BookmarksSection from './BookmarksSection';
import { useTranslation } from 'react-i18next';
import FullScreenThumbnails from './FullScreenThumbnails';

const visibleSearchWrapper = css`
  background: #f1f3f5;
  width: 300px;
  overflow: auto;
  flex-grow: 0;
  flex-shrink: 0;
  display: flex;
  flex-direction: column;
  align-items: center;

	&::-webkit-scrollbar {
    width: 10px;
  }
  &::-webkit-scrollbar-thumb {
    background: #888;
  }
`;

const invisibleSearchWrapper = css`
  background: orange;
  display: none;
`;

const Panel = ({
	onClickSplit,
	fullScreenThumbnailRef,
	splitMarkers,
	showPanel,
	tools,
	showSearch,
	isSplitting,
	fileName,
	setActivePage,
	activePage,
	pdf,
	documentLoading,
	pdfProxyObj,
	onDragEnd,
	showFullScreenThumbnails,
	onExpand,
	multiPageSelections,
	setMultiPageSelections,
	onDeleteThumbnail,
	onExtractThumbnail,
	onRotate,
	expandedViewThumbnailScale,
	thumbnailScale,
	setThumbnailScale
}) => {

	const { t } = useTranslation();
	const [activeTab, setActiveTab] = useState(0);

	const onThumbnailClick = (num, e) => {
		setActivePage(num);
		if (e.shiftKey) {
			let resultingArray = [...multiPageSelections.filter((each) => each !== num)];
			if (multiPageSelections.includes(num)) {
				// redundant now: resultingArray = resultingArray.filter((each) => each !== num);
			}
			else {
				resultingArray.push(num);
			}
			setMultiPageSelections(resultingArray);
		}
	};

	if (showFullScreenThumbnails) {
		return (<FullScreenThumbnails
			showSearch={showSearch}
			fileName={fileName}
			splitMarkers={splitMarkers}
			onClickSplit={onClickSplit}
			documentLoading={documentLoading}
			onDeleteThumbnail={onDeleteThumbnail}
			onExtractThumbnail={onExtractThumbnail}
			onDragEnd={onDragEnd}
			isSplitting={isSplitting}
			activePage={activePage}
			pdf={pdf}
			tools={tools}
			fullScreenThumbnailRef={fullScreenThumbnailRef}
			onThumbnailClick={onThumbnailClick}
			pdfProxyObj={pdfProxyObj}
			multiPageSelections={multiPageSelections}
			setMultiPageSelections={setMultiPageSelections}
			onRotate={onRotate}
			expandedViewThumbnailScale={expandedViewThumbnailScale}
		        />);
	}

	return (
		<div id="panel" css={showPanel ? visibleSearchWrapper : invisibleSearchWrapper}>
			{
				activeTab === 0 && tools?.general?.includes('thumbnails') && (
					<ThumbnailsSection
						documentLoading={documentLoading}
						onThumbnailClick={onThumbnailClick}
						onRotate={onRotate}
						onDeleteThumbnail={onDeleteThumbnail}
						onExtractThumbnail={onExtractThumbnail}
						onExpand={onExpand}
						onDragEnd={onDragEnd}
						tools={tools}
						setActivePage={setActivePage}
						activePage={activePage}
						pdf={pdf}
						thumbnailScale={thumbnailScale}
						setThumbnailScale={setThumbnailScale}
						pdfProxyObj={pdfProxyObj}
						multiPageSelections={multiPageSelections}
						setMultiPageSelections={setMultiPageSelections}
					/>
				)
			}
			{
				activeTab === 1 && (
					<BookmarksSection
						setActivePage={setActivePage}
						pdf={pdf}
					/>
				)
			}
		</div>
	);
};

export default Panel;

/*
						<Tooltip title="Bookmarks">
							<Icon onClick={() => setActiveTab(1)} src={Bookmark} alt="Menu" />
						</Tooltip>
						*/