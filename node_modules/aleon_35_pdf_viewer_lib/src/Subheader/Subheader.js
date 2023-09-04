/** @jsxImportSource @emotion/react */
import { css } from '@emotion/react';

import 'pdfjs-dist/web/pdf_viewer.css';
import HeaderBtn from './HeaderBtn';
import Redo from '../../assets/arrow-undo-down-right-svgrepo-com.svg';
import Undo from '../../assets/arrow-undo-up-left-svgrepo-com.svg';
import Trash from '../../assets/trash-svgrepo-com.svg';
import { useTranslation } from 'react-i18next';

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
	onDelete,
	undoLastAction,
	redoLastAction
}) => {

	const { t } = useTranslation();
	return (
		<Wrapper>
			<div css={contentLeftStyle}>
			<>
				<HeaderBtn onClick={undoLastAction} title={t("undo")} iconAlt={t("undo")} icon={Undo} />
				<HeaderBtn onClick={redoLastAction} title={t("redo")} iconAlt={t("redo")} icon={Redo} />
				<HeaderBtn onClick={onDelete} title={t("remove")} iconAlt={t("remove")} icon={Trash} />
			</>
			</div>
		</Wrapper>
	)
}

export default Subheader;