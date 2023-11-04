/** @jsxImportSource @emotion/react */
import { css } from '@emotion/react';

import ZoomIn from '../../assets/minus-circle-svgrepo-com.svg';
import ZoomOut from '../../assets/add-circle-svgrepo-com.svg';
import ChevronDown from '../../assets/chevron-down-svgrepo-com.svg';
import Dropdown from '../components/Dropdown';
import { useDebounce } from '../utils/useDebounce';
import { useEffect, useRef, useState } from 'preact/hooks';
import { Icon, Tooltip } from 'aleon_35_pdf_ui_lib';
import { useTranslation } from 'react-i18next';
import { AnnotationEditorParamsType } from 'pdfjs-dist/build/pdf';

const inputStyles = css`
  font-size: 16px;
  height: 12px;
  border: none;
  font-weight: 600;
  color: #5b5b5b;
  background: transparent;
  width: 28px;
  text-align: right; // This line was added
  &:focus {
    outline: none;
  }
`;

const wrapper = css`
  display: flex;
  align-items: center;
  font-weight: 600;
`;

const innerWrapper = css`
  background: #f3f3f3;
  display: flex;
  align-items: center;
  padding: 2px 8px;
  border-radius: 4px;
`;

const dropdownTitle = css`
  display: flex;
  align-items: center;
  cursor: pointer;
  margin-right: 12px;
`;

const percentStyle = css`
  margin-right: 8px;
  color: #5b5b5b;
`;

const zoomLeft = css`
  margin-right: 4px;
`;

const childStyle = css`
  margin: 8px 0;
`; // padding: 12px 16px;

const zoomOptionStyle = css`
  padding: 4px 16px;
  cursor: pointer;
  &:hover {
    background-color: #e7e7e7;
  }
`;

const MAX_ZOOM = 9999;

const MIN_ZOOM = 0.1;

const ZOOM_FACTOR = 0.1;

const SLOW_ZOOM_FACTOR = 0.05;

const RoundZoomValue = (v) => Math.floor(v * 100);

const FontSizeInput = ({
  pdfViewerRef
}) => {

	const { t } = useTranslation();

	const zoomTextRef = useRef('100');

	const [zoomValue, setZoomValue] = useState(100);

	
	const _onZoomOut = () => {

	};

	const _onZoomIn = () => {

	};

	const onZoomIn = useDebounce(_onZoomIn, 5);
	const onZoomOut = useDebounce(_onZoomOut, 5);

	const _onChangeZoomByText = (e) => {

	};

	const onChangeZoomByText = useDebounce(_onChangeZoomByText, 5);

	const setZoom = (value) => {
	};

	const onFitWidth = () => {
	}

	const onFitHeight = () => {
	}

  const onSelectValue = (v) => {
    setZoomValue(v);
    // console.log(pdfViewerRef.current, 'pdfViewerRef.current')
    pdfViewerRef.current.annotationEditorParams = {
			type: AnnotationEditorParamsType.FREETEXT_SIZE,
			value: v
		}
  }

	return (
		<div css={wrapper}>
			<div css={innerWrapper}>
				<input value={zoomValue} css={inputStyles} ref={zoomTextRef} onChange={onChangeZoomByText} type="text" />
				<Dropdown
					width={100}
					marginTop={28}
					title={
						<div css={dropdownTitle}>
							<div css={percentStyle}>%</div>
							<Icon size="sm" src={ChevronDown} alt={t("arrowDown")} />
						</div>
					}
					child={<div css={childStyle}>
						<div css={zoomOptionStyle} onClick={onFitWidth}>Fit to width</div>
						<div css={zoomOptionStyle} onClick={onFitHeight}>Fit to page</div>
						<hr />
						<div css={zoomOptionStyle} onClick={() => onSelectValue(12)}>12</div>
						<div css={zoomOptionStyle} onClick={() => onSelectValue(20)}>20</div>
						<div css={zoomOptionStyle} onClick={() => setZoom(0.5)}>50%</div>
						<div css={zoomOptionStyle} onClick={() => setZoom(1)}>100%</div>
						<div css={zoomOptionStyle} onClick={() => setZoom(1.25)}>125%</div>
						<div css={zoomOptionStyle} onClick={() => setZoom(1.5)}>150%</div>
						<div css={zoomOptionStyle} onClick={() => setZoom(2)}>200%</div>
						<div css={zoomOptionStyle} onClick={() => setZoom(4)}>400%</div>
						<div css={zoomOptionStyle} onClick={() => setZoom(8)}>800%</div>
						<div css={zoomOptionStyle} onClick={() => setZoom(16)}>1600%</div>
						<div css={zoomOptionStyle} onClick={() => setZoom(64)}>6400%</div>
					</div>}
				/>
				<div css={zoomLeft}>
					<Tooltip title={t("zoomIn")}>
						<Icon onClick={onZoomIn} src={ZoomOut} alt={t("zoomIn")} />
					</Tooltip>
				</div>
				<Tooltip title={t("zoomOut")}>
					<Icon onClick={onZoomOut} src={ZoomIn} alt={t("zoomOut")} />
				</Tooltip>
			</div>
		</div>
	);
};

export default FontSizeInput;