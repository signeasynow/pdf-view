/** @jsxImportSource @emotion/react */
import { css } from '@emotion/react';

import 'pdfjs-dist/web/pdf_viewer.css';
import { Tooltip } from '../SharedComponents/Tooltip';
import Gear from '../../assets/gear-svgrepo-com.svg';

const HeaderIcon = ({ src, alt, onClick }) => (
  <img onClick={onClick} css={css({ width: 28, height: 28, cursor: "pointer"})} src={src} alt="" />
)

const ControlsSection = ({
  pdfViewerRef
}) => {

  
  return (
    <>
      <Tooltip title="View controls">
        <HeaderIcon src={Gear} alt="View controls" />
      </Tooltip>
    </>
  );
};

export default ControlsSection;