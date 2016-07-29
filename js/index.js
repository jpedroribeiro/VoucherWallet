if ('serviceWorker' in navigator) {
	console.log('CLIENT: serviceWorker registration starting...');
	// Service worker on the root as it is scoped on directory level
	navigator.serviceWorker.register('/sw.js').then(
		function () {
			console.log('CLIENT: serviceWorker registration complete 🙏');
		},
		function () {
			console.log('CLIENT: serviceWorker registration failed 🖕');
		}
	);
} else {
	console.log('CLIENT: serviceWorker it not supported in this browser 💩');
}