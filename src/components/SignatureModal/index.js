/** @jsxImportSource @emotion/react */
import {  css } from '@emotion/react';
import { useContext, useEffect, useRef, useState } from 'preact/hooks';
import SignaturePad from 'react-signature-pad-wrapper'; // Updated import
import { SignaturesContext } from '../../Contexts/SignaturesContext';
import { ColorButton } from './ColorButton';
import trimCanvas from 'trim-canvas';
import { useMediaQuery } from '../../hooks/useMediaQuery';

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
  z-index: 999999; /* Ensure it's on top */
`;

const modalContentStyle = css`
  background-color: white;
  padding: 20px;
  border-radius: 8px;
  max-width: 100%;
  text-align: center;
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

export const SignatureModal = ({
  onConfirm,
  onClose,
  modifiedUiElements
}) => {

  console.log(modifiedUiElements, 'modifiedUiElements');

  const signatureRef = useRef();
  const initialRef = useRef();
  const [penColor, setPenColor] = useState('black'); // Default pen color

  const { setInitialsSignature, setFullSignature, fullSignature, initialsSignature } = useContext(SignaturesContext);

  const handleSaveSignature = () => {
    // console.log(signatureRef.current, 'signatureRef.current')
    // Convert canvas to data URL (base64 image) only if the canvas is not empty
    const signatureImage = !signatureRef.current.isEmpty()
      ? trimCanvas(signatureRef.current.canvas?.current).toDataURL('image/png')
      : fullSignature;
    const initialsImage = !initialRef.current.isEmpty()
      ? trimCanvas(initialRef.current.canvas?.current).toDataURL('image/png')
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

  const isSmallScreen = useMediaQuery('(max-width: 550px)');


  useEffect(() => {
    signatureRef.current.penColor = penColor;
    initialRef.current.penColor = penColor;
  }, [penColor]);

  const onClickConfirm = () => {
    if (signatureRef.current.isEmpty()) {
      return alert("Please draw your signature before proceeding.");
    }
    // Handle confirm action here
    handleSaveSignature();
    onClose?.();
  }

  const shouldShowCancelBtn = () => {
    if (!modifiedUiElements?.signatureModal?.buttons) {
      return true;
    }
    return modifiedUiElements?.signatureModal?.buttons.includes("cancel");
  }

  const shouldShowInitialsPad = () => {
    if (!modifiedUiElements?.signatureModal?.drawingPads) {
      return true;
    }
    return modifiedUiElements?.signatureModal?.drawingPads.includes("initials");
  }

  const shouldShowColors = () => {
    if (typeof modifiedUiElements?.signatureModal?.colorChoice !== "boolean") {
      return true;
    }
    return modifiedUiElements?.signatureModal?.colorChoice
  }

  const signatureMarginRight = () => {
    if (isSmallScreen || !shouldShowInitialsPad()) {
      return 0;
    }
    return 8;
  }

  return (
    <div css={overlayStyle}>
      <div
        css={modalContentStyle}
        style={{ width: shouldShowInitialsPad() ? 720 : 400 }}
      >
        <div style={{display: "flex", flexFlow: "wrap"}}>
          <div style={{marginRight: signatureMarginRight(), background: "#efefef", border: "1px solid #d3d3d3", width: 400, borderRadius: "4px"}}>
            <div style={{cursor: "crosshair"}}>
              <SignaturePad ref={signatureRef} options={{ velocityFilterWeight: 0.4 }}
          canvasProps={{ width: 800, height: 320, className: 'sigCanvas' }} />

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
          {
            shouldShowInitialsPad() && (
              <div style={{background: "#efefef", border: "1px solid #d3d3d3", width: 280, borderRadius: "4px"}}>
                <div style={{cursor: "crosshair"}}>
                  <SignaturePad ref={initialRef} penColor={penColor}
              canvasProps={{ width: 280, height: 160, className: 'sigCanvas' }} />
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
            )
          }
        </div>
        <div style={{ marginBottom: '8px', marginTop: '8px' }}>
          {/* Color selection buttons */}
          {
            shouldShowColors() && (
              <>
                <ColorButton color="black" onChangeColor={changeColor} />
                <ColorButton color="red" onChangeColor={changeColor} />
                <ColorButton color="blue" onChangeColor={changeColor} />
                <ColorButton color="green" onChangeColor={changeColor} />
              </>
            )
          }
          
        </div>
        <button css={confirmBtnStyle} variant="primary" size="sm" onClick={onClickConfirm}>
          Confirm
        </button>
        {
          shouldShowCancelBtn() && (
            <button css={closeBtnStyle} variant="secondary" size="md" onClick={onClose}>Cancel</button>
          )
        }
      </div>
    </div>
  );
};

export default SignatureModal;
