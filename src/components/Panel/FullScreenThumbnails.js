/** @jsxImportSource @emotion/react */
import { css } from '@emotion/react';
import { useEffect, useState } from 'preact/hooks';
import { Thumbnail } from '../../Thumbnail';

const wrapperStyle = css`
  position: relative;
`;

const fullScreenWrapper = css`
  position: absolute;
	width: 100vw;
	height: 100%;
	z-index: 4;
	background: #f1f3f5;
  overflow: auto;
  display: flex;
  flex-wrap: wrap;
  justify-content: center;
`

const dummyThumbnailStyle = css`
  flex: 1 1 calc(25% - 16px);
  margin: 8px;
  min-width: fit-content;
  max-width: calc(25% - 16px);
  border: 2px dashed #ccc; // or any other styles to indicate it's a placeholder
`;

const thumbnailStyle = css`
  min-width: fit-content;
  flex: 1 1 calc(25% - 16px); // 25% for 4 items per row and 16px for margin
  margin: 8px; // Add margin around each thumbnail
  max-width: calc(25% - 16px); // Cap width at 25% for 4 per row
`;

const FullScreenThumbnails = ({
  onDragEnd,
  activePage,
  pdf,
  scale,
  onThumbnailClick,
  pdfProxyObj,
  multiPageSelections,
	setMultiPageSelections,
  onDeleteThumbnail,
  onRotate
}) => {

  const numPages = pdfProxyObj?.numPages;
  const [draggingIndex, setDraggingIndex] = useState(null);
  const [dragOverIndex, setDragOverIndex] = useState(null);
  const [pendingDragEnd, setPendingDragEnd] = useState(null);

  useEffect(() => {
    if (pendingDragEnd !== null && dragOverIndex !== null) {
      console.log(dragOverIndex, 'dragOverIndex', pendingDragEnd)
      if (dragOverIndex > pendingDragEnd) {
        onDragEnd(pendingDragEnd, Math.max(dragOverIndex - 2, 0));
      } else {
        onDragEnd(pendingDragEnd, dragOverIndex - 1);
      }
      
      setPendingDragEnd(null);
      setDraggingIndex(null);
      setDragOverIndex(null);
    }
  }, [dragOverIndex, pendingDragEnd]);


  if (!numPages) return (<div>Loading...</div>);

  const thumbnails = Array.from({ length: numPages })
  .flatMap((_, i) => {
    let elements = [];
    
    if (i === dragOverIndex - 1) {
      elements = [...elements, <div css={dummyThumbnailStyle}></div>];
    }

    const thumbnailElement = (
      <div css={thumbnailStyle}>
        <Thumbnail
          onRotate={onRotate}
          onDelete={onDeleteThumbnail}
          multiPageSelections={multiPageSelections}
          setMultiPageSelections={setMultiPageSelections}
          onDragStart={(e, pageNum) => {
            e.dataTransfer.setData("text/plain", pageNum);
            setDraggingIndex(pageNum);
          }}
          onDragOver={(e, pageNum) => {
            e.preventDefault();
            const boundingRect = e.currentTarget.getBoundingClientRect();
            const midX = boundingRect.left + (boundingRect.right - boundingRect.left) / 2;
      
            // Decide whether to move the dragOverIndex to the left or right based on the position of the drag
            if (e.clientX < midX) {
              setDragOverIndex(pageNum);
            } else {
              setDragOverIndex(pageNum + 1);
            }
          }}
          onDragEnd={() => {
            setPendingDragEnd(i);
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
        />
      </div>
    );

    elements = [...elements, thumbnailElement];

    return elements;
  });

  return (
    <div css={wrapperStyle}>
      <div css={fullScreenWrapper}>
        {thumbnails}
      </div>
    </div>
  );
};

export default FullScreenThumbnails;
