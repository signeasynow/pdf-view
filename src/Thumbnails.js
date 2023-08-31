/** @jsxImportSource @emotion/react */
import { css } from '@emotion/react';
import { useState } from 'preact/hooks'; // add this import
import { h } from 'preact';
import { Thumbnail } from './Thumbnail';

const wrapperStyle = css`
  position: relative;
`;

const lineIndicatorStyle = css`
  height: 2px;
  background-color: red;
  width: 100%;
`;

const ThumbnailsContainer = ({ hiddenPages, activePage, pdf, scale, onThumbnailClick, pdfProxyObj }) => {
	const numPages = pdfProxyObj?.numPages;

	const [draggingIndex, setDraggingIndex] = useState(null);
	const [dragOverIndex, setDragOverIndex] = useState(null);

	if (!numPages) return (
		<div>Loading...</div>
	);

	let displayPageNum = 0; // Initialize the counter

	const thumbnails = Array.from({ length: numPages }, (_, i) => {
    const isHidden = hiddenPages.includes(i + 1);
		if (!isHidden) {
			displayPageNum++;  // Increment the counter if the thumbnail is not hidden
		}
    return (
      <>
				{dragOverIndex === i + 1 && <div css={lineIndicatorStyle}></div>}
				<Thumbnail
					onDragStart={(e, pageNum) => {
						e.dataTransfer.setData("text/plain", pageNum);
						setDraggingIndex(pageNum);
					}}
					onDragOver={(e, pageNum) => {
						e.preventDefault();
						setDragOverIndex(pageNum);
					}}
					onDragEnd={() => {
						console.log(`Dropped at index: ${dragOverIndex - 1}`); // Subtract 1 because your pageNum starts from 1
						// logic for reordering thumbnails based on draggingIndex and dragOverIndex
						setDraggingIndex(null);
						setDragOverIndex(null);
					}}
					hidden={false}  // pass the hidden state
					activePage={activePage}
					key={i}
					pdf={pdf}
					pdfProxyObj={pdfProxyObj}
					pageNum={i + 1}
					displayPageNum={i + 1}
					scale={scale}
					onThumbnailClick={onThumbnailClick}
				/>
			</>
    );
  });

	return (<div css={wrapperStyle}>
		{thumbnails}
	</div>);
};

export default ThumbnailsContainer;
