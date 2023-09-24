export async function fetchBuffers(files, retrievePDF, blobUrlToArrayBuffer) {
  // Initialize tasks to retrieve PDFs
  const arr = Array.from({ length: files.length }).fill(null);
  const tasks = arr.map((_, idx) => retrievePDF(`pdfId${idx}`));
  
  // Execute all tasks
  const results = await Promise.allSettled(tasks);

  // Process the results
  const successfulBuffers = [];
  const processingTasks = results.map(async (result, idx) => {
    if (result.status === "fulfilled") {
      successfulBuffers.push(result.value);
    } else {
      try {
        const buffer = await blobUrlToArrayBuffer(files[idx]);
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



