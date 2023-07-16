/** @jsxImportSource @emotion/react */
import { css } from '@emotion/react';

import 'pdfjs-dist/web/pdf_viewer.css';
import { Tooltip } from '../SharedComponents/Tooltip';
import Gear from '../../assets/gear-svgrepo-com.svg';
import Dropdown from '../SharedComponents/Dropdown';
import { Icon } from '../SharedComponents/Icon';

const wrapper = css`
  padding: 8px;
  &:hover {
    background-color: #e7e7e7;
  }
`;

const HeaderBtn = ({
  icon,
  title,
  iconAlt
}) => {

  return (
    <div css={wrapper}>
      <Tooltip title={title}>
        <Icon src={icon} alt={iconAlt} />
      </Tooltip>
    </div>
  );
};

export default HeaderBtn;
