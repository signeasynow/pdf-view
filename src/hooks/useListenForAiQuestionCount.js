import { useEffect, useRef } from 'preact/hooks';
import { useUserData } from './useUserData';
import { useModal } from '../Contexts/ModalProvider';
import { ChromeStorage, IndexedDBStorage } from '../utils/indexDbUtils';
import { useTranslation } from 'react-i18next';

// DONE: use storage, either chrome or indexdb rather than localstorage
// DONE: if no subscription, show popup
// DONE: show message explaining why pop up appeared.

const isChromeExtension = process.env.NODE_CHROME === "true";
let storage = isChromeExtension ? new ChromeStorage() : new IndexedDBStorage();

function useListenForAiQuestionCount(conversation, setAiLimitReached) {

  const { hasValidSubscription, licenseCheckDone } = useUserData();

  const isThrottled = useRef(false);

  const { showAuthModal } = useModal();

  const { t } = useTranslation();

	const checkConsumerSubscription = async () => {
    if (!licenseCheckDone) {
      // better UX. don't want to always show upon load
      return;
    }
    if (isThrottled.current) {
      return;
    }
    isThrottled.current = true;

    setAiLimitReached(!hasValidSubscription);
    if (hasValidSubscription) {
      await storage.delete('timestamps');
    } else {
      showAuthModal(false, t("create-account-ai"));
    }
    setTimeout(() => {
      isThrottled.current = false;
    }, 1000);
  };

	useEffect(() => {
    const processTimestamps = async () => {
      const currentTime = new Date().getTime();
      let timestamps;
      try {
        const data = await storage.retrieve('timestamps', false);
        timestamps = JSON.parse(data) || [];
      } catch (e) {
        timestamps = [];
      }

      // Filter out timestamps older than 24 hours
      timestamps = timestamps.filter(ts => currentTime - ts < 24 * 60 * 60 * 1000);

      // Check if more than 10 questions have been asked in the past 24 hours
      if (timestamps.length > 10) {
        await checkConsumerSubscription();
      }

      // Add a new timestamp for the current question
      timestamps.push(currentTime);
      try {
        await storage.save(JSON.stringify(timestamps), 'timestamps', false);
       
      } catch (err) {
      }
    };

    processTimestamps();
  }, [conversation]);

	return null;
}

export default useListenForAiQuestionCount;
