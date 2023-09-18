/** @jsxImportSource @emotion/react */
import { css } from '@emotion/react';
// import Pan from "./assets/pan.svg";
import { useState } from 'preact/hooks';
import ThumbnailsSection from './ThumbnailsSection';
import BookmarksSection from './BookmarksSection';
import { Icon, Tooltip } from 'aleon_35_pdf_ui_lib';
import ExpandIcon from "../../../assets/expand-svgrepo-com.svg";
import { useTranslation } from 'react-i18next';
import PanelTools from './PanelTools';
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
	showPanel,
	tools,
	setActivePage,
	activePage,
	pdf,
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
		setActivePage(num)
		if (e.shiftKey) {
			let resultingArray = [...multiPageSelections.filter((each) => each !== num)];
			if (multiPageSelections.includes(num)) {
				// redundant now: resultingArray = resultingArray.filter((each) => each !== num);
			} else {
				resultingArray.push(num);
			}
			setMultiPageSelections(resultingArray);
		}
	}

	if (showFullScreenThumbnails) {
		return <FullScreenThumbnails
		onDeleteThumbnail={onDeleteThumbnail}
		onExtractThumbnail={onExtractThumbnail}
		onDragEnd={onDragEnd}
		activePage={activePage}
		pdf={pdf}
		tools={tools}
		onThumbnailClick={onThumbnailClick}
		pdfProxyObj={pdfProxyObj}
		multiPageSelections={multiPageSelections}
		setMultiPageSelections={setMultiPageSelections}
		onRotate={onRotate}
		expandedViewThumbnailScale={expandedViewThumbnailScale}
		/>
	}

	return (
		<div id="panel" css={showPanel ? visibleSearchWrapper : invisibleSearchWrapper}>
			{
				activeTab === 0 && tools?.general?.includes('thumbnails') && (
					<ThumbnailsSection
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