function uint8ArrayToBase64(buffer) {
	let binary = '';
	const bytes = new Uint8Array(buffer);
	const len = bytes.byteLength;
	for (let i = 0; i < len; i++) {
			binary += String.fromCharCode(bytes[i]);
	}
	return window.btoa(binary);
}

function base64ToUint8Array(base64) {
	const binaryString = window.atob(base64);
	const len = binaryString.length;
	const bytes = new Uint8Array(len);
	for (let i = 0; i < len; i++) {
			bytes[i] = binaryString.charCodeAt(i);
	}
	return bytes;
}

class StorageInterface {
  async save(key, value) {
    throw new Error("Method 'save()' must be implemented.");
  }

  async retrieve(key) {
    throw new Error("Method 'retrieve()' must be implemented.");
  }

  async delete(key) {
    throw new Error("Method 'delete()' must be implemented.");
  }
}

export class IndexedDBStorage extends StorageInterface {
		async openDB() {
			return new Promise((resolve, reject) => {
					const request = indexedDB.open('myDB', 1);

					request.onupgradeneeded = (event) => {
							const db = event.target.result;
							db.createObjectStore('pdfs', { keyPath: 'id' });
					};

					request.onsuccess = (event) => {
							resolve(event.target.result);
					};

					request.onerror = (event) => {
							reject(event.target.error);
					};
			});
	}

	async save(buffer, id) {
		console.log("saving pdf")
			// Implementation for saving a PDF
			const db = await this.openDB();
			return new Promise((resolve, reject) => {
					const transaction = db.transaction(['pdfs'], 'readwrite');
					const objectStore = transaction.objectStore('pdfs');
					const request = objectStore.put({ id, pdf: buffer });

					request.onsuccess = () => resolve(`Saved record with id: ${id}`);
					request.onerror = (event) => reject(`Failed to save record with id: ${id}, error: ${event.target.error}`);
			});
	}

	async retrieve(id) {
			// Implementation for retrieving a PDF
			const db = await this.openDB();
			return new Promise((resolve, reject) => {
					const transaction = db.transaction(['pdfs'], 'readonly');
					const objectStore = transaction.objectStore('pdfs');
					const request = objectStore.get(id);

					request.onsuccess = () => {
							if (request.result?.pdf) {
									resolve(request.result.pdf);
							} else {
									reject(`No record found with id: ${id}`);
							}
					};
					request.onerror = (event) => reject(`Failed to retrieve record with id: ${id}, error: ${event.target.error}`);
			});
	}

	async delete(id) {
			// Implementation for deleting a PDF
			const db = await this.openDB();
			return new Promise((resolve, reject) => {
					const transaction = db.transaction(['pdfs'], 'readwrite');
					const objectStore = transaction.objectStore('pdfs');
					const request = objectStore.delete(id);

					request.onsuccess = () => resolve(`Deleted record with id: ${id}`);
					request.onerror = (event) => reject(`Failed to delete record with id: ${id}, error: ${event.target.error}`);
			});
	}
}

export class ChromeStorage extends StorageInterface {
		async save(buffer, id) {
			const base64String = uint8ArrayToBase64(buffer);
			return new Promise((resolve, reject) => {
					chrome.storage.local.set({ [id]: base64String }, function() {
							if (chrome.runtime.lastError) {
									return reject(chrome.runtime.lastError);
							}
							resolve(`Saved record with id: ${id}`);
					});
			});
	}

	async retrieve(id) {
    return new Promise((resolve, reject) => {
        chrome.storage.local.get(id, function(result) {
            if (chrome.runtime.lastError) {
                return reject(chrome.runtime.lastError);
            }
            if (result[id]) {
                const buffer = base64ToUint8Array(result[id]);
                resolve(buffer);
            } else {
                reject(`No record found with id: ${id}`);
            }
        });
    });
}

	async delete(id) {
		console.log('delete11')
			// Implementation for deleting a PDF
			return new Promise((resolve, reject) => {
					chrome.storage.local.remove(id, function() {
							if (chrome.runtime.lastError) {
									return reject(chrome.runtime.lastError);
							}
							resolve(`Deleted record with id: ${id}`);
					});
			});
	}
}