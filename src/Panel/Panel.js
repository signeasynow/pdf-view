/** @jsxImportSource @emotion/react */
import { css } from '@emotion/react';

import 'pdfjs-dist/web/pdf_viewer.css';
import ThumbnailsContainer from '../Thumbnails';
// import Pan from "./assets/pan.svg";
import { useState } from 'preact/hooks';
import { Tooltip } from '../SharedComponents/Tooltip';
import { Icon } from '../SharedComponents/Icon';
import Bookmark from '../../assets/bookmark-svgrepo-com.svg';
import ThumbnailsIcon from '../../assets/pages-svgrepo-com.svg';
import ThumbnailsSection from './ThumbnailsSection';
import BookmarksSection from './BookmarksSection';

const optionsWrapper = css`
  display: flex;
`
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

  const [activeTab, setActiveTab] = useState(0);

  return (
    <div css={showPanel ? visibleSearchWrapper : invisibleSearchWrapper}>
      <div css={optionsWrapper}>
        <Tooltip title="Thumbnails">
          <Icon onClick={() => setActiveTab(0)} src={ThumbnailsIcon} alt="Menu" />
        </Tooltip>
        <Tooltip title="Bookmarks">
          <Icon onClick={() => setActiveTab(1)} src={Bookmark} alt="Menu" />
        </Tooltip>
      </div>
      {
        activeTab === 0 && (
          <ThumbnailsSection
            setActivePage={setActivePage}
            activePage={activePage}
            pdf={pdf}
            pdfProxyObj={pdfProxyObj}
          />
        )
      }
      {
        activeTab === 1 && (
          <BookmarksSection />
        )
      }
    </div>
  );
};

export default Panel;