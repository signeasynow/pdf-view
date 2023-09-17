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

const ThumbnailsContainer = ({
	onDragEnd,
	activePage,
	pdf,
	tools,
	scale,
	onThumbnailClick,
	pdfProxyObj,
	multiPageSelections,
	setMultiPageSelections,
	onDelete,
	onRotate
}) => {
	console.log(tools, 'too thuco')
	const numPages = pdfProxyObj?.numPages;

	const [draggingIndex, setDraggingIndex] = useState(null);
	const [dragOverIndex, setDragOverIndex] = useState(null);

	const thumbnails = Array.from({ length: numPages }, (_, i) => {
    return (
      <>
				{dragOverIndex === i + 1 && <div css={lineIndicatorStyle}></div>}
				<Thumbnail
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
						if (dragOverIndex > i) {
							onDragEnd(i, dragOverIndex - 2);
						} else {
							onDragEnd(i, dragOverIndex - 1);
						}
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
					something={() => {console.log("DOG")}}
					onThumbnailClick={onThumbnailClick}
					tools={true}
				/>
			</>
    );
  });

	if (!numPages) return (
		<div style={{display: "flex", flexDirection: "column", alignItems: "center", marginTop: 20}}>
			<LoadingSpinner />
			<div style={{fontFamily: "Lato"}}>Loading...</div>
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
