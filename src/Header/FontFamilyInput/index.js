/** @jsxImportSource @emotion/react */
import { css } from '@emotion/react';

import ChevronDown from '../../../assets/chevron-down-svgrepo-com.svg';
import Dropdown from '../../components/Dropdown';
import { useEffect, useMemo, useRef, useState } from 'preact/hooks';
import { Icon, Tooltip } from 'aleon_35_pdf_ui_lib';
import { useTranslation } from 'react-i18next';
import { AnnotationEditorParamsType } from 'pdfjs-dist/build/pdf';
import { useAnnotations } from '../../hooks/useAnnotations';
import { useDebounce } from '../../utils/useDebounce';

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
  height: 12px;
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

const families = [
  {
    value: "courier",
    label: "Courier"
  },
  {
    value: "helvetica",
    label: "Helvetica"
  }
]

const FontFamilyInput = ({
  pdfViewerRef,
  onUpdateFontFamily,
  fontFamilyValue,
	setFontFamilyValue
}) => {

	const { t } = useTranslation();
  
	const fontSizeTextRef = useRef(families[1]);

	const _onChangeFontSizeByText = (e) => {

	};

	const onChangeFontSizeByText = useDebounce(_onChangeFontSizeByText, 5);

  const onSelectValue = (v) => {
    console.log(v, 'v bro')
    setFontFamilyValue(v);
    // console.log(pdfViewerRef.current, 'pdfViewerRef.current')
    pdfViewerRef.current.annotationEditorParams = {
			type: AnnotationEditorParamsType.FREETEXT_FONT,
			value: v.value
		}
    onUpdateFontFamily(v.value);
  }

	return (
		<div css={wrapper}>
			<div css={innerWrapper}>
				<input value={fontFamilyValue.label} css={inputStyles} ref={fontSizeTextRef} onChange={onChangeFontSizeByText} type="text" />
				<Dropdown
					width={100}
					marginTop={28}
					title={
						<div css={dropdownTitle}>
							<Icon size="sm" src={ChevronDown} alt={t("arrowDown")} />
						</div>
					}
					child={<div css={childStyle}>
            {
              families.map((e) => (
                <div key={e.value} css={zoomOptionStyle} onClick={() => onSelectValue(e)}>{e.label}</div>
              ))
            }
					</div>}
				/>
			</div>
		</div>
	);
};

export default FontFamilyInput;