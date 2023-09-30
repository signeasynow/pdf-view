/** @jsxImportSource @emotion/react */
import { css } from '@emotion/react';
import { useEffect, useRef, useState } from 'preact/hooks';
import 'pdfjs-dist/web/pdf_viewer.css';
import { Icon } from 'aleon_35_pdf_ui_lib';
import ChevronLeft from '../../../assets/chevron-left-svgrepo-com.svg';
import ChevronRight from '../../../assets/chevron-right-svgrepo-com.svg';
import { useTranslation } from 'react-i18next';
import SearchbarTools from './SearchbarTools';
import ConversationSection from './ConversationSection';
import { extractLastThreeQA } from '../../utils/extractLastQaQuestions';

const confirmBtnStyle = css`
  background: #3183c8;
  color: white;
  border: 1px solid transparent;
  font-size: 16px;
  padding: 8px 16px;
  border-radius: 4px;
  cursor: pointer;
`
const disabledConfirmBtnStyle = css`
background: grey;
color: white;
border: 1px solid transparent;
font-size: 16px;
padding: 8px 16px;
border-radius: 4px;
cursor: not-allowed;
`

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

const topSectionStyle = css`
  margin-top: 16px;
  position: sticky;
  top: 0;
  z-index: 2;
  background: #f1f3f5;
  width: 100%;
  display: flex;
  justify-content: center;
	flex-direction: column;
	align-items: center;
`;

const thumbnailTopActionsWrapper = css`
  background: #d6dee8;
	width: 100px;
	display: flex;
	align-items: center;
	justify-content: center;
	margin-top: 8px;
	margin-bottom: 8px;
	border-radius: 4px;
`;

const SearchBar = ({
	aiDocHash,
	aiLimitReached,
	currentAiDocHash,
	aiDocId,
	showSearch,
	setSearchBarView,
	searchBarView,
	onAskQuestion,
	searchText,
	onEmbed,
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
	setConversation
}) => {

	const conversationContainerRef = useRef(null); // New ref for the conversation container

	const [loading, setLoading] = useState(false);
  const [rows, setRows] = useState(1);

	const handleSendQuestion = (questionText) => {
    setRows(1);
    setLoading(true);
    onAskQuestion(questionText, extractLastThreeQA(conversation)).then((answerText) => {
      setConversation([
        ...conversation,
        { type: 'question', text: questionText },
        { type: 'answer', text: answerText.answer }
      ]);
      setLoading(false);
    }).catch((err) => {
      alert("Something went wrong. Please reload the page and try again.")
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
	}

	const handleEmbed = () => {
		setLoading(true);
		onEmbed().then(() => {
			setLoading(false);
		}).catch((err) => {
			alert("Something went wrong. Please try again later.")
			setLoading(false);
		})
	}

	return (
		<div css={showSearch ? visibleSearchWrapper : invisibleSearchWrapper}>
			{
				searchBarView === "ai" && showSearch && (
					<>
						<div css={topSectionStyle}>
							<div css={thumbnailTopActionsWrapper}>
								<SearchbarTools
									aiDocId={aiDocId}
									onRemoveChatHistory={handleRemoveChatHistory}
									searchBarView={searchBarView} onToggle={() => {
									setSearchBarView("search")
								}} />
							</div>
						</div>
						{
							!aiDocId && (
								<div style={{margin: 8, display: "flex", flexDirection: "column"}}>
									<button disabled={loading || aiLimitReached} onClick={handleEmbed} css={aiLimitReached ? disabledConfirmBtnStyle : confirmBtnStyle}>{loading ? "Please wait..." : "Enable AI Discussions"}</button>
									<p>{aiLimitReached ? "Daily limit reached. Subscribe to continue." : "Activate to let AI answer queries about this document."}</p>
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
									onFindCitation={onChange}
									onAskQuestion={onAskQuestion}
									onEmbed={onEmbed}
								/>
							)
						}
					</>
				)
			}
			{
				searchBarView === "search" && (
					<>
						<div css={topSectionStyle}>
							<div css={thumbnailTopActionsWrapper}>
								<SearchbarTools onToggle={() => {
									setSearchBarView("ai")
								}} />
							</div>
						</div>
						<div css={innerWrapperStyle}>
							<div>
								<div css={inputWrapperStyle}>
									<input css={inputStyle} ref={searchTextRef} onChange={onChange} placeholder={t("searchDocument")} />
									{
										!!searchText && <button css={inputCloseStyle} onClick={onClickClear}>✖</button>
									}
								</div>
							</div>
							<div css={belowInputStyle}>
								<input value={caseSensitive} onClick={onToggleCaseSensitive} type="checkbox" id="caseSensitive" />
								<label css={checkboxLabelStyle} htmlFor="caseSensitive">{t("caseSensitive")}</label>
								<input value={matchWholeWord} onClick={onToggleWholeWord} type="checkbox" id="wholeWord" />
								<label css={checkboxLabelStyle} htmlFor="wholeWord">{t("wholeWord")}</label>
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
														<Icon src={ChevronLeft} alt={t("arrowLeft")} />
													</div>
													<div onClick={onNext}>
														<Icon src={ChevronRight} alt={t("arrowRight")} />
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