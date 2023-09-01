/** @jsxImportSource @emotion/react */
import { css } from '@emotion/react';

import 'pdfjs-dist/web/pdf_viewer.css';
// import Pan from "./assets/pan.svg";
import { useState } from 'preact/hooks';
import ThumbnailsSection from './ThumbnailsSection';
import BookmarksSection from './BookmarksSection';

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

const Panel = ({
	showPanel,
	tools,
	setActivePage,
	activePage,
	pdf,
	pdfProxyObj,
	hiddenPages,
	onDragEnd
}) => {

	const [activeTab, setActiveTab] = useState(0);

	return (
		<div css={showPanel ? visibleSearchWrapper : invisibleSearchWrapper}>
			{

				/*
				<div css={optionsWrapper}>
				<Tooltip title="Thumbnails">
					<Icon onClick={() => setActiveTab(0)} src={ThumbnailsIcon} alt="Menu" />
				</Tooltip>
				<Tooltip title="Bookmarks">
					<Icon onClick={() => setActiveTab(1)} src={Bookmark} alt="Menu" />
				</Tooltip>
			</div>
			*/
			}
			{
				activeTab === 0 && tools.includes('thumbnails') && (
					<ThumbnailsSection
						onDragEnd={onDragEnd}
						hiddenPages={hiddenPages}
						tools={tools}
						setActivePage={setActivePage}
						activePage={activePage}
						pdf={pdf}
						pdfProxyObj={pdfProxyObj}
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