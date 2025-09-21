/** @jsxImportSource @emotion/react */
import {  css } from '@emotion/react';
import { useContext, useEffect, useRef, useState } from 'preact/hooks';
import SignaturePad from 'react-signature-pad-wrapper'; // Updated import
import { SignaturesContext } from '../../Contexts/SignaturesContext';
import trimCanvas from 'trim-canvas';
import { useMediaQuery } from '../../hooks/useMediaQuery';
import { useTranslation } from 'react-i18next';

const containerStyle = css`
  padding: 20px;
  font-family: Arial, sans-serif;

	@media (max-width: 600px) {
    flex-direction: column;
  }
`;

const inputGroupStyle = css`
  margin-bottom: 20px;

	@media (max-width: 600px) {
    flex-basis: 100%;
    max-width: 100%;
  }
`;

const labelStyle = css`
  display: block;
  margin-bottom: 5px;
`;

const inputStyle = css`
  width: 100%;
  padding: 4px;
  margin-bottom: 4px;
	max-width: 80%;
`;

const signaturePreviewStyle = css`
  border: 1px solid #000;
  padding: 0 20px;
  text-align: center;
  margin-bottom: 20px;
`;

const buttonStyle = css`
  background-color: #4CAF50;
  color: white;
  padding: 14px 20px;
  margin: 8px 0;
  border: none;
  cursor: pointer;
  width: 100%;
	display: inline-flex;
	border-radius: 4px;
`;

const buttonCloseStyle = css`
	background-color: #767676;
	color: white;
	padding: 14px 20px;
	margin: 8px 0;
	border: none;
	cursor: pointer;
	width: 100%;
	display: inline-flex;
	border-radius: 4px;
`;

const overlayStyle = css`
  position: fixed;
	overflow: auto;
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
  border-radius: 8px;
  max-width: 100%;
	margin-top: 100px;
`;

const tabsContainerStyle = css`
  display: flex;
  justify-content: space-between;
  margin-bottom: 20px;
	max-width: 480px;
`;

const tabStyle = css`
  padding: 8px 4px;
  cursor: pointer;
  border: none;
  background: transparent;
  font-size: 16px;
  &:focus {
    outline: none;
  }
  &.active {
    border-bottom: 2px solid blue;
  }
`;

const contentContainerStyle = css`
  border: 1px solid #ccc;
  padding: 20px;
`;


export const SignatureModal = ({
	onConfirm,
	onClose,
	modifiedUiElements
}) => {

	const { t } = useTranslation();

	const signatureRef = useRef();
	const [penColor] = useState('black'); // Default pen color

	const [signatureUpload, setSignatureUpload] = useState(null);

	const { setFullSignature, fullSignature } = useContext(SignaturesContext);

	const [activeTab, setActiveTab] = useState('draw');

	const handleSaveSignature = () => {
		// Convert canvas to data URL (base64 image) only if the canvas is not empty
		const signatureImage = !signatureRef.current.isEmpty()
			? trimCanvas(signatureRef.current.canvas?.current).toDataURL('image/png')
			: fullSignature;
		
		// Only update localStorage and context if there's a new signature/initials
		if (signatureImage) {
			sessionStorage.setItem('signatureImage', signatureImage);
			try { localStorage.setItem('signatureImage', signatureImage); } catch (_) {}
			setFullSignature(signatureImage);
		}
  
		// Call the onConfirm callback if provided
		onConfirm?.(signatureImage, null);
		onClose?.();
	};

	const onClearFullSignature = () => {
		signatureRef.current?.clear();
	};

	const isSmallScreen = useMediaQuery('(max-width: 550px)');


	useEffect(() => {
		if (signatureRef.current) {
			signatureRef.current.penColor = penColor;
		}
	}, [penColor]);

	const onClickConfirmUpload = () => {
		if (!signatureUpload) {
			return alert("Please upload your signature");
		}
		if (signatureUpload) {
			sessionStorage.setItem('signatureImage', signatureUpload);
			try { localStorage.setItem('signatureImage', signatureUpload); } catch (_) {}
			setFullSignature(signatureUpload);
		}
  
		// Call the onConfirm callback if provided
		onConfirm?.(signatureUpload, null);
		onClose?.();
	}

	const onClickConfirmDrawing = () => {
		if (signatureRef.current.isEmpty()) {
			return alert(t("draw-signature-before"));
		}
		
		handleSaveSignature();
		onClose?.();
	};

	const signatureMarginRight = () => 0;


  const handleTabClick = (tab) => {
    setActiveTab(tab);
  };

	const onAdopt = () => {
		sessionStorage.setItem('signatureType', activeTab);
		switch (activeTab) {
			case "draw": {
				onClickConfirmDrawing();
				break;
			}
			case "upload": {
				onClickConfirmUpload();
				break;
			}
			default:
				break;
		}
	}

	const onMarkWithX = () => {
		const pad = signatureRef.current;
		const canvas = pad?.canvas?.current;
		if (!pad || !canvas) return;
		const w = canvas.width;
		const h = canvas.height;
		const margin = Math.floor(Math.min(w, h) * 0.15);
		const now = Date.now();
		const line = (x1, y1, x2, y2, t0) => ([
			{ x: x1, y: y1, time: t0, color: penColor },
			{ x: (x1 + x2) / 2, y: (y1 + y2) / 2, time: t0 + 10 },
			{ x: x2, y: y2, time: t0 + 20 }
		]);
		const stroke1 = line(margin, margin, w - margin, h - margin, now);
		const stroke2 = line(w - margin, margin, margin, h - margin, now + 30);
		pad.fromData([
			{ points: stroke1, penColor },
			{ points: stroke2, penColor }
		]);
	};

	const handleFileChange = (event) => {
    const file = event.target.files[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = (e) => {
        setSignatureUpload(e.target.result);
      };
      reader.readAsDataURL(file);
    }
  };

  return (
		<div css={overlayStyle}>
			<div
				css={modalContentStyle}
				style={{ width: 400 }}
			>
				<div css={containerStyle}>
					<h1>Adopt your signature</h1>
					<hr />
					<p style={{color: "grey"}}>Create your signature by drawing or uploading an image</p>
					<div css={tabsContainerStyle}>
						<button
							css={tabStyle}
							className={activeTab === 'draw' ? 'active' : ''}
							onClick={() => handleTabClick('draw')}
						>
							DRAW
						</button>
						<button
							css={tabStyle}
							className={activeTab === 'upload' ? 'active' : ''}
							onClick={() => handleTabClick('upload')}
						>
							UPLOAD
						</button>
					</div>
					<div css={contentContainerStyle}>

						{activeTab === 'draw' && (
							<div style={{ marginRight: signatureMarginRight(), background: '#efefef', border: '1px solid #d3d3d3', width: 320, borderRadius: '4px' }}>
								<div style={{ cursor: 'crosshair', width: 320, height: 120 }}>
									<SignaturePad ref={signatureRef} options={{ velocityFilterWeight: 0.4 }}
										canvasProps={{ width: 320, height: 120, className: 'sigCanvas' }}
									/>
		
								</div>
								<div style={{
									marginLeft: 8, marginRight: 8,
									alignItems: 'center',
									display: 'flex', justifyContent: 'space-between', borderTop: '1px solid #d3d3d3' }}
								>
									<div style={{ display: 'flex', gap: 12 }}>
										<div style={{
											cursor: 'pointer',
											color: '#3083c8', fontSize: '14px' }} onClick={onMarkWithX}
										>Mark with X</div>
									</div>
									<div style={{
										fontSize: '12px',
										color: 'grey',
										paddingTop: 4,
										paddingBottom: 4
									}}
									>Draw signature</div>
									<div style={{
										cursor: 'pointer',
										color: '#3083c8', fontSize: '14px' }} onClick={onClearFullSignature}
									>{t("Clear")}</div>
								</div>
							</div>
						)}
						{activeTab === 'upload' && (
							<div>
								<input
									type="file"
									accept="image/*"
									onChange={handleFileChange}
									style={{ display: 'block', margin: '20px 0' }}
								/>
								{signatureUpload && (
									<img
										src={signatureUpload}
										alt="Uploaded Signature"
										style={{ maxWidth: '100%', maxHeight: '200px', display: 'block' }}
									/>
								)}
							</div>
						)}
					</div>
					<p style={{color: "grey", fontSize: 12}}>By selecting Adopt and Sign, I agree that the signature and initials will be the electronic representation of my signature and initials for all purposes when I (or my agent) use them on documents, including legally binding contracts.</p>
					<div style={{display: "flex", justifyContent: "space-between"}}>
						<div style={{display: "inline-flex"}}>
							<button onClick={onAdopt} css={buttonStyle}>
								Adopt and Sign
							</button>
						</div>
						<div style={{display: "inline-flex"}}>
							<button onClick={onClose} css={buttonCloseStyle}>
								Close
							</button>
						</div>
					</div>
				</div>
			</div>
		</div>
  );

};

export default SignatureModal;
