/** @jsxImportSource @emotion/react */
import { css } from '@emotion/react';
import { useEffect, useState } from 'preact/hooks';
import { useTranslation } from 'react-i18next';

const overlayStyle = css`
  position: fixed;
  overflow: auto;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background-color: rgba(0, 0, 0, 0.4);
  display: flex;
  justify-content: center;
  align-items: center;
  z-index: 999999;
`;

const modalContentStyle = css`
  background-color: white;
  border-radius: 8px;
  max-width: 100%;
  margin-top: 100px;
`;

const containerStyle = css`
  padding: 20px;
  font-family: Arial, sans-serif;

  @media (max-width: 600px) {
    flex-direction: column;
  }
`;

const labelStyle = css`
  display: block;
  margin-bottom: 5px;
`;

const inputStyle = css`
  width: 100%;
  padding: 8px;
  margin-bottom: 16px;
  font-size: 16px;
  border: 1px solid #ccc;
  border-radius: 4px;
`;

const buttonRowStyle = css`
  display: flex;
  justify-content: flex-end;
  gap: 12px;
`;

const buttonStyle = css`
  background-color: #4caf50;
  color: white;
  padding: 10px 16px;
  border: none;
  cursor: pointer;
  border-radius: 4px;
  font-size: 14px;
`;

const secondaryButtonStyle = css`
  background-color: #767676;
  color: white;
  padding: 10px 16px;
  border: none;
  cursor: pointer;
  border-radius: 4px;
  font-size: 14px;
`;

const descriptionStyle = css`
  color: grey;
  margin-bottom: 16px;
`;

const titleStyle = css`
  margin: 0 0 12px;
`;

const TextTagModal = ({
  title,
  description,
  label,
  defaultValue = '',
  confirmLabel,
  cancelLabel,
  inputType = 'text',
  onConfirm,
  onClose,
}) => {
  const { t } = useTranslation();
  const [value, setValue] = useState(defaultValue ?? '');

  useEffect(() => {
    setValue(defaultValue ?? '');
  }, [defaultValue]);

  const handleConfirm = () => {
    onConfirm?.(value);
    onClose?.();
  };

  const handleKeyDown = (event) => {
    if (event.key === 'Enter') {
      event.preventDefault();
      handleConfirm();
    }
    if (event.key === 'Escape') {
      event.preventDefault();
      onClose?.();
    }
  };

  return (
    <div css={overlayStyle}>
      <div css={modalContentStyle} style={{ width: 400 }}>
        <div css={containerStyle}>
          {title && <h1 css={titleStyle}>{title}</h1>}
          {description && <p css={descriptionStyle}>{description}</p>}
          {label && <label css={labelStyle}>{label}</label>}
          <input
            css={inputStyle}
            type={inputType}
            value={value}
            onInput={(event) => setValue(event.target.value)}
            onKeyDown={handleKeyDown}
            autoFocus
          />
          <div css={buttonRowStyle}>
            <button css={secondaryButtonStyle} onClick={onClose} type="button">
              {cancelLabel || t('Cancel')}
            </button>
            <button css={buttonStyle} onClick={handleConfirm} type="button">
              {confirmLabel || t('Apply')}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default TextTagModal;
