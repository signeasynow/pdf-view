/** @jsxImportSource @emotion/react */
import { css } from '@emotion/react';

import 'pdfjs-dist/web/pdf_viewer.css';
import ThumbnailsContainer from './Thumbnails';
// import Pan from "./assets/pan.svg";

const visibleSearchWrapper = css`
  background: green;
  width: 400px;
`

const invisibleSearchWrapper = css`
  background: orange;
  display: none;
`

const Panel = ({
  showPanel,
  pdf
}) => {

  return (
    <div css={showPanel ? visibleSearchWrapper : invisibleSearchWrapper}>
      <ThumbnailsContainer pdf={pdf} scale={1} onThumbnailClick={() => {}} />
    </div>
  );
};

export default Panel;