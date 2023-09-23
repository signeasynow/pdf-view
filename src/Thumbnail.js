/** @jsxImportSource @emotion/react */
import { css } from '@emotion/react';

import { h } from 'preact';
import { useEffect, useRef, useState } from 'preact/hooks';
import { Icon, Checkbox } from 'aleon_35_pdf_ui_lib';
import Trash from '../assets/trash-svgrepo-com.svg';
import RotateRight from '../assets/rotate-right-svgrepo-com.svg';
import RotateLeft from '../assets/rotate-left-svgrepo-com.svg';
import Extract from '../assets/gradebook-export-svgrepo-com.svg';
import Deque from "collections/deque";

const thumbnailWrapper = css`
  display: flex;
  flex-direction: column;
  align-items: center;
	font-family: Lato;
	color: #8b8b8b;
	position: relative;
	margin-top: 20px;
`;

const draggingStyle = css`
  opacity: 0.1 !important;
`;

const hiddenThumbnailWrapper = css`
  display: none;
`;

const activeThumbnailWrapper = css`
  display: flex;
	margin-top: 20px;
  flex-direction: column;
  align-items: center;
	font-family: Lato;
	color: #3183c8;
	position: relative;
`;

const canvasStyle = css`
	border: 2px solid transparent;
`;

const activeCanvasStyle = css`
	border: 2px solid #3183c8;
`;

const checkboxStyle = css`
	position: absolute;
	top: 4px;
	z-index: 1;
`;

const contextMenuStyle = css`
  position: fixed;
  top: 0;
  left: 0;
  background: #fff;
  border: 1px solid #ccc;
  z-index: 1;
	padding: 8px;
`;

const contextMenuLabel = css`
  color: black;
`;

const contextMenuItem = css`
  display: flex;
  align-items: center;
  padding: 4px;
`;

const contextMenuItemText = css`
  margin: 0 4px;
  color: #7f7f7f;
`;

const MAX_RETRIES = 10;

export const Thumbnail = ({
	multiPageSelections,
	selectedIndexes,
	canvasKey,
	setMultiPageSelections,
	onDragStart,
	isFullScreen,
	tools,
	onDragOver,
	onDragEnd,
	displayPageNum,
	hidden,
	pdfProxyObj,
	activePage,
	draggingIndex,
	pageNum,
	scale,
	onThumbnailClick,
	onDelete,
	onExtract,
	onRotate,
	clickIsMultiSelect
}) => {
	const canvasRef = useRef(null);
	const [isDragging, setIsDragging] = useState(false); // Add this state to keep track

	const [contextMenu, setContextMenu] = useState({ visible: false, x: 0, y: 0 });

	const onToggleMultiSelect = () => {
		// e.stopPropagation();
		if (multiPageSelections?.includes(pageNum)) {
			setMultiPageSelections(multiPageSelections.filter((each) => each !== pageNum));
		} else {
			setMultiPageSelections([...multiPageSelections, pageNum]);
		}
	}

	const isTargetedByDragRect = () => {
		return selectedIndexes?.includes(pageNum - 1);
	}

	const isMultiSelected = () => {
		return multiPageSelections?.includes(pageNum) || isTargetedByDragRect();
	}

	const isSingleOrMultiDragging = () => {
		if (isDragging) {
			return true;
		}
		return typeof draggingIndex === "number" && isMultiSelected()
	}

  const renderTaskRef = useRef(null); // Add this reference to keep track of render tasks

	const processRenderQueue = async () => {
    if (renderQueue.current.length === 0 || isRendering) return;
	
		setIsRendering(true); // Set flag to indicate that rendering is in progress
		
    const pageNumToRender = renderQueue.current.shift(); // Dequeue from front
		
		const renderThumbnail = async () => {
			const page = await pdfProxyObj.getPage(pageNumToRender);
			const viewport = page.getViewport({ scale });
			canvasRef.current.width = viewport.width;
			canvasRef.current.height = viewport.height;
			
			const canvasContext = canvasRef.current.getContext('2d');
			if (!canvasContext) {
				throw new Error('Failed to get canvas context');
			}
			
			// Cancel any ongoing render task before starting a new one
			if (renderTaskRef.current) {
				renderTaskRef.current.cancel();
			}
	
			renderTaskRef.current = page.render({ canvasContext, viewport });
			try {
				// Existing code for rendering
				// ...
				await renderTaskRef.current.promise;
				
				resetRetries(); // Reset retries if successful
			} catch (err) {
				if (err.name === 'RenderingCancelledException') {
					if (retries < MAX_RETRIES) {
						setRetries(prevRetries => prevRetries + 1); // Increment retries
						setTimeout(() => renderThumbnail(), 500);  // Retry after 500ms
					} else {
						console.log('Max retries reached. Giving up rendering.');
					}
				} else {
					throw err;  // For other exceptions, still throw
				}
			}
		};
	
		// Execute rendering
		await renderThumbnail().catch(err => {
			if (err.name === 'RenderingCancelledException') {
				console.log('Rendering was cancelled');
			} else {
				throw err;
			}
		});
		
		setIsRendering(false);
		processRenderQueue();
	};

	useEffect(() => {
		// Enqueue the pageNum if it needs rendering
		if (!hidden) {
      renderQueue.current.push(pageNum); // Enqueue at back
      processRenderQueue(); // Start processing
    }
	}, [hidden, pageNum, scale, pdfProxyObj]);

	const onRightClick = (e) => {
		e.preventDefault();
		// Hide any other context menus before showing this one
		document.dispatchEvent(new Event('hide-contextmenu'));
		
		setContextMenu({ visible: true, x: e.clientX, y: e.clientY });
		
		// Add the click listener to the document
		document.addEventListener('click', hideContextMenu);
	};

	const hideContextMenu = () => {
		setContextMenu({ visible: false, x: 0, y: 0 });
		// Remove the click listener from the document
		document.removeEventListener('click', hideContextMenu);
	};

	useEffect(() => {
    const onHide = () => {
      hideContextMenu();
    };
    document.addEventListener('hide-contextmenu', onHide);
    return () => {
      document.removeEventListener('hide-contextmenu', onHide);
    };
  }, []);

	useEffect(() => {
		// Setup code (if any)
		
		return () => {
			console.log("umounting bro")
			// Cleanup code
			renderQueue.current.clear(); // Also clear the queue here

			// Cancel any ongoing render task
			if (renderTaskRef.current) {
				renderTaskRef.current.cancel();
			}
	
			// Clear the canvas
			if (canvasRef.current) {
				const context = canvasRef.current.getContext('2d');
				if (context) {
					context.clearRect(0, 0, canvasRef.current.width, canvasRef.current.height);
				}
			}
		};
	}, [pdfProxyObj]);

	const onClick = (e) => {
		// e.stopPropagation();
		// e.preventDefault();
		if (clickIsMultiSelect) {
			onToggleMultiSelect(e);
			return;
		}
		onThumbnailClick(pageNum, e);
	}

	const getThumbnailClass = () => {
		if (clickIsMultiSelect) {
			return [isMultiSelected() ? activeCanvasStyle : canvasStyle]
		}
		return [activePage === pageNum ? activeCanvasStyle : canvasStyle];
	}

	// console.log(tools?.editing?.includes('move'), "tools?.editing?.includes('move')")

	return (
		<div
			style={{color: "#7f7f7f", alignSelf: "auto"}}
			draggable={tools?.editing?.includes('move')}
			onDragStart={(e) => {
				setIsDragging(true);
				onDragStart(e, pageNum)
			}}
			onDragOver={(e) => onDragOver(e, pageNum)}
			onDragEnd={(e) => {
				setIsDragging(false);
				onDragEnd(e);
			}}
			css={[
				hidden ? hiddenThumbnailWrapper : (activePage === pageNum ? activeThumbnailWrapper : thumbnailWrapper),
				isSingleOrMultiDragging() ? draggingStyle : null
			]}
			id={`thumbnail-${pageNum}`}
    >
				{
				contextMenu.visible && 
				<div
					css={contextMenuStyle}
					style={{
					top: `${contextMenu.y}px`,
					left: `${contextMenu.x}px`,
				}}
				onClick={hideContextMenu}
				>
					{
						tools?.editing?.includes("rotation") && (
							<>
								<strong css={contextMenuLabel}>Page orientation</strong>
								<div onClick={() => onRotate(true, pageNum)} css={contextMenuItem}>
									<Icon src={RotateRight} alt="Delete" />
									<p css={contextMenuItemText}>Rotate clockwise</p>
								</div>
								<div onClick={() => onRotate(false, pageNum)} css={contextMenuItem}>
									<Icon src={RotateLeft} alt="Delete" />
									<p css={contextMenuItemText}>Rotate counterclockwise</p>
								</div>
							</>
						)
					}
					{
						tools?.editing?.includes("rotation")
						&& tools?.editing?.includes("remove") && (
							<hr />
						)
					}
					{
						tools?.editing?.includes("remove") || tools?.editing?.includes("extract") && (
							<strong css={contextMenuLabel}>Page manipulation</strong>
						)
					}
					{
						tools?.editing?.includes("remove") && (
							<>
								<div onClick={() => onDelete(pageNum)} css={contextMenuItem}>
									<Icon src={Trash} alt="Delete" />
									<p css={contextMenuItemText}>Delete</p>
								</div>
							</>
						)
					}
					{
						tools?.editing?.includes("extract") && (
							<>
								<div onClick={() => onExtract(pageNum)} css={contextMenuItem}>
									<Icon src={Extract} alt="Delete" />
									<p css={contextMenuItemText}>Extract</p>
								</div>
							</>
						)
					}
				</div>
			}
			<div
				onContextMenu={onRightClick}
				onClick={onClick}
				style={{display: "inline-flex", cursor: "pointer"}} css={getThumbnailClass()} >
				<div css={checkboxStyle}>
					<Checkbox onChange={(e) => {
						if (!clickIsMultiSelect) {
							onToggleMultiSelect();
						}
					}} checked={isMultiSelected()}
					/>
				</div>
				{/*<input checked={isMultiSelected()} onClick={onToggleMultiSelect} css={checkboxStyle} type="checkbox" />*/}
				<canvas key={canvasKey} style={{opacity: isMultiSelected() ? 0.5 : 1}} class="canvas-page" ref={canvasRef} />
			</div>
			<div style={{ fontSize: '0.8rem', marginTop: '0.5rem', pointerEvents: "none", color: isFullScreen ? "white" : "" }}>{displayPageNum}</div>
		</div>
	);
};
