/** @jsxImportSource @emotion/react */
import { css } from '@emotion/react';
import { useAnnotations } from '../../hooks/useAnnotations';
import { useCallback } from 'preact/hooks';
import { useTranslation } from 'react-i18next';

const wrapper = css`
	color: white;
  width: 140px;
  text-align: center;
  background: #437baf;
  padding: 4px;
  margin-right: 8px;
  border-radius: 4px;
  cursor: pointer;
  box-shadow: 0px 4px 8px rgba(0, 0, 0, 0.25);
`;

const doneWrapper = css`
  color: white;
  width: 140px;
  text-align: center;
  background: #008200;
  padding: 4px;
  margin-right: 8px;
  border-radius: 4px;
  cursor: pointer;
  box-shadow: 0px 4px 8px rgba(0, 0, 0, 0.25);
`;

const overlayMap = {
	Sign: 'signature',
	Name: 'name',
	Date: 'date',
	Email: 'email'
};

export const GoToNextTag = ({
	pdf
}) => {

	const { annotations } = useAnnotations();

	const { t } = useTranslation();

	const nextAnnotation = useCallback(() => {
		// Filter annotations for those with name 'stampEditor' and having overlayText
		const clickableAnnotations = annotations.filter(annotation =>
			annotation.name === 'stampEditor' && annotation.overlayText && !annotation.isAutoFill
		);

		// Sort annotations by pageNumber to find the next one
		clickableAnnotations.sort((a, b) => {
			if (a.pageNumber === b.pageNumber) {
				return a.y - b.y; // For same page, sort by y value (vertical position)
			}
			return a.pageNumber - b.pageNumber; // Otherwise, sort by page number
		});
		// Assuming you want to find the first annotation in the sorted array
		return clickableAnnotations[0];
	}, [annotations]);

	const nextAnnotationType = () => {
		const annotation = nextAnnotation();
		if (!annotation) {
			return t("save-and-finish");
		}

		return `${t("go-to")} ${t(overlayMap[annotation.overlayText])}`;
	};

	const isDone = () => !nextAnnotation();

	const onSaveAndFinish = () => {
		window.parent.postMessage({ type: 'finish-signing' });
		// audit
		// propagate to the iFrame parent who will handle the UI
	};

	const onClick = () => {
		// console.log(annotations, 'annot33')
		const annotation = nextAnnotation();
		if (annotation) {
			// console.log(annotation, 'nextAnnotation');
			pdf.scrollPageIntoView({
				pageNumber: annotation.pageNumber
			});
		}
		else {
			onSaveAndFinish();
		}
	};

	if (!nextAnnotation()) {
		return null;
	}

	return (
		<div onClick={onClick} css={isDone() ? doneWrapper : wrapper}>
			{nextAnnotationType()}
		</div>
	);
};

export default GoToNextTag;
