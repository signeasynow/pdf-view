/** @jsxImportSource @emotion/react */
import {  css } from '@emotion/react';

const confirmBtnStyle = css`
  text-decoration: underline;
  display: inline-block;
  cursor: pointer;
`;


export const TextLink = ({
  onClick,
  children,
  style
}) => {

	return (
		<div css={confirmBtnStyle} style={style} onClick={onClick}>{children}</div>
	);
};
