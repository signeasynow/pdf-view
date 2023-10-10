/** @jsxImportSource @emotion/react */
import { css } from '@emotion/react';
import Search from '../../assets/file-search-svgrepo-com.svg';
import File from '../../assets/file-svgrepo-com.svg';
import Panel from '../../assets/panel-left-svgrepo-com.svg';
import Download from '../../assets/download-svgrepo-com.svg';
import ZoomSection from './ZoomSection';
import HeaderBtn from './HeaderBtn';
import { useTranslation } from 'react-i18next';
import VerticalDivider from '../components/VerticalDivider';

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
	showSearch,
	pdfProxyObj,
	pdfViewerObj,
	onSearch,
	onPanel,
	onDownload,
	leftPanelEnabled,
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
					<HeaderBtn onClick={onSearch} title={t("search")} iconAlt={t("search")} icon={showSearch ? File : Search} />
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