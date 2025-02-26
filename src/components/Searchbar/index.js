/** @jsxImportSource @emotion/react */
import { css } from '@emotion/react';
import { useRef, useState } from 'preact/hooks';
import { Icon } from 'alien35_pdf_ui_lib_2';
import ChevronLeft from '../../../assets/chevron-left-svgrepo-com.svg';
import ChevronRight from '../../../assets/chevron-right-svgrepo-com.svg';
import { useTranslation } from 'react-i18next';
import SearchbarTools from './SearchbarTools';
import ConversationSection from './ConversationSection';
import { extractLastThreeQA } from '../../utils/extractLastQaQuestions';
import TagSection from './TagSection';
import TagFillSection from './TagFillSection';
import FormFillSection from './FormFillSection';
import { useUserData } from '../../hooks/useUserData';

const confirmBtnStyle = css`
  background: #3183c8;
  color: white;
  border: 1px solid transparent;
  font-size: 16px;
  padding: 8px 16px;
  border-radius: 4px;
  cursor: pointer;
`;
const disabledConfirmBtnStyle = css`
background: grey;
color: white;
border: 1px solid transparent;
font-size: 16px;
padding: 8px 16px;
border-radius: 4px;
cursor: not-allowed;
`;

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

const inputWrapperStyle = css`
  display: flex;
`;

const inputStyle = css`
  width: 100%;
  padding: 4px;
`;

const inputCloseStyle = css`
  position: absolute;
  right: 8px;
  border: none;
  background: none;
  margin-top: 5px;
  cursor: pointer;
`;

const innerWrapperStyle = css`
  padding: 8px;
`;

const belowInputStyle = css`
  margin-top: 8px;
`;

const checkboxLabelStyle = css`
  margin-left: 4px;
  margin-right: 4px;
`;

const hrStyle = css`
  opacity: 0.5;
  margin-top: 16px;
  margin-bottom: 16px;
`;

const resultsCountSectionStyle = css`
  display: flex;
  justify-content: space-between;
  align-items: center;
`;

const arrowsStyle = css`
  display: flex;
`;

const SearchBar = ({
	onDisableEditorMode,
	aiDocHash,
	fileName,
	customData,
	editorMode,
	pdfProxyObj,
	aiLimitReached: _aiLimitReached,
	currentAiDocHash,
	showFullScreenSearch,
	aiDocId,
	onClickField,
	showSearch,
	setSearchBarView,
	searchBarView,
	onAskQuestion,
	searchText,
	onEmbed,
	onFindCitation,
	onChange,
	matchesCount,
	onNext,
	onPrev,
	onToggleWholeWord,
	matchWholeWord,
	onToggleCaseSensitive,
	caseSensitive,
	onRemoveChatHistory,
	onClear,
	onNoToAiWarning,
	conversation,
	setConversation,
	forceRefreshView
}) => {

	const { hasValidSubscription } = useUserData();

	const aiLimitReached = _aiLimitReached && !hasValidSubscription;

	const conversationContainerRef = useRef(null); // New ref for the conversation container

	const [loading, setLoading] = useState(false);
	const [rows, setRows] = useState(1);

	const handleSendQuestion = (questionText) => {
		setRows(1);
		setLoading(true);
		onAskQuestion(questionText, extractLastThreeQA(conversation)).then((answerText) => {
			if (answerText?.error === 'document purged') {
				alert(t("document-metadata-removed"));
				setLoading(false);
				return;
			}
			setConversation([
				...conversation,
				{ type: 'question', text: questionText },
				{ type: 'answer', text: answerText.answer }
			]);
			setLoading(false);
			return;
		}).catch((err) => {
			alert(t("went-wrong-reload"));
			setLoading(false);
		});
	};

	const { t } = useTranslation();
	const searchTextRef = useRef('');

	const onClickClear = () => {
		searchTextRef.current.value = '';
		onClear();
	};

	const handleRemoveChatHistory = () => {
		onRemoveChatHistory();
	};

	const handleEmbed = () => {
		setLoading(true);
		onEmbed().then(() => {
			setLoading(false);
			return;
		}).catch((err) => {
			alert(t("something-went-wrong-try-again"));
			setLoading(false);
		});
	};

	const getWrapperClass = () => {
		if (showFullScreenSearch) {
			return fullSearchWrapper;
		}
		return showSearch ? visibleSearchWrapper : invisibleSearchWrapper;
	};

	if (editorMode === 'tag-fill') {
		return (
			<TagFillSection
				onDisableEditorMode={onDisableEditorMode}
				fileName={fileName}
				customData={customData}
				pdfProxyObj={pdfProxyObj}
				showFullScreenSearch={showFullScreenSearch}
				onClickField={onClickField}
				showSearch={showSearch}
			/>
		);
	}

	if (editorMode === 'tag') {
		return (
			<TagSection
				forceRefreshView={forceRefreshView}
				onDisableEditorMode={onDisableEditorMode}
				fileName={fileName}
				customData={customData}
				pdfProxyObj={pdfProxyObj}
				showFullScreenSearch={showFullScreenSearch}
				onClickField={onClickField}
				showSearch={showSearch}
			/>
		);
	}

	if (editorMode === 'form-fill' || editorMode === 'form-fill-edit') {
		return (
			<FormFillSection
				onDisableEditorMode={onDisableEditorMode}
				fileName={fileName}
				customData={customData}
				pdfProxyObj={pdfProxyObj}
				showFullScreenSearch={showFullScreenSearch}
				onClickField={onClickField}
				showSearch={showSearch}
				isEdit={editorMode === 'form-fill-edit'}
			/>
		);
	}

	return (
		<div css={getWrapperClass()}>
			<SearchbarTools
				aiDocId={aiDocId}
				onRemoveChatHistory={handleRemoveChatHistory}
				searchBarView={searchBarView}
				onToggle={(which) => {
					setSearchBarView(which);
				}}
			/>
			{
				searchBarView === 'chat' && showSearch && (
					<>
						{
							!aiDocId && (
								<div style={{ margin: 8, display: 'flex', flexDirection: 'column' }}>
									<button disabled={loading || aiLimitReached} onClick={handleEmbed} css={aiLimitReached ? disabledConfirmBtnStyle : confirmBtnStyle}>{loading ? `${t("Please wait")}...` : t("enable-ai")}</button>
									<p>{aiLimitReached ? t("daily-limit-reached") : t("activate-to-let")}</p>
								</div>
							)
						}
						{
							!!aiDocId && (
								<ConversationSection
									aiLimitReached={aiLimitReached}
									onYesToWarning={handleEmbed}
									onNoToAiWarning={onNoToAiWarning}
									aiDocHash={aiDocHash}
									currentAiDocHash={currentAiDocHash}
									conversation={conversation}
									conversationContainerRef={conversationContainerRef}
									loading={loading}
									rows={rows}
									setRows={setRows}
									handleSendQuestion={handleSendQuestion}
									onFindCitation={onFindCitation}
									onAskQuestion={onAskQuestion}
									onEmbed={onEmbed}
								/>
							)
						}
					</>
				)
			}
			{
				searchBarView === 'search' && (
					<>
						<div css={innerWrapperStyle}>
							<div>
								<div css={inputWrapperStyle}>
									<input css={inputStyle} ref={searchTextRef} onChange={onChange} placeholder={t('searchDocument')} />
									{
										!!searchText && <button css={inputCloseStyle} onClick={onClickClear}>✖</button>
									}
								</div>
							</div>
							<div css={belowInputStyle}>
								<input value={caseSensitive} onClick={onToggleCaseSensitive} type="checkbox" id="caseSensitive" />
								<label css={checkboxLabelStyle} htmlFor="caseSensitive">{t('caseSensitive')}</label>
								<input value={matchWholeWord} onClick={onToggleWholeWord} type="checkbox" id="wholeWord" />
								<label css={checkboxLabelStyle} htmlFor="wholeWord">{t('wholeWord')}</label>
								{
									!!searchText && (
										<>
											<hr css={hrStyle} />
											<div css={resultsCountSectionStyle}>
												<div>
													{t('resultsFound', { count: matchesCount })}
												</div>
												<div css={arrowsStyle}>
													<div onClick={onPrev}>
														<Icon src={ChevronLeft} alt={t('arrowLeft')} />
													</div>
													<div onClick={onNext}>
														<Icon src={ChevronRight} alt={t('arrowRight')} />
													</div>
												</div>
											</div>
										</>
									)
								}
							</div>
						</div>
					</>
				)
			}
		</div>
	);
};

export default SearchBar;