/** @jsxImportSource @emotion/react */
import { css } from '@emotion/react';

import 'pdfjs-dist/web/pdf_viewer.css';
import ThumbnailsContainer from '../Thumbnails';
import { useState } from 'preact/hooks';

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
`;

const minusStyle = css`
 font-size: 12px;
 font-weight: 600;
 margin-right: 4px;
`;

const plusStyle = css`
  margin-left: 4px;
`;

const ThumbnailsSection = ({
	setActivePage,
	activePage,
	pdf,
	tools,
	pdfProxyObj,
	hiddenPages
}) => {
	const [thumbnailScale, setThumbnailScale] = useState(2);

	const handleInputChange = (e) => {
		const num = parseInt(e.target.value);
		setThumbnailScale(num);
	};

	const handleThumbnailClick = (num) => {
		setActivePage(num);
		console.log(num, 'num here 12', pdf);
		pdf.scrollPageIntoView({
			pageNumber: num
		});
	};

	return (
		<>
			{
				tools?.includes('thumbnail-zoom') && (
					<div css={topSectionStyle}>
						<div css={rangeWrapperStyle}>
							<label css={minusStyle}>—</label>
							<input
								css={rangeStyle}
								value={thumbnailScale}
								onChange={handleInputChange}
								type="range"
								id="scale"
								name="scale"
								min="0"
								max="10"
							/>
							<label css={plusStyle}>+</label>
						</div>
					</div>
				)
			}
			<ThumbnailsContainer
				hiddenPages={hiddenPages}
				activePage={activePage}
				pdfProxyObj={pdfProxyObj}
				pdf={pdf}
				scale={thumbnailScale / 10}
				onThumbnailClick={handleThumbnailClick}
			/>
		</>
	);
};

export default ThumbnailsSection;