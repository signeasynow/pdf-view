import { useContext, useState } from 'preact/hooks';
import { createContext } from 'preact';
import ConfirmationModal from '../components/ConfirmationModal';

const ModalContext = createContext();

export const useModal = () => useContext(ModalContext);

export const ModalProvider = ({ children }) => {
  const [isVisible, setIsVisible] = useState(false);
  const [message, setMessage] = useState('');

  const showModal = (msg) => {
    setMessage(msg);
    setIsVisible(true);
  };

  const hideModal = () => {
    console.log("CLOSING MODAL")
    setIsVisible(false);
  };

  return (
    <ModalContext.Provider value={{ showModal, hideModal }}>
      {isVisible && <ConfirmationModal message={message} onClose={hideModal} />}
      {children}
    </ModalContext.Provider>
  );
};

export default ModalProvider;
