/** @jsxImportSource @emotion/react */
import { Icon, Tooltip } from 'aleon_35_pdf_ui_lib';
import AiIcon from "../../../assets/ai-file-svgrepo-com.svg";
import SearchIcon from "../../../assets/search-svgrepo-com.svg";
import ChatDelete from "../../../assets/chat-delete-svgrepo-com.svg";
import { useTranslation } from 'react-i18next';
import AccessibleButton from '../AccessibleButton';
import { useModal } from '../../Contexts/ModalProvider';

const SearchbarTools = ({
  onToggle,
  searchBarView,
  onRemoveChatHistory,
  aiDocId
}) => {

  const { t } = useTranslation();
  
  const { showModal } = useModal();


  if (searchBarView === "ai") {
    return (
      <>
        <Tooltip title={"Search text"}>
          <AccessibleButton
            onClick={onToggle} 
            ariaLabel={"Search text"}
          >
            <Icon src={SearchIcon} alt={t("expand")} />
          </AccessibleButton>
        </Tooltip>
        {
          !!aiDocId && (
            <div style={{marginLeft: 8}}>
              <Tooltip title={"Delete chat"}>
                <AccessibleButton
                  onClick={() => showModal("Proceeding will delete your chat history and remove the PDF from our records. Are you sure?", () => {
                    onRemoveChatHistory();
                  })} 
                  ariaLabel={"Delete chat"}
                >
                  <Icon src={ChatDelete} alt={"Delete chat"} />
                </AccessibleButton>
              </Tooltip>
            </div>
          )
        }
      </>
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