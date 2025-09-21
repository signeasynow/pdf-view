/** @jsxImportSource @emotion/react */
import { css } from '@emotion/react';

import ChevronDown from '../../../../assets/chevron-down-svgrepo-com.svg';
import Dropdown from '../../../components/Dropdown';
import { useEffect, useMemo, useRef, useState } from 'preact/hooks';
import { Icon, Tooltip } from 'alien35_pdf_ui_lib_2';
import { useTranslation } from 'react-i18next';
import { AnnotationEditorParamsType } from 'pdfjs-dist/build/pdf';
import { useDebounce } from '../../../utils/useDebounce';
import { useModal } from '../../../Contexts/ModalProvider';

const inputStyles = css`
  font-size: 16px;
  height: 12px;
  border: none;
  font-weight: 600;
  color: #5b5b5b;
  background: transparent;
  width: 28px;
  text-align: right; // This line was added
  &:focus {
    outline: none;
  }
`;

const wrapper = css`
  display: flex;
  align-items: center;
  font-weight: 600;
`;

const innerWrapper = css`
  background: #f3f3f3;
  display: flex;
  align-items: center;
  padding: 2px 8px;
  border-radius: 4px;
  height: 32px;
`;

const dropdownTitle = css`
  display: flex;
  align-items: center;
  cursor: pointer;
  padding-left: 12px;
  padding-right: 8px;
  height: 24px;
`;

const percentStyle = css`
  margin-right: 8px;
  color: #5b5b5b;
`;

const childStyle = css`
  margin: 8px 0;
`; // padding: 12px 16px;

const zoomOptionStyle = css`
  padding: 4px 16px;
  cursor: pointer;
  &:hover {
    background-color: #e7e7e7;
  }
`;

const SignatureSelectionDropdown = ({
	pdfViewerRef,
	onUpdateFontFamily,
	fullSignature,
	initialsSignature,
	setFontFamilyValue,
	onClickSignature
}) => {

	const [mainType, setMainType] = useState('full');

	const { t } = useTranslation();
  
	const { showSignatureModal } = useModal();

	const mainSrc = () => mainType === 'full' ? fullSignature : initialsSignature;

	const dropdownSrc = () => mainType !== 'full' ? fullSignature : initialsSignature;

	const onClickOptionDropdown = () => {
		if (mainType === 'full') {
			setMainType('initials');
			onClickSignature('initialsImage');
		}
		else {
			setMainType('full');
			onClickSignature('signatureImage');
		}
    
	};

	const handleClickSignature = () => {
		onClickSignature(mainType === 'full' ? 'signatureImage' : 'initialsImage');
	};

	return (
		<div css={wrapper}>
			<div css={innerWrapper}>
				<img onClick={handleClickSignature} style={{ height: '100%', width: '100%', objectFit: 'contain', cursor: 'pointer' }} src={mainSrc()} />
				<Dropdown
					width={100}
					marginTop={28}
					title={
						<div css={dropdownTitle}>
							<Icon size="sm" src={ChevronDown} alt={t('arrowDown')} />
						</div>
					}
					child={<div css={childStyle}>
						<img onClick={onClickOptionDropdown} style={{ height: 24, width: '100%', objectFit: 'contain', cursor: 'pointer' }} src={dropdownSrc()} />
						<div
							css={zoomOptionStyle}
							onClick={() =>
								showSignatureModal('Test', () => {
									// After adopting, immediately apply the edited signature/initials
									onClickSignature(mainType === 'full' ? 'signatureImage' : 'initialsImage');
								})
							}
						>
							{t("Edit signature")} / {t("initials")}
						</div>
					</div>}
				/>
			</div>
		</div>
	);
};

export default SignatureSelectionDropdown;
