/** @jsxImportSource @emotion/react */
import {  css } from '@emotion/react';
import ColorWheelIcon from '../../../assets/color-wheel.png';
import { SketchPicker } from 'react-color';
import { useState } from 'preact/hooks';

const wrapper = css`
  padding: 4px;
  cursor: pointer;
  display: inline-block;
  border-radius: 8px;
  position: relative;
  &:hover {
    background-color: #e7e7e7;
  }
`;

export const ColorWheel = ({ onChooseColor }) => {
  const [showPicker, setShowPicker] = useState(false);
  const [color, setColor] = useState('#fff');

  const handleColorChange = (color) => {
    setColor(color.hex);
    if (onChooseColor) {
      onChooseColor(color.hex);
    }
  };

  const togglePicker = () => {
    setShowPicker(!showPicker);
  };

  return (
    <div css={wrapper}>
      <div onClick={togglePicker}>
        <img
          style={{ borderRadius: '4px', width: 28, height: 28 }}
          src={ColorWheelIcon}
          alt="Color Wheel"
        />
      </div>
      {showPicker && (
        <div style={{ position: 'absolute', zIndex: 999 }}>
          <div
            style={{
              position: 'fixed',
              top: '0px',
              right: '0px',
              bottom: '0px',
              left: '0px',
            }}
            onClick={togglePicker}
          />
          <SketchPicker
            color={color}
            disableAlpha={true} // This will remove the opacity slider
            onChangeComplete={handleColorChange}
            presetColors={[]} // Pass an empty array to remove preset colors
          />
        </div>
      )}
    </div>
  );
};
