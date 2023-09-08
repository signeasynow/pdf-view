/** @jsxImportSource @emotion/react */
import { css } from '@emotion/react';

import { h } from 'preact';
import { useEffect, useRef, useState } from 'preact/hooks';
import { Icon } from 'aleon_35_pdf_ui_lib';
import Trash from '../assets/trash-svgrepo-com.svg';

const partialOpacityStyle = css`
  position: relative;
	opacity: 0.5;
`;

const thumbnailWrapper = css`
  display: flex;
  flex-direction: column;
  align-items: center;
  margin-top: 20px;
  cursor: pointer;
	font-family: Lato;
	color: #8b8b8b;
	margin-bottom: 20px;
	position: relative;
`;

const hiddenThumbnailWrapper = css`
  display: none;
`;

const activeThumbnailWrapper = css`
  display: flex;
  flex-direction: column;
  align-items: center;
  margin-top: 20px;
  cursor: pointer;
	font-family: Lato;
	color: #3183c8;
	position: relative;
`;

const canvasStyle = css`
  margin-bottom: 4px;
`;

const activeCanvasStyle = css`
	border: 2px solid #3183c8;
`;

const checkboxStyle = css`
	position: absolute;
	top: 4px;
	right: 20px;
`;

export const Thumbnail = ({
	multiPageSelections,
	setMultiPageSelections,
	onDragStart,
	onDragOver,
	onDragEnd,
	displayPageNum,
	hidden,
	pdfProxyObj,
	activePage,
	pageNum,
	scale,
	onThumbnailClick,
	onDelete
}) => {
	const canvasRef = useRef(null);

	const [contextMenu, setContextMenu] = useState({ visible: false, x: 0, y: 0 });

	const onToggleMultiSelect = () => {
		if (multiPageSelections?.includes(pageNum)) {
			setMultiPageSelections(multiPageSelections.filter((each) => each !== pageNum));
		} else {
			setMultiPageSelections([...multiPageSelections, pageNum]);
		}
	}

	const isMultiSelected = () => {
		return multiPageSelections?.includes(pageNum);
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

	return (
		<div
		  onContextMenu={onRightClick}
			draggable
			onDragStart={(e) => onDragStart(e, pageNum)}
			onDragOver={(e) => onDragOver(e, pageNum)}
			onDragEnd={onDragEnd}
      css={hidden ? hiddenThumbnailWrapper : (activePage === pageNum ? activeThumbnailWrapper : thumbnailWrapper)}
      id={`thumbnail-${pageNum}`}
      onClick={() => onThumbnailClick(pageNum)}>
				{
				contextMenu.visible && 
				<div style={{
					position: 'fixed',
					top: `${contextMenu.y}px`,
					left: `${contextMenu.x}px`,
					background: '#fff',
					border: '1px solid #ccc',
				}}
				onClick={hideContextMenu}
				>
					<div onClick={() => onDelete(pageNum)} style={{display: "flex", alignItems: "center", padding: "4px"}}>
						<Icon src={Trash} alt="Delete" />
						<p style={{marginLeft: "4px", color: "#7f7f7f"}}>Delete</p>
					</div>
				</div>
			}
			<div style={{display: "inline-flex"}} css={[activePage === pageNum ? activeCanvasStyle : canvasStyle]} >
				<canvas style={{opacity: isMultiSelected() ? 0.5 : 1}} class="canvas-page" ref={canvasRef} />
			</div>
			<input checked={isMultiSelected()} onClick={onToggleMultiSelect} css={checkboxStyle} type="checkbox" />
			<div style={{ fontSize: '0.8rem', marginTop: '0.5rem' }}>{displayPageNum}</div>
		</div>
	);
};
