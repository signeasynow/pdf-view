/** @jsxImportSource @emotion/react */
import {  css } from '@emotion/react';
import { useRef } from 'preact/hooks';
import SignatureCanvas from 'react-signature-canvas';

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
  width: 720px;
  max-width: 100%;
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
`

const closeBtnStyle = css`
  border: 1px solid lightgrey;
  font-size: 16px;
  padding: 8px 16px;
  border-radius: 4px;
  margin-left: 8px;
  cursor: pointer;
`

export const SignatureModal = ({ onConfirm, message, onClose }) => {

  const signatureRef = useRef();
  const initialRef = useRef();

  return (
    <div css={overlayStyle}>
      <div css={modalContentStyle}>
        <span css={topCloseBtnStyle} onClick={onClose}>&times;</span>
        <div style={{display: "flex", flexFlow: "wrap"}}>
          <div style={{marginRight: 8, background: "#efefef", border: "1px solid #d3d3d3", width: 400, borderRadius: "4px"}}>
            <div style={{cursor: "crosshair"}}>
              <SignatureCanvas ref={signatureRef} penColor='green'
                canvasProps={{width: 400, height: 160, className: 'sigCanvas'}} />
            </div>
            <div style={{
              marginLeft: 8, marginRight: 8,
              alignItems: "center",
              display: "flex", justifyContent: "space-between", borderTop: "1px solid #d3d3d3", }}>
              <div />
              <div style={{
                fontSize: "12px",
                color: "grey",
                paddingTop: 4,
                paddingBottom: 4,
              }}>Draw signature</div>
              <div style={{
                cursor: "pointer",
                color: "#3083c8", fontSize: "14px"}} onClick={() => signatureRef.current?.clear()}>Clear</div>
            </div>
          </div>
          <div style={{background: "#efefef", border: "1px solid #d3d3d3", width: 280, borderRadius: "4px"}}>
            <div style={{cursor: "crosshair"}}>
              <SignatureCanvas ref={initialRef} penColor='green'
                canvasProps={{width: 280, height: 160, className: 'sigCanvas'}} />
            </div>
            <div style={{
              marginLeft: 8, marginRight: 8,
              alignItems: "center",
              display: "flex", justifyContent: "space-between", borderTop: "1px solid #d3d3d3", }}>
              <div />
              <div style={{
                fontSize: "12px",
                color: "grey",
                paddingTop: 4,
                paddingBottom: 4,
              }}>Draw initials</div>
              <div style={{
                cursor: "pointer",
                color: "#3083c8", fontSize: "14px"}} onClick={() => initialRef.current?.clear()}>Clear</div>
            </div>
          </div>
        </div>
        <button css={confirmBtnStyle} variant="primary" size="sm" onClick={() => {
          // Handle confirm action here
          onConfirm?.();
          onClose?.();
        }}>
          Confirm
        </button>
        <button css={closeBtnStyle} variant="secondary" size="md" onClick={onClose}>Cancel</button>
      </div>
    </div>
  );
};

export default SignatureModal;
