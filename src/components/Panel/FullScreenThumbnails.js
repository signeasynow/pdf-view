/** @jsxImportSource @emotion/react */
import { css } from '@emotion/react';
import { useEffect, useRef, useState } from 'preact/hooks';
import { Thumbnail } from '../../Thumbnail';
import Slider from '../Slider';
import { LoadingSpinner } from '../LoadingSpinner';
import Split from '../../../assets/split-svgrepo-com.svg';
import HeaderBtn from '../../Header/HeaderBtn';
import { Icon, Tooltip } from 'aleon_35_pdf_ui_lib';
import AccessibleButton from '../AccessibleButton';

const wrapperStyle = css`
  position: relative;
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

const dummyThumbnailStyle = css`
  min-width: 1px;
  max-width: 1px;
  border-left: 2px dashed #ccc; // or any other styles to indicate it's a placeholder
`;

const emptyDummyThumbnailStyle = css`
min-width: 1px;
max-width: 1px;
border-left: 2px dashed transparent; // or any other styles to indicate it's a placeholder
`;

const thumbnailStyle = css`
  flex: 1 1 auto;  // Automatically adjust the size based on container size
  margin: 8px;  // Add margin around each thumbnail
  min-width: 32px;
  height: fit-content;
`;

const FullScreenThumbnails = ({
  onDragEnd,
  showSearch,
  splitMarkers,
  fileName,
  documentLoading,
  pdf,
  isSplitting,
  tools,
  onThumbnailClick,
  pdfProxyObj,
  multiPageSelections,
	setMultiPageSelections,
  onDeleteThumbnail,
  onExtractThumbnail,
  onRotate,
  onClickSplit,
  expandedViewThumbnailScale,
}) => {

  const containerRef = useRef(null);

  const [dragStart, setDragStart] = useState(null);
  const [dragRect, setDragRect] = useState(null);
  const [selectedIndexes, setSelectedIndexes] = useState([]);
  const [mouseUp, setMouseUp] = useState(new Date().toISOString());

  const onMouseDown = (e) => {
    if (e.target.closest('.canvas-page')) {
      return;
    }
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

      const normalizedDragRect = {
        x: width < 0 ? dragStart.x + width : dragStart.x,
        y: height < 0 ? dragStart.y + height : dragStart.y,
        width: Math.abs(width),
        height: Math.abs(height),
      };

      const newSelectedIndexes = [];
      const thumbnailElements = containerRef.current.querySelectorAll('[data-type="regular-full-screen-thumbnail"]');
      Array.from(thumbnailElements).forEach((child, index) => {
        const childRect = child.getBoundingClientRect();
        if (
          normalizedDragRect.x < childRect.right - rect.left &&
          normalizedDragRect.x + normalizedDragRect.width > childRect.left - rect.left &&
          normalizedDragRect.y < childRect.bottom - rect.top &&
          normalizedDragRect.y + normalizedDragRect.height > childRect.top - rect.top
        ) {
          newSelectedIndexes.push(index);
        }
      });
  
      setSelectedIndexes(newSelectedIndexes);
    }
  };

  useEffect(() => {
    if (selectedIndexes.length > 0) {
      const newSet = Array.from(new Set([...multiPageSelections, ...selectedIndexes.map((each) => each + 1)]));
      setMultiPageSelections(newSet);
      setSelectedIndexes([]); // Reset the selected indexes
    }
    setDragRect(null);
  }, [mouseUp]);

  const onMouseUp = () => {
    setDragStart(null);
    setDragRect(null);
    setMouseUp(new Date().toISOString());
  };

  const getWidth = () => {
    if (showSearch) {
      return "calc(100vw - 300px)";
    }
    return "100vw";
  }
  
  useEffect(() => {
    if (dragStart) {
      window.addEventListener('mousemove', onMouseMove);
    } else {
      window.removeEventListener('mousemove', onMouseMove);
    }
    return () => {
      window.removeEventListener('mousemove', onMouseMove);
    };
  }, [dragStart]);
  
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
    
    if (isSplitting) {
      if (i !== 0) {
        if (splitMarkers.includes(i)) {
          elements = [...elements, <div style={{display: "flex", alignItems: "center"}}>
            <Tooltip title="Splitting here">
            <div style={{background: "#f96804", borderRadius: "4px"}}>
              <AccessibleButton ariaLabel="Split" onClick={() => onClickSplit(i)}>
                <Icon src={Split} />
              </AccessibleButton>
            </div>
          </Tooltip>
          </div>];
        } else {
          elements = [...elements, <div style={{display: "flex", alignItems: "center"}}>
            <Tooltip title="Add a split here">
            <AccessibleButton ariaLabel="Split" onClick={() => onClickSplit(i)}>
              <Icon src={Split} />
            </AccessibleButton>
          </Tooltip>
          </div>];
        }
      }
    } else {
      if (i === dragOverIndex - 1) {
        elements = [...elements, <div css={dummyThumbnailStyle}></div>];
      } else {
        elements = [...elements, <div css={emptyDummyThumbnailStyle}></div>];
      }
    }

    const thumbnailElement = (
      <div data-type="regular-full-screen-thumbnail" css={thumbnailStyle}>
        <Thumbnail
          canvasKey={fileName}
          draggingIndex={draggingIndex}
          onExtract={onExtractThumbnail}
          isFullScreen
          tools={tools}
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
          onDragEnd={(e) => {
            e.preventDefault();
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

  if (documentLoading) {
    return (
      <div css={wrapperStyle}>
        <div style={{width: getWidth()}} css={fullScreenWrapper}>
          <div style={{display: "flex", alignItems: "center", justifyContent: "center"}}>
            <div style={{marginTop: 20, display: "flex", alignItems: "center", justifyContent: "center", flexDirection: "column"}}>
              <LoadingSpinner />
              <div style={{fontFamily: "Lato", color: "white"}}>Loading...</div>
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
      onMouseUp={onMouseUp}
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
      <div style={{width: getWidth()}} css={fullScreenWrapper}>
        {thumbnails}
        {
          dragOverIndex === numPages + 1 && (
            <div css={dummyThumbnailStyle}></div>
          )
        }
      </div>
    </div>
  );
};

export default FullScreenThumbnails;
