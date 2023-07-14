/** @jsxImportSource @emotion/react */
import { css } from '@emotion/react';

import 'pdfjs-dist/web/pdf_viewer.css';
import { Tooltip } from '../SharedComponents/Tooltip';
import Gear from '../../assets/gear-svgrepo-com.svg';
import Dropdown from '../SharedComponents/Dropdown';
import { Icon } from '../SharedComponents/Icon';

const ControlsSection = ({
  pdfViewerObj,
  eventBusRef
}) => {

  const onRotate = (clockwise) => {
    if (clockwise) {
      pdfViewerObj.pagesRotation += 90;
    } else {
      pdfViewerObj.pagesRotation -= 90;
    }
  }
  
  return (
    <>
      <Dropdown title={
        <Tooltip title="View controls">
          <Icon src={Gear} alt="View controls" />
        </Tooltip>
      }
        child={<div>
          <h6>Page orientation</h6>
          <p onClick={() => onRotate(true)}>Rotate clockwise</p>
          <p onClick={() => onRotate(false)}>Rotate counterclockwise</p>
      </div>} />
    </>
  );
};

export default ControlsSection;