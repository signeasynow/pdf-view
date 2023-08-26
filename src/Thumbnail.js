/** @jsxImportSource @emotion/react */
import { css } from '@emotion/react';

import { h } from 'preact';
import { useEffect, useRef } from 'preact/hooks';

const thumbnailWrapper = css`
  display: flex;
  flex-direction: column;
  align-items: center;
  margin-top: 20px;
  cursor: pointer;
	font-family: Lato;
	color: #8b8b8b;
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
`;

const canvasStyle = css`
  padding-bottom: 4px;
`;

const activeCanvasStyle = css`
	border: 2px solid #3183c8;
`;

export const Thumbnail = ({ displayPageNum, hidden, pdfProxyObj, activePage, pageNum, scale, onThumbnailClick }) => {
	const canvasRef = useRef(null);

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
      css={hidden ? hiddenThumbnailWrapper : (activePage === pageNum ? activeThumbnailWrapper : thumbnailWrapper)}
      id={`thumbnail-${pageNum}`}
      onClick={() => onThumbnailClick(pageNum)}>
			<canvas css={activePage === pageNum ? activeCanvasStyle : canvasStyle} class="canvas-page" ref={canvasRef} />
			<div style={{ fontSize: '0.8rem', marginTop: '0.5rem' }}>{displayPageNum}</div>
		</div>
	);
};
