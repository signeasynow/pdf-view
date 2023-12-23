import { useEffect, useRef } from 'preact/hooks';
import { useUserData } from './useUserData';
import { useModal } from '../Contexts/ModalProvider';
import { ChromeStorage, IndexedDBStorage } from '../utils/indexDbUtils';

// DONE: use storage, either chrome or indexdb rather than localstorage
// DONE: if no subscription, show popup
// DONE: show message explaining why pop up appeared.

const isChromeExtension = process.env.NODE_CHROME === "true";
let storage = isChromeExtension ? new ChromeStorage() : new IndexedDBStorage();

function useListenForAiQuestionCount(conversation, setAiLimitReached) {

  const { hasValidSubscription } = useUserData();

  const isThrottled = useRef(false);

  const { showAuthModal } = useModal();

	const checkConsumerSubscription = async () => {
    if (isThrottled.current) {
      return;
    }
    isThrottled.current = true;

    setAiLimitReached(!hasValidSubscription);
    if (hasValidSubscription) {
      await storage.delete('timestamps');
    } else {
      showAuthModal(false, "Create an account and subscribe for continued access to AI conversations");
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
        console.log(data, 'data333')
        timestamps = JSON.parse(data) || [];
      } catch (e) {
        console.log(e, 'e error')
        timestamps = [];
      }
      console.log(timestamps, 'timesrampt4')

      // Filter out timestamps older than 24 hours
      timestamps = timestamps.filter(ts => currentTime - ts < 24 * 60 * 60 * 1000);

      // Check if more than 10 questions have been asked in the past 24 hours
      if (timestamps.length > 0) {
        await checkConsumerSubscription();
      }

      // Add a new timestamp for the current question
      timestamps.push(currentTime);
      try {
        const res = await storage.save(JSON.stringify(timestamps), 'timestamps', false);
        console.log(res, 'ress2')
      } catch (err) {
        console.log(err, 'err do s')
      }
    };

    processTimestamps();
  }, [conversation]);

	return null;
}

export default useListenForAiQuestionCount;
