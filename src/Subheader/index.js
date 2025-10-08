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
import HeaderBtn from '../Header/HeaderBtn';
import Slider from '../components/Slider';
import AccessibleButton from '../components/AccessibleButton';
import VerticalDivider from '../components/VerticalDivider';
import AnnotationSelectionDropdown from './AnnotationSelectionDropdown';
import Signatures from './Signatures';
import AnnotationTextSettings from './AnnotationTextSettings';
import * as pdfjs from 'pdfjs-dist';
import SubheaderZoomSlider from './SubheaderZoomSlider';
import { useMediaQuery } from '../hooks/useMediaQuery';

const Wrapper = ({ children, isSmallScreen }) => (
	<div css={css({
		display: 'flex',
		background: 'white',
		height: 50,
		alignItems: 'center',
		padding: '0 12px',
		justifyContent: 'space-between',
		borderTop: '1px solid #ccc',
		overflowY: isSmallScreen ? 'auto' : 'initial',
		position: 'relative'
	})}
	>
		{children}
	</div>
);

const contentLeftStyle = css`
	display: flex;
	align-items: center;
`;

const gradientLeft = css`
	position: fixed;
	z-index: 99999;
	height: 48px;
	left: -1px;
	width: 24px;
	background: linear-gradient(to left, rgba(255, 255, 255, 0)20%, rgba(255, 255, 255, 1)70%);
`;

const gradientRight = css`
        position: fixed;
        z-index: 99999;
        height: 48px;
        right: -1px;
        width: 24px;
        background: linear-gradient(to right, rgba(255, 255, 255, 0) 20%, rgba(255, 255, 255, 1) 70%);
`;

const applyChangesButtonStyle = css`
        margin-left: 8px;
        background-color: #2563eb;
        border: none;
        color: white;
        border-radius: 4px;
        padding: 6px 12px;
        font-weight: 600;
        cursor: pointer;
        height: 32px;
        display: flex;
        align-items: center;
        justify-content: center;

        &:hover:enabled {
                background-color: #1d4ed8;
        }

        &:disabled {
                opacity: 0.6;
                cursor: not-allowed;
        }
`;

const Subheader = ({
        editorMode,
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
	onEnableEditTextMode,
	onEnableFreeTextMode,
	handleChooseColor,
	onDisableEditorMode,
	undoStackLength,
	redoStackLength,
	canExtract,
	onDelete,
	tools,
        onAddImage,
        onFinalizeDocument,
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
        pdfViewerRef,
        fontWeightBold,
        onUpdateFontWeight,
        onUpdateFontItalic,
        fontItalic,
        showApplyDocumentChanges,
        onApplyDocumentChanges,
        isApplyingDocumentChanges,
        hideUndoRedoButtons = false
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

        const showUndoRedo = () => !hideUndoRedoButtons && !!tools?.editing?.length;

	const showExtract = () => {
		if (annotationMode === pdfjs.AnnotationEditorType.FREETEXT
			|| annotationMode === pdfjs.AnnotationEditorType.STAMP
			|| annotationMode === pdfjs.AnnotationEditorType.TEXTEDIT) {
			return false;
		}
		return tools?.editing?.includes('extract');
	};

	const showRemove = () => {
		if (annotationMode === pdfjs.AnnotationEditorType.FREETEXT
			|| annotationMode === pdfjs.AnnotationEditorType.STAMP
			|| annotationMode === pdfjs.AnnotationEditorType.TEXTEDIT
			) {
			return false;
		}
		return tools?.editing?.includes('remove');
	}

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
			case 'edit-text':
				onEnableEditTextMode();
				break;
			case 'none':
				handleChangeActiveToolbarItem('');
				onDisableEditorMode();
				break;
		}
	};

        const isSmallScreen = useMediaQuery('(max-width: 550px)');

        const shouldRenderApplyChangesButton = showApplyDocumentChanges && typeof onApplyDocumentChanges === 'function';
        const applyChangesLabel = isApplyingDocumentChanges ? t('Applying...') : t('Apply changes');

        return (
                <Wrapper isSmallScreen={isSmallScreen}>
                        {
                                isSmallScreen && (
					<>
						<div css={gradientLeft} />
						<div css={gradientRight} />
					</>
				)
			}
                        <div css={contentLeftStyle}>
                          <div style={{ display: 'flex', alignItems: 'center' }}>
                                  <AnnotationSelectionDropdown
                                                editorMode={editorMode}
                                                tools={tools}
                                                activeToolbarItem={activeToolbarItem}
                                                annotationMode={annotationMode}
                                                onClickSignature={onAddImage}
                                                onChangeActiveToolbarItem={onChangeActiveToolbarItem}
                                        />
                                        {shouldRenderApplyChangesButton && (
                                                <button
                                                        type="button"
                                                        css={applyChangesButtonStyle}
                                                        onClick={onApplyDocumentChanges}
                                                        disabled={isApplyingDocumentChanges}
                                                >
                                                        {applyChangesLabel}
                                                </button>
                                        )}
                                        <Signatures
                                                onClickSignature={onAddImage}
                                                onChangeActiveToolbarItem={onChangeActiveToolbarItem}
                                                tools={tools}
                                                activeToolbarItem={activeToolbarItem}
					/>
					<AnnotationTextSettings
						annotationMode={annotationMode}
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
						fontWeightBold={fontWeightBold}
						onUpdateFontWeight={onUpdateFontWeight}
						onUpdateFontItalic={onUpdateFontItalic}
						fontItalic={fontItalic}
					/>
				</div>
				{
					showFullScreenThumbnails && (
						<div style={{marginRight: 4}}>
							<AccessibleButton
								onClick={onMinimize}
								ariaLabel={t('minimize')}
							>
								<HeaderBtn title={t('minimize')} iconAlt={t('minimize')} icon={Minimize} />
							</AccessibleButton>
						</div>
					)
				}
				{
					!!multiPageSelections?.length && (
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
					)
				}
				{
					!isSmallScreen && (
						<div style={{ width: '37px' }} />
					)
				}
			</div>
			<SubheaderZoomSlider
				showFullScreenThumbnails={showFullScreenThumbnails}
				handleInputChange={handleInputChange}
				expandedViewThumbnailScale={expandedViewThumbnailScale}
			/>
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
						showExtract() && (
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
						showRemove() && (
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
