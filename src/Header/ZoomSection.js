/** @jsxImportSource @emotion/react */
import { css } from '@emotion/react';

import 'pdfjs-dist/web/pdf_viewer.css';
import ZoomOut from '../../assets/zoom-out-svgrepo-com.svg';
import ZoomIn from '../../assets/zoom-in-svgrepo-com.svg';
import { Tooltip } from '../SharedComponents/Tooltip';
import Dropdown from '../SharedComponents/Dropdown';
import { useDebounce } from '../utils/useDebounce';
import { useEffect, useRef, useState } from 'preact/hooks';

// import Pan from "./assets/pan.svg";

const ZOOM_FACTOR = 0.1;

const HeaderIcon = ({ src, alt, onClick }) => (
  <img onClick={onClick} css={css({ width: 28, height: 28, cursor: "pointer"})} src={src} alt="" />
)

const RoundZoomValue = (v) => {
  return Math.floor(v * 100)
}

const ZoomSection = ({
  pdfViewerRef
}) => {

  const zoomTextRef = useRef("100");

  const [zoomValue, setZoomValue] = useState(100);

  const _onZoomOut = () => {
    if (pdfViewerRef.current && pdfViewerRef.current.currentScale > ZOOM_FACTOR) { // minimum scale 0.1
        const newValue = pdfViewerRef.current.currentScale - ZOOM_FACTOR;
        pdfViewerRef.current.currentScale = newValue;
        setZoomValue(RoundZoomValue(newValue));
    }
  };

  const _onZoomIn = () => {
    if (pdfViewerRef.current && pdfViewerRef.current.currentScale < (10 - ZOOM_FACTOR)) {
        const newValue = pdfViewerRef.current.currentScale + ZOOM_FACTOR;
        pdfViewerRef.current.currentScale = newValue;
        setZoomValue(RoundZoomValue(newValue));
    }
  };

  const onZoomIn = useDebounce(_onZoomIn, 5);
  const onZoomOut = useDebounce(_onZoomOut, 5);

  const _onChangeZoomByText = (e) => {
    const { value } = e.target;
    const num = parseInt(value, 10)?.toFixed(0);
    if (isNaN(num) || !num) {
      return;
    }
    pdfViewerRef.current.currentScale = num / 100;
    setZoomValue(num); 
  }

  const onChangeZoomByText = useDebounce(_onChangeZoomByText, 5);

  const setZoom = (value) => {
    pdfViewerRef.current.currentScale = value;
    zoomTextRef.current.value = (value * 100).toFixed(0);
  }

  useEffect(() => {
    if (zoomTextRef) {
      // console.log(pdfViewerRef.current.currentScaleValue, 'pdfViewerRef.current.currentScaleValue')
      zoomTextRef.current.value = 100;
    }
  }, [zoomTextRef])

  return (
    <>
      <input ref={zoomTextRef} onChange={onChangeZoomByText} type="text" />
      %
      <Dropdown title=">"
        child={<div>
        <div onClick={() => setZoom(0.1)}>10%</div>
        <div onClick={() => setZoom(0.25)}>25%</div>
        <div onClick={() => setZoom(0.5)}>50%</div>
        <div onClick={() => setZoom(1)}>100%</div>
        <div onClick={() => setZoom(1.25)}>125%</div>
        <div onClick={() => setZoom(1.5)}>150%</div>
        <div onClick={() => setZoom(2)}>200%</div>
        <div onClick={() => setZoom(4)}>400%</div>
        <div onClick={() => setZoom(8)}>800%</div>
        <div onClick={() => setZoom(16)}>1600%</div>
        <div onClick={() => setZoom(64)}>6400%</div>
      </div>} />
      <Tooltip title="Zoom in">
        <HeaderIcon onClick={onZoomIn} src={ZoomOut} alt="Zoom in" />
      </Tooltip>
      <Tooltip title="Zoom out">
        <HeaderIcon onClick={onZoomOut} src={ZoomIn} alt="Zoom out" />
      </Tooltip>
    </>
  );
};

export default ZoomSection;