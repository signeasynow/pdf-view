/** @jsxImportSource @emotion/react */
import { css } from '@emotion/react';

import 'pdfjs-dist/web/pdf_viewer.css';
import ThumbnailsContainer from '../../Thumbnails';
import PanelTools from './PanelTools';
import Slider from '../Slider';

const topSectionStyle = css`
  margin-top: 16px;
  position: sticky;
  top: 0;
  z-index: 2;
  background: #f1f3f5;
  width: 100%;
  display: flex;
  justify-content: center;
	flex-direction: column;
	align-items: center;
`;

const thumbnailTopActionsWrapper = css`
  background: #d6dee8;
	width: 100px;
	display: flex;
	align-items: center;
	justify-content: center;
	margin-top: 8px;
	margin-bottom: 8px;
	border-radius: 4px;
`;

const ThumbnailsSection = ({
	setActivePage,
	activePage,
	pdf,
	tools,
	documentLoading,
	pdfProxyObj,
	onDragEnd,
	multiPageSelections,
	setMultiPageSelections,
	onExpand,
	onDeleteThumbnail,
	onExtractThumbnail,
	onRotate,
	thumbnailScale,
	setThumbnailScale,
	onThumbnailClick
}) => {

	const handleInputChange = (e) => {
		const num = parseInt(e.target.value);
		setThumbnailScale(num);
	};


	const handleThumbnailClick = (num, e) => {
		setActivePage(num);
		pdf.scrollPageIntoView({
			pageNumber: num
		});
		onThumbnailClick(num, e);
	};

	const shouldShowTopBar = () => {
		return tools?.thumbnails?.includes('zoom') || tools?.thumbnails?.includes('expand')
	}
	

	return (
		<>
			{
				shouldShowTopBar() && (
					<div css={topSectionStyle}>
						{
							tools?.thumbnails?.includes('expand') && (
								<div css={thumbnailTopActionsWrapper}>
									<PanelTools onToggle={() => onExpand()} />
								</div>
							)
						}
						{
							tools?.thumbnails?.includes('zoom') && (
								<Slider
									value={thumbnailScale}
									onChange={handleInputChange}
								/>
							)
						}
					</div>
				)
			}
			<ThumbnailsContainer
				documentLoading={documentLoading}
				onRotate={onRotate}
				onExtract={onExtractThumbnail}
				onDelete={onDeleteThumbnail}
				onDragEnd={onDragEnd}
				activePage={activePage}
				pdfProxyObj={pdfProxyObj}
				pdf={pdf}
				tools={tools}
				scale={thumbnailScale / 10}
				onThumbnailClick={handleThumbnailClick}
				multiPageSelections={multiPageSelections}
				setMultiPageSelections={setMultiPageSelections}
			/>
		</>
	);
};

export default ThumbnailsSection;