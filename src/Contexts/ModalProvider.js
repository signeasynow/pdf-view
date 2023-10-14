import { useContext, useState } from 'preact/hooks';
import { createContext } from 'preact';
import ConfirmationModal from '../components/ConfirmationModal';
import SignatureModal from '../components/SignatureModal';

const ModalContext = createContext();

export const useModal = () => useContext(ModalContext);

export const ModalProvider = ({ children }) => {
  const [isVisible, setIsVisible] = useState(false);
  const [message, setMessage] = useState('');
  const [onConfirmCallback, setOnConfirmCallback] = useState(null);
  const [isSignatureVisible, setIsSignatureVisible] = useState(false);

  const showModal = (msg, onConfirm) => {
    setMessage(msg);
    setIsVisible(true);
    setOnConfirmCallback(() => onConfirm); // Storing the callback
  };

  const showSignatureModal = (msg, onConfirm) => {
    setMessage(msg);
    setIsSignatureVisible(true);
    console.log(onConfirm, 'onConfirm')
    setOnConfirmCallback(() => onConfirm); // Storing the callback
  };

  const hideModal = () => {
    setIsVisible(false);
  };

  const hideSignatureModal = () => {
    setIsSignatureVisible(false);
  };

  return (
    <ModalContext.Provider value={{ showModal, showSignatureModal, hideModal }}>
      {isVisible && <ConfirmationModal onConfirm={onConfirmCallback} message={message} onClose={hideModal} />}
      {isSignatureVisible && <SignatureModal onConfirm={onConfirmCallback} message={message} onClose={hideSignatureModal} />}
      {children}
    </ModalContext.Provider>
  );
};

export default ModalProvider;
