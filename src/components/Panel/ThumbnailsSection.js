/** @jsxImportSource @emotion/react */
import { css } from '@emotion/react';

import 'pdfjs-dist/web/pdf_viewer.css';
import ThumbnailsContainer from '../../Thumbnails';
import { useState } from 'preact/hooks';
import PanelTools from './PanelTools';
import Slider from '../Slider';

const rangeStyle = css`
  -webkit-appearance: none; /* Override default CSS styles */
  appearance: none;
  width: 100%; /* Full width */
  height: 4px; /* Specified height */
  border-radius: 5px;   
  background: #3183c8; /* Grey background */
  outline: none; /* Remove outline */
  opacity: 0.7; /* Set transparency (it will look lighter) */
  -webkit-transition: .2s; /* 0.2 seconds transition on hover */
  transition: opacity .2s;

  /* For thumb of the slider */
  ::-webkit-slider-thumb {
    -webkit-appearance: none; /* Override default look */
    appearance: none;
    width: 20px; /* Set a specific slider handle width */
    height: 20px; /* Slider handle height */
    background: #3183c8; /* blue background */
    cursor: pointer; /* Cursor on hover */
    border-radius: 50%; 
  }

  /* For thumb of the slider in Firefox */
  ::-moz-range-thumb {
    width: 20px; /* Set a specific slider handle width */
    height: 20px; /* Slider handle height */
    background: #3183c8; /* blue background */
    cursor: pointer; /* Cursor on hover */
    border-radius: 50%; 
  }
`;

const rangeWrapperStyle = css`
  display: flex;
  font-size: 20px;
  align-items: center;
`;

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

const minusStyle = css`
 font-size: 12px;
 font-weight: 600;
 margin-right: 4px;
`;

const plusStyle = css`
  margin-left: 4px;
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
	pdfProxyObj,
	onDragEnd,
	multiPageSelections,
	setMultiPageSelections,
	onExpand,
	onDeleteThumbnail,
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
	

	return (
		<>
			{
				tools?.thumbnails?.includes('zoom') && (
					<div css={topSectionStyle}>
						<div css={thumbnailTopActionsWrapper}>
							<PanelTools onToggle={() => onExpand()} />
						</div>
						<Slider
							value={thumbnailScale}
							onChange={handleInputChange}
						/>
					</div>
				)
			}
			<ThumbnailsContainer
				onRotate={onRotate}
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