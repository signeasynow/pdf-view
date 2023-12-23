import { createContext } from 'preact';
import { useContext, useEffect, useRef, useState } from 'preact/hooks';
import { supabase } from '../utils/supabase';
import { AuthInfoContext } from './AuthInfoContext';

export const UserContext = createContext(null);

export const UserProvider = ({ children }) => {

  const { setAuthInfo } = useContext(AuthInfoContext);

  const [details, setDetails] = useState({
    fetched: false,
    loading: true,
    result: null
  });
  
  const hasSentSignedInRef = useRef(false);

  useEffect(() => {
		supabase.auth.onAuthStateChange((event, session) => {
      const token = session?.access_token;
      const refreshToken = session?.refresh_token;
      if (event === "SIGNED_IN" || event === "TOKEN_REFRESHED") {
        setDetails({
          fetched: true,
          loading: false,
          result: session?.user
        })
      }
      if (event === "SIGNED_IN" && !hasSentSignedInRef.current && token) {
        hasSentSignedInRef.current = true;
        if (token) {
          setAuthInfo({
            token,
            refreshToken
          });
          window.parent.postMessage({ type: 'token-granted', success: true, token, refreshToken }, '*');
        }
      }
      if (event === "TOKEN_REFRESHED") {
        const token = session?.access_token;
        const refreshToken = session?.refresh_token;
        if (token) {
          setAuthInfo({
            token,
            refreshToken
          });
          window.parent.postMessage({ type: 'token-granted', success: true, token, refreshToken }, '*');
        }
      }
      if (event === "SIGNED_OUT") {
        hasSentSignedInRef.current = false;
        setAuthInfo({
          token: `revoked_${new Date().toISOString()}`,
          refreshToken: `revoked_${new Date().toISOString()}`
        });
        window.parent.postMessage({ type: 'token-removed', success: true }, '*');
        setDetails({
          fetched: false,
          loading: false,
          result: null
        })
      }
			
		})
	}, []);

  return (
      <UserContext.Provider value={{ details, setDetails, getUser }}>
        {children}
      </UserContext.Provider>
  );
};