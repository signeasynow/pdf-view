/** @jsxImportSource @emotion/react */
import { css } from '@emotion/react';
import Search from '../../assets/file-search-svgrepo-com.svg';
import File from '../../assets/file-svgrepo-com.svg';
import Panel from '../../assets/panel-left-svgrepo-com.svg';
import Download from '../../assets/download-svgrepo-com.svg';
import Gear from '../../assets/gear-svgrepo-com.svg';
import Tag from '../../assets/tag-svgrepo-com.svg';
import ZoomSection from './ZoomSection';
import HeaderBtn from './HeaderBtn';
import { useTranslation } from 'react-i18next';
import VerticalDivider from '../components/VerticalDivider';
import GoToNextTag from '../components/GoToNextTag';
import { useModal } from '../Contexts/ModalProvider';

const Wrapper = ({ children }) => (
	<div css={css({
		display: 'flex',
		background: 'white',
		height: 50,
		alignItems: 'center',
		padding: '0 12px',
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
	showFullScreenSearch,
	onSearch,
	onPanel,
	onDownload,
	leftPanelEnabled,
	viewerContainerRef,
	defaultZoom,
	showFullScreenThumbnails
}) => {
	const { t } = useTranslation();

	const { showSettingsModal } = useModal();
	const onSettings = () => {
		console.log("showing set")
		showSettingsModal();
	}

	const showSettings = () => {
		return tools?.general?.includes('account') || tools?.general?.includes('locale')
	}

	return (
		<Wrapper>
			<div css={contentLeftStyle}>
				{
					showSettings() && (
						<>
							<HeaderBtn offsetX="10px" onClick={onSettings} title={"Settings"} iconAlt={t('download')}  icon={Gear} />
							<VerticalDivider />
						</>
					)
				}
				{
					tools?.markers?.includes('go-to-next') && (
						<GoToNextTag pdf={pdfViewerObj} />
					)
				}
				{
					tools?.general?.includes('download') && (
						<>
							<HeaderBtn offsetX="10px" onClick={onDownload} title={t('download')} iconAlt={t('download')}  icon={Download} />
							<VerticalDivider />
						</>
					)
				}
				{
					(tools?.general?.includes('panel-toggle') && !showFullScreenThumbnails && !showFullScreenSearch) && (
						<>
							<HeaderBtn onClick={onPanel} title={t('panel')} iconAlt={t('panel')} icon={Panel} />
							<VerticalDivider />
						</>
					)
				}
				{
					tools?.general.includes('zoom') && !showFullScreenThumbnails && !showFullScreenSearch && (
						<>
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
			<div>
				{
					tools?.general?.includes('search') && (
						<HeaderBtn offsetX="-20px" onClick={onSearch} title={t('search')} iconAlt={t('search')} icon={showSearch ? File : Search} />
					)
				}
				{
					tools?.general?.includes('tag') && (
						<HeaderBtn offsetX="-20px" onClick={onSearch} title={'Add markers'} iconAlt={t('search')} icon={Tag} />
					)
				}
			</div>
		</Wrapper>
	);
};

export default Header;