import { createContext } from 'preact';
import { useState } from 'preact/hooks';

export const SignaturesContext = createContext({
        fullSignature: '',
        setFullSignature: () => {},
        initialsSignature: '',
        setInitialsSignature: () => {},
        notarySeal: '',
        setNotarySeal: () => {}
});

export const SignaturesProvider = ({ children }) => {
        const [fullSignature, setFullSignature] = useState(localStorage.getItem('signatureImage'));
        const [initialsSignature, setInitialsSignature] = useState(localStorage.getItem('initialsImage'));
        const [notarySeal, setNotarySeal] = useState(localStorage.getItem('notarySeal'));

        return (
                <SignaturesContext.Provider value={{
                        fullSignature,
                        setFullSignature,
                        initialsSignature,
                        setInitialsSignature,
                        notarySeal,
                        setNotarySeal
                }}
                >
                        {children}
                </SignaturesContext.Provider>
        );
};
