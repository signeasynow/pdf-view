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
		let bucketName = 'template-document'; // Replace with your bucket name
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

const tagBtnStyle = css`
  background: #fee179;
	margin: 4px;
`;

const nextBtn = css`
  display: flex;
  padding: 8px;
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

const FormFillSection = ({
	showFullScreenSearch,
	onClickField,
	showSearch,
	onDisableEditorMode,
	pdfProxyObj,
	customData,
	fileName,
	isEdit
}) => {

	const { annotationsRef } = useContext(AnnotationsContext);

	const { t } = useTranslation();

	const [nameInput, setNameInput] = useState('');
	const [autoFillInput, setAutoFillInput] = useState('');
	const [templateName, setTemplateName] = useState('');
	const [subject, setSubject] = useState(t("doc-ready-signing"));
	const [subjectModified, setSubjectModified] = useState(false);
	const [message, setMessage] = useState(`${t("Hello")},\n\n${t("please-sign")}\n\n${t("thank-you")},\n\n${customData?.name}`);
	const [messageModified, setMessageModified] = useState(false);
	const [loadingSend, setLoadingSend] = useState(false);

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

	const [ip, setIp] = useState('');

	const fetchIp = async () => {
		const res = await getUserIP();
		setIp(res);
	};

	useEffect(() => {
		fetchIp();
	}, []);

	const onEditChanges = async () => {
		setLoadingSend(true);
		try {
			const { data, error } = await supabase.functions.invoke('create-signing-room', {
				body: {
					actionType: 'update_template',
					id: customData?.templateId,
					annotations: annotationsRef.current.filter((e) => !!e.overlayText && !e.isAutoFill),
					fillableAnnotations: annotationsRef.current.filter((e) => !!e.overlayText && !!e.isAutoFill),
				}
			});

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
	}

	const onSaveChanges = async () => {
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
					actionType: 'create_template',
					organizationId: customData?.organizationId,
					annotations: annotationsRef.current.filter((e) => !!e.overlayText && !e.isAutoFill),
					fillableAnnotations: annotationsRef.current.filter((e) => !!e.overlayText && !!e.isAutoFill),
					pdfDocumentPath: `${customData?.organizationId}/${uuid}.pdf`,
					documentName: templateName,
					senderEmail: "placeholder"
				}
			});

			if (error) {
				alert(t("something-wrong-email"));
				setLoadingSend(false);
				return;
			}

			alert("Your changes were saved!");
			// leave this to true to avoid abuse.
			setLoadingSend(false);
		} catch (err) {
			alert(t("something-wrong-email"));
			console.log(err, 'err333')
			setLoadingSend(false);
		}
	};
  

	const handleKeyDown = (e) => {
		if (e.key === 'Delete') {
			// e.stopPropagation();
		}
	};

	const onChangeAutoFill = (e) => {
		setAutoFillInput(e.target.value);
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

	const onSubmitAutoFill = () => {
		if (!autoFillInput) {
			return alert("Please name your marker");
		}
		if (annotationsRef.current?.some((annotation) => annotation.overlayText === autoFillInput)) {
			alert("Please use a different name that hasn't been used yet.")
			return;
		}
		const value = autoFillInput;
		onClickField(value, true);
		setAutoFillInput("");
	}

	return (
		<div>
			<div css={getWrapperClass()}>
				<div style={{ margin: '12px 4px 8px' }}><ProgressBar completed={33} customLabel="&nbsp;" bgColor="#d9b432" /></div>
				<h3 style={{marginLeft: '4px'}}>Template name</h3>
				<input
					onFocus={onInputFocus}
					onKeyDown={handleKeyDown}
					value={templateName}
					onChange={(e) => setTemplateName(e.target.value)}
					style={{ margin: '4px', width: '260px' }} type="text" placeholder={"Name your template"}
				/>
				<h3 style={{marginLeft: '4px'}}>Add clickable markers</h3>
				<div style={{ margin: '4px' }}>{t("add-markers-doc")}</div>
				<button css={tagBtnStyle} onClick={() => onClickField('Sign')}>{t("Signature")}</button>
				<button css={tagBtnStyle} onClick={() => onClickField('Name')}>{t("Name")}</button>
				<button css={tagBtnStyle} onClick={() => onClickField('Email')}>{t("Email")}</button>
				<button css={tagBtnStyle} onClick={() => onClickField('Date')}>{t("Date")}</button>

				<h3 style={{marginLeft: '4px'}}>Add auto-fill marker</h3>
				<div style={{margin: 4}}>Name your marker and click to place it on the document. You'll specify the data to auto-fill when you're ready to send the template.</div>
				<input
					onFocus={onInputFocus}
					onKeyDown={handleKeyDown}
					value={autoFillInput}
					onChange={onChangeAutoFill} style={{ margin: '4px', width: '260px' }} type="text" placeholder={"Marker name, ie. First Name"}
				/>
				<button disabled={!autoFillInput} css={tagBtnStyle} onClick={onSubmitAutoFill}>Add {autoFillInput || "Auto-fill marker"}</button>
			</div>
			<div style={{ display: 'flex', justifyContent: 'space-between', padding: '8px 4px', background: '#f1f3f5' }}>
				<div />
				<button disabled={loadingSend} css={nextBtn} onClick={isEdit ? onEditChanges : onSaveChanges}><div>Save</div></button>
			</div>
		</div>
	)
	
};

export default FormFillSection;