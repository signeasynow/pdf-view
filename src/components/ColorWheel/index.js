/** @jsxImportSource @emotion/react */
import {  css } from '@emotion/react';
import ColorWheelIcon from '../../../assets/color-wheel.png';

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

export const ColorWheel = () => {

  return (
    <div css={wrapper}>
      <img style={{borderRadius: "4px", width: 28, height: 28, display: "flex"}} src={ColorWheelIcon} />
    </div>
  );
};
