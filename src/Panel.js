/** @jsxImportSource @emotion/react */
import { css } from '@emotion/react';

import 'pdfjs-dist/web/pdf_viewer.css';
import ThumbnailsContainer from './Thumbnails';
// import Pan from "./assets/pan.svg";

const visibleSearchWrapper = css`
  background: green;
  width: 400px;
  overflow: auto;
  display: flex;
  flex-direction: column;
  align-items: center;
`

const invisibleSearchWrapper = css`
  background: orange;
  display: none;
`

const Panel = ({
  showPanel,
  pdf,
  pdfProxyObj
}) => {

  return (
    <div css={showPanel ? visibleSearchWrapper : invisibleSearchWrapper}>
      <ThumbnailsContainer
        pdfProxyObj={pdfProxyObj}
        pdf={pdf}
        scale={1}
        onThumbnailClick={(num) => {
          pdf.scrollPageIntoView({
            pageNumber: num,
          });
        }}
      />
    </div>
  );
};

export default Panel;