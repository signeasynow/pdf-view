/** @jsxImportSource @emotion/react */
import { css } from '@emotion/react';

const wrapper = css`
	color: white;
  background: #008200;
  padding: 4px;
  margin-right: 8px;
  border-radius: 4px;
  cursor: pointer;
  box-shadow: 0px 4px 8px rgba(0, 0, 0, 0.25);
`;

export const GoToNextTag = () => {

  return (
    <div css={wrapper}>
      Go to signature
    </div>
  );
};

export default GoToNextTag;
