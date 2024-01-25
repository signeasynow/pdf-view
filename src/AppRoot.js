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
import { LocaleProvider } from './Contexts/LocaleContext';
import { ClerkProvider } from '@clerk/clerk-react';

const clerkPublishableKey='pk_test_bWF0dXJlLWFscGFjYS01Ni5jbGVyay5hY2NvdW50cy5kZXYk';

const AppRoot = () => (
	<I18nextProvider i18n={i18n}>
    <ClerkProvider publishableKey={clerkPublishableKey}>
      <AuthInfoProvider>
        <UserProvider>
          <FilesProvider>
            <ActivePageProvider>
              <UndoRedoProvider>
                <SignaturesProvider>
                  <AnnotationsProvider>
                    <LocaleProvider>
                      <ModalProvider>
                        <App />
                      </ModalProvider>
                    </LocaleProvider>
                  </AnnotationsProvider>
                </SignaturesProvider>
              </UndoRedoProvider>
            </ActivePageProvider>
          </FilesProvider>
        </UserProvider>
      </AuthInfoProvider>
    </ClerkProvider>
	</I18nextProvider>
);

export default AppRoot;
