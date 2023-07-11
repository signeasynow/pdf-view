/** @jsxImportSource @emotion/react */
import { css } from '@emotion/react';

import 'pdfjs-dist/web/pdf_viewer.css';
import ZoomOut from '../../assets/zoom-out-svgrepo-com.svg';
import ZoomIn from '../../assets/zoom-in-svgrepo-com.svg';
import { Tooltip } from '../SharedComponents/Tooltip';
import Dropdown from '../SharedComponents/Dropdown';
import { useDebounce } from '../utils/useDebounce';
import { useEffect, useRef, useState } from 'preact/hooks';
import { HeaderIcon } from './SharedComponents/HeaderIcon';
// import Pan from "./assets/pan.svg";

const WHEEL_ZOOM_DISABLED_TIMEOUT = 1000; // ms

let zoomDisabledTimeout = null;
function setZoomDisabledTimeout() {
  if (zoomDisabledTimeout) {
    clearTimeout(zoomDisabledTimeout);
  }
  zoomDisabledTimeout = setTimeout(function () {
    zoomDisabledTimeout = null;
  }, WHEEL_ZOOM_DISABLED_TIMEOUT);
}



const ZOOM_FACTOR = 0.1;

const RoundZoomValue = (v) => {
  return Math.floor(v * 100)
}

const ZoomSection = ({
  pdfViewerObj
}) => {

  const zoomTextRef = useRef("100");

  const [zoomValue, setZoomValue] = useState(100);

  const _onZoomOut = () => {
    if (pdfViewerObj && pdfViewerObj.currentScale > ZOOM_FACTOR) { // minimum scale 0.1
        const newValue = pdfViewerObj.currentScale - ZOOM_FACTOR;
        pdfViewerObj.currentScale = newValue;
        setZoomValue(RoundZoomValue(newValue));
    }
  };

  const _onZoomIn = () => {
    if (pdfViewerObj && pdfViewerObj.currentScale < (10 - ZOOM_FACTOR)) {
        const newValue = pdfViewerObj.currentScale + ZOOM_FACTOR;
        pdfViewerObj.currentScale = newValue;
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
    pdfViewerObj.currentScale = num / 100;
    setZoomValue(num); 
  }

  const onChangeZoomByText = useDebounce(_onChangeZoomByText, 5);

  const setZoom = (value) => {
    pdfViewerObj.currentScale = value;
    zoomTextRef.current.value = (value * 100).toFixed(0);
  }

  useEffect(() => {
    if (zoomTextRef) {
      zoomTextRef.current.value = 100;
    }
  }, [zoomTextRef]);

  /*
  const [initialTouchDistance, setInitialTouchDistance] = useState(null);
  const [scale, setScale] = useState(1);

  useEffect(() => {

    if (!viewer) {
      return;
    }
    
    const handleTouchStart = (event) => {
      if (event.touches.length === 2) {
        const touch1 = event.touches[0];
        const touch2 = event.touches[1];
  
        const dx = touch1.clientX - touch2.clientX;
        const dy = touch1.clientY - touch2.clientY;
  
        const distance = Math.sqrt(dx * dx + dy * dy);
        
        setInitialTouchDistance(distance);
      }
    };
  
    const handleTouchMove = (event) => {
      if (event.touches.length === 2 && initialTouchDistance !== null) {
        const touch1 = event.touches[0];
        const touch2 = event.touches[1];
  
        const dx = touch1.clientX - touch2.clientX;
        const dy = touch1.clientY - touch2.clientY;
  
        const distance = Math.sqrt(dx * dx + dy * dy);
        const scaleChange = distance / initialTouchDistance;
        
        // Adjust this to change how much pinch affects zoom:
        const sensitivity = 0.1;
        const newScale = scale * (1 + (scaleChange - 1) * sensitivity);
        
        // Update the scale of your PDF viewer here:
        viewer.currentScale = newScale;
        setScale(newScale);
        setInitialTouchDistance(distance);
      }
    };
  
    const handleTouchEnd = (event) => {
      if (event.touches.length < 2) {
        setInitialTouchDistance(null);
      }
    };
    
    viewer.addEventListener('touchstart', handleTouchStart, { passive: false });
    viewer.addEventListener('touchmove', handleTouchMove, { passive: false });
    viewer.addEventListener('touchend', handleTouchEnd, { passive: false });
    
    return () => {
      viewer.removeEventListener('touchstart', handleTouchStart);
      viewer.removeEventListener('touchmove', handleTouchMove);
      viewer.removeEventListener('touchend', handleTouchEnd);
    };
  }, [initialTouchDistance, scale]);
*/

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