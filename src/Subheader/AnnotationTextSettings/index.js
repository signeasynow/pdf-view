/** @jsxImportSource @emotion/react */
import { css } from '@emotion/react';
import { useTranslation } from 'react-i18next';
import { ColorWheel } from '../../components/ColorWheel';
import FontSizeInput from '../../Header/FontSizeInput';
import FontFamilyInput from '../../Header/FontFamilyInput';
import FontBoldInput from '../FontBoldInput';
import FontItalicInput from '../FontItalicInput';
import * as pdfjs from 'pdfjs-dist';

const AnnotationTextSettings = ({
	annotationColor,
	setAnnotationColor,
	handleChooseColor,
	fontSizeValue,
	setFontSizeValue,
	editableAnnotationId,
	onUpdateFontSize,
	pdfViewerRef,
	fontFamilyValue,
	setFontFamilyValue,
	onUpdateFontFamily,
	fontWeightBold,
	onUpdateFontWeight,
	onUpdateFontItalic,
	fontItalic,
	annotationMode
}) => {

	if (annotationMode !== pdfjs.AnnotationEditorType.FREETEXT &&
		  annotationMode !== pdfjs.AnnotationEditorType.TEXTEDIT) {
		return;
	}
  
	return (
		<>
			<ColorWheel
				annotationColor={annotationColor}
				setAnnotationColor={setAnnotationColor}
				onChooseColor={handleChooseColor}
			/>
			<FontSizeInput
				fontSizeValue={fontSizeValue}
				setFontSizeValue={setFontSizeValue}
				editableAnnotationId={editableAnnotationId}
				onUpdateFontSize={onUpdateFontSize}
				pdfViewerRef={pdfViewerRef}
			/>
			<FontFamilyInput
				fontFamilyValue={fontFamilyValue}
				setFontFamilyValue={setFontFamilyValue}
				editableAnnotationId={editableAnnotationId}
				onUpdateFontFamily={onUpdateFontFamily} pdfViewerRef={pdfViewerRef}
			/>
			<FontBoldInput
				onUpdateFontWeight={onUpdateFontWeight}
				fontWeightBold={fontWeightBold}
				pdfViewerRef={pdfViewerRef}
			/>
			<FontItalicInput
				onUpdateFontItalic={onUpdateFontItalic}
				fontItalic={fontItalic}
			/>
		</>
	);
};

export default AnnotationTextSettings;

// <img src={fullSignature}/>