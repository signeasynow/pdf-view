/** @jsxImportSource @emotion/react */
import { css } from '@emotion/react';

import ChevronDown from '../../../assets/chevron-down-svgrepo-com.svg';
import Dropdown from '../../components/Dropdown';
import { useRef } from 'preact/hooks';
import { Icon } from 'alien35_pdf_ui_lib_2';
import { useTranslation } from 'react-i18next';
import { AnnotationEditorParamsType } from 'pdfjs-dist/build/pdf';
import { useDebounce } from '../../utils/useDebounce';

const inputStyles = css`
  font-size: 16px;
  height: 32px;
  border: none;
  font-weight: 600;
  color: #5b5b5b;
  background: transparent;
  width: 72px;
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
		value: 'courier',
		label: 'Courier'
	},
	{
		value: 'helvetica',
		label: 'Helvetica'
	},
	{
		value: 'timesroman',
		label: 'Times New Roman'
	}
];

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
		setFontFamilyValue(v);
		// console.log(pdfViewerRef.current, 'pdfViewerRef.current')
		pdfViewerRef.current.annotationEditorParams = {
			type: AnnotationEditorParamsType.FREETEXT_FONT,
			value: v.value
		};
		onUpdateFontFamily(v.value);
	};

	return (
		<div css={wrapper}>
			<div css={innerWrapper}>
				<Dropdown
					width={100}
					marginTop={28}
					title={
						<div css={dropdownTitle}>
							<input disabled value={fontFamilyValue.label} css={inputStyles} ref={fontSizeTextRef} onChange={onChangeFontSizeByText} type="text" />
							<Icon size="sm" src={ChevronDown} alt={t('arrowDown')} />
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