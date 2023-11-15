/** @jsxImportSource @emotion/react */
import {  css } from '@emotion/react';
import { useContext, useEffect, useRef, useState } from 'preact/hooks';
import SignatureCanvas from 'react-signature-canvas';
import { SignaturesContext } from '../../Contexts/SignaturesContext';
import { ColorButton } from './ColorButton';

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
  const [penColor, setPenColor] = useState('black'); // Default pen color

  const { setInitialsSignature, setFullSignature, fullSignature, initialsSignature } = useContext(SignaturesContext);

  const handleSaveSignature = () => {

    const createHighResImage = (canvasRef) => {
      if (canvasRef.current && !canvasRef.current.isEmpty()) {
        const originalCanvas = canvasRef.current.getCanvas();
        const ratio = window.devicePixelRatio || 1;
  
        // Create a temporary canvas with higher resolution
        const tempCanvas = document.createElement('canvas');
        tempCanvas.width = originalCanvas.width * ratio;
        tempCanvas.height = originalCanvas.height * ratio;
  
        const tempCtx = tempCanvas.getContext('2d');
        tempCtx.scale(ratio, ratio);
        tempCtx.drawImage(originalCanvas, 0, 0);
  
        // Convert high-resolution canvas to data URL
        return tempCanvas.toDataURL('image/png');
      }
      return null;
    };
    // Convert canvas to data URL (base64 image) only if the canvas is not empty
    const signatureImage = !signatureRef.current.isEmpty()
      ? signatureRef.current.getTrimmedCanvas().toDataURL('image/png')
      : fullSignature;
    const initialsImage = !initialRef.current.isEmpty()
      ? initialRef.current.getTrimmedCanvas().toDataURL('image/png')
      : initialsSignature;
  
    // Only update localStorage and context if there's a new signature/initials
    if (signatureImage) {
      localStorage.setItem('signatureImage', signatureImage);
      setFullSignature(signatureImage);
    }
  
    if (initialsImage) {
      localStorage.setItem('initialsImage', initialsImage);
      setInitialsSignature(initialsImage);
    }
  
    // Call the onConfirm callback if provided
    onConfirm?.(signatureImage, initialsImage);
    onClose?.();
  };

  useEffect(() => {
    const loadImageData = (canvasRef, imageDataUrl) => {
      if (imageDataUrl && canvasRef.current) {
        const image = new Image();
        image.onload = () => {
          const canvas = canvasRef.current.getCanvas();
          const ctx = canvas.getContext('2d');
          const x = (canvas.width - image.width) / 2;
          const y = (canvas.height - image.height) / 2;

          ctx.clearRect(0, 0, canvas.width, canvas.height); // Clear the canvas first
          ctx.drawImage(image, x, y); // Draw the image centered
        };
        image.src = imageDataUrl;
      }
    };

    const storedSignatureImage = localStorage.getItem('signatureImage');
    const storedInitialsImage = localStorage.getItem('initialsImage');

    loadImageData(signatureRef, storedSignatureImage);
    loadImageData(initialRef, storedInitialsImage);
  }, []);

  const onClearInitials = () => {
    initialRef.current?.clear();
    // localStorage.removeItem('initialsImage');
    // setInitialsSignature("");
  }

  const onClearFullSignature = () => {
    signatureRef.current?.clear();
    //localStorage.removeItem('signatureImage');
    //setFullSignature("");
  }

  const changeColor = (color) => {
    setPenColor(color);
    onClearInitials();
    onClearFullSignature();
  };

  return (
    <div css={overlayStyle}>
      <div css={modalContentStyle}>
        <span css={topCloseBtnStyle} onClick={onClose}>&times;</span>
        <div style={{display: "flex", flexFlow: "wrap"}}>
          <div style={{marginRight: 8, background: "#efefef", border: "1px solid #d3d3d3", width: 400, borderRadius: "4px"}}>
            <div style={{cursor: "crosshair"}}>
              <SignatureCanvas ref={signatureRef} penColor={penColor}
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
                color: "#3083c8", fontSize: "14px"}} onClick={onClearFullSignature}>Clear</div>
            </div>
          </div>
          <div style={{background: "#efefef", border: "1px solid #d3d3d3", width: 280, borderRadius: "4px"}}>
            <div style={{cursor: "crosshair"}}>
              <SignatureCanvas ref={initialRef} penColor={penColor}
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
                color: "#3083c8", fontSize: "14px"}} onClick={onClearInitials}>Clear</div>
            </div>
          </div>
        </div>
        <div style={{ marginBottom: '8px', marginTop: '8px' }}>
          {/* Color selection buttons */}
          <ColorButton color="black" onChangeColor={changeColor} />
          <ColorButton color="red" onChangeColor={changeColor} />
          <ColorButton color="blue" onChangeColor={changeColor} />
          <ColorButton color="green" onChangeColor={changeColor} />
        </div>
        <button css={confirmBtnStyle} variant="primary" size="sm" onClick={() => {
          // Handle confirm action here
          handleSaveSignature();
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
