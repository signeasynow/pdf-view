import { createContext } from 'preact';
import { useEffect, useState } from 'preact/hooks';
import { supabase } from '../utils/supabase';

export const UserContext = createContext(null);

export const UserProvider = ({ children }) => {

  const [details, setDetails] = useState({
    fetched: false,
    loading: true,
    result: null
  });
  const getUser = async () => {
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

  return (
      <UserContext.Provider value={{ details, setDetails, getUser }}>
        {children}
      </UserContext.Provider>
  );
};