/** @jsxImportSource @emotion/react */
import { css } from '@emotion/react';
import Redo from '../../assets/arrow-undo-down-right-svgrepo-com.svg';
import Undo from '../../assets/arrow-undo-up-left-svgrepo-com.svg';
import Minimize from '../../assets/minimize-svgrepo-com.svg';
import RemoveSelection from '../../assets/notification-remove-svgrepo-com.svg';
import TextIcon from '../../assets/text-svgrepo-com.svg';
import Trash from '../../assets/trash-svgrepo-com.svg';
import RotateRight from '../../assets/rotate-right-svgrepo-com.svg';
import RotateLeft from '../../assets/rotate-left-svgrepo-com.svg';
import Extract from '../../assets/gradebook-export-svgrepo-com.svg';
import { useTranslation } from 'react-i18next';
import HeaderBtn, { MySVGIcon } from '../Header/HeaderBtn';
import Slider from '../components/Slider';
import { useState } from 'preact/hooks';
import AccessibleButton from '../components/AccessibleButton';
import VerticalDivider from '../components/VerticalDivider';
import { useModal } from '../Contexts/ModalProvider';
import FontSizeInput from '../Header/FontSizeInput';
import { ColorWheel } from '../components/ColorWheel';
import FontFamilyInput from '../Header/FontFamilyInput';
import AnnotationSelectionDropdown from './AnnotationSelectionDropdown';
import Signatures from './Signatures';
import AnnotationTextSettings from './AnnotationTextSettings';

const Wrapper = ({ children }) => (
	<div css={css({
		display: 'flex',
		background: 'white',
		height: 50,
		alignItems: 'center',
		padding: '0 12px',
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
	fontFamilyValue,
	annotationColor,
	setAnnotationColor,
	setFontFamilyValue,
	annotationMode,
	fontSizeValue,
	setFontSizeValue,
	handleChangeActiveToolbarItem,
	activeToolbarItem,
	canDelete,
	editableAnnotationId,
	onUpdateFontSize,
	onUpdateFontFamily,
	onEnableClickTagMode,
	onEnableFreeTextMode,
	handleChooseColor,
	onDisableEditorMode,
	undoStackLength,
	redoStackLength,
	canExtract,
	onDelete,
	tools,
	onAddImage,
	onRotate,
	undoLastAction,
	redoLastAction,
	onMinimize,
	showFullScreenThumbnails,
	setMultiPageSelections,
	multiPageSelections,
	expandedViewThumbnailScale,
	setExpandedViewThumbnailScale,
	onExtract,
	pdfViewerRef
}) => {
	
	const { t } = useTranslation();

	const handleInputChange = (e) => {
		const num = parseInt(e.target.value, 10);
		setExpandedViewThumbnailScale(num);
	};

	const getSelectionsCount = () => {
		const { length } = multiPageSelections;
		if (length > 99) {
			return '99+';
		}
		return length;
	};

	const showUndoRedo = () => !!tools?.editing?.length;

	const onChangeActiveToolbarItem = ({
		tooltype
	}) => {
		handleChangeActiveToolbarItem(tooltype);
		switch (tooltype) {
			case 'text':
				onEnableFreeTextMode();
				break;
			case 'signature':
				onEnableFreeTextMode();
				break;
			case 'none':
				handleChangeActiveToolbarItem('');
				onDisableEditorMode();
				break;
		}
	};

	return (
		<Wrapper>
			<div css={contentLeftStyle}>
			  <div style={{ display: 'flex', alignItems: 'center' }}>
					<AnnotationSelectionDropdown
						tools={tools}
						annotationMode={annotationMode}
						onClickSignature={onAddImage}
						onChangeActiveToolbarItem={onChangeActiveToolbarItem}
					/>
					<Signatures
						onClickSignature={onAddImage}
						onChangeActiveToolbarItem={onChangeActiveToolbarItem}
						tools={tools}
						activeToolbarItem={activeToolbarItem}
					/>
					<AnnotationTextSettings
						activeToolbarItem={activeToolbarItem}
						annotationColor={annotationColor}
						setAnnotationColor={setAnnotationColor}
						handleChooseColor={handleChooseColor}
						fontSizeValue={fontSizeValue}
						setFontSizeValue={setFontSizeValue}
						editableAnnotationId={editableAnnotationId}
						onUpdateFontSize={onUpdateFontSize}
						pdfViewerRef={pdfViewerRef}
						fontFamilyValue={fontFamilyValue}
						setFontFamilyValue={setFontFamilyValue}
						onUpdateFontFamily={onUpdateFontFamily}
					/>
				</div>
				{
					showFullScreenThumbnails && (
						<AccessibleButton
							onClick={onMinimize}
							ariaLabel={t('minimize')}
						>
							<HeaderBtn title={t('minimize')} iconAlt={t('minimize')} icon={Minimize} />
						</AccessibleButton>
					)
				}
				{
					multiPageSelections?.length ? (
						<div style={{
							display: 'flex',
							alignItems: 'center'
						}}
						>
							<AccessibleButton
								onClick={() => setMultiPageSelections([])}
								ariaLabel={t('redo')}
							>
								<HeaderBtn title={'Clear selection'} iconAlt={t('redo')} icon={RemoveSelection} />
							</AccessibleButton>
						</div>
					) : (
						<div style={{ width: '37px' }} />
					)
				}
			</div>
			{
				showFullScreenThumbnails && (
					<div style={{ display: 'flex', alignItems: 'center' }}>
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
					{
						showUndoRedo() && (
							<>
								<AccessibleButton
									onClick={undoLastAction}
									ariaLabel={t('undo')}
								>
									<HeaderBtn
										style={{ opacity: undoStackLength ? 1 : 0.5 }}
										title={t('undo')} iconAlt={t('undo')} icon={Undo}
									/>
								</AccessibleButton>
								<AccessibleButton
									onClick={redoLastAction}
									ariaLabel={t('redo')}
								>
									<HeaderBtn
										style={{ opacity: redoStackLength ? 1 : 0.5 }}
										title={t('redo')} iconAlt={t('redo')} icon={Redo}
									/>
								</AccessibleButton>
								<VerticalDivider />
							</>
						)
					}
					{
						tools?.editing?.includes('rotation') && (
							<div style={{
								display: 'flex',
								border: multiPageSelections?.length ? '1px solid #f96804' : '1px solid transparent',
								background: multiPageSelections?.length ? '#f6f6f6' : '',
								borderRadius: '10px'
							}}
							>
								<div style={{ position: 'relative' }}>
									<AccessibleButton
										onClick={() => onRotate(false)}
										ariaLabel={t('redo')}
									>
										<HeaderBtn offsetX="-20px" style={{ opacity: canDelete ? 1 : 0.5 }} title={t('rotateCounterClockwise')} iconAlt={t('rotateCounterClockwise')} icon={RotateLeft} />
										{
											!!multiPageSelections?.length && (
												<div style={{
													position: 'absolute',
													bottom: 0,
													color: 'white',
													left: 0,
													pointerEvents: 'none',
													height: 12,
													minWidth: 12,
													background: '#f96804',
													fontSize: 12,
													padding: 2,
													display: 'flex',
													alignItems: 'center',
													justifyContent: 'center',
													borderRadius: '8px'
												}}
												>{getSelectionsCount()}</div>
											)
										}
									</AccessibleButton>
								</div>
								<div style={{ position: 'relative' }}>
									<AccessibleButton
										onClick={() => onRotate(true)}
										ariaLabel={t('redo')}
									>
										<HeaderBtn offsetX="-30px" style={{ opacity: canDelete ? 1 : 0.5 }} title={t('rotateClockwise')} iconAlt={t('rotateClockwise')} icon={RotateRight} />
									</AccessibleButton>
								</div>
							</div>
						)
					}
					{
						tools?.editing?.includes('extract') && (
							<div style={{ position: 'relative' }}>
								<AccessibleButton
									onClick={onExtract}
									ariaLabel={t('Extract')}
								>
									<HeaderBtn
										style={{ opacity: canExtract ? 1 : 0.3 }}
										title={t('Extract')} iconAlt={t('Extract')} icon={Extract}
									/>
									{
										!!multiPageSelections?.length && (
											<div style={{
												position: 'absolute',
												bottom: 0,
												color: 'white',
												left: 0,
												pointerEvents: 'none',
												height: 12,
												minWidth: 12,
												background: '#f96804',
												fontSize: 12,
												padding: 2,
												display: 'flex',
												alignItems: 'center',
												justifyContent: 'center',
												borderRadius: '8px'
											}}
											>{getSelectionsCount()}</div>
										)
									}
								</AccessibleButton>
							</div>
						)
					}
					{
						tools?.editing?.includes('remove') && (
							<div style={{ position: 'relative' }}>
								<AccessibleButton
									onClick={onDelete}
									ariaLabel={t('redo')}
								>
									<HeaderBtn style={{ opacity: canDelete ? 1 : 0.5 }} title={t('remove')} iconAlt={t('remove')} icon={Trash} />
									{
										!!multiPageSelections?.length && (
											<div style={{
												position: 'absolute',
												bottom: 0,
												color: 'white',
												left: 0,
												pointerEvents: 'none',
												height: 12,
												minWidth: 12,
												background: '#f96804',
												fontSize: 12,
												padding: 2,
												display: 'flex',
												alignItems: 'center',
												justifyContent: 'center',
												borderRadius: '8px'
											}}
											>{getSelectionsCount()}</div>
										)
									}
								</AccessibleButton>
							</div>
						)
					}
				</>
			</div>
		</Wrapper>
	);
};

export default Subheader;