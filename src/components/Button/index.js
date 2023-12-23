/** @jsxImportSource @emotion/react */
import {  css } from '@emotion/react';

const closeBtnStyle = css`
  border: 1px solid lightgrey;
  font-size: 16px;
  padding: 8px 16px;
  border-radius: 4px;
  margin-left: 8px;
  cursor: pointer;
`;

const confirmBtnStyle = css`
  background: #3183c8;
  color: white;
  border: 1px solid transparent;
  font-size: 16px;
  padding: 8px 16px;
  border-radius: 4px;
  cursor: pointer;
`;


export const Button = ({
	variant = "secondary",
  onClick,
  children,
  style
}) => {

	return (
		<button style={style} css={variant === "primary" ? confirmBtnStyle : closeBtnStyle} size="md" onClick={onClick}>{children}</button>
	);
};
