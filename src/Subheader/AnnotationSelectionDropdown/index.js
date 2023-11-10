/** @jsxImportSource @emotion/react */
import { css } from '@emotion/react';
import ChevronDown from '../../../assets/chevron-down-svgrepo-com.svg';
import Dropdown from '../../components/Dropdown';
import { useContext } from 'preact/hooks';
import { Icon } from 'aleon_35_pdf_ui_lib';
import { useTranslation } from 'react-i18next';
import { useModal } from '../../Contexts/ModalProvider';
import HeaderBtn from '../../Header/HeaderBtn';
import WriteIcon from '../../../assets/write-svgrepo-com.svg';
import SignatureIcon from '../../../assets/signature-solid-svgrepo-com.svg';
import TextIcon from '../../../assets/text-svgrepo-com.svg';

import { SignaturesContext } from '../../Contexts/SignaturesContext';

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
  margin-right: 12px;
`;

const childStyle = css`
  margin: 8px 0;
`; // padding: 12px 16px;

const zoomOptionStyle = css`
  padding: 4px 16px;
  cursor: pointer;
  display: flex;
  &:hover {
    background-color: #e7e7e7;
  }
`;

const AnnotationSelectionDropdown = ({
  onClickSignature,
  onChangeActiveToolbarItem
}) => {

	const { t } = useTranslation();
  
  const { showSignatureModal } = useModal();

  const { fullSignature, initialsSignature } = useContext(SignaturesContext);

  const onSelectSignature = () => {
    if (!fullSignature && !initialsSignature) {
      showSignatureModal("Test", () => {});
      return;
    }
    if (fullSignature) {
      onClickSignature("signatureImage");
      onChangeActiveToolbarItem({tooltype: "signature"})
      // go ahead and add
      return;
    }
    onClickSignature("initialsImage");
    onChangeActiveToolbarItem({tooltype: "signature"})
    // initialsImage
    // add initials
    
  }

  const onSelectFreeText = () => {
    onChangeActiveToolbarItem({tooltype: "text"})

  }

  const onSelectNone = () => {
    onChangeActiveToolbarItem({tooltype: "none"})
  }

	return (
		<div css={wrapper}>
			<div css={innerWrapper}>
				<Dropdown
					width={100}
					marginTop={28}
					title={
						<div css={dropdownTitle}>
              <HeaderBtn offsetX="-20px" title={"Add text"} iconAlt={t("search")} icon={WriteIcon} />
							<Icon size="sm" src={ChevronDown} alt={t("arrowDown")} />
						</div>
					}
					child={<div css={childStyle}>
            <div css={zoomOptionStyle} onClick={onSelectSignature}><img height={24} width={24} src={SignatureIcon}/>Add signature</div>
            <div css={zoomOptionStyle} onClick={onSelectFreeText}><img height={24} width={24} src={TextIcon}/>Edit free text</div>
            <div css={zoomOptionStyle} onClick={onSelectNone}><img height={24} width={24} src={WriteIcon}/>End edit mode</div>
					</div>}
				/>
			</div>
		</div>
	);
};

export default AnnotationSelectionDropdown;

// <img src={fullSignature}/>