/** @jsxImportSource @emotion/react */
import { css } from '@emotion/react';

import 'pdfjs-dist/web/pdf_viewer.css';
import { Tooltip } from '../SharedComponents/Tooltip';
import Gear from '../../assets/gear-svgrepo-com.svg';
import Dropdown from '../SharedComponents/Dropdown';
import { Icon } from '../SharedComponents/Icon';

const wrapper = css`
  padding: 8px;
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
  onClick
}) => {

  return (
    <Tooltip title={title}>
      <div onClick={onClick} css={wrapper}>
          <Icon src={icon} alt={iconAlt} />
      </div>
    </Tooltip>
  );
};

export default HeaderBtn;
