/** @jsxImportSource @emotion/react */
import { css } from '@emotion/react';
import Redo from '../../assets/arrow-undo-down-right-svgrepo-com.svg';
import Undo from '../../assets/arrow-undo-up-left-svgrepo-com.svg';
import Minimize from '../../assets/minimize-svgrepo-com.svg';
import RemoveSelection from '../../assets/notification-remove-svgrepo-com.svg';
import Trash from '../../assets/trash-svgrepo-com.svg';
import RotateRight from '../../assets/rotate-right-svgrepo-com.svg';
import RotateLeft from '../../assets/rotate-left-svgrepo-com.svg';
import Extract from '../../assets/gradebook-export-svgrepo-com.svg';
import { useTranslation } from 'react-i18next';
import { Button } from 'aleon_35_pdf_ui_lib';
import HeaderBtn from '../Header/HeaderBtn';
import Slider from '../components/Slider';
import { useState } from 'preact/hooks';
import AccessibleButton from '../components/AccessibleButton';
import VerticalDivider from '../components/VerticalDivider';

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
	canExtract,
	onDelete,
	tools,
	onRotate,
	undoLastAction,
	redoLastAction,
	onMinimize,
	showFullScreenThumbnails,
	setMultiPageSelections,
	multiPageSelections,
	expandedViewThumbnailScale,
	setExpandedViewThumbnailScale,
	onExtract
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
						<div style={{width: "37px"}}></div>
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
					<VerticalDivider />
					{
						tools?.editing?.includes("extract") && (
							<div style={{position: "relative"}}>
								<AccessibleButton
									onClick={onExtract} 
									ariaLabel={t("redo")}
								>
									<HeaderBtn
										style={{opacity: canExtract ? 1 : 0.3}}
										title={"Extract"} iconAlt={t("redo")} icon={Extract} />
										{
											!!multiPageSelections?.length && (
												<div style={{
													position: "absolute",
													bottom: 0,
													color: "white",
													fontFamily: "Lato",
													left: 0,
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
						)
					}
					{
						tools?.editing?.includes("rotation") && (
							<div style={{
								display: "flex",
								border: !!multiPageSelections?.length ? "1px solid #f96804" : "1px solid transparent",
								background: !!multiPageSelections?.length ? "#f6f6f6" : "",
								borderRadius: "10px"
							}}>
								<div style={{position: "relative"}}>
									<AccessibleButton
										onClick={() => onRotate(false)} 
										ariaLabel={t("redo")}
									>
										<HeaderBtn offsetX="-20px" style={{opacity: canDelete ? 1 : 0.5}} title={"Rotate counterclockwise"} iconAlt={t("remove")} icon={RotateLeft} />
										{
											!!multiPageSelections?.length && (
												<div style={{
													position: "absolute",
													bottom: 0,
													color: "white",
													fontFamily: "Lato",
													left: 0,
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
								<div style={{position: "relative"}}>
									<AccessibleButton
										onClick={() => onRotate(true)} 
										ariaLabel={t("redo")}
									>
										<HeaderBtn offsetX="-30px" style={{opacity: canDelete ? 1 : 0.5}} title={"Rotate clockwise"} iconAlt={t("remove")} icon={RotateRight} />
									</AccessibleButton>
								</div>
							</div>
						)
					}
					{
						tools?.editing?.includes("remove") && (
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
												bottom: 4,
												color: "white",
												fontFamily: "Lato",
												left: 0,
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
						)
					}
				</>
			</div>
		</Wrapper>
	)
}

export default Subheader;