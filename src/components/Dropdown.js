/** @jsxImportSource @emotion/react */
import { css } from '@emotion/react';

import { useEffect, useRef, useState } from 'preact/hooks';
const dropdownContent = css`
  display: none;
  position: absolute;
  background-color: #f9f9f9;
  max-height: 200px; /* Set max-height to 200px */
  overflow-y: scroll; /* Force scrollbar */
  box-shadow: 0px 8px 16px 0px rgba(0,0,0,0.2);
  z-index: 1;

	&::-webkit-scrollbar {
    -webkit-appearance: none;
    width: 7px;
  }

  &::-webkit-scrollbar-thumb {
    border-radius: 4px;
    background-color: rgba(0,0,0,.5);
    box-shadow: 0 0 1px rgba(255,255,255,.5);
  }
`;

const styleRefresh = css`
  padding: 0;
  margin: 0;
  border: none;
  box-sizing: border-box;
  display: flex;
`;

const dropdownVisible = css`
  ${dropdownContent};
  display: block;
`;

function listenForOutsideClicks(listening, setListening, menuRef, setIsOpen) {
	return () => {
		if (listening) return;
		if (!menuRef.current) return;
		setListening(true);
		[`click`, `touchstart`].forEach((type) => {
			document.addEventListener(`click`, (evt) => {
				if (menuRef.current.contains(evt.target)) return;
				setIsOpen(false);
			});
		});
	};
}

const Dropdown = ({ title, child, marginTop, width = 160 }) => {
	const [isOpen, setIsOpen] = useState(false);

	const childClick = (e) => {
		e.stopPropagation();
		setIsOpen(false);
		// perform the action for child click
	};

	const [listening, setListening] = useState(false);

	const dropdownRef = useRef(null);

	useEffect(listenForOutsideClicks(
		listening,
		setListening,
		dropdownRef,
		setIsOpen
	));

	return (
		<div style="z-index:9999" css={styleRefresh} ref={dropdownRef}>
			<div css={styleRefresh} onClick={() => setIsOpen(!isOpen)}>
				{title}
				<div onClick={childClick} css={isOpen ? dropdownVisible : dropdownContent} style={{
					marginTop: marginTop || 48,
					minWidth: width
				}}
				>
					{child}
				</div>
			</div>
		</div>
	);
};

export default Dropdown;
