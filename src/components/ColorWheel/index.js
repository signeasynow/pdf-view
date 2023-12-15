/** @jsxImportSource @emotion/react */
import {  css } from '@emotion/react';
import ColorWheelIcon from '../../../assets/color-wheel.png';
import { SketchPicker } from 'react-color';
import { useState } from 'preact/hooks';

const wrapper = css`
  cursor: pointer;
  display: flex;
  border-radius: 8px;
  margin-right: 8px;
  position: relative;
  &:hover {
    background-color: #e7e7e7;
  }
`;

export const ColorWheel = ({
	onChooseColor,
	annotationColor,
	setAnnotationColor
}) => {
	const [showPicker, setShowPicker] = useState(false);

	const handleColorChange = (color) => {
		setAnnotationColor(color.hex);
		if (onChooseColor) {
			onChooseColor(color.hex);
		}
	};

	const togglePicker = () => {
		setShowPicker(!showPicker);
	};

	return (
		<div css={wrapper}>
			<img
				onClick={togglePicker}
				style={{ borderRadius: '4px', width: 32, height: 32 }}
				src={ColorWheelIcon}
				alt="Color Wheel"
			/>
			{showPicker && (
				<div style={{ position: 'absolute', zIndex: 99999, top: 40 }}>
					<div
						style={{
							position: 'fixed',
							top: '0px',
							right: '0px',
							bottom: '0px',
							left: '0px'
						}}
						onClick={togglePicker}
					/>
					<SketchPicker
						color={annotationColor}
						disableAlpha // This will remove the opacity slider
						onChangeComplete={handleColorChange}
						presetColors={[]} // Pass an empty array to remove preset colors
					/>
				</div>
			)}
		</div>
	);
};
