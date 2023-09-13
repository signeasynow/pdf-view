/** @jsxImportSource @emotion/react */
import { css } from '@emotion/react';

import 'pdfjs-dist/web/pdf_viewer.css';
import Hand from '../../assets/hand-svgrepo-com.svg';
import Search from '../../assets/search-svgrepo-com.svg';
import Hamburger from '../../assets/hamburger-md-svgrepo-com.svg';
import Comment from '../../assets/comment-svgrepo-com.svg';
import Panel from '../../assets/panel-left-svgrepo-com.svg';
import Download from '../../assets/download-svgrepo-com.svg';
import ZoomSection from './ZoomSection';
import ControlsSection from './ControlsSection';
import HeaderBtn from './HeaderBtn';
import { useTranslation } from 'react-i18next';

const VerticalDivider = () => (
	<div css={css`
    width: 1px;
    background-color: #ccc;
    margin: 12px 12px;
		height: 32px;
  `}
	/>
);

const Wrapper = ({ children }) => (
	<div css={css({
		display: 'flex',
		background: 'white',
		height: 50,
		alignItems: "center",
		margin: '0 12px',
		justifyContent: 'space-between'
	})}
	>
		{children}
	</div>
);

const contentLeftStyle = css`
	display: flex;
	align-items: center;
`;

const Header = ({
	tools,
	pdfProxyObj,
	pdfViewerObj,
	onSearch,
	onPanel,
	onDownload,
	leftPanelEnabled,
	onRotate,
	viewerContainerRef,
	defaultZoom,
	showFullScreenThumbnails
}) => {
	const { t } = useTranslation();

 return (
		<Wrapper>
			<div css={contentLeftStyle}>
				{
					tools?.general?.includes('download') && (
						<>
							<HeaderBtn offsetX="10px" onClick={onDownload} title={t("download")} iconAlt={t("download")}  icon={Download} />
							<VerticalDivider />
						</>
					)
				}
				{
					tools?.editing?.includes('rotation') && (
						<ControlsSection
							onRotate={onRotate}
						/>
					)
				}
				{
					(tools?.general?.includes('panel-toggle') && !showFullScreenThumbnails) && (
						<HeaderBtn onClick={onPanel} title={t("panel")} iconAlt={t("panel")} icon={Panel} />
					)
				}
				{
					tools?.general.includes('zoom') && !showFullScreenThumbnails && (
						<>
							<VerticalDivider />
							<ZoomSection
								defaultZoom={defaultZoom}
								leftPanelEnabled={leftPanelEnabled}
								pdfProxyObj={pdfProxyObj}
								viewerContainerRef={viewerContainerRef}
								pdfViewerObj={pdfViewerObj}
							/>
						</>
					)
				}
			</div>
			

			{

				/*
				<HeaderBtn onClick={onPanel} title="Pan" iconAlt="Pan" icon={Hand} />
        <select>
        <option>View</option>
        <option>Annotate</option>
      </select>
      */
			}
			{
				tools?.general?.includes('search') && (
					<HeaderBtn onClick={onSearch} title={t("search")} iconAlt={t("search")} icon={Search} />
				)
			}
			{

				/*
				<HeaderBtn title="Comments" iconAlt="Comments" icon={Comment} />
				*/
			}
		</Wrapper>
	)
}

export default Header;