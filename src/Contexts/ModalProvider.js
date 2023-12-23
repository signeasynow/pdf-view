import { useContext, useState } from 'preact/hooks';
import { createContext } from 'preact';
import ConfirmationModal from '../components/ConfirmationModal';
import SignatureModal from '../components/SignatureModal';
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

	const showModal = (msg, onConfirm) => {
		setMessage(msg);
		setIsVisible(true);
		setOnConfirmCallback(() => onConfirm); // Storing the callback
	};

	const showSignatureModal = (msg, onConfirm) => {
		setMessage(msg);
		setIsSignatureVisible(true);
		setOnConfirmCallback(() => onConfirm); // Storing the callback
	};

	const showAuthModal = (login = false) => {
		setIsAuthVisible(true);
		setShowLogin(login);
	};

	const showSettingsModal = () => {
		setIsSettingsVisible(true);
	};

	const hideModal = () => {
		setIsVisible(false);
	};

	const hideSignatureModal = () => {
		setIsSignatureVisible(false);
	};
	
	const hideAuthModal = () => {
		setIsAuthVisible(false);
		setShowLogin(false);
	}

	const hideSettingsModal = () => {
		setIsSettingsVisible(false);
	}

	return (
		<ModalContext.Provider value={{ showModal, showSignatureModal, hideModal, setModifiedUiElements, showAuthModal, showSettingsModal }}>
			{isVisible && <ConfirmationModal onConfirm={onConfirmCallback} message={message} onClose={hideModal} />}
			{isAuthVisible && <AuthModal onClose={hideAuthModal} showLogin={showLogin} />}
			{isSettingsVisible && <SettingsModal onClose={hideSettingsModal} />}
			{isSignatureVisible && <SignatureModal
				modifiedUiElements={modifiedUiElements}
				onConfirm={onConfirmCallback}
				message={message}
				onClose={hideSignatureModal}
			                       />}
			{children}
		</ModalContext.Provider>
	);
};

export default ModalProvider;
