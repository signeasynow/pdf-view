/** @jsxImportSource @emotion/react */
import { css } from '@emotion/react';

export const Icon = ({ src, alt, size, onClick }) => {
	let newSize = 28;
	if (size === 'sm') {
		newSize = 8;
	}
	return (
		<img onClick={onClick} css={css({ width: newSize, height: newSize, cursor: 'pointer', display: 'flex' })} src={src} alt={alt} />
	);
};