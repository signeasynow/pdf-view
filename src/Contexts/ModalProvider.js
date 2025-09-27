import { useContext, useState } from 'preact/hooks';
import { createContext } from 'preact';
import ConfirmationModal from '../components/ConfirmationModal';
import SignatureModal from '../components/SignatureModal';
import TextTagModal from '../components/TextTagModal';
import AuthModal from '../components/AuthModal';
import SettingsModal from '../components/SettingsModal';

const ModalContext = createContext();

export const useModal = () => useContext(ModalContext);

export const ModalProvider = ({ children }) => {
	const [isVisible, setIsVisible] = useState(false);
	const [isAuthVisible, setIsAuthVisible] = useState(false);
	const [message, setMessage] = useState('');
	const [onConfirmCallback, setOnConfirmCallback] = useState(null);
        const [isSignatureVisible, setIsSignatureVisible] = useState(false);
        const [isSettingsVisible, setIsSettingsVisible] = useState(false);
        const [modifiedUiElements, setModifiedUiElements] = useState(null);
        const [showLogin, setShowLogin] = useState(false);
        const [locale, setLocale] = useState("");
        const [isTextTagVisible, setIsTextTagVisible] = useState(false);
        const [textTagConfig, setTextTagConfig] = useState(null);

	const showModal = (msg, onConfirm) => {
		setMessage(msg);
		setIsVisible(true);
		setOnConfirmCallback(() => onConfirm); // Storing the callback
	};

        const showSignatureModal = (name, onConfirm) => {
                setMessage(name);
                window.parent.postMessage({ type: 'annotation-modal-open-change', message: true }, '*');
                setIsSignatureVisible(true);
                setOnConfirmCallback(() => onConfirm); // Storing the callback
        };

        const showTextTagModal = (config) => {
                console.log('[TextTag] Opening text tag modal', config);
                window.parent.postMessage({ type: 'annotation-modal-open-change', message: true }, '*');
                setTextTagConfig(config);
                setIsTextTagVisible(true);
        };

	const [authMessage, setAuthMessage] = useState("");

	const showAuthModal = (login = false, customMessage) => {
		setIsAuthVisible(true);
		setShowLogin(login);
		setAuthMessage(customMessage);
	};

	const showSettingsModal = (_locale) => {
		setIsSettingsVisible(true);
		setLocale(_locale);
	};

	const hideModal = () => {
		setIsVisible(false);
	};

        const hideSignatureModal = () => {
                window.parent.postMessage({ type: 'annotation-modal-open-change', message: false }, '*');
                setIsSignatureVisible(false);
        };

        const hideTextTagModal = () => {
                console.log('[TextTag] Closing text tag modal');
                window.parent.postMessage({ type: 'annotation-modal-open-change', message: false }, '*');
                setIsTextTagVisible(false);
                setTextTagConfig(null);
        };
	
	const hideAuthModal = () => {
		setIsAuthVisible(false);
		setShowLogin(false);
	}

	const hideSettingsModal = () => {
		setIsSettingsVisible(false);
	}

        return (
                <ModalContext.Provider value={{ showModal, showSignatureModal, showTextTagModal, hideModal, hideSignatureModal, setModifiedUiElements, showAuthModal, showSettingsModal }}>
			{isVisible && <ConfirmationModal onConfirm={onConfirmCallback} message={message} onClose={hideModal} />}
			{isAuthVisible && <AuthModal message={authMessage} onClose={hideAuthModal} showLogin={showLogin} />}
			{isSettingsVisible && <SettingsModal locale={locale} onClose={hideSettingsModal} />}
                        {isSignatureVisible && <SignatureModal
                                modifiedUiElements={modifiedUiElements}
                                onConfirm={onConfirmCallback}
                                onClose={hideSignatureModal}
                                               />}
                        {isTextTagVisible && textTagConfig && (
                                <TextTagModal
                                        {...textTagConfig}
                                        onClose={hideTextTagModal}
                                />
                        )}
			{children}
		</ModalContext.Provider>
	);
};

export default ModalProvider;
