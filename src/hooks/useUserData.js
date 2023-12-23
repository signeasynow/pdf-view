import { useContext, useEffect, useState } from 'preact/hooks';
import { supabase } from '../utils/supabase';
import { UserContext } from '../Contexts/UserContext';
import { AuthInfoContext } from '../Contexts/AuthInfoContext';

export const useUserData = () => {
  const {details: user, setDetails } = useContext(UserContext);

  const [userExists, setUserExists] = useState(null);
  const [failHappened, setFailHappened] = useState(false);
  const [licenseCheckDone, setLicenseCheckDone] = useState(false); 
  const [authorizedDomains, setAuthorizedDomains] = useState(null);

  const [licenseKey, setLicenseKey] = useState(null);
  const [endDate, setEndDate] = useState(null);
  const [planType, setPlanType] = useState(null);
  const [planCanceled, setPlanCanceled] = useState(false);
  const [subscriptionInfo, setSubscriptionInfo] = useState({});
	const [userDetails, setUserDetails] = useState({});
  const [hasValidSubscription, setHasValidSubscription] = useState(false);

  useEffect(() => {
    if (!subscriptionInfo) {
      return;
    }
    setHasValidSubscription(subscriptionInfo?.status === "verified");
  }, [subscriptionInfo]);

  const onResultFound = (exists) => {
    setUserExists(exists);
    setFailHappened(false);
  }
  const checkUserExists = async (email) => {
    if (email) {
      const { data, error } = await supabase
        .from('users')
        .select('*')
        .eq('email', email)
        .single();

      if (error) {
        if (error.details.includes("0 rows")) {
          setUserExists(false);
        } else {
          console.error('Error checking user:', error);
          setFailHappened(true);
        }
        return;
      }
      if (data) {
        setUserDetails(data);
        onResultFound(true);
        checkLicense();
        // Proceed with other logic if needed
      } else {
        onResultFound(false);
        // Handle case where user doesn't exist
      }
    } else {
      // fail silently. Will retry later.
    }
  };

	useEffect(() => {
    // Function to check if user exists in Supabase
    checkUserExists(user?.result?.email);
  }, [user]);

  useEffect(() => {
    if (!user?.loading && !user?.result) {
      setHasValidSubscription(false);
    }
  }, [user]);

  const { authInfo } = useContext(AuthInfoContext);

  const loginViaToken = async (token, refreshToken) => {
    const { data, error } = supabase.auth.setSession({
      access_token: token,
      refresh_token: refreshToken
    });
    if (error) {
      console.log(error, 'error log in via');
      return;
      // let it fail quiektly
    }
    console.log(data, 'logged in token')
  }

  const checkForLogout = async (_user, _authInfo) => {
    if (!user?.fetched || !user.result) {
      return;
    }
    if (authInfo?.token?.startsWith("revoked_")) {
      const dateRevoked = new Date(authInfo?.token.slice(8));
      const now = new Date();
      const differenceInMilliseconds = now.getTime() - dateRevoked.getTime();

      if (differenceInMilliseconds > 2000) {
        const { error } = await supabase.auth.signOut();
        if (error) {
          // nothing to do
          console.log(error, 'error logging out')
          return;
        }
        setDetails({
          fetched: false,
          loading: false,
          result: null
        })
      }
    }
  }

  useEffect(() => {
    if (!user?.fetched && !!authInfo?.token && !authInfo?.token.startsWith("revoked_")) {
      loginViaToken(authInfo?.token, authInfo?.refreshToken);
      console.log("finding token");
    }
    checkForLogout(user, authInfo);
    console.log(user, 'user221', authInfo);
  }, [user, authInfo]);

  useEffect(() => {
		function handleVisibilityChange() {
			if (document.hidden) {
				// Page is now hidden
			}
			else {
				// Page is now visible
        // TODO: make a call asking for the token info
        window.parent.postMessage({ type: 'request-token', success: true }, '*');
			}
		}
	
		document.addEventListener('visibilitychange', handleVisibilityChange);
		return () => document.removeEventListener('visibilitychange', handleVisibilityChange);
	}, [user, authInfo]);

	const createAccount = async (name, cb, failCb) => {
		const id = user?.result?.id;
		const email = user?.result?.email;
		if (!id || !email) {
			return alert("Something went wrong creating your account.");
		}
		const {data, error} = await supabase
			.from('users')
			.upsert([{ id, email, name }]);
    if (error) {
      setFailHappened(true);
      alert("Something went wrong creating your account.");
      failCb?.(error);
      return;
    }
		onResultFound(true);
    cb();
	}

	const updateAccount = async (fields, cb, failCb) => {
		const id = user?.result?.id;
		const email = user?.result?.email;
		if (!id || !email) {
			return alert("Something went wrong creating your account.");
		}
		const {data, error} = await supabase
			.from('users')
			.upsert([{ id, ...fields }]);
    if (error) {
      setFailHappened(true);
      alert("Something went wrong creating your account.");
			failCb?.(error);
      return;
    }
		onResultFound(true);
    cb();
	}

	const checkLicense = async () => {
		const id = user?.result?.id;
		const email = user?.result?.email;
	
		if (!id || !email) {
			return;
		}
		const { data, error } = await supabase
    .from('users')
    .select('*, subscriptions:subscriptions (status, end_date, stripe_plan_id, stripe_subscription_id), authorized_domains:authorized_domains(domain)')
    .eq('id', id)
		.single();

  if (error) {
    console.error('Error fetching user with subscription:', error);
    setLicenseCheckDone(true);
    setFailHappened(true);
    return;
  }

  if (data) {
    const userWithSubscription = data;
    const localSubscriptionInfo = userWithSubscription.subscriptions?.[0];
    
    setSubscriptionInfo(localSubscriptionInfo);

    // setLicenseKey(localSubscriptionInfo?.license_key);

    setEndDate(localSubscriptionInfo?.end_date);

    if (localSubscriptionInfo) {
      const localPlanType = localSubscriptionInfo?.stripe_plan_id.startsWith("consumer") ? "consumer" : "developer";
      setPlanType(localPlanType);
    }

    if (localSubscriptionInfo?.status === "canceled") {
      setPlanCanceled(true);
    }

    const authorizedDomainsRes = userWithSubscription.authorized_domains?.map((each) => each.domain);
    setAuthorizedDomains(authorizedDomainsRes);
    setLicenseCheckDone(true);
  } else {
    setLicenseCheckDone(true);
  }

	}

  return {
		checkLicense,
		createAccount,
    userExists,
    failHappened,
    licenseCheckDone,
    authorizedDomains,
		setAuthorizedDomains,
    licenseKey,
    endDate,
    planType,
    planCanceled,
		setPlanCanceled,
    subscriptionInfo,
		setSubscriptionInfo,
		setLicenseKey,
		setPlanType,
		setEndDate,
		userDetails,
		setUserDetails,
		updateAccount,
    hasValidSubscription
  };
};
