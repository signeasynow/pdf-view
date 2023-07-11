import { h } from 'preact';
import { useState, useEffect, useRef } from 'preact/hooks';

const Thumbnail = ({ pdf, pageNum, scale, onThumbnailClick }) => {
  const canvasRef = useRef(null);

  useEffect(() => {
    const renderThumbnail = async () => {
      const page = await pdf.getPage(pageNum);
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
  }, [pdf, pageNum, scale]);

  return (
    <div class="thumbnail-wrapper" onClick={() => onThumbnailClick(pageNum)}>
      <canvas class="canvas-page" ref={canvasRef}></canvas>
      <div style={{ fontSize: '0.8rem', marginTop: '0.5rem' }}>{pageNum}</div>
    </div>
  );
};

const ThumbnailsContainer = ({ pdf, scale, onThumbnailClick }) => {
  const numPages = pdf?.numPages;
  
  console.log(pdf?.pdfDocument?.numPages, 'numpages thumb1', pdf)
  useEffect(() => {
    console.log(pdf?.pdfDocument?.numPages, 'numpages thumb', pdf)
  }, [pdf]);
  if (!numPages) return;
  const thumbnails = Array.from({ length: numPages }, (_, i) => (
    <Thumbnail
      key={i}
      pdf={pdf}
      pageNum={i + 1}
      scale={scale}
      onThumbnailClick={onThumbnailClick}
    />
  ));

  return <div>HELLO{thumbnails}</div>;
};

export default ThumbnailsContainer;
