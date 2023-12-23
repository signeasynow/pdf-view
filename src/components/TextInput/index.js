/** @jsxImportSource @emotion/react */
import {  css } from '@emotion/react';

const confirmBtnStyle = css`
  padding: 4px 8px;
`;


export const TextInput = ({
  value,
  onChange,
  type,
  placeholder,
  style
}) => {

	return (
  <input css={confirmBtnStyle} style={style} value={value} onChange={onChange} type={type} placeholder={placeholder} />	);
};
