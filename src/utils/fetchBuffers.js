import { retrievePDF } from "./indexDbUtils";
import * as pdfjs from 'pdfjs-dist';

const blobUrlToArrayBuffer = async (blobUrl) => {
  try {
    const loadingTask = pdfjs.getDocument(blobUrl);
    const pdfDoc = await loadingTask.promise;
    return await pdfDoc.getData();
    // return new Uint8Array(pdfData); // or pdfData.buffer if Uint8Array is not suitable
  } catch (err) {
    console.error(`Error while reading PDF: ${err.message}`);
    throw err; // or return some default/fallback value
  }
};

async function fetchBuffers(files) {
  // Initialize tasks to retrieve PDFs
  const arr = Array.from({ length: files.length }).fill(null);
  const tasks = arr.map((_, idx) => retrievePDF(`pdfId${idx}`));
  
  // Execute all tasks
  const results = await Promise.allSettled(tasks);

  // Process the results
  const successfulBuffers = [];
  const processingTasks = results.map(async (result, idx) => {
    if (result.status === "fulfilled") {
      console.log("fulfilled here")
      successfulBuffers.push(result.value);
    } else {
      try {
        const buffer = await blobUrlToArrayBuffer(files[idx].url);
        successfulBuffers.push(buffer);
      } catch (err) {
        console.error(`Error converting blob to array buffer for pdfId${idx}:`, err);
      }
      console.error(`Error retrieving pdfId${idx}:`, result.reason);
    }
  });

  // Wait for all processing tasks to complete
  await Promise.all(processingTasks);
  
  return successfulBuffers; // This will be an array of all the successful buffers.
}

export default fetchBuffers;

