/** @jsxImportSource @emotion/react */
import { css } from '@emotion/react';

import ZoomIn from '../../assets/minus-circle-svgrepo-com.svg';
import ZoomOut from '../../assets/add-circle-svgrepo-com.svg';
import ChevronDown from '../../assets/chevron-down-svgrepo-com.svg';
import Dropdown from '../components/Dropdown';
import { useDebounce } from '../utils/useDebounce';
import { useEffect, useRef, useState } from 'preact/hooks';
import { Icon, Tooltip } from 'alien35_pdf_ui_lib_2';
import { useTranslation } from 'react-i18next';

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

const ZoomSection = ({
	pdfViewerObj,
	viewerContainerRef,
	defaultZoom
}) => {

	const { t } = useTranslation();

	const zoomTextRef = useRef('100');

	const [zoomValue, setZoomValue] = useState(100);

	useEffect(() => {
		if (typeof defaultZoom !== 'number') {
			return;
		}
		setZoomValue(defaultZoom);
	}, [defaultZoom]);

	const _onZoomOut = () => {
		if (pdfViewerObj && pdfViewerObj.currentScale > ZOOM_FACTOR) { // minimum scale 0.1
			const newValue = Math.max(pdfViewerObj.currentScale - ZOOM_FACTOR, MIN_ZOOM);
			pdfViewerObj.currentScale = newValue;
			setZoomValue(RoundZoomValue(newValue));
		}
	};

	const _onZoomIn = () => {
		if (pdfViewerObj && pdfViewerObj.currentScale < (10 - ZOOM_FACTOR)) {
			const newValue = Math.min(pdfViewerObj.currentScale + ZOOM_FACTOR, MAX_ZOOM);
			pdfViewerObj.currentScale = newValue;
			setZoomValue(RoundZoomValue(newValue));
		}
	};

	const onZoomIn = useDebounce(_onZoomIn, 5);
	const onZoomOut = useDebounce(_onZoomOut, 5);

	const _onChangeZoomByText = (e) => {
		const { value } = e.target;
		const num = parseInt(value, 10)?.toFixed(0);
		if (isNaN(num) || !num) {
			return;
		}
		pdfViewerObj.currentScale = num / 100;
		setZoomValue(num);
	};

	const onChangeZoomByText = useDebounce(_onChangeZoomByText, 5);

	const setZoom = (value) => {
		pdfViewerObj.currentScale = value;
		zoomTextRef.current.value = (value * 100).toFixed(0);
	};

	useEffect(() => {
		if (zoomTextRef) {
			zoomTextRef.current.value = 100;
		}
	}, [zoomTextRef]);

	useEffect(() => {
		let touchStartScale = 1;
	
		const handleTouchStart = (event) => {
			if (event.touches.length === 2) {
				const touch1 = event.touches[0];
				const touch2 = event.touches[1];
				touchStartScale = Math.hypot(
					touch2.pageX - touch1.pageX,
					touch2.pageY - touch1.pageY
				);
			}
		};
	
		const handleTouchMove = (event) => {
			if (event.touches.length === 2) {
				const touch1 = event.touches[0];
				const touch2 = event.touches[1];
				const touchMoveScale = Math.hypot(
					touch2.pageX - touch1.pageX,
					touch2.pageY - touch1.pageY
				);
				const scale = pdfViewerObj.currentScale;
				pdfViewerObj.currentScale = scale * (touchMoveScale / touchStartScale);
				touchStartScale = touchMoveScale;
				setZoomValue(RoundZoomValue(pdfViewerObj.currentScale));
			}
		};
		if (!viewerContainerRef?.current) {
			return;
		}
		const viewerContainer = viewerContainerRef.current;
		viewerContainer.addEventListener('touchstart', handleTouchStart);
		viewerContainer.addEventListener('touchmove', handleTouchMove);
	
		return () => {
			viewerContainer.removeEventListener('touchstart', handleTouchStart);
			viewerContainer.removeEventListener('touchmove', handleTouchMove);
		};
	}, [pdfViewerObj, setZoomValue, viewerContainerRef]);
	
	const onFitWidth = () => {
		pdfViewerObj.currentScaleValue = 'page-width';
		setZoomValue(Math.round(pdfViewerObj.currentScale * 100));
	};

	const onFitHeight = () => {
		pdfViewerObj.currentScaleValue = 'page-height';
		setZoomValue(Math.round(pdfViewerObj.currentScale * 100));
	};

	useEffect(() => {
		if (!pdfViewerObj) {
			return;
		}
    
		const handleWheel = (event) => {
			if (event.ctrlKey) {
				event.preventDefault();  // prevent the default zoom behavior
				const zoomChange = event.deltaY < 0 ? SLOW_ZOOM_FACTOR : -SLOW_ZOOM_FACTOR;
				const newScale = Math.min(Math.max(pdfViewerObj.currentScale + zoomChange, 0.1), 99.999);
				pdfViewerObj.currentScale = newScale;
				setZoomValue(RoundZoomValue(newScale));
			}
		};

		const container = viewerContainerRef.current;
		if (!container) {
			return;
		}
		container.addEventListener('wheel', handleWheel, { passive: false });
    
		return () => {
			container?.removeEventListener('wheel', handleWheel);
		};
	}, [pdfViewerObj, setZoomValue]);

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
							<Icon size="sm" src={ChevronDown} alt={t('arrowDown')} />
						</div>
					}
					child={<div css={childStyle}>
						<div css={zoomOptionStyle} onClick={onFitWidth}>{t("Fit to width")}</div>
						<div css={zoomOptionStyle} onClick={onFitHeight}>{t("Fit to page")}</div>
						<hr />
						<div css={zoomOptionStyle} onClick={() => setZoom(0.1)}>10%</div>
						<div css={zoomOptionStyle} onClick={() => setZoom(0.25)}>25%</div>
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
					<Tooltip title={t('zoomOut')}>
						<div style={{marginTop: 4}}>
							<Icon onClick={onZoomOut} src={ZoomIn} alt={t('zoomOut')} />
						</div>
					</Tooltip>
				</div>
				<Tooltip title={t('zoomIn')}>
					<Icon onClick={onZoomIn} src={ZoomOut} alt={t('zoomIn')} />
				</Tooltip>
			</div>
		</div>
	);
};

export default ZoomSection;