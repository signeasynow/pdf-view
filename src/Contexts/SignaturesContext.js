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

const getInitialNotarySeal = () => {
        try {
                if (typeof window === 'undefined' || !window?.localStorage) {
                        return '';
                }
                return window.localStorage.getItem('notarySeal') || '';
        }
        catch (err) {
                return '';
        }
};

export const SignaturesProvider = ({ children }) => {
        const [fullSignature, setFullSignature] = useState('');
        const [initialsSignature, setInitialsSignature] = useState('');
        const [notarySeal, setNotarySeal] = useState(getInitialNotarySeal);

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
