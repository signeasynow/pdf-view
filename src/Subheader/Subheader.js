/** @jsxImportSource @emotion/react */
import { css } from '@emotion/react';
import HeaderBtn from './HeaderBtn';
import Redo from '../../assets/arrow-undo-down-right-svgrepo-com.svg';
import Undo from '../../assets/arrow-undo-up-left-svgrepo-com.svg';
import Minimize from '../../assets/minimize-svgrepo-com.svg';
import Trash from '../../assets/trash-svgrepo-com.svg';
import { useTranslation } from 'react-i18next';
import { Button } from 'aleon_35_pdf_ui_lib';

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
	redoLastAction,
	onMinimize,
	showFullScreenThumbnails,
	setMultiPageSelections,
	multiPageSelections
}) => {

	const { t } = useTranslation();
	return (
		<Wrapper>
			<div css={contentLeftStyle}>
				{
					showFullScreenThumbnails && (
						<div>
							<HeaderBtn onClick={onMinimize} title={t("minimize")} iconAlt={t("minimize")} icon={Minimize} />
						</div>
					)
				}
				{
					!!multiPageSelections?.length && (
						<div style={{
							display: "flex",
							alignItems: "center"
						}}>
							<button
							  onClick={() => {
									setMultiPageSelections([]);
								}}
							  style={{
								cursor: "pointer",
								border: "2px solid #7f7f7f",
								color: "#7f7f7f",
								borderRadius: "4px",
								fontWeight: "600",
								background: "none"
							}}>
								Clear selection
							</button>
						</div>
					)
				}
			</div>
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