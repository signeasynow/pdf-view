/** @jsxImportSource @emotion/react */
import { css } from '@emotion/react'

export const Icon = ({ src, alt, onClick }) => (
  <img onClick={onClick} css={css({ width: 28, height: 28, cursor: "pointer"})} src={src} alt="" />
)
