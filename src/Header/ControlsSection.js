/** @jsxImportSource @emotion/react */
import { css } from '@emotion/react';

import 'pdfjs-dist/web/pdf_viewer.css';
import { Tooltip } from '../SharedComponents/Tooltip';
import Gear from '../../assets/gear-svgrepo-com.svg';
import Dropdown from '../SharedComponents/Dropdown';
import { Icon } from '../SharedComponents/Icon';
import HeaderBtn from './HeaderBtn';

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
        <HeaderBtn title="View controls" iconAlt="View controls" icon={Gear} />
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