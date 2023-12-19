const openDB = async () => new Promise((resolve, reject) => {
	const request = indexedDB.open('myDB', 1);

	request.onupgradeneeded = (event) => {
		const db = event.target.result;
		db.createObjectStore('pdfs', { keyPath: 'id' });
	};

	request.onsuccess = (event) => resolve(event.target.result);
	request.onerror = (event) => reject(event.target.error);
});

// Retrieve PDF from IndexedDB
export const retrievePDF = async (id) => {
	const db = await openDB();
	return new Promise((resolve, reject) => {
		const transaction = db.transaction(['pdfs'], 'readonly');
		const objectStore = transaction.objectStore('pdfs');
		const request = objectStore.get(id);
		console.log(request, 'request335');
		request.onsuccess = () => {
			if (request.result?.pdf) {
				resolve(request.result.pdf);
			}
			else {
				reject(null);
			}
		};
		request.onerror = reject;
	});
};

// Save PDF to IndexedDB
export const savePDF = async (buffer, id) => {
	console.log('saving pdf2');
	let db;
	try {
		db = await openDB();
	} catch (err) {
		console.log(err, 'err openDb')
	}
	console.log(db, 'db open');
	return new Promise((resolve, reject) => {
		const transaction = db.transaction(['pdfs'], 'readwrite');
		const objectStore = transaction.objectStore('pdfs');
		const request = objectStore.put({ id, pdf: buffer });

		request.onsuccess = resolve;
		request.onerror = reject;
	});
};

export const deletePDF = async (id) => {
	const db = await openDB();
	return new Promise((resolve, reject) => {
		const transaction = db.transaction(['pdfs'], 'readwrite');
		const objectStore = transaction.objectStore('pdfs');
		const request = objectStore.delete(id);

		request.onsuccess = () => resolve(`Deleted record with id: ${id}`);
		request.onerror = () => reject(`Failed to delete record with id: ${id}`);
	});
};

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

class ChromeStorage extends StorageInterface {
  // Implement the methods using chrome.storage.local
  // Similar to the examples I provided in the previous message
}