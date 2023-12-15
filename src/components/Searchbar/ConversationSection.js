/** @jsxImportSource @emotion/react */
import { css } from '@emotion/react';
import { useEffect, useRef, useState } from 'preact/hooks';
import RobotIcon from '../../../assets/zap-svgrepo-com.svg';
import UserIcon from '../../../assets/user-svgrepo-com.svg';
import { Icon } from 'alien35_pdf_ui_lib_2';
import { LoadingSpinner } from '../LoadingSpinner';
import { useTranslation } from 'react-i18next';

const getFindableCitation = (text) => {
	// Trim the text
	let trimmedText = text.trim();

	// Remove page numbers - Adjust regex based on expected page number formats
	trimmedText = trimmedText.replace(/\[\d+\]|\(p\.\d+\)|\(pp\.\d+-\d+\)/g, '');

	// Limit to 50 characters
	return trimmedText.slice(0, 50).trim();
};

const conversationContainerStyle = css`
padding: 8px;
position: absolute;
top: 0;
bottom: 0;
overflow-y: auto;
left: 0;
right: 0;
margin-top: 60px;
`;

const closeBtnStyle = css`
  border: 1px solid lightgrey;
  font-size: 16px;
  padding: 8px 16px;
  border-radius: 4px;
  margin-left: 8px;
  cursor: pointer;
`;

const disclaimerStyle = css`
  margin: 4px 2px;
  font-size: 10px;
  text-align: center;
`;

const citationStyle = css`
  display: inline-flex;
  background: #f68800;
  color: white;
  border-radius: 4px;
  padding: 0 8px;
  cursor: pointer;
`;

const inputWrapperStyle = css`
  display: flex;
  margin: 0 2px;
`;

const conversationContentStyle = css`
  flex-grow: 1;
`;

const conversationEntryStyle = css`
  word-wrap: break-word;
  white-space: pre-wrap;
  margin-bottom: 20px;
  line-height: 1.8;
`;

const inputContainerStyle = css`
  flex-shrink: 0; /* Prevents the input from shrinking */
  position: absolute;
  bottom: 0;
  left: 0;
  right: 0;
`;

const inputStyle = css`
  width: 100%;
  padding: 4px;
  font-size: 16px;
  resize: none; // disable resizing
`;

const aiWrapperStyle = css`
  padding: 8px;
  display: flex;
  flex-direction: column;
  height: 100%;
  font-size: 16px;
`;

const parseEntryText = (text) => {
	try {
		return JSON.parse(text);
	}
	catch (error) {
		console.error('Error parsing entry text:', error);
		return { answer: text, citation: '' }; // Fallback in case of parsing error
	}
};

const ConversationSection = ({
	onChange,
	onFindCitation,
	aiLimitReached,
	handleSendQuestion,
	loading,
	rows,
	conversationContainerRef,
	setRows,
	conversation,
	aiDocHash,
	currentAiDocHash,
	onNoToAiWarning,
	onYesToWarning
}) => {

	const { t } = useTranslation();

	const [showWrongDocWarning, setShowWrongDocWarning] = useState(false);

	useEffect(() => {
		if (!aiDocHash || !currentAiDocHash) {
			return;
		}
		setShowWrongDocWarning(aiDocHash !== currentAiDocHash);
	}, [aiDocHash, currentAiDocHash]);
	const searchTextRef = useRef('');

	const handleChange = (e) => {
		const text = e.target.value;
		const lines = text.split('\n');
		let totalVisualLines = 0;
		const maxCharsPerLine = 27;
  
		for (const line of lines) {
			const lineLength = line.length;
			if (lineLength === 0) {
				totalVisualLines += 1; // For empty lines
			}
			else {
				totalVisualLines += Math.ceil(lineLength / maxCharsPerLine);
			}
		}
  
		setRows(Math.min(totalVisualLines, 5));
  
		if (onChange) {
			onChange(e);
		}
	};

	useEffect(() => {
		localStorage.setItem('conversation', JSON.stringify(conversation));

		if (conversationContainerRef.current) {
			conversationContainerRef.current.scrollTop = conversationContainerRef.current.scrollHeight;
		}
	}, [conversation]);

	useEffect(() => {
		// Scroll to the bottom when the component mounts
		if (conversationContainerRef.current) {
			conversationContainerRef.current.scrollTop = conversationContainerRef.current.scrollHeight;
		}
	}, []); // Empty dependency array means this runs once when the component mounts
  
	const handleSubmit = () => {
		const qText = searchTextRef.current.value;
		handleSendQuestion(qText);
		searchTextRef.current.value = '';
	};
  
	const onNoToWarning = () => {
		setShowWrongDocWarning(false);
		onNoToAiWarning();
	};

	const inputRef = useRef(null); // New Ref to track input container

	if (showWrongDocWarning) {
		return (
			<div style={{ margin: '4px 12px 8px', alignItems: 'center', display: 'flex', flexDirection: 'column' }}>
				<div>{t('document-updated-warning')}</div>
				<div>
					<button disabled={loading} onClick={onYesToWarning} css={closeBtnStyle}>{loading ? <LoadingSpinner size="sm" /> : t('Yes')}</button>
					{
						!loading && <button disabled={loading} onClick={onNoToWarning} css={closeBtnStyle}>{t('No')}</button>
					}
				</div>
			</div>
		);
	}
	return (
		<div css={aiWrapperStyle}>
			<div>
				<div ref={conversationContainerRef} style={{ marginBottom: (30 * rows) + 20 }} css={conversationContainerStyle}>
					<div css={conversationContentStyle}>
						{conversation.map((entry, index) => {
							const { answer, citation } = parseEntryText(entry.text);
							return (
								<div css={conversationEntryStyle} key={index}>
									{entry.type === 'question' ? <Icon clickable={false} src={UserIcon} /> : <Icon src={RobotIcon} />}
									<div>{answer}</div>
									{
										citation && (
											<div onClick={() => onFindCitation({
												target: {
													value: getFindableCitation(citation)
												}
											})}  css={citationStyle}
											>{t('View citation')}</div>
										)
									}
								</div>
							);
						})}
					</div>
				</div>
				<div css={inputContainerStyle}>
					<div ref={inputRef} css={inputWrapperStyle}>
						<textarea
							style={{ cursor: aiLimitReached ? 'not-allowed' : '' }}
							disabled={aiLimitReached}
							css={inputStyle}
							ref={searchTextRef}
							rows={rows}
							onChange={handleChange}
							placeholder={aiLimitReached ? t('daily-limit-warning') : t('ask-doc-question')}
						/>
						<button disabled={loading || aiLimitReached} style={{ cursor: aiLimitReached ? 'not-allowed' : 'pointer', fontSize: 16, border: 'none', borderBottomRightRadius: '2px', borderTopRightRadius: '2px', color: 'white', background: (loading || aiLimitReached) ? 'white' : '#3183c8' }} onClick={handleSubmit}>{loading ? <LoadingSpinner size="sm" /> : '⮕'}</button>
					</div>
					<p css={disclaimerStyle}>{t('wrong-answers-warning')}</p>
				</div>
			</div>
		</div>
	);
};

export default ConversationSection;
