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

const Thumbnail = ({ pdfProxyObj, pdf, pageNum, scale, onThumbnailClick }) => {
  const canvasRef = useRef(null);

  useEffect(() => {
    const renderThumbnail = async () => {
      const page = await pdfProxyObj.getPage(pageNum);
      console.log(page, 'page bro')
      const viewport = page.getViewport({ scale: 0.2 });

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
    <div css={thumbnailWrapper} onClick={() => onThumbnailClick(pageNum)}>
      <canvas class="canvas-page" ref={canvasRef}></canvas>
      <div style={{ fontSize: '0.8rem', marginTop: '0.5rem' }}>{pageNum}</div>
    </div>
  );
};

const ThumbnailsContainer = ({ pdf, scale, onThumbnailClick, pdfProxyObj }) => {
  const numPages = pdfProxyObj?.numPages;
  
  console.log(pdf?.pdfDocument?.numPages, 'numpages thumb1', pdf, 'wassuup', pdf?.pdfDocument, 'doog', pdfProxyObj)

  useEffect(() => {
    console.log(pdfProxyObj, 'numpages thumb2', pdf, 'wassuup', pdf?.pdfDocument)
  }, [pdfProxyObj]);

  if (!numPages) return (
    <div>Loading...</div>
  )
  const thumbnails = Array.from({ length: numPages }, (_, i) => (
    <Thumbnail
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
