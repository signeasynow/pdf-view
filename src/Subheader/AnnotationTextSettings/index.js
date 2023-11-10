/** @jsxImportSource @emotion/react */
import { css } from '@emotion/react';
import { useTranslation } from 'react-i18next';
import { ColorWheel } from '../../components/ColorWheel';
import FontSizeInput from '../../Header/FontSizeInput';
import FontFamilyInput from '../../Header/FontFamilyInput';

const AnnotationTextSettings = ({
  activeToolbarItem,
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

}) => {

	const { t } = useTranslation();

  if (activeToolbarItem !== "text") {
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
        onUpdateFontSize={onUpdateFontSize} pdfViewerRef={pdfViewerRef}
      />
      <FontFamilyInput
        fontFamilyValue={fontFamilyValue}
        setFontFamilyValue={setFontFamilyValue}
        editableAnnotationId={editableAnnotationId}
        onUpdateFontFamily={onUpdateFontFamily} pdfViewerRef={pdfViewerRef}
      />
    </>
	);
};

export default AnnotationTextSettings;

// <img src={fullSignature}/>