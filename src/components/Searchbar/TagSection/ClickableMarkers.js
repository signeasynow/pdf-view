/** @jsxImportSource @emotion/react */
import { css } from '@emotion/react';
import ProgressBar from '@ramonak/react-progress-bar';
import { Icon } from 'alien35_pdf_ui_lib_2';
import ChevronRight from '../../../../assets/chevron-right-svgrepo-com.svg';
import { useTranslation } from 'react-i18next';
import ChevronLeft from '../../../../assets/chevron-left-svgrepo-com.svg';
import { useContext, useEffect, useState } from 'preact/hooks';
import { AnnotationsContext } from '../../../Contexts/AnnotationsContext';

const backBtn = css`
  display: flex;
  padding: 0 8px 0 0;
  background: #a5bfd7;
  border-radius: 4px;
  border: none;
  align-items: center;
  cursor: pointer;
`;

const tagBtnStyle = css`
  background: #fee179;
	cursor: pointer;
	margin: 4px;
`;

const visibleSearchWrapper = css`
  background: #f1f3f5;
  width: 300px;
  flex-shrink: 0;
	overflow: hidden;
  flex-grow: 0;
  font-size: 14px;
  color: #5b5b5b;
	z-index: 4;
	position: relative;
`;

const fullSearchWrapper = css`
  background: #f1f3f5;
  width: 100%;
  flex-shrink: 0;
	overflow: hidden;
  flex-grow: 0;
  font-size: 14px;
  color: #5b5b5b;
	z-index: 4;
	position: relative;
`;

const invisibleSearchWrapper = css`
  display: none;
`;

const nextBtn = css`
  display: flex;
  padding: 0 0 0 8px;
  background: #a5bfd7;
  border-radius: 4px;
  border: none;
  align-items: center;
  cursor: pointer;
`;

const ClickableMarkers = ({
	showFullScreenSearch,
	showSearch,
  onClickField,
  onBack,
  onNext,
  signers,
  forceRefreshView
}) => {

	const { t } = useTranslation();
  const { activeSignerId, setActiveSignerId } = useContext(AnnotationsContext);

  // const [activeSignerId, setActiveSignerId] = useState(signers[0]?.id);

  useEffect(() => {
    if (!activeSignerId) {
      setActiveSignerId(signers[0]?.id);
    }
  }, signers);

	const getWrapperClass = () => {
		if (showFullScreenSearch) {
			return fullSearchWrapper;
		}
		return showSearch ? visibleSearchWrapper : invisibleSearchWrapper;
	};

  const handleSelectChange = (e) => {
    setActiveSignerId(e.target.value);
  };

  console.log(activeSignerId, 'activeSignerId2');

  useEffect(() => {
    if (!activeSignerId) {
      return;
    }
    forceRefreshView?.()
  }, [activeSignerId]);

	return (
    <div>
      <div css={getWrapperClass()}>
        <div style={{ margin: '12px 4px 8px' }}><ProgressBar completed={75} customLabel="&nbsp;" bgColor="#d9b432" /></div>
        <h3 style={{marginLeft: '4px'}}>Click to add clickable markers for:</h3>
        <div style={{marginBottom: 8}}>
          <select
            id="activeSignerSelect"
            value={activeSignerId}
            onChange={handleSelectChange}
            style={{ marginLeft: '4px' }}
          >
            {signers.map((signer) => (
              <option key={signer.id} value={signer.id}>
                {signer.name || signer.email}
              </option>
            ))}
          </select>
        </div>
        <button css={tagBtnStyle} onClick={() => onClickField('Sign', false, activeSignerId)}>{t("Signature")}</button>
        <button css={tagBtnStyle} onClick={() => onClickField('Name', false, activeSignerId)}>{t("Name")}</button>
        <button css={tagBtnStyle} onClick={() => onClickField('Email', false, activeSignerId)}>{t("Email")}</button>
        <button css={tagBtnStyle} onClick={() => onClickField('Date', false, activeSignerId)}>{t("Date")}</button>
      </div>
      <div style={{ display: 'flex', justifyContent: 'space-between', padding: '8px 4px', background: '#f1f3f5' }}>
        <button css={backBtn} onClick={onBack}><Icon src={ChevronLeft} alt={t("Back")} /><div>{t("Back")}</div></button>
        <button css={nextBtn} onClick={onNext}><div>{t("Next")}</div><Icon src={ChevronRight} alt={t("Next")} /></button>
      </div>
    </div>
  );
	
};

export default ClickableMarkers;