/** @jsxImportSource @emotion/react */
import { css } from '@emotion/react';
import { heightOffsetTabs } from '../../constants';

const tabStyle = css`
  margin-right: 16px;
	padding-left: 4px;
	padding-right: 4px;
`;

const Wrapper = ({ children }) => (
	<div css={css({
		display: 'flex',
		background: 'white',
		height: heightOffsetTabs,
		alignItems: "center",
		margin: '0 12px',
		justifyContent: 'flex-start',
		borderTop: '1px solid #ccc'
	})}
	>
		{children}
	</div>
);
// #e4e4e4

const Tabs = ({
	fileNames,
	activePageIndex,
	onClick
}) => {
	console.log(fileNames, 'fileNames')
	return (
		<Wrapper>
			{
				fileNames.map((name, idx) => (
					<span onClick={() => onClick(idx)} style={{
						cursor: activePageIndex === idx ? "" : "pointer",
						border: activePageIndex === idx ? "1px solid #1c1c1c" : "1px solid white",
						background: activePageIndex === idx ? "#e4e4e4" : ""
					}} css={tabStyle}>{name}</span>
				))
			}
		</Wrapper>
	)
}

export default Tabs;