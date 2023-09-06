/** @jsxImportSource @emotion/react */
import { Icon, Tooltip } from 'aleon_35_pdf_ui_lib';
import ExpandIcon from "../../../assets/expand-svgrepo-com.svg";
import { useTranslation } from 'react-i18next';

const PanelTools = ({
  onToggle
}) => {

  const { t } = useTranslation();

	return (
		<Tooltip title={t("view thumbnails in full screen")}>
      <Icon onClick={onToggle} src={ExpandIcon} alt={t("expand")} />
    </Tooltip>
	);
};

export default PanelTools;