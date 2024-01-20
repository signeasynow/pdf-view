/** @jsxImportSource @emotion/react */
import { css } from '@emotion/react';

const VerticalDivider = () => (
	<div css={css`
    width: 1px;
    background-color: #ccc;
    margin: 12px 8px;
    color: transparent;
    pointer-events: none;
  `}
	>&nbsp;</div>
);

export default VerticalDivider;
