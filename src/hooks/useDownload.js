function useDownload(pdfProxyObj, fileName) {
	const triggerDownload = async () => {
    if (!pdfProxyObj) {
			console.log('No PDF loaded to download');
			return;
		}
	
		const buffer = await pdfProxyObj.getData();
		try {
			const blob = new Blob([buffer], { type: 'application/pdf' });
			const url = URL.createObjectURL(blob);
			const link = document.createElement('a');
			link.href = url;
			link.download = fileName;
			link.click();
		} catch (error) {
			console.error('Error modifying PDF:', error);
		}
  }

	return {
    triggerDownload
  }
}

export default useDownload;
