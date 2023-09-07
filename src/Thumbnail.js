/** @jsxImportSource @emotion/react */
import { css } from '@emotion/react';

import { h } from 'preact';
import { useEffect, useRef } from 'preact/hooks';

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
	onThumbnailClick
}) => {
	const canvasRef = useRef(null);

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

	return (
		<div
			draggable
			onDragStart={(e) => onDragStart(e, pageNum)}
			onDragOver={(e) => onDragOver(e, pageNum)}
			onDragEnd={onDragEnd}
      css={hidden ? hiddenThumbnailWrapper : (activePage === pageNum ? activeThumbnailWrapper : thumbnailWrapper)}
      id={`thumbnail-${pageNum}`}
      onClick={() => onThumbnailClick(pageNum)}>
			<div style={{display: "inline-flex"}} css={[activePage === pageNum ? activeCanvasStyle : canvasStyle]} >
				<canvas style={{opacity: isMultiSelected() ? 0.5 : 1}} class="canvas-page" ref={canvasRef} />
			</div>
			<input checked={isMultiSelected()} onClick={onToggleMultiSelect} css={checkboxStyle} type="checkbox" />
			<div style={{ fontSize: '0.8rem', marginTop: '0.5rem' }}>{displayPageNum}</div>
		</div>
	);
};
