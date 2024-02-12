/** @jsxImportSource @emotion/react */
import { css } from '@emotion/react';
import ProgressBar from '@ramonak/react-progress-bar';
import { Icon } from 'alien35_pdf_ui_lib_2';
import ChevronRight from '../../../../assets/chevron-right-svgrepo-com.svg';
import { useTranslation } from 'react-i18next';
import { useState } from 'preact/hooks';
import { generateUUID } from '../../../utils/generateUuid';

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

const AddSigners = ({
	showFullScreenSearch,
	showSearch,
  onNext,
  signers,
  setSigners
}) => {

	const { t } = useTranslation();


	const getWrapperClass = () => {
		if (showFullScreenSearch) {
			return fullSearchWrapper;
		}
		return showSearch ? visibleSearchWrapper : invisibleSearchWrapper;
	};

	const handleKeyDown = (e) => {
		if (e.key === 'Delete') {
			// e.stopPropagation();
		}
	};

	const onInputFocus = () => {
		var event = new KeyboardEvent('keydown', {
				key: 'Escape',
				keyCode: 27, // the keyCode for Escape
				code: 'Escape',
				which: 27,
				shiftKey: false,
				ctrlKey: false,
				metaKey: false
		});
		
		// Dispatch it on the desired element, for example, the document
		document.dispatchEvent(event);
	}

  
  const handleDeleteSigner = (id) => {
    // Remove the signer from the state
    const newSigners = signers.filter((signer) => signer.id !== id);
    setSigners(newSigners);
  };

	const onAddSigner = () => {
    // Add a new signer to the state
    setSigners([...signers, { id: generateUUID(), name: '', email: '' }]);
  };

  const handleSignerChange = (id, field, value) => {
    // Update the signer details in the state
    const newSigners = signers.map((signer) => {
      if (signer.id === id) {
        return { ...signer, [field]: value };
      }
      return signer;
    });
    setSigners(newSigners);
  };

  console.log(signers, 'signer33')

	return (
    <div>
      <div css={getWrapperClass()}>
        <div style={{ margin: '12px 4px 8px' }}><ProgressBar completed={33} customLabel="&nbsp;" bgColor="#d9b432" /></div>
        <h3 style={{marginLeft: '4px'}}>Add signers</h3>
        <div style={{ margin: '4px' }}>Add the people who will sign the document in order from first to last.</div>
        {signers.map((signer, index) => (
          <div key={signer.id} style={{ display: 'flex', alignItems: 'center', overflow: 'hidden' }}>
            <input
              onFocus={onInputFocus}
              onKeyDown={handleKeyDown}
              style={{flex: "1 1 auto", minWidth: "0", margin: "4px"}}          
              value={signer.name}
              onChange={(e) => handleSignerChange(signer.id, 'name', e.target.value)}
              placeholder='Name'
            />
            <input
              onFocus={onInputFocus}
              onKeyDown={handleKeyDown}
              style={{flex: "1 1 auto", minWidth: "0", margin: "4px"}}          
              value={signer.email}
              onChange={(e) => handleSignerChange(signer.id, 'email', e.target.value)}
              placeholder='Email'
            />
            <button
              onClick={() => handleDeleteSigner(signer.id)}
              style={{
                margin: "4px",
                color: "#fff", /* White text color */
                backgroundColor: "#777777", /* Blue background color */
                border: "none", /* No border */
                borderRadius: "4px", /* Rounded corners */
                fontSize: "16px", /* Text size */
                cursor: "pointer", /* Pointer cursor on hover */
                outline: "none", /* Remove outline */
                transition: "background-color 0.2s", /* Smooth background color transition on hover */
                textDecoration: "none" /* No underline on text */      
              }}
            >
              ✖
            </button>
          </div>
        ))}
        <button
          onClick={onAddSigner}
          style={{
          margin: "4px",
          color: "#fff", /* White text color */
          backgroundColor: "#37aa00", /* Blue background color */
          border: "none", /* No border */
          borderRadius: "4px", /* Rounded corners */
          fontSize: "16px", /* Text size */
          cursor: "pointer", /* Pointer cursor on hover */
          outline: "none", /* Remove outline */
          transition: "background-color 0.2s", /* Smooth background color transition on hover */
          textDecoration: "none" /* No underline on text */
        }}>
          + Add signer
        </button>
      </div>
      <div style={{ display: 'flex', justifyContent: 'space-between', padding: '8px 4px', background: '#f1f3f5' }}>
        <div />
        <button css={nextBtn} onClick={onNext}><div>{t("Next")}</div><Icon src={ChevronRight} alt={t("Next")} /></button>
      </div>
    </div>
  );
	
};

export default AddSigners;