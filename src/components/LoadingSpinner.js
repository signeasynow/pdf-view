/** @jsxImportSource @emotion/react */
import { css } from "@emotion/react";

const spinnerStyle = css`
  border: 4px solid rgba(0, 0, 0, 0.1);
  width: 20px;
  height: 20px;
  border-radius: 50%;
  border-top-color: #3183c8;
  animation: spin 2s linear infinite;

  @keyframes spin {
    0% {
      transform: rotate(0deg);
    }
    100% {
      transform: rotate(360deg);
    }
  }
`;

export function LoadingSpinner() {

  return (
    <div css={spinnerStyle}></div>
  );
};