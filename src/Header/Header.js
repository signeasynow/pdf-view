/** @jsxImportSource @emotion/react */
import { css } from '@emotion/react'

import 'pdfjs-dist/web/pdf_viewer.css';
import Hand from '../../assets/hand-svgrepo-com.svg';
import Search from '../../assets/search-svgrepo-com.svg';
import Hamburger from '../../assets/hamburger-md-svgrepo-com.svg';
import Comment from '../../assets/comment-svgrepo-com.svg';
import Panel from '../../assets/panel-left-svgrepo-com.svg';
import ZoomSection from './ZoomSection';
import { Tooltip } from '../SharedComponents/Tooltip';
import ControlsSection from './ControlsSection';
import { Icon } from '../SharedComponents/Icon';
import HeaderBtn from "./HeaderBtn";

const VerticalDivider = () => (
  <div css={css`
    height: 24px;
    width: 1px;
    background-color: #ccc;
    margin: 0 12px;
  `} />
);

const Wrapper = ({ children }) => (
  <div css={css({
    display: "flex",
    background: "white",
    height: 50,
    margin: "8px 12px"
  })}>
    {children}
  </div>
)

const ZOOM_FACTOR = 0.1;

const Header = ({
  pdfViewerObj,
  onSearch,
  onPanel,
  eventBusRef,
  viewerContainerRef
}) => {

  /*
  useEffect(() => {
      const viewerContainer = viewerContainerRef.current;

      // Other setup code...

      const debouncedHandleWheel = useDebounce((event) => {
          // prevent the default zooming behavior in the browser
          event.preventDefault();
          if (event.deltaY < 0) {
              // Wheel scrolled up, zoom in
              onZoomIn();
          } else if (event.deltaY > 0) {
              // Wheel scrolled down, zoom out
              onZoomOut();
          }
      }, 50);

      viewerContainer.addEventListener('wheel', debouncedHandleWheel, { passive: false });
      return () => {
          // Cleanup - remove the event listener when the component unmounts
          viewerContainer.removeEventListener('wheel', debouncedHandleWheel);
      };
  }, []);
  */

  return (
    <Wrapper>
      <HeaderBtn title="Menu" iconAlt="Menu" icon={Hamburger} />
      <VerticalDivider />
      <Tooltip title="Panel">
        <Icon onClick={onPanel} src={Panel} alt="Panel" />
      </Tooltip>
      <ControlsSection
        eventBusRef={eventBusRef}
        pdfViewerObj={pdfViewerObj}
      />
      <VerticalDivider />
      <ZoomSection
        pdfViewerObj={pdfViewerObj}
      />
      <Tooltip title="Pan">
        <Icon src={Hand} alt="Pan" />
      </Tooltip>
      

      <select>
        <option>View</option>
        <option>Annotate</option>
      </select>
      <Tooltip title="Search">
        <Icon onClick={onSearch} src={Search} alt="Search" />
      </Tooltip>
      <Tooltip title="Comments">
        <Icon src={Comment} alt="Comments" />
      </Tooltip>
    </Wrapper>
  );
};

export default Header;