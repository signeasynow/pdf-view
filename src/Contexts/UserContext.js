import { createContext } from 'preact';
import { useContext, useEffect, useRef, useState } from 'preact/hooks';
import { supabase } from '../utils/supabase';
import { AuthInfoContext } from './AuthInfoContext';

const isChromeExtension = process.env.NODE_CHROME === "true";

export const UserContext = createContext(null);

export const UserProvider = ({ children }) => {

  const { setAuthInfo } = useContext(AuthInfoContext);

  const [details, setDetails] = useState({
    fetched: false,
    loading: true,
    result: null
  });
  const getUser = async () => {
    if (!isChromeExtension) {
      return;
    }
    setDetails({
      ...details,
      loading: true
    });
    try {
      const result = await supabase.auth.getUser();

      if (result?.data?.user) {
        setDetails({
          fetched: true,
          loading: false,
          result: result.data.user
        });
        return result;
      } else {
        setDetails({
          fetched: true,
          loading: false,
          result: null
        });
      }
    } catch (err) {
      setDetails({
        fetched: true,
        loading: false,
        result: null
      });
    }
  }
	
  useEffect(() => {
    getUser();
  }, []);

  const hasSentSignedInRef = useRef(false);

  useEffect(() => {
		supabase.auth.onAuthStateChange((event, session) => {
      console.log(event, 'event registered here', session)
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