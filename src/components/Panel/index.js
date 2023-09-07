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
`;

const invisibleSearchWrapper = css`
  background: orange;
  display: none;
`;

const optionsWrapper = css`

`;


const fullScreenWrapper = css`
  position: absolute;
	width: 100vw;
	height: 100%;
	z-index: 4;
	background: gray;
`

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
	setMultiPageSelections
}) => {

	const { t } = useTranslation();
	const [activeTab, setActiveTab] = useState(0);

	if (showFullScreenThumbnails) {
		return <FullScreenThumbnails
		onDragEnd={onDragEnd}
		activePage={activePage}
		pdf={pdf}
		scale={0.2}
		onThumbnailClick={setActivePage}
		pdfProxyObj={pdfProxyObj}
		multiPageSelections={multiPageSelections}
		setMultiPageSelections={setMultiPageSelections}
		/>
	}

	return (
		<div css={showPanel ? visibleSearchWrapper : invisibleSearchWrapper}>
			{
				activeTab === 0 && tools?.general?.includes('thumbnails') && (
					<ThumbnailsSection
						onExpand={onExpand}
						onDragEnd={onDragEnd}
						tools={tools}
						setActivePage={setActivePage}
						activePage={activePage}
						pdf={pdf}
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