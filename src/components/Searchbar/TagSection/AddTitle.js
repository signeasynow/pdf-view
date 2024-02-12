/** @jsxImportSource @emotion/react */
import { css } from '@emotion/react';
import ProgressBar from '@ramonak/react-progress-bar';
import { Icon } from 'alien35_pdf_ui_lib_2';
import ChevronRight from '../../../../assets/chevron-right-svgrepo-com.svg';
import { useTranslation } from 'react-i18next';

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

const backBtn = css`
  display: flex;
  padding: 0 8px 0 0;
  background: #a5bfd7;
  border-radius: 4px;
  border: none;
  align-items: center;
  cursor: pointer;
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

const AddTitle = ({
	showFullScreenSearch,
	showSearch,
  onNext,
  title,
  setTitle
}) => {

	const { t } = useTranslation();

	const getWrapperClass = () => {
		if (showFullScreenSearch) {
			return fullSearchWrapper;
		}
		return showSearch ? visibleSearchWrapper : invisibleSearchWrapper;
	};

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

	return (
		<div>
			<div css={getWrapperClass()}>
				<div style={{ margin: '12px 4px 8px' }}><ProgressBar completed={25} customLabel="&nbsp;" bgColor="#d9b432" /></div>
        <h3 style={{marginLeft: '4px'}}>Add title</h3>
        <div style={{ margin: '4px' }}>Add the title to the document.</div>
				<input
					onFocus={onInputFocus}
					value={title}
          onChange={(e) => setTitle(e.target.value)}
          style={{ margin: '4px', width: '260px' }}
          type="email" placeholder="Title"
        />
			</div>
			<div style={{ display: 'flex', justifyContent: 'flex-start', padding: '8px 4px', background: '#f1f3f5' }}>
				<div />
        <button css={nextBtn} onClick={onNext}><div>{t("Next")}</div><Icon src={ChevronRight} alt={t("Next")} /></button>
			</div>
		</div>
	);
	
};

export default AddTitle;