/** @jsxImportSource @emotion/react */
import { css } from '@emotion/react';

import { h } from 'preact';
import { Thumbnail } from './Thumbnail';

const wrapperStyle = css`
  position: relative;
`;

const ThumbnailsContainer = ({ hiddenPages, activePage, pdf, scale, onThumbnailClick, pdfProxyObj }) => {
	const numPages = pdfProxyObj?.numPages;

	if (!numPages) return (
		<div>Loading...</div>
	);

	let displayPageNum = 0; // Initialize the counter

	const thumbnails = Array.from({ length: numPages }, (_, i) => {
    const isHidden = hiddenPages.includes(i + 1);
		if (!isHidden) {
			displayPageNum++;  // Increment the counter if the thumbnail is not hidden
		}
    return (
      <Thumbnail
        hidden={isHidden}  // pass the hidden state
        activePage={activePage}
				key={i}
				pdf={pdf}
				pdfProxyObj={pdfProxyObj}
				pageNum={i + 1}
				displayPageNum={displayPageNum}
				scale={scale}
				onThumbnailClick={onThumbnailClick}
      />
    );
  });

	return (<div css={wrapperStyle}>
		{thumbnails}
	</div>);
};

export default ThumbnailsContainer;
