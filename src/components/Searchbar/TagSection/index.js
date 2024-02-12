/** @jsxImportSource @emotion/react */
import { css } from '@emotion/react';
import ProgressBar from '@ramonak/react-progress-bar';
import { useContext, useEffect, useState } from 'preact/hooks';
import { Icon } from 'alien35_pdf_ui_lib_2';
import ChevronRight from '../../../../assets/chevron-right-svgrepo-com.svg';
import SendIcon from '../../../../assets/send-alt-1-svgrepo-com.svg';
import ChevronLeft from '../../../../assets/chevron-left-svgrepo-com.svg';
import { AnnotationsContext } from '../../../Contexts/AnnotationsContext';
import { supabase } from '../../../utils/supabase';
import { isValidEmail } from '../../../utils/isValidEmail';
import { useTranslation } from 'react-i18next';
import { generateUUID } from '../../../utils/generateUuid';
import { modifyPdfBuffer } from '../../../hooks/useDownload';
import AddSigners from './AddSigners';
import ClickableMarkers from './ClickableMarkers';

async function getUserIP() {
	try {
		const response = await fetch('https://httpbin.org/ip');
		const data = await response.json();
		return data.origin;
	}
	catch (error) {
		console.error('Error fetching IP:', error);
		return null;
	}
}

async function uploadPDF(file, uid, organizationId) {
	try {
		let bucketName = 'sign-document'; // Replace with your bucket name
		let filePath = `${organizationId}/${uid}.pdf`; // Replace with desired path in the bucket

		let { data, error } = await supabase.storage
			.from(bucketName)
			.upload(filePath, file);

		if (error) {
			throw error;
		}

		console.log('File uploaded successfully', data);
		return data;
	}
	catch (error) {
		console.error('Error uploading file:', error.message);
	}
}

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

const sendBtn = css`
  display: flex;
  padding: 0 0 0 8px;
  background: #6ce906;
  border-radius: 4px;
  border: none;
  align-items: center;
  cursor: pointer;
`;

const loadingSendBtn = css`
  display: flex;
  padding: 0 0 0 8px;
  background: #d8d8d8;
  border-radius: 4px;
  border: none;
  align-items: center;
  cursor: not-allowed;
`;

const backBtn = css`
  display: flex;
  padding: 0 8px 0 0;
  background: #a5bfd7;
  border-radius: 4px;
  border: none;
  align-items: center;
  cursor: pointer;
`;

const TagSection = ({
	showFullScreenSearch,
	onClickField,
	showSearch,
	onDisableEditorMode,
	pdfProxyObj,
	customData,
	fileName
}) => {

	const [stage, setStage] = useState(0);

	const { annotationsRef } = useContext(AnnotationsContext);

	const { t } = useTranslation();

	const [emailInput, setEmailInput] = useState('');
	const [nameInput, setNameInput] = useState('');
	const [recipientEmail, setRecipientEmail] = useState('');
	const [subject, setSubject] = useState(t("doc-ready-signing"));
	const [replyTo, setReplyTo] = useState(customData?.email);
	const [subjectModified, setSubjectModified] = useState(false);
	const [message, setMessage] = useState(`${t("Hello")},\n\n${t("please-sign")}\n\n${t("thank-you")},\n\n${customData?.name}`);
	const [messageModified, setMessageModified] = useState(false);
	const [loadingSend, setLoadingSend] = useState(false);

	const [signers, setSigners] = useState([{ name: '', email: '' }]);

	useEffect(() => {
		if (subjectModified) {
			return;
		}
		setSubject(`${t("doc-ready-signing")}: ${nameInput}`);
	}, [nameInput]);

	useEffect(() => {
		if (messageModified) {
			return;
		}
		setMessage(`${t("Hello")} ${nameInput},\n\n${t("please-sign")}\n\n${t("thank-you")},\n\n${customData?.name}`);
	}, [nameInput]);

	const getWrapperClass = () => {
		if (showFullScreenSearch) {
			return fullSearchWrapper;
		}
		return showSearch ? visibleSearchWrapper : invisibleSearchWrapper;
	};

	const hasNameTag = () => annotationsRef.current.some((ann) => ann.overlayText === 'Name');

	const hasEmailTag = () => annotationsRef.current.some((ann) => ann.overlayText === 'Email');

	const [ip, setIp] = useState('');

	const fetchIp = async () => {
		const res = await getUserIP();
		setIp(res);
	};

	useEffect(() => {
		fetchIp();
	}, []);

	const onSend = async () => {
		if (!subject) {
			alert(t("subject-required"));
			return;
		}
		if (!recipientEmail) {
			alert(t("email-required"));
			return;
		}
		if (!isValidEmail(recipientEmail)) {
			alert(t("email-invalid"));
			return;
		}
		setLoadingSend(true);
		try {
			const originalBuffer = await pdfProxyObj.getData();
			const regularAnnotations = annotationsRef.current.filter((e) => !e.overlayText);
			const buffer = await modifyPdfBuffer(originalBuffer, regularAnnotations);

			const uuid = generateUUID();
			const doc = await uploadPDF(buffer, uuid, customData?.organizationId);
			if (!doc) {
				setLoadingSend(false);
				alert(t("something-wrong-upload-pdf"));
				return;
			}
			const { data, error } = await supabase.functions.invoke('create-signing-room', {
				body: {
					doc_type: "pdf",
					status: "pending",
					organizationId: customData?.organizationId,
					senderEmail: replyTo,
					receiverEmail: recipientEmail,
					message,
					pdfDocumentPath: `${customData?.organizationId}/${uuid}.pdf`,
					annotations: annotationsRef.current.filter((e) => !!e.overlayText),
					emailField: emailInput,
					nameField: nameInput,
					senderName: customData?.name,
					documentName: fileName,
					subject,
					userIp: ip,
					userAgent: navigator.userAgent
				}
			});

			const formData = {
				document_name: fileName,
				receiver_name: nameInput,
				receiver_email: recipientEmail,
				document_id: data.id,
				entity_id: customData?.organizationId,
				created_at: new Date().toISOString(),
				status: "pending",
				doc_type: "pdf"
			};

			const result = await fetch('https://storenewpayload-aobn3y2eda-uc.a.run.app/', {
					method: 'POST',
					body: JSON.stringify(formData),
			});

			if (result?.status !== 200) {
				alert("Something went wrong. The signer has received the document but our system was unable to save parts of the data. Please reach out to alex@signeasynow.com to correct this issue.");
				// setLoadingSend(false);
				return;
			}

			if (error) {
				alert(t("something-wrong-email"));
				setLoadingSend(false);
				return;
			}
			alert(t("doc-sent-success"));
			// leave this to true to avoid abuse.
			setLoadingSend(true);
		} catch (err) {
			alert(t("something-wrong-email"));
			console.log(err, 'err333')
			setLoadingSend(false);
		}
	};
  

	const onChangeEmailTag = (e) => {
		if (emailInput === recipientEmail) {
			setRecipientEmail(e.target.value);
		}
		setEmailInput(e.target.value);
	};

	const handleKeyDown = (e) => {
		if (e.key === 'Delete') {
			// e.stopPropagation();
		}
	};

	const onCompleteStageZero = () => {
		if (hasNameTag() || hasEmailTag()) {
			setStage(1);
		}
		else {
			setStage(2);
		}
	};

	const onRevertFromStage2 = () => {
		if (hasNameTag() || hasEmailTag()) {
			setStage(1);
		}
		else {
			setStage(0);
		}
	};

	const onProceedToStep = (num) => {
		switch (num) {
			case 1: {
				if (!signers.length) {
					return alert("At least one signer is required");
				}
				if (signers.some((signer) => {
					return !signer.name?.trim() || !signer.email?.trim();
				})) {
					return alert("Please set the name and email for every signer")
				}
				const emailRegex = /^\w+([\.-]?\w+)*@\w+([\.-]?\w+)*(\.\w{2,3})+$/;
				if (signers.some((signer) => {
						return !emailRegex.test(signer.email);
				})) {
						return alert("Please enter a valid email address for every signer");
				}
				// onDisableEditorMode();
				setStage(1);
				break;
			}
		}
	}

	const onProceedToStep1 = () => {
		onDisableEditorMode();
		onCompleteStageZero();
	};

	const onChangeSubject = (e) => {
		setSubject(e.target.value);
		setSubjectModified(true);
	};

	const onChangeMessage = (e) => {
		setMessage(e.target.value);
		setMessageModified(true);
	};

	const onSubmitStage1 = () => {
		if (hasNameTag() && !nameInput) {
			alert(t("name-required"));
			return;
		}
		if (hasEmailTag() && !emailInput) {
			alert(t("email-required"));
			return;
		}
		if (hasEmailTag() && !isValidEmail(emailInput)) {
			alert(t("email-invalid"));
			return;
		}
		setStage(2);
	};

	const onChangeName = (e) => {
		setNameInput(e.target.value);
	}

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

	if (stage === 0) {
		return <AddSigners
			signers={signers}
			setSigners={setSigners}
			showFullScreenSearch={showFullScreenSearch}
			showSearch={showSearch}
			onNext={() => onProceedToStep(1)}
		/>
	}

	if (stage === 1) {
		return (
			<ClickableMarkers
				signers={signers}
				showFullScreenSearch={showFullScreenSearch}
				showSearch={showSearch}
				onClickField={onClickField}
				onBack={() => setStage(0)}
				onNext={() => onProceedToStep(2)}
			/>
		);
	}

	if (stage === 2) {
		return (
			<div>
				<div css={getWrapperClass()}>
					<div style={{ margin: '12px 4px 8px' }}><ProgressBar completed={67} customLabel="&nbsp;" bgColor="#d9b432" /></div>
					<div style={{ margin: '4px' }}>{t("when-marker-clicked")}</div>
					{
						hasNameTag() && (
							<input
								onFocus={onInputFocus}
								onKeyDown={handleKeyDown}
								value={nameInput}
								onChange={onChangeName}
								style={{ margin: '4px', width: '260px' }} type="text" placeholder={t("Name")}
							/>
						)
					}
					{
						hasEmailTag() && (
							<input
								onFocus={onInputFocus}
								value={emailInput} onChange={onChangeEmailTag} style={{ margin: '4px', width: '260px' }} type="email" placeholder={t("Email")} />
						)
					}
				</div>
				<div style={{ display: 'flex', justifyContent: 'space-between', padding: '8px 4px', background: '#f1f3f5' }}>
					<button css={backBtn} onClick={() => setStage(0)}><Icon src={ChevronLeft} alt={t("Back")} /><div>{t("Back")}</div></button>
					<button css={nextBtn} onClick={onSubmitStage1}><div>{t("Next")}</div><Icon src={ChevronRight} alt={t("Next")} /></button>
				</div>
			</div>
		);
	}

	return (
		<div>
			<div css={getWrapperClass()}>
				<div style={{ margin: '12px 4px 8px' }}><ProgressBar completed={98} customLabel="&nbsp;" bgColor="#d9b432" /></div>
				<div style={{ margin: '4px' }}>{t("doc-ready-send")}</div>
				<br />
				<div style={{ margin: '4px' }}>{t("recipient-email")}</div>
				<input
					onFocus={onInputFocus}
					value={recipientEmail} onChange={(e) => setRecipientEmail(e.target.value)} style={{ margin: '4px', width: '260px' }} type="email" placeholder={t("Email")} />
				<br />
				{
					!hasNameTag() && (
						<>
							<div style={{ margin: '4px' }}>{t("recipient-name")}</div>
							<input
								onFocus={onInputFocus}
								value={nameInput} onChange={(e) => setNameInput(e.target.value)} style={{ margin: '4px', width: '260px' }} type="text" placeholder="" />
							<br />
						</>
					)
				}
				<div style={{ margin: '4px' }}>{t("email-subject")}</div>
				<input
					onFocus={onInputFocus}
					value={subject} onChange={onChangeSubject} style={{ margin: '4px', width: '260px' }} type="email" placeholder="" />
				<br />
				<div style={{ margin: '4px' }}>{t("add-custom-message")}</div>

				<textarea
					onFocus={onInputFocus}
					minLength={4} value={message} onChange={onChangeMessage} style={{ margin: '4px', width: '260px', height: 80 }} type="email" placeholder=""
				/>
				<div style={{ margin: '4px' }}>Reply to</div>
				<input
					onFocus={onInputFocus}
					value={replyTo}
					onChange={(e) => setReplyTo(e.target.value)}
					style={{ margin: '4px', width: '260px' }}
					type="email"
					placeholder=""
				/>
			</div>
			<div style={{ display: 'flex', justifyContent: 'flex-start', padding: '8px 4px', background: '#f1f3f5' }}>
				<button css={backBtn} onClick={onRevertFromStage2}><Icon src={ChevronLeft} alt={t("Back")} /><div>{t("Back")}</div></button>
				<button style={{marginLeft: 12}} disabled={loadingSend} css={loadingSend ? loadingSendBtn : sendBtn} onClick={onSend}><div>{t("Send")}</div><Icon src={SendIcon} alt={t("Send")} /></button>
			</div>
		</div>
	);
	
};

export default TagSection;