/** @jsxImportSource @emotion/react */
import { css } from '@emotion/react';
import { useAnnotations } from '../../hooks/useAnnotations';

const wrapper = css`
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

const emptyWrapper = css`
  width: 140px;
  text-align: center;
  padding: 4px;
  margin-right: 8px;
  border-radius: 4px;
`

const overlayMap = {
  Sign: "signature",
  Name: "name",
  Date: "date",
  Email: "email"
}

export const GoToNextTag = ({
  pdf
}) => {

  const { annotations } = useAnnotations();

  const nextAnnotation = () => {
    // Filter annotations for those with name 'stampEditor' and having overlayText
    const clickableAnnotations = annotations.filter(annotation => 
        annotation.name === 'stampEditor' && annotation.overlayText
    );

    // Sort annotations by pageNumber to find the next one
    clickableAnnotations.sort((a, b) => a.pageNumber - b.pageNumber);

    // Assuming you want to find the first annotation in the sorted array
    return clickableAnnotations[0];
  }

  const nextAnnotationType = () => {
    const annotation = nextAnnotation();
    if (!annotation) {
      return;
    }

    return `Go to ${overlayMap[annotation.overlayText]}`;
  }


  const onClick = () => {
    // console.log(annotations, 'annot33')
      const annotation = nextAnnotation();
      if (annotation) {
          // console.log(annotation, 'nextAnnotation');
          pdf.scrollPageIntoView({
              pageNumber: annotation.pageNumber
          });
      } else {
          console.log('No next annotation found');
      }
  }

  return (
    <div onClick={onClick} css={nextAnnotation() ? wrapper : emptyWrapper}>
      {nextAnnotationType()}
    </div>
  );
};

export default GoToNextTag;
