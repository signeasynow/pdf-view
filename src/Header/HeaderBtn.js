/** @jsxImportSource @emotion/react */
import { css } from '@emotion/react';

import { Icon, Tooltip } from 'aleon_35_pdf_ui_lib';

export const MySVGIcon = ({ strokeColor }) => {
  return (
    <svg width="28px" height="28px" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
      <path
        d="M12 3V21M9 21H15M19 6V3H5V6"
        stroke={strokeColor}
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
};

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
  active,
  title,
  iconComponent,
  iconAlt,
  onClick,
  offsetX,
  style = {}
}) => {

  return (
    <Tooltip offsetX={offsetX} title={title}>
      <div onClick={onClick} css={wrapper} style={{...style, background: active ? "#e7e7e7" : ""}}>
        {
          icon ? <Icon src={icon} alt={iconAlt} /> : iconComponent()
        }
      </div>
    </Tooltip>
  );
};

export default HeaderBtn;
