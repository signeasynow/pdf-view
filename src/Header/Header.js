/** @jsxImportSource @emotion/react */
import { css } from '@emotion/react';

import 'pdfjs-dist/web/pdf_viewer.css';
import Hand from '../../assets/hand-svgrepo-com.svg';
import Search from '../../assets/search-svgrepo-com.svg';
import Hamburger from '../../assets/hamburger-md-svgrepo-com.svg';
import Comment from '../../assets/comment-svgrepo-com.svg';
import Panel from '../../assets/panel-left-svgrepo-com.svg';
import Download from '../../assets/download-svgrepo-com.svg';
import ZoomSection from './ZoomSection';
import ControlsSection from './ControlsSection';
import HeaderBtn from './HeaderBtn';

const VerticalDivider = () => (
	<div css={css`
    width: 1px;
    background-color: #ccc;
    margin: 12px 12px;
  `}
	/>
);

const Wrapper = ({ children }) => (
	<div css={css({
		display: 'flex',
		background: 'white',
		height: 50,
		margin: '0 12px',
		justifyContent: 'space-between'
	})}
	>
		{children}
	</div>
);

const contentLeftStyle = css`
	display: flex;
`;

const Header = ({
	appRef,
	pdfProxyObj,
	pdfViewerObj,
	onSearch,
	onPanel,
	onDownload,
	leftPanelEnabled,
	eventBusRef,
	viewerContainerRef
}) =>

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

	(
		<Wrapper>
			<div css={contentLeftStyle}>
				{

					/*
					<HeaderBtn title="Menu" iconAlt="Menu" icon={Hamburger} />
				
				*/
				}
				<HeaderBtn onClick={onDownload} title="Download" iconAlt="Download" icon={Download} />
				<VerticalDivider />
				<HeaderBtn onClick={onPanel} title="Panel" iconAlt="Panel" icon={Panel} />
				<ControlsSection
					eventBusRef={eventBusRef}
					pdfViewerObj={pdfViewerObj}
				/>
				<VerticalDivider />
				<ZoomSection
					leftPanelEnabled={leftPanelEnabled}
					pdfProxyObj={pdfProxyObj}
					appRef={appRef}
					viewerContainerRef={viewerContainerRef}
					pdfViewerObj={pdfViewerObj}
				/>
			</div>
			

			{

				/*
				<HeaderBtn onClick={onPanel} title="Pan" iconAlt="Pan" icon={Hand} />
        <select>
        <option>View</option>
        <option>Annotate</option>
      </select>
      */
			}
			<HeaderBtn onClick={onSearch} title="Search" iconAlt="Search" icon={Search} />
			{

				/*
				<HeaderBtn title="Comments" iconAlt="Comments" icon={Comment} />
				*/
			}
		</Wrapper>
	)
;

export default Header;