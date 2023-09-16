/** @jsxImportSource @emotion/react */
import { css } from '@emotion/react';

import 'pdfjs-dist/web/pdf_viewer.css';
import { Icon, Tooltip } from 'aleon_35_pdf_ui_lib';

const wrapper = css`
  padding: 4px;
  cursor: pointer;
  display: flex;
  align-items: center;
  border-radius: 8px;
  &:hover {
    background-color: #e7e7e7;
  }
`;

const HeaderBtn = ({
  icon,
  title,
  iconAlt,
  onClick,
  offsetX,
  style = {}
}) => {

  return (
    <Tooltip offsetX={offsetX} title={title}>
      <div onClick={onClick} css={wrapper} style={style}>
          <Icon src={icon} alt={iconAlt} />
      </div>
    </Tooltip>
  );
};

export default HeaderBtn;
