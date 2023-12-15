/** @jsxImportSource @emotion/react */
import { css } from '@emotion/react';
import AccessibleButton from './AccessibleButton';

const rangeStyle = css`
  -webkit-appearance: none; /* Override default CSS styles */
  appearance: none;
  width: 100%; /* Full width */
  height: 4px; /* Specified height */
  border-radius: 5px;   
  background: #3183c8; /* Grey background */
  outline: none; /* Remove outline */
  opacity: 0.7; /* Set transparency (it will look lighter) */
  -webkit-transition: .2s; /* 0.2 seconds transition on hover */
  transition: opacity .2s;

  /* For thumb of the slider */
  ::-webkit-slider-thumb {
    -webkit-appearance: none; /* Override default look */
    appearance: none;
    width: 20px; /* Set a specific slider handle width */
    height: 20px; /* Slider handle height */
    background: #3183c8; /* blue background */
    cursor: pointer; /* Cursor on hover */
    border-radius: 50%; 
  }

  /* For thumb of the slider in Firefox */
  ::-moz-range-thumb {
    width: 20px; /* Set a specific slider handle width */
    height: 20px; /* Slider handle height */
    background: #3183c8; /* blue background */
    cursor: pointer; /* Cursor on hover */
    border-radius: 50%; 
  }
`;

const rangeWrapperStyle = css`
  display: flex;
  font-size: 20px;
  align-items: center;
`;

const minusStyle = css`
 font-size: 12px;
 font-weight: 600;
 margin-right: 4px;
`;

const plusStyle = css`
  margin-left: 4px;
`;


const Slider = ({ value, onChange }) => (
	<div css={rangeWrapperStyle}>
		<AccessibleButton
			ariaLabel="Minus"
			onClick={() => {
				onChange({
					target: {
						value: Math.max(value - 1, 0)
					}
				});
			}}
		>
			<label css={minusStyle}>—</label>
		</AccessibleButton>
		<input
			css={rangeStyle}
			value={value}
			onChange={onChange}
			type="range"
			id="scale"
			name="scale"
			min="0"
			max="10"
		/>
		<AccessibleButton
			ariaLabel="Plus"
			onClick={() => {
				onChange({
					target: {
						value: Math.min(value + 1, 10)
					}
				});
			}}
		>
			<label css={plusStyle}>+</label>
		</AccessibleButton>
	</div>
);

export default Slider;
