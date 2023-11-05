/** @jsxImportSource @emotion/react */
import { css } from '@emotion/react';
import { I18nextProvider } from 'react-i18next';
import i18n from './utils/i18n';
import App from './App';
import { AnnotationsProvider } from './Contexts/AnnotationsContext';
import ModalProvider from './Contexts/ModalProvider';

const AppRoot = () => {
	return (<I18nextProvider i18n={i18n}>
    <AnnotationsProvider>
      <ModalProvider>
        <App />
      </ModalProvider>
    </AnnotationsProvider>
  </I18nextProvider>);
};

export default AppRoot;
