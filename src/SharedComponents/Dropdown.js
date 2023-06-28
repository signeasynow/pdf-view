/** @jsxImportSource @emotion/react */
import { css } from '@emotion/react';

import onClickOutside from 'react-onclickoutside';
import { useEffect, useRef, useState } from 'preact/hooks';
import Select from 'react-select';

const options = [
  { value: 'option1', label: 'Option 1' },
  { value: 'option2', label: 'Option 2' },
  // Add more options as needed
];

const dropdown = css`
  position: relative;
  display: inline-block;
`;

const dropdownContent = css`
  display: none;
  position: absolute;
  background-color: #f9f9f9;
  min-width: 160px;
  box-shadow: 0px 8px 16px 0px rgba(0,0,0,0.2);
  padding: 12px 16px;
  z-index: 1;
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
  }
}

const Dropdown = ({ title, child }) => {
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
    setIsOpen,
  ));

  return (
    <div style="z-index:9999" ref={dropdownRef}>
      <div onClick={() => setIsOpen(!isOpen)}>
        {title}
        <div onClick={childClick} css={isOpen ? dropdownVisible : dropdownContent}>
          {child}
        </div>
      </div>
    </div>
  );
};

export default Dropdown;