let requestID = 0;
export const pendingRequests = {};

export const invokePlugin = ({ pluginName, funcName, args }) => new Promise((resolve, reject) => {
	const id = ++requestID;

	// Add to pending requests
	pendingRequests[id] = { resolve, reject };

	// Send the request
	window.parent.postMessage({
		type: 'fromUi',
		pluginName,
		funcName,
		args,
		id // add id to keep track
	}, '*');
});