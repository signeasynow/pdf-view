/** @jsxImportSource @emotion/react */

import 'pdfjs-dist/web/pdf_viewer.css';
import ThumbnailsContainer from '../Thumbnails';
// import Pan from "./assets/pan.svg";
import { useState } from 'preact/hooks';

const ThumbnailsSection = ({
	setActivePage,
	activePage,
	pdf,
	pdfProxyObj
}) => {

	const [thumbnailScale, setThumbnailScale] = useState(2);

	return (
		<>
			<input value={thumbnailScale} onChange={(e) => {
				const num = parseInt(e.target.value);
				setThumbnailScale(num);
			}} type="range" id="scale" name="scale"
				min="0" max="10"
			/>
			<ThumbnailsContainer
				activePage={activePage}
				pdfProxyObj={pdfProxyObj}
				pdf={pdf}
				scale={thumbnailScale / 10}
				onThumbnailClick={(num) => {
					setActivePage(num);
					pdf.scrollPageIntoView({
						pageNumber: num
					});
				}}
			/>
		</>
	);
};

export default ThumbnailsSection;
