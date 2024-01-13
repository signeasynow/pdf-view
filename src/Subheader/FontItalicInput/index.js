/** @jsxImportSource @emotion/react */
import { css } from '@emotion/react';
import { useTranslation } from 'react-i18next';
import { Tooltip } from 'alien35_pdf_ui_lib_2';

const FontItalicInput = ({
	onUpdateFontItalic,
	fontItalic
}) => {

	const { t } = useTranslation();

	const textStyle = css`
    font-size: 24px;
		font-family: serif;
    margin-left: 8px;
    cursor: pointer;
		font-style: italic;
		width: 20px;
		text-align: center;
    color: ${fontItalic ? 'blue' : '#bebfbf'};
  `;

	return (
		<Tooltip title={t("Italic")}>
			<div css={textStyle} onClick={onUpdateFontItalic} style={{
				fontSize: 24,
				fontWeight: 600,
				marginLeft: 8,
				cursor: "pointer"
			}}>I</div>
		</Tooltip>
  )
};

export default FontItalicInput;
