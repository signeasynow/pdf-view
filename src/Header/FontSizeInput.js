/** @jsxImportSource @emotion/react */
import { css } from '@emotion/react';

import ChevronDown from '../../assets/chevron-down-svgrepo-com.svg';
import Dropdown from '../components/Dropdown';
import { useDebounce } from '../utils/useDebounce';
import { useEffect, useMemo, useRef, useState } from 'preact/hooks';
import { Icon, Tooltip } from 'alien35_pdf_ui_lib_2';
import { useTranslation } from 'react-i18next';
import { AnnotationEditorParamsType } from 'pdfjs-dist/build/pdf';

function generateNumbers() {
	let numbers = [];

	// Numbers from 1 to 20
	for (let i = 1; i <= 20; i++) {
		numbers.push(i);
	}

	// Every second number from 20 to 48
	for (let i = 22; i <= 48; i += 2) {
		numbers.push(i);
	}

	// Every fourth number from 48 to 128
	for (let i = 52; i <= 128; i += 4) {
		numbers.push(i);
	}

	return numbers;
}

const inputStyles = css`
  font-size: 16px;
  height: 32px;
  border: none;
  font-weight: 600;
  color: #5b5b5b;
  background: transparent;
  width: 28px;
  text-align: right; // This line was added
  &:focus {
    outline: none;
  }
`;

const wrapper = css`
  display: flex;
  align-items: center;
  font-weight: 600;
  margin-right: 8px;
`;

const innerWrapper = css`
  background: #f3f3f3;
  display: flex;
  align-items: center;
  padding: 2px 8px;
  border-radius: 4px;
`;

const dropdownTitle = css`
  display: flex;
  align-items: center;
  cursor: pointer;
  margin-right: 12px;
`;

const percentStyle = css`
  margin-right: 8px;
  color: #5b5b5b;
`;

const childStyle = css`
  margin: 8px 0;
`; // padding: 12px 16px;

const zoomOptionStyle = css`
  padding: 4px 16px;
  cursor: pointer;
  &:hover {
    background-color: #e7e7e7;
  }
`;

const FontSizeInput = ({
	pdfViewerRef,
	onUpdateFontSize,
	fontSizeValue,
	setFontSizeValue
}) => {

	const { t } = useTranslation();
  
	const fontSizeTextRef = useRef(fontSizeValue);

	const _onChangeFontSizeByText = (e) => {

	};

	const onChangeFontSizeByText = useDebounce(_onChangeFontSizeByText, 5);

	const onSelectValue = (v) => {
		setFontSizeValue(v);
		pdfViewerRef.current.annotationEditorParams = {
			type: AnnotationEditorParamsType.FREETEXT_SIZE,
			value: v
		};
		onUpdateFontSize(v);
	};

	const getNumbers = useMemo(generateNumbers, []);

	return (
		<div css={wrapper}>
			<div css={innerWrapper}>
				<Dropdown
					width={100}
					marginTop={28}
					title={
						<div css={dropdownTitle}>
							<input disabled value={fontSizeValue} css={inputStyles} ref={fontSizeTextRef} onChange={onChangeFontSizeByText} type="text" />
							<div css={percentStyle}>pt</div>
							<Icon size="sm" src={ChevronDown} alt={t('arrowDown')} />
						</div>
					}
					child={<div css={childStyle}>
						{
							getNumbers.map((e) => (
								<div key={e} css={zoomOptionStyle} onClick={() => onSelectValue(e)}>{e}pt</div>
							))
						}
					</div>}
				/>
			</div>
		</div>
	);
};

export default FontSizeInput;