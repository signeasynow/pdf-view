/** @jsxImportSource @emotion/react */
import { css } from '@emotion/react';
import Redo from '../../assets/arrow-undo-down-right-svgrepo-com.svg';
import Undo from '../../assets/arrow-undo-up-left-svgrepo-com.svg';
import Minimize from '../../assets/minimize-svgrepo-com.svg';
import Trash from '../../assets/trash-svgrepo-com.svg';
import RotateRight from '../../assets/rotate-right-svgrepo-com.svg';
import RotateLeft from '../../assets/rotate-left-svgrepo-com.svg';
import { useTranslation } from 'react-i18next';
import { Button } from 'aleon_35_pdf_ui_lib';
import HeaderBtn from '../Header/HeaderBtn';
import Slider from '../components/Slider';
import { useState } from 'preact/hooks';
import AccessibleButton from '../components/AccessibleButton';

const Wrapper = ({ children }) => (
	<div css={css({
		display: 'flex',
		background: 'white',
		height: 50,
		alignItems: "center",
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
	onRotate,
	undoLastAction,
	redoLastAction,
	onMinimize,
	showFullScreenThumbnails,
	setMultiPageSelections,
	multiPageSelections,
	expandedViewThumbnailScale,
	setExpandedViewThumbnailScale
}) => {
	

	const { t } = useTranslation();

  const handleInputChange = (e) => {
		const num = parseInt(e.target.value);
		setExpandedViewThumbnailScale(num);
	};

	return (
		<Wrapper>
			<div css={contentLeftStyle}>
				{
					showFullScreenThumbnails && (
						<AccessibleButton
							onClick={onMinimize} 
							ariaLabel={t("minimize")}
						>
							<HeaderBtn title={t("minimize")} iconAlt={t("minimize")} icon={Minimize} />
						</AccessibleButton>
					)
				}
				{
					!!multiPageSelections?.length ? (
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
					) : (
						<div style={{width: "111px"}}></div>
					)
				}
			</div>
			{
				showFullScreenThumbnails && (
					<div style={{display: "flex", alignItems: "center"}}>
						<div>
							<Slider
								value={expandedViewThumbnailScale}
								onChange={handleInputChange}
							/>
						</div>
					</div>
				)
			}
			<div css={contentLeftStyle}>
				<>
					<AccessibleButton
						onClick={undoLastAction} 
						ariaLabel={t("undo")}
					>
						<HeaderBtn title={t("undo")} iconAlt={t("undo")} icon={Undo} />
					</AccessibleButton>
					<AccessibleButton
						onClick={redoLastAction} 
						ariaLabel={t("redo")}
					>
						<HeaderBtn title={t("redo")} iconAlt={t("redo")} icon={Redo} />
					</AccessibleButton>
					<AccessibleButton
						onClick={onDelete} 
						ariaLabel={t("redo")}
					>
						<HeaderBtn title={t("remove")} iconAlt={t("remove")} icon={Trash} />
					</AccessibleButton>
				</>
			</div>
		</Wrapper>
	)
}

export default Subheader;