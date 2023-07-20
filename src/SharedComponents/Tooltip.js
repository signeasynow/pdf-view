/** @jsxImportSource @emotion/react */
import { css } from '@emotion/react';

const tooltip = css`
  position: relative;
  display: inline-block;
  font-family: Lato;
  font-size: 14px;
  &:hover::after {
    content: attr(data-tooltip); // use data-tooltip instead of title
    position: absolute;
    z-index: 999999;
    top: 100%;
    left: 50%;
    transform: translateX(-50%);
    padding: 5px;
    color: #fff;
    background-color: #333;
    border-radius: 3px;
    white-space: nowrap;
  }
`;

export const Tooltip = ({ children, title }) => (
	<div css={tooltip} data-tooltip={title}>
		{children}
	</div>
);