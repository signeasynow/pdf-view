/** @jsxImportSource @emotion/react */
import { css } from '@emotion/react';

import { h } from 'preact';
import { useEffect, useRef, useState } from 'preact/hooks';
import { Icon, Checkbox } from 'aleon_35_pdf_ui_lib';
import Trash from '../assets/trash-svgrepo-com.svg';
import RotateRight from '../assets/rotate-right-svgrepo-com.svg';
import RotateLeft from '../assets/rotate-left-svgrepo-com.svg';

const thumbnailWrapper = css`
  display: flex;
  flex-direction: column;
  align-items: center;
	font-family: Lato;
	color: #8b8b8b;
	position: relative;
	margin-top: 20px;
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

export const Thumbnail = ({
	multiPageSelections,
	selectedIndexes,
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
	pageNum,
	scale,
	onThumbnailClick,
	onDelete,
	onRotate,
	clickIsMultiSelect
}) => {

	const canvasRef = useRef(null);

	const [contextMenu, setContextMenu] = useState({ visible: false, x: 0, y: 0 });

	const onToggleMultiSelect = () => {
		// console.log(e, 'e multi')
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


	useEffect(() => {
		const renderThumbnail = async () => {
			const page = await pdfProxyObj.getPage(pageNum);
			const viewport = page.getViewport({ scale });
			canvasRef.current.width = viewport.width;
			canvasRef.current.height = viewport.height;

			const canvasContext = canvasRef.current.getContext('2d');
			if (!canvasContext) {
				throw new Error('Failed to get canvas context');
			}
			await page.render({ canvasContext, viewport }).promise;
		};

		if (!hidden) {
      renderThumbnail();
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

	const onClick = (e) => {
		// e.stopPropagation();
		// e.preventDefault();
		if (clickIsMultiSelect) {
			onToggleMultiSelect(e);
			return;
		}
		console.log("clicking bro")
		onThumbnailClick(pageNum, e);
	}

	const getThumbnailClass = () => {
		if (clickIsMultiSelect) {
			return [isMultiSelected() ? activeCanvasStyle : canvasStyle]
		}
		return [activePage === pageNum ? activeCanvasStyle : canvasStyle];
	}

	return (
		<div
			style={{color: "#7f7f7f", alignSelf: "auto"}}
			draggable={tools?.editing?.includes('move')}
			onDragStart={(e) => {
				onDragStart(e, pageNum)
			}}
			onDragOver={(e) => onDragOver(e, pageNum)}
			onDragEnd={onDragEnd}
      css={hidden ? hiddenThumbnailWrapper : (activePage === pageNum ? activeThumbnailWrapper : thumbnailWrapper)}
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
								<div onClick={() => onRotate(true)} css={contextMenuItem}>
									<Icon src={RotateRight} alt="Delete" />
									<p css={contextMenuItemText}>Rotate clockwise</p>
								</div>
								<div onClick={() => onRotate(false)} css={contextMenuItem}>
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
						tools?.editing?.includes("remove") && (
							<>
								<strong css={contextMenuLabel}>Page manipulation</strong>
								<div onClick={() => onDelete(pageNum)} css={contextMenuItem}>
									<Icon src={Trash} alt="Delete" />
									<p css={contextMenuItemText}>Delete</p>
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
				<canvas style={{opacity: isMultiSelected() ? 0.5 : 1}} class="canvas-page" ref={canvasRef} />
			</div>
			<div style={{ fontSize: '0.8rem', marginTop: '0.5rem', pointerEvents: "none", color: isFullScreen ? "white" : "" }}>{displayPageNum}</div>
		</div>
	);
};
