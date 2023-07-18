/** @jsxImportSource @emotion/react */
import { css } from '@emotion/react'

const tooltip = css`
  position: relative;
  display: inline-block;
  &:hover::after {
    content: attr(title);
    position: absolute;
    z-index: 1;
    top: 120%;
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
  <div css={tooltip} title={title}>
    {children}
  </div>
);
