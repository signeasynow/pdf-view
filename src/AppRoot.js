import { I18nextProvider } from 'react-i18next';
import i18n from './utils/i18n';
import App from './App';
import { AnnotationsProvider } from './Contexts/AnnotationsContext';
import ModalProvider from './Contexts/ModalProvider';
import { SignaturesProvider } from './Contexts/SignaturesContext';
import { FilesProvider } from './Contexts/FilesContext';
import { UndoRedoProvider } from './Contexts/UndoRedoContext';
import { ActivePageProvider } from './Contexts/ActivePageContext';
import { UserProvider } from './Contexts/UserContext';
import { AuthInfoProvider } from './Contexts/AuthInfoContext';

const AppRoot = () => (
	<I18nextProvider i18n={i18n}>
    <AuthInfoProvider>
      <UserProvider>
        <FilesProvider>
          <ActivePageProvider>
            <UndoRedoProvider>
              <SignaturesProvider>
                <AnnotationsProvider>
                  <ModalProvider>
                    <App />
                  </ModalProvider>
                </AnnotationsProvider>
              </SignaturesProvider>
            </UndoRedoProvider>
          </ActivePageProvider>
        </FilesProvider>
      </UserProvider>
    </AuthInfoProvider>
	</I18nextProvider>
);

export default AppRoot;
