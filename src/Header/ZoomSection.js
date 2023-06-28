/** @jsxImportSource @emotion/react */
import { css } from '@emotion/react';

import 'pdfjs-dist/web/pdf_viewer.css';
import ZoomOut from '../../assets/zoom-out-svgrepo-com.svg';
import ZoomIn from '../../assets/zoom-in-svgrepo-com.svg';
import { Tooltip } from '../SharedComponents/Tooltip';
import Dropdown from '../SharedComponents/Dropdown';
// import Pan from "./assets/pan.svg";


const HeaderIcon = ({ src, alt, onClick }) => (
  <img onClick={onClick} css={css({ width: 28, height: 28, cursor: "pointer"})} src={src} alt="" />
)

const ZoomSection = ({
  onZoomIn,
  onZoomOut
}) => {

/*
  return (
    <>
    <Dropdown
      title="Hekki"
    />
    <Tooltip title="Zoom in">
          <HeaderIcon onClick={onZoomIn} src={ZoomOut} alt="Zoom in" />
        </Tooltip>
        <Tooltip title="Zoom out">
          <HeaderIcon onClick={onZoomOut} src={ZoomIn} alt="Zoom out" />
        </Tooltip>
        </>
  )

  */
  return (
    <>
      <input type="text" />
      <Dropdown title=">" />
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