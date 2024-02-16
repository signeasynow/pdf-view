/** @jsxImportSource @emotion/react */
import styled, {  css } from '@emotion/react';
import { useContext, useEffect, useRef, useState } from 'preact/hooks';
import SignaturePad from 'react-signature-pad-wrapper'; // Updated import
import { SignaturesContext } from '../../Contexts/SignaturesContext';
import { ColorButton } from './ColorButton';
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
  padding: 20px;
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
	modifiedUiElements,
	message
}) => {

	const { t } = useTranslation();

	const signatureRef = useRef();
	const initialRef = useRef();
	const [penColor, setPenColor] = useState('black'); // Default pen color

	const [signatureUpload, setSignatureUpload] = useState(null);

	const { setInitialsSignature, setFullSignature, fullSignature, initialsSignature } = useContext(SignaturesContext);
	const [fullName, setFullName] = useState(message);
  const [initials, setInitials] = useState('');

	useEffect(() => {
		if (!message) {
			return;
		}
		setFullName(message);

		const calculateInitials = (name) => {
      const words = name.split(' ').filter(Boolean); // Split name into words and remove any empty strings
      if (words.length === 0) return '';
      const initials = words.slice(0, 2).map(word => word[0].toUpperCase()).join(''); // Take first two words, if available
      return initials;
    };

    setInitials(calculateInitials(message));

	}, [message]);

	const [activeTab, setActiveTab] = useState('selectStyle');

	const handleSaveSignature = () => {
		// Convert canvas to data URL (base64 image) only if the canvas is not empty
		const signatureImage = !signatureRef.current.isEmpty()
			? trimCanvas(signatureRef.current.canvas?.current).toDataURL('image/png')
			: fullSignature;
		
		// Only update localStorage and context if there's a new signature/initials
		if (signatureImage) {
			sessionStorage.setItem('signatureImage', signatureImage);
			setFullSignature(signatureImage);
		}
  
		// Call the onConfirm callback if provided
		onConfirm?.(signatureImage, null);
		onClose?.();
	};

	useEffect(() => {
		const loadImageData = (canvasRef, imageDataUrl) => {
			if (imageDataUrl && canvasRef.current) {
				return; // todo
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

		loadImageData(signatureRef, storedSignatureImage);
	}, []);

	const onClearFullSignature = () => {
		signatureRef.current?.clear();
	};

	const isSmallScreen = useMediaQuery('(max-width: 550px)');


	useEffect(() => {
		signatureRef.current.penColor = penColor;
		if (initialRef.current) {
			initialRef.current.penColor = penColor;
		}
    
	}, [penColor]);

	const onClickConfirmText = () => {
		if (!fullName) {
			return alert("Name is required");
		}
		if (!initials) {
			return alert("Initials are required")
		}
		sessionStorage.setItem("signatureName", fullName);
		sessionStorage.setItem("signatureInitials", initials);
		onConfirm?.(null, {fullName, initials});
		onClose?.();
	}

	const onClickConfirmUpload = () => {
		if (!signatureUpload) {
			return alert("Please upload your signature");
		}
		if (signatureUpload) {
			sessionStorage.setItem('signatureImage', signatureUpload);
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

	const shouldShowInitialsPad = () => {
		if (!modifiedUiElements?.signatureModal?.drawingPads) {
			return true;
		}
		return modifiedUiElements?.signatureModal?.drawingPads.includes('initials');
	};

	const signatureMarginRight = () => {
		if (isSmallScreen || !shouldShowInitialsPad()) {
			return 0;
		}
		return 8;
	};


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
			case "selectStyle": {
				onClickConfirmText();
			}
		}
	}

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
					<p style={{color: "grey"}}>Confirm your name, initials, and signature</p>
					<div style={{display: "flex"}}>
						<div css={inputGroupStyle}>
							<label css={labelStyle} htmlFor="fullName">Full Name*</label>
							<input
								css={inputStyle}
								id="fullName"
								value={fullName}
								onChange={(e) => setFullName(e.target.value)}
								placeholder="Enter your full name"
								required
							/>
						</div>
						<div css={inputGroupStyle}>
							<label css={labelStyle} htmlFor="initials">Initials*</label>
							<input
								css={inputStyle}
								id="initials"
								value={initials}
								onChange={(e) => setInitials(e.target.value)}
								placeholder="Enter your initials"
								required
							/>
						</div>
					</div>
					<div css={tabsContainerStyle}>
        		<button
							css={tabStyle}
							className={activeTab === 'selectStyle' ? 'active' : ''}
							onClick={() => handleTabClick('selectStyle')}
						>
							SELECT STYLE
						</button>
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
						{activeTab === "selectStyle" && (
							<div css={signaturePreviewStyle}>
								<p style={{textAlign: "left"}}>Signed by:</p>
								<div style={{display: "flex", justifyContent: "space-between", fontFamily: "Mr Dafoe"}}>
									<p style={{fontFamily: "Mr Dafoe"}}>{fullName}</p>
									<p style={{fontFamily: "Mr Dafoe"}}>{initials}</p>
								</div>
							</div>
						)}
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
									<div />
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
