import JSZip from 'jszip';
import fetchBuffers from '../utils/fetchBuffers';

const downloadAll = async (pdfBuffers) => {
  // Initialize JSZip instance
  const zip = new JSZip();

  // Loop over all PDF Buffers and add them to the ZIP file
  pdfBuffers.forEach((buffer, index) => {
    zip.file(`document-${index + 1}.pdf`, buffer);
  });

  // Generate ZIP file as Blob
  const zipBlob = await zip.generateAsync({ type: 'blob' });

  // Trigger download of ZIP file
  const url = URL.createObjectURL(zipBlob);
  const link = document.createElement('a');
  link.href = url;
  link.download = 'AllDocuments.zip';
  link.click();

  // Cleanup
  URL.revokeObjectURL(url);
};

function useDownload(files, fileName, isSandbox) {
	const triggerDownload = async () => {
		if (isSandbox) {
			// return alert("Download is not enabled in Sandbox mode.");
		}
		console.log(files, 'files bro here')
    const successfulBuffers = await fetchBuffers(files);
		console.log(successfulBuffers, 'successfulBuffers');
		// const buffer = await pdfProxyObj.getData();
		if (!successfulBuffers.length) {
			return alert("Nothing to download.");
		}
		if (successfulBuffers.length === 1) {
			try {
				const blob = new Blob([successfulBuffers[0]], { type: 'application/pdf' });
				const url = URL.createObjectURL(blob);
				const link = document.createElement('a');
				link.href = url;
				link.download = fileName;
				link.click();
			} catch (error) {
				console.error('Error modifying PDF:', error);
			}
			return;
		}
		downloadAll(successfulBuffers);
		
  }

	return {
    triggerDownload
  }
}

export default useDownload;
