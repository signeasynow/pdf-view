/** @jsxImportSource @emotion/react */
import { useTranslation } from 'react-i18next';
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
		<div style={{ display: 'flex' }}>
			<div onClick={() => onToggle('chat')} style={{ fontWeight: '800', cursor: 'pointer', padding: 4, fontSize: 16, textDecoration: searchBarView === 'chat' ? 'underline' : '' }}>{t('Chat')}</div>
			<div onClick={() => onToggle('search')} style={{ fontWeight: '800', cursor: 'pointer', padding: 4, fontSize: 16, textDecoration: searchBarView !== 'chat' ? 'underline' : '' }}>{t('Search')}</div>
			{
				!!aiDocId && (
					<div onClick={() => showModal(t('delete-proceed-warning'), () => {
						onRemoveChatHistory();
					})} style={{ cursor: 'pointer', padding: 4, fontSize: 16 }}
					>{t('Delete chat')}</div>
				)
			}
		</div>
	);
};

export default SearchbarTools;