/** @jsxImportSource @emotion/react */
import { css } from '@emotion/react';

import { useRef } from 'preact/hooks';
import 'pdfjs-dist/web/pdf_viewer.css';
import { Icon } from 'aleon_35_pdf_ui_lib';
import ChevronLeft from '../assets/chevron-left-svgrepo-com.svg';
import ChevronRight from '../assets/chevron-right-svgrepo-com.svg';

const visibleSearchWrapper = css`
  background: #f1f3f5;
  width: 300px;
  flex-shrink: 0;
  flex-grow: 0;
  font-family: Lato;
  font-size: 14px;
  color: #5b5b5b;
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
	showSearch,
	searchText,
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

	const searchTextRef = useRef('');

	const onClickClear = () => {
		searchTextRef.current.value = '';
		onClear();
	};

	return (
		<div css={showSearch ? visibleSearchWrapper : invisibleSearchWrapper}>
			<div css={innerWrapperStyle}>
				<div>
					<div css={inputWrapperStyle}>
						<input css={inputStyle} ref={searchTextRef} onChange={onChange} placeholder="Search document" />
						{
							!!searchText && <button css={inputCloseStyle} onClick={onClickClear}>✖</button>
						}
					</div>
				</div>
				<div css={belowInputStyle}>
					<input value={caseSensitive} onClick={onToggleCaseSensitive} type="checkbox" id="caseSensitive" />
					<label css={checkboxLabelStyle} htmlFor="caseSensitive">Case sensitive</label>
					<input value={matchWholeWord} onClick={onToggleWholeWord} type="checkbox" id="wholeWord" />
					<label css={checkboxLabelStyle} htmlFor="wholeWord">Whole word</label>
					{
						!!searchText && (
							<>
								<hr css={hrStyle} />
								<div css={resultsCountSectionStyle}>
									<div>
										{matchesCount} results found
									</div>
									<div css={arrowsStyle}>
										<div onClick={onPrev}>
											<Icon src={ChevronLeft} alt="Arrow left" />
										</div>
										<div onClick={onNext}>
											<Icon src={ChevronRight} alt="Arrow right" />
										</div>
									</div>
								</div>
							</>
						)
					}
				</div>
			</div>
		</div>
	);
};

export default SearchBar;