/** @jsxImportSource @emotion/react */
import { css } from '@emotion/react';
import { useEffect, useRef, useState } from 'preact/hooks';
import { Thumbnail } from '../../Thumbnail';
import Slider from '../Slider';
import { LoadingSpinner } from '../LoadingSpinner';

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

  &::-webkit-scrollbar {
    width: 10px;
  }
  &::-webkit-scrollbar-thumb {
    background: #888;
  }
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
  pdf,
  onThumbnailClick,
  pdfProxyObj,
  multiPageSelections,
	setMultiPageSelections,
  onDeleteThumbnail,
  onRotate,
  expandedViewThumbnailScale
}) => {

  const containerRef = useRef(null);

  const [dragStart, setDragStart] = useState(null);
  const [dragRect, setDragRect] = useState(null);
  const [selectedIndexes, setSelectedIndexes] = useState([]);
  const [mouseUp, setMouseUp] = useState(new Date().toISOString());

  console.log(dragRect, 'dragRect')
  const onMouseDown = (e) => {
    const rect = containerRef.current.getBoundingClientRect();  // Get bounding box
    setDragStart({ x: e.clientX - rect.left, y: e.clientY - rect.top });  // Correct for offset
  };

  const onMouseMove = (e) => {
    if (dragStart) {
      const rect = containerRef.current.getBoundingClientRect();  // Get bounding box
      const width = (e.clientX - rect.left) - dragStart.x;  // Correct for offset
      const height = (e.clientY - rect.top) - dragStart.y;  // Correct for offset
      const newDragRect = {
        x: dragStart.x,
        y: dragStart.y,
        width,
        height,
      };
      setDragRect(newDragRect);
      
      const newSelectedIndexes = [];
      const thumbnailElements = containerRef.current.querySelectorAll('[data-type="regular-full-screen-thumbnail"]');
      console.log(thumbnailElements, 'thumbnailElements')
      Array.from(thumbnailElements).forEach((child, index) => {
        // console.log(child, 'child found brouu')
        const childRect = child.getBoundingClientRect();
        console.log(childRect, 'childrect 1')
        if (
          newDragRect.x < childRect.right - rect.left &&
          newDragRect.x + newDragRect.width > childRect.left - rect.left &&
          newDragRect.y < childRect.bottom - rect.top &&
          newDragRect.y + newDragRect.height > childRect.top - rect.top
        ) {
          newSelectedIndexes.push(index);
        }
      });
  
      setSelectedIndexes(newSelectedIndexes);
    }
  };

  console.log(selectedIndexes, 'selectedIndexes')

  useEffect(() => {
    if (selectedIndexes.length > 0) {
      const newSet = Array.from(new Set([...multiPageSelections, ...selectedIndexes.map((each) => each + 1)]));
      console.log(newSet, 'newSet');
      setMultiPageSelections(newSet);
      setSelectedIndexes([]); // Reset the selected indexes
    }
  }, [mouseUp, selectedIndexes]);

  const onMouseUp = () => {
    setDragStart(null);
    setDragRect(null);
    setMouseUp(new Date().toISOString());
  };
  
  useEffect(() => {
    if (dragStart) {
      window.addEventListener('mousemove', onMouseMove);
      window.addEventListener('mouseup', onMouseUp);
    }
  }, [dragStart]);
  
  // Remove event listeners when component unmounts
  useEffect(() => {
    return () => {
      window.removeEventListener('mousemove', onMouseMove);
      window.removeEventListener('mouseup', onMouseUp);
    };
  }, []);
  
  const activePage = -1;

  const numPages = pdfProxyObj?.numPages;
  const [draggingIndex, setDraggingIndex] = useState(null);
  const [dragOverIndex, setDragOverIndex] = useState(null);
  const [pendingDragEnd, setPendingDragEnd] = useState(null);

  useEffect(() => {
    if (pendingDragEnd !== null && dragOverIndex !== null) {
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

  // if (!numPages) return null;

  const thumbnails = Array.from({ length: numPages })
  .flatMap((_, i) => {
    let elements = [];
    
    if (i === dragOverIndex - 1) {
      elements = [...elements, <div css={dummyThumbnailStyle}></div>];
    }

    const thumbnailElement = (
      <div data-type="regular-full-screen-thumbnail" css={thumbnailStyle}>
        <Thumbnail
          clickIsMultiSelect
          onRotate={onRotate}
          onDelete={onDeleteThumbnail}
          selectedIndexes={selectedIndexes}
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
          scale={expandedViewThumbnailScale / 10}
          onThumbnailClick={onThumbnailClick}
        />
      </div>
    );

    elements = [...elements, thumbnailElement];

    return elements;
  });

  if (!numPages) {
    return (
      <div css={wrapperStyle}>
        <div css={fullScreenWrapper}>
          <div style={{display: "flex", alignItems: "center", justifyContent: "center"}}>
            <div style={{display: "flex", alignItems: "center", justifyContent: "center", flexDirection: "column"}}>
              <LoadingSpinner />
              <div style={{fontFamily: "Lato"}}>Loading...</div>
            </div>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div
      ref={containerRef}
      onMouseDown={onMouseDown}
      css={wrapperStyle}
    >
      {dragRect && (
        <div style={{
          position: 'absolute',
          left: `${dragRect.width < 0 ? dragRect.x + dragRect.width : dragRect.x}px`,
          top: `${dragRect.height < 0 ? dragRect.y + dragRect.height : dragRect.y}px`,
          zIndex: 5,
          width: `${Math.abs(dragRect.width)}px`,
          height: `${Math.abs(dragRect.height)}px`,
          backgroundColor: 'rgba(0, 128, 255, 0.3)',
          border: '2px solid blue',
        }} />
      )}
      <div css={fullScreenWrapper}>
        {thumbnails}
      </div>
    </div>
  );
};

export default FullScreenThumbnails;
