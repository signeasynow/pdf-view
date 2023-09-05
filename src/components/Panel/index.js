/** @jsxImportSource @emotion/react */
import { css } from '@emotion/react';
// import Pan from "./assets/pan.svg";
import { useState } from 'preact/hooks';
import ThumbnailsSection from './ThumbnailsSection';
import BookmarksSection from './BookmarksSection';
import { Icon, Tooltip } from 'aleon_35_pdf_ui_lib';
import ExpandIcon from "../../../assets/expand-svgrepo-com.svg";
import { useTranslation } from 'react-i18next';

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

const thumbnailTopActionsWrapper = css`
  background: #d6dee8;
	width: 100px;
	display: flex;
	align-items: center;
	justify-content: center;
	margin-top: 8px;
	border-radius: 4px;
`

const Panel = ({
	showPanel,
	tools,
	setActivePage,
	activePage,
	pdf,
	pdfProxyObj,
	onDragEnd
}) => {

	const { t } = useTranslation();
	const [activeTab, setActiveTab] = useState(0);

	return (
		<div css={showPanel ? visibleSearchWrapper : invisibleSearchWrapper}>
				<div css={optionsWrapper}>
					<div css={thumbnailTopActionsWrapper}>
						<Tooltip title={t("view thumbnails in full screen")}>
							<Icon onClick={() => setActiveTab(0)} src={ExpandIcon} alt={t("expand")} />
						</Tooltip>
					</div>
					{
						/*
						<Tooltip title="Bookmarks">
							<Icon onClick={() => setActiveTab(1)} src={Bookmark} alt="Menu" />
						</Tooltip>
						*/
					}
				</div>
			{
				activeTab === 0 && tools?.general?.includes('thumbnails') && (
					<ThumbnailsSection
						onDragEnd={onDragEnd}
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