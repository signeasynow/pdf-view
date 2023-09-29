/** @jsxImportSource @emotion/react */
import { css } from '@emotion/react';
import { useState } from 'preact/hooks'; // add this import
import { h } from 'preact';
import { Thumbnail } from './Thumbnail';
import {LoadingSpinner} from "./components/LoadingSpinner";

const wrapperStyle = css`
  position: relative;
`;

const lineIndicatorStyle = css`
  height: 2px;
  background-color: #3183c8;
  width: 100%;
`;

const fullScreenWrapper = css`
  position: absolute;
	height: 100%;
	z-index: 4;
	background: #282828;
  overflow: auto;
  display: flex;
  flex-wrap: wrap;
  justify-content: center;
  align-content: flex-start;  // Add this line

  &::-webkit-scrollbar {
    width: 10px;
  }
  &::-webkit-scrollbar-thumb {
    background: #888;
  }
`

const ThumbnailsContainer = ({
	onDragEnd,
	activePage,
	pdf,
	tools,
	scale,
	onExtract,
	onThumbnailClick,
	pdfProxyObj,
	multiPageSelections,
	setMultiPageSelections,
	onDelete,
	onRotate,
	documentLoading
}) => {
	
	const numPages = pdfProxyObj?.numPages;

	const [draggingIndex, setDraggingIndex] = useState(null);
	const [dragOverIndex, setDragOverIndex] = useState(null);

	const thumbnails = Array.from({ length: numPages }).flatMap((_, i) => {
		let elements = [];
		
		// Handle line indicator
		if (dragOverIndex === i + 1) {
			elements = [...elements, <div css={lineIndicatorStyle}></div>];
		}
	
		// Thumbnail component
		const thumbnailElement = (
			<Thumbnail
				onExtract={onExtract}
				onRotate={onRotate}
				onDelete={onDelete}
				multiPageSelections={multiPageSelections}
				setMultiPageSelections={setMultiPageSelections}
				onDragStart={(e, pageNum) => {
					e.dataTransfer.setData("text/plain", pageNum);
					setDraggingIndex(pageNum);
				}}
				onDragOver={(e, pageNum) => {
					e.preventDefault();
					setDragOverIndex(pageNum);
				}}
				onDragEnd={async () => {
					const targetIndex = dragOverIndex > i ? dragOverIndex - 2 : dragOverIndex - 1;
					onDragEnd(i, targetIndex);
					setDraggingIndex(null);
					setDragOverIndex(null);
				}}
				hidden={false}
				activePage={activePage}
				key={i}
				pdf={pdf}
				pdfProxyObj={pdfProxyObj}
				pageNum={i + 1}
				displayPageNum={i + 1}
				scale={scale}
				onThumbnailClick={onThumbnailClick}
				tools={tools}
			/>
		);
	
		elements = [...elements, thumbnailElement];
		return elements;
	});

	if (documentLoading) return (
		<div style={{display: "flex", flexDirection: "column", alignItems: "center", marginTop: 20}}>
			<LoadingSpinner />
			<div>Loading...</div>
		</div>
	);

	return (<div
		css={wrapperStyle}>
		{thumbnails}
		<div
      draggable
      onDragOver={(e) => {
        e.preventDefault();
        // set the dragOverIndex to numPages + 1 for the dummy element
        setDragOverIndex(numPages + 1);
      }}
      onDragEnd={() => {
        // If dummy is the target, move the dragging item to the end
        onDragEnd(draggingIndex, numPages);
        setDraggingIndex(null);
        setDragOverIndex(null);
      }}
    >
      {/* Style your dummy thumbnail here */}
      <div style={{height: "40px", width: "150px", borderTop: dragOverIndex === numPages + 1 ? "2px solid red" : ""}}>

      </div>
    </div>
	</div>);
};

export default ThumbnailsContainer;
