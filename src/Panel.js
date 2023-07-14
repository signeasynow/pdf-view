/** @jsxImportSource @emotion/react */
import { css } from '@emotion/react';

import 'pdfjs-dist/web/pdf_viewer.css';
import ThumbnailsContainer from './Thumbnails';
// import Pan from "./assets/pan.svg";
import { useState } from 'preact/hooks';
import { Tooltip } from './SharedComponents/Tooltip';
import { Icon } from './SharedComponents/Icon';
import Hamburger from '../assets/hamburger-md-svgrepo-com.svg';

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
  setActivePage,
  activePage,
  pdf,
  pdfProxyObj
}) => {

  const [thumbnailScale, setThumbnailScale] = useState(2)

  return (
    <div css={showPanel ? visibleSearchWrapper : invisibleSearchWrapper}>
      <Tooltip title="Thumbnails">
        <Icon src={Hamburger} alt="Menu" />
      </Tooltip>
      <Tooltip title="Bookmarks">
        <div>book</div>
      </Tooltip>
      <input value={thumbnailScale} onChange={(e) => {
        const num = parseInt(e.target.value);
        setThumbnailScale(num);
      }} type="range" id="scale" name="scale"
         min="0" max="10" />
      <ThumbnailsContainer
        activePage={activePage}
        pdfProxyObj={pdfProxyObj}
        pdf={pdf}
        scale={thumbnailScale / 10}
        onThumbnailClick={(num) => {
          setActivePage(num);
          pdf.scrollPageIntoView({
            pageNumber: num,
          });
        }}
      />
    </div>
  );
};

export default Panel;