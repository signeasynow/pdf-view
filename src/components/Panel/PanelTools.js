/** @jsxImportSource @emotion/react */
import { Icon, Tooltip } from 'aleon_35_pdf_ui_lib';
import ExpandIcon from "../../../assets/expand-svgrepo-com.svg";
import { useTranslation } from 'react-i18next';
import AccessibleButton from '../AccessibleButton';

const PanelTools = ({
  onToggle
}) => {

  const { t } = useTranslation();

	return (
		<Tooltip title={t("view thumbnails in full screen")}>
      <AccessibleButton
        onClick={onToggle} 
        ariaLabel={t("view thumbnails in full screen")}
      >
        <Icon src={ExpandIcon} alt={t("expand")} />
      </AccessibleButton>
    </Tooltip>
	);
};

export default PanelTools;