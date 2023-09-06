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
	background: #151515;
  overflow: auto;
  display: flex;
  flex-wrap: wrap;
`

const dummyThumbnailStyle = css`
  flex: 1 1 calc(25% - 16px);
  margin: 8px;
  max-width: calc(25% - 16px);
  border: 2px dashed #ccc; // or any other styles to indicate it's a placeholder
`;

const thumbnailStyle = css`
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
          onDragStart={(e, pageNum) => {
            e.dataTransfer.setData("text/plain", pageNum);
            setDraggingIndex(pageNum);
          }}
          onDragOver={(e, pageNum) => {
            e.preventDefault();
            setDragOverIndex(pageNum);
          }}
          onDragEnd={() => {
            setPendingDragEnd(i);
            // setDraggingIndex(null);
            // setDragOverIndex(null);
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
