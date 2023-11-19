/** @jsxImportSource @emotion/react */
import { Icon, Tooltip } from 'alien35_pdf_ui_lib_2';
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

  return (
    <div style={{display: "flex"}}>
      <div onClick={() => onToggle("chat")} style={{fontWeight: "800", cursor: "pointer", padding: 4, fontSize: 16, textDecoration: searchBarView === "chat" ? "underline" : ""}}>Chat</div>
      <div onClick={() => onToggle("search")} style={{fontWeight: "800", cursor: "pointer", padding: 4, fontSize: 16, textDecoration: searchBarView !== "chat" ? "underline" : ""}}>Search</div>
      {
        !!aiDocId && (
          <div onClick={() => showModal("Proceeding will delete your chat history and remove the PDF from our records. Are you sure?", () => {
            onRemoveChatHistory();
          })} style={{cursor: "pointer", padding: 4, fontSize: 16 }}>Delete chat</div>
        )
      }
    </div>
  )

};

export default SearchbarTools;