import { useEffect } from 'preact/hooks';
import { supabase } from '../utils/supabase';

function useListenForStateChange() {
	useEffect(() => {
    /*
		supabase.auth.onAuthStateChange((event, session) => {
      console.log(event, 'event registered here')
      if (event === "SIGNED_IN" || event === "TOKEN_REFRESHED") {
        const token = session?.access_token;
        const refreshToken = session?.refresh_token;
        if (token) {
          window.parent.postMessage({ type: 'token-granted', success: true, token, refreshToken }, '*');
        }
        console.log(token, refreshToken, 'new event state')
      }
			
		})
    */
	}, []);

	return null;
}

export default useListenForStateChange;
