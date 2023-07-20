/** @jsxImportSource @emotion/react */
import { css } from '@emotion/react';

import 'pdfjs-dist/web/pdf_viewer.css';
import Gear from '../../assets/gear-svgrepo-com.svg';
import RotateRight from '../../assets/rotate-right-svgrepo-com.svg';
import RotateLeft from '../../assets/rotate-left-svgrepo-com.svg';
import Dropdown from '../SharedComponents/Dropdown';
import { Icon } from '../SharedComponents/Icon';
import HeaderBtn from './HeaderBtn';

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
	pdfViewerObj,
	eventBusRef
}) => {

	const onRotate = (clockwise) => {
		if (clockwise) {
			pdfViewerObj.pagesRotation += 90;
		}
		else {
			pdfViewerObj.pagesRotation -= 90;
		}
	};

	return (
		<>
			<Dropdown title={
				<HeaderBtn title="View controls" iconAlt="View controls" icon={Gear} />
			}
				child={<div css={childStyle}>
				<h4 css={titleStyle}>Page orientation</h4>
				<div css={optionStyle} onClick={() => onRotate(true)}>
					<Icon src={RotateRight} alt="Rotate clockwise" />
					<p css={optionTextStyle}>Rotate clockwise</p>
				</div>
				<div css={optionStyle} onClick={() => onRotate(false)}>
					<Icon src={RotateLeft} alt="Rotate counterclockwise" />
					<p css={optionTextStyle}>Rotate counterclockwise</p>
				</div>
			</div>}
			/>
		</>
	);
};

export default ControlsSection;