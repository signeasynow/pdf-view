/** @jsxImportSource @emotion/react */

const AccessibleButton = ({ onClick, children, ariaLabel }) => (
	<div
		role="button"
		tabIndex={0}
		onClick={onClick}
		onKeyDown={(e) => { if (e.key === 'Enter' || e.key === ' ') { onClick(e); }}}
		aria-label={ariaLabel}
		aria-pressed="false"
	>
		{children}
	</div>
);

export default AccessibleButton;
