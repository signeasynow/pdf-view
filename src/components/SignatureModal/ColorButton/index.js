/** @jsxImportSource @emotion/react */
import { css } from '@emotion/react';

export const ColorButton = ({ color, onChangeColor }) => {
	const buttonStyle = css`
    background-color: ${color};
    border: 2px solid ${color === 'white' ? 'black' : 'transparent'};
    border-radius: 50%;
    width: 30px;
    height: 30px;
    margin: 5px;
    cursor: pointer;
  `;

	return (
		<button css={buttonStyle} onClick={() => onChangeColor(color)} />
	);
};