/** @jsxImportSource @emotion/react */
import { css } from '@emotion/react';
import { useRef } from 'preact/hooks';
import 'pdfjs-dist/web/pdf_viewer.css';
import { Icon } from 'aleon_35_pdf_ui_lib';
import ChevronLeft from '../../../assets/chevron-left-svgrepo-com.svg';
import ChevronRight from '../../../assets/chevron-right-svgrepo-com.svg';
import { useTranslation } from 'react-i18next';
import SearchbarTools from './SearchbarTools';
import ConversationSection from './ConversationSection';

const visibleSearchWrapper = css`
  background: #f1f3f5;
  width: 300px;
  flex-shrink: 0;
  flex-grow: 0;
  font-family: Lato;
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

const aiWrapperStyle = css`
  padding: 8px;
	position: absolute;
	bottom: 0;
	left: 0;
	right: 0;
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
	showSearch,
	setSearchBarView,
	searchBarView,
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
	onClear
}) => {

	const { t } = useTranslation();
	const searchTextRef = useRef('');

	const onClickClear = () => {
		searchTextRef.current.value = '';
		onClear();
	};

	return (
		<div css={showSearch ? visibleSearchWrapper : invisibleSearchWrapper}>
			{
				searchBarView === "ai" && (
					<>
						<div css={topSectionStyle}>
							<div css={thumbnailTopActionsWrapper}>
								<SearchbarTools searchBarView={searchBarView} onToggle={() => {
									setSearchBarView("search")
								}} />
							</div>
						</div>
						<ConversationSection onEmbed={onEmbed} />
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