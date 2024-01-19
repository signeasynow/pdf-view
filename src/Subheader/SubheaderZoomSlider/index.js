/** @jsxImportSource @emotion/react */
import { css } from '@emotion/react';

import { useTranslation } from 'react-i18next';
import Slider from '../../components/Slider';
import { useMediaQuery } from '../../hooks/useMediaQuery';
import { Icon, Tooltip } from 'alien35_pdf_ui_lib_2';
import ZoomIn from '../../../assets/minus-circle-svgrepo-com.svg';
import ZoomOut from '../../../assets/add-circle-svgrepo-com.svg';

const containerStyle = css`
display: flex;
align-items: center;
`;

const zoomWrapper = css`
  background: #f3f3f3;
  padding-left: 4px;
  padding-right: 4px;
  height: 36px;
  border-radius: 4px;
  align-items: center;
  display: flex;
`

const zoomLeft = css`
  margin-right: 4px;
`;

const SubheaderZoomSlider = ({
	handleInputChange,
  expandedViewThumbnailScale,
  showFullScreenThumbnails

}) => {
	
	const { t } = useTranslation();

  const isSmallScreen = useMediaQuery('(max-width: 550px)');

	if (!showFullScreenThumbnails) {
		return;
	}

  const onDecrease = () => {
    handleInputChange({
      target: {
        value: Math.max(expandedViewThumbnailScale - 1, 0)
      }
    })
  }

  const onIncrease = () => {
    handleInputChange({
      target: {
        value: Math.min(expandedViewThumbnailScale + 1, 10)
      }
    })
  }

	return (
		<div css={containerStyle}>
      {isSmallScreen ? (
        <div css={zoomWrapper}>
          <div css={zoomLeft}>
            <Tooltip title={t('zoomOut')}>
              <div style={{marginTop: 4}}>
                <Icon size="md" onClick={onDecrease} src={ZoomIn} alt={t('zoomOut')} />
              </div>
            </Tooltip>
          </div>
          <Tooltip title={t('zoomIn')}>
            <Icon onClick={onIncrease} src={ZoomOut} alt={t('zoomIn')} />
          </Tooltip>
        </div>
      ) : (
        <Slider
          value={expandedViewThumbnailScale}
          onChange={handleInputChange}
        />
      )}
    </div>
	);
};

export default SubheaderZoomSlider;