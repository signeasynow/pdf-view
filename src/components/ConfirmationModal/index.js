/** @jsxImportSource @emotion/react */
import {  css } from '@emotion/react';
import { useTranslation } from 'react-i18next';

const overlayStyle = css`
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background-color: rgba(0,0,0,0.4); /* Dull background */
  display: flex;
  justify-content: center;
  align-items: center;
  z-index: 1000; /* Ensure it's on top */
`;

const modalContentStyle = css`
  background-color: white;
  padding: 20px;
  border-radius: 8px;
  width: 300px;
  text-align: center;
`;

const topCloseBtnStyle = css`
  position: absolute;
  top: 10px;
  right: 10px;
  cursor: pointer;
`;

const confirmBtnStyle = css`
  background: #3183c8;
  color: white;
  border: 1px solid transparent;
  font-size: 16px;
  padding: 8px 16px;
  border-radius: 4px;
  cursor: pointer;
`;

const closeBtnStyle = css`
  border: 1px solid lightgrey;
  font-size: 16px;
  padding: 8px 16px;
  border-radius: 4px;
  margin-left: 8px;
  cursor: pointer;
`;

export const ConfirmationModal = ({ onConfirm, message, onClose }) => {
  const { t } = useTranslation();
  return (
    <div css={overlayStyle}>
      <div css={modalContentStyle}>
        <span css={topCloseBtnStyle} onClick={onClose}>&times;</span>
        <p>{message}</p>
        <button css={confirmBtnStyle} variant="primary" size="sm" onClick={() => {
          // Handle confirm action here
          onConfirm?.();
          onClose?.();
        }}
        >
          {t("Confirm")}
        </button>
        <button css={closeBtnStyle} variant="secondary" size="md" onClick={onClose}>{t("Cancel")}</button>
      </div>
    </div>
  )
}

export default ConfirmationModal;
