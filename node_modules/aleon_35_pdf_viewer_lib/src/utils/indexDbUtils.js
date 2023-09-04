const openDB = async () => {
  return new Promise((resolve, reject) => {
    const request = indexedDB.open('myDB', 1);

    request.onupgradeneeded = (event) => {
      const db = event.target.result;
      db.createObjectStore('pdfs', { keyPath: 'id' });
    };

    request.onsuccess = (event) => resolve(event.target.result);
    request.onerror = (event) => reject(event.target.error);
  });
};

// Retrieve PDF from IndexedDB
export const retrievePDF = async (id) => {
  const db = await openDB();
  return new Promise((resolve, reject) => {
    const transaction = db.transaction(['pdfs'], 'readonly');
    const objectStore = transaction.objectStore('pdfs');
    const request = objectStore.get(id);

    request.onsuccess = () => resolve(request.result.pdf);
    request.onerror = reject;
  });
};

// Save PDF to IndexedDB
export const savePDF = async (buffer, id) => {
  const db = await openDB();
  return new Promise((resolve, reject) => {
    const transaction = db.transaction(['pdfs'], 'readwrite');
    const objectStore = transaction.objectStore('pdfs');
    const request = objectStore.put({ id, pdf: buffer });

    request.onsuccess = resolve;
    request.onerror = reject;
  });
};

