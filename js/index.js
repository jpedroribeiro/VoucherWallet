if ('serviceWorker' in navigator) {
	console.log('CLIENT: serviceWorker registration starting...');
	// Service worker on the root as it is scoped on directory level
	navigator.serviceWorker.register('/sw.js').then(
		function () {
			console.log('CLIENT: serviceWorker registration complete 🙏');
			messageToSW('test').then(
				function (data) {
					debugger;
				},
				function (data) {
					debugger;
				});

		},
		function () {
			console.log('CLIENT: serviceWorker registration failed 🖕');
		}
	);
} else {
	console.log('CLIENT: serviceWorker it not supported in this browser 💩');
}


function messageToSW (message) {
	return new Promise (function (resolve, reject) {
		let msgChannel = new MessageChannel();

		// Resolve or reject the promise when we got a return message from SW
		msgChannel.port1.onmessage = function (event) {
			if (event.data.error) {
				reject(event.data.error);
			} else {
				resolve(event.data);
			}
		}

		navigator.serviceWorker.controller.postMessage(message, [msgChannel.port2]);
	});
}