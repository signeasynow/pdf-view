/** @jsxImportSource @emotion/react */
import { css } from '@emotion/react';

import { h } from 'preact';
import { useState, useEffect, useRef } from 'preact/hooks';

const thumbnailWrapper = css`
  display: flex;
  flex-direction: column;
  align-items: center;
  margin-top: 20px;
  cursor: pointer;
`

const activeThumbnailWrapper = css`
  display: flex;
  flex-direction: column;
  align-items: center;
  margin-top: 20px;
  cursor: pointer;
  background: red;
`

const Thumbnail = ({ pdfProxyObj, activePage, pageNum, scale, onThumbnailClick }) => {
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

    renderThumbnail();
  }, [pageNum, scale, pdfProxyObj]);

  return (
    <div id={`thumbnail-${pageNum}`} css={activePage === pageNum ? activeThumbnailWrapper : thumbnailWrapper} onClick={() => onThumbnailClick(pageNum)}>
      <canvas class="canvas-page" ref={canvasRef}></canvas>
      <div style={{ fontSize: '0.8rem', marginTop: '0.5rem' }}>{pageNum}</div>
    </div>
  );
};

const ThumbnailsContainer = ({ activePage, pdf, scale, onThumbnailClick, pdfProxyObj }) => {
  const numPages = pdfProxyObj?.numPages;

  if (!numPages) return (
    <div>Loading...</div>
  )
  const thumbnails = Array.from({ length: numPages }, (_, i) => (
    <Thumbnail
      activePage={activePage}
      key={i}
      pdf={pdf}
      pdfProxyObj={pdfProxyObj}
      pageNum={i + 1}
      scale={scale}
      onThumbnailClick={onThumbnailClick}
    />
  ));

  return thumbnails;
};

export default ThumbnailsContainer;
