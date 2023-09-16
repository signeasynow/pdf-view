/** @jsxImportSource @emotion/react */
import { css } from '@emotion/react';
import Redo from '../../assets/arrow-undo-down-right-svgrepo-com.svg';
import Undo from '../../assets/arrow-undo-up-left-svgrepo-com.svg';
import Minimize from '../../assets/minimize-svgrepo-com.svg';
import RemoveSelection from '../../assets/notification-remove-svgrepo-com.svg';
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
	canDelete,
	undoStackLength,
	redoStackLength,
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

	const getSelectionsCount = () => {
		const { length } = multiPageSelections;
		if (length > 99) {
			return "99+"
		}
		return length;
	}

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
							<AccessibleButton
								onClick={() => setMultiPageSelections([])} 
								ariaLabel={t("redo")}
							>
								<HeaderBtn title={"Clear selection"} iconAlt={t("redo")} icon={RemoveSelection} />
							</AccessibleButton>
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
						<HeaderBtn
							style={{opacity: undoStackLength ? 1 : 0.5}}
							title={t("undo")} iconAlt={t("undo")} icon={Undo} />
					</AccessibleButton>
					<AccessibleButton
						onClick={redoLastAction} 
						ariaLabel={t("redo")}
					>
						<HeaderBtn
							style={{opacity: redoStackLength ? 1 : 0.5}}
							title={t("redo")} iconAlt={t("redo")} icon={Redo} />
					</AccessibleButton>
					<div style={{position: "relative"}}>
						<AccessibleButton
							onClick={onDelete} 
							ariaLabel={t("redo")}
						>
							<HeaderBtn style={{opacity: canDelete ? 1 : 0.5}} title={t("remove")} iconAlt={t("remove")} icon={Trash} />
							{
								!!multiPageSelections?.length && (
									<div style={{
										position: "absolute",
										bottom: 0,
										color: "white",
										fontFamily: "Lato",
										right: 0,
										pointerEvents: "none",
										height: 12,
										minWidth: 12,
										background: "#f96804",
										fontSize: 12,
										padding: 2,
										display: "flex",
										alignItems: "center",
										justifyContent: "center",
										borderRadius: "8px"
									}}>{getSelectionsCount()}</div>
								)
							}
							
						</AccessibleButton>
					</div>
				</>
			</div>
		</Wrapper>
	)
}

export default Subheader;