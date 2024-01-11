/** @jsxImportSource @emotion/react */
import { css } from '@emotion/react';
import { useTranslation } from 'react-i18next';
import { Tooltip } from 'alien35_pdf_ui_lib_2';
import { AnnotationEditorParamsType } from 'pdfjs-dist/build/pdf';

const FontBoldInput = ({
	onUpdateFontWeight,
	fontWeightBold,
	pdfViewerRef
}) => {

	const { t } = useTranslation();

	const textStyle = css`
    font-size: 24px;
    font-weight: 600;
    margin-left: 8px;
    cursor: pointer;
		width: 20px;
		text-align: center;
    color: ${fontWeightBold ? 'blue' : '#bebfbf'};
  `;

	const onClick = () => {
		onUpdateFontWeight();
	}

	return (
		<Tooltip title={"Bold"}>
			<div css={textStyle} onClick={onClick} style={{
				fontSize: 24,
				fontWeight: 600,
				marginLeft: 8,
				cursor: "pointer"
			}}>B</div>
		</Tooltip>
  )
};

export default FontBoldInput;
