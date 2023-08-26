/** @jsxImportSource @emotion/react */
import { css } from '@emotion/react';

import 'pdfjs-dist/web/pdf_viewer.css';
import Download from '../../assets/download-svgrepo-com.svg';
import HeaderBtn from './HeaderBtn';
import Redo from '../../assets/arrow-undo-down-right-svgrepo-com.svg';
import Undo from '../../assets/arrow-undo-up-left-svgrepo-com.svg';
import Trash from '../../assets/trash-svgrepo-com.svg';

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
		justifyContent: 'space-between',
		borderTop: '1px solid #ccc'
	})}
	>
		{children}
	</div>
);

const contentLeftStyle = css`
	display: flex;
`;

const Subheader = ({
	onDownload,
	onDelete,
	undoLastAction,
	redoLastAction
}) =>

	(
		<Wrapper>
			<div css={contentLeftStyle}>
			<>
				<HeaderBtn onClick={undoLastAction} title="Undo" iconAlt="undo" icon={Undo} />
				<HeaderBtn onClick={redoLastAction} title="Redo" iconAlt="redo" icon={Redo} />
				<HeaderBtn onClick={onDelete} title="Remove" iconAlt="redo" icon={Trash} />
			</>
			</div>
		</Wrapper>
	)
;

export default Subheader;