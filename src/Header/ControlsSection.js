/** @jsxImportSource @emotion/react */
import { css } from '@emotion/react';

import Gear from '../../assets/gear-svgrepo-com.svg';
import RotateRight from '../../assets/rotate-right-svgrepo-com.svg';
import RotateLeft from '../../assets/rotate-left-svgrepo-com.svg';
import Dropdown from '../components/Dropdown';
import { Icon } from 'aleon_35_pdf_ui_lib';
import HeaderBtn from './HeaderBtn';
import { useTranslation } from 'react-i18next';

const optionStyle = css`
  display: flex;
  align-items: center;
  padding: 0 16px;
  cursor: pointer;
  &:hover {
    background-color: #e7e7e7;
  }
`;

const optionTextStyle = css`
  margin-left: 8px;
`;

const childStyle = css`

`;

const titleStyle = css`
  margin: 12px 16px;
`;

const ControlsSection = ({
	onRotate
}) => {

	const { t } = useTranslation();

	return (
		<>
			<Dropdown title={
				<HeaderBtn title={t("viewControls")} iconAlt={t("viewControls")} icon={Gear} />
			}
				child={<div css={childStyle}>
				<h4 css={titleStyle}>{t("pageOrientation")}</h4>
				<div css={optionStyle} onClick={() => onRotate(true)}>
					<Icon src={RotateRight} alt={t("rotateClockwise")} />
					<p css={optionTextStyle}>{t("rotateClockwise")}</p>
				</div>
				<div css={optionStyle} onClick={() => onRotate(false)}>
					<Icon src={RotateLeft} alt={t("rotateCounterClockwise")} />
					<p css={optionTextStyle}>{t("rotateCounterClockwise")}</p>
				</div>
			</div>}
			/>
		</>
	);
};

export default ControlsSection;