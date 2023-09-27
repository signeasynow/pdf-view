/** @jsxImportSource @emotion/react */
import { Icon, Tooltip } from 'aleon_35_pdf_ui_lib';
import AiIcon from "../../../assets/ai-file-svgrepo-com.svg";
import SearchIcon from "../../../assets/search-svgrepo-com.svg";
import { useTranslation } from 'react-i18next';
import AccessibleButton from '../AccessibleButton';

const SearchbarTools = ({
  onToggle,
  searchBarView
}) => {

  const { t } = useTranslation();

  if (searchBarView === "ai") {
    return (
      <Tooltip title={"Search text"}>
        <AccessibleButton
          onClick={onToggle} 
          ariaLabel={"Search text"}
        >
          <Icon src={SearchIcon} alt={t("expand")} />
        </AccessibleButton>
      </Tooltip>
    );
  }

	return (
		<Tooltip title={"Ask your PDF questions with AI"}>
      <AccessibleButton
        onClick={onToggle} 
        ariaLabel={"Ask your PDF questions with AI"}
      >
        <Icon src={AiIcon} alt={t("expand")} />
      </AccessibleButton>
    </Tooltip>
	);
};

export default SearchbarTools;