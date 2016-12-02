let
	version = 'v1-',
	appShellCacheName = 'app-shell',
	contentCacheName = 'content',
	status = 'online';

const
	appShellFiles = [
		'/css/index.css',
		'/js/index.js',
		'/node_modules/handlebars/dist/handlebars.min.js',
		'/manifest.json'
	];

/*
*		INSTALL 
*
*		This event is only called *once* per service worker (unless you change it)
* 		https://developers.google.com/web/fundamentals/instant-and-offline/service-worker/lifecycle
*/
self.addEventListener('install', function (event) {
	console.log('WORKER: install event in progress...');

	event.waitUntil(
		caches
			.open(version + appShellCacheName)
			.then(function (cache) {
				return cache.addAll(appShellFiles);
			})
			.then(function () {
				console.log('WORKER: installation complete 🌟');
				// https://davidwalsh.name/service-worker-claim
				// `skipWaiting()` forces the waiting ServiceWorker to become the
				// active ServiceWorker, triggering the `onactivate` event.
				// Together with `Clients.claim()` this allows a worker to take effect
				// immediately in the client(s).
				return self.skipWaiting();
			})
	);
});



/*
*	ACTIVATE
*
*	This event takes place when a new service worker is installed
*/
self.addEventListener('activate', function (event) {
	// Cleanup: deleting cache if it doesn't match my current version
	event.waitUntil(
		caches
			.keys() // Resolves to an array of cache keys
			.then(function (cacheKeysArray) {
				// filtering for old cache and starting delete promise for each key
				let oldCacheKeys = cacheKeysArray.filter(function (key) {
						return !key.startsWith(version);
					}),
					deleteOldCacheKeysPromises = oldCacheKeys.map(function(key){
						return caches.delete(key);
					});

				return Promise.all(deleteOldCacheKeysPromises);
			})
			.then(function () {
				console.log('WORKER: activate completed.');
			})
	);
	
	// https://davidwalsh.name/service-worker-claim
	// `claim()` sets this worker as the active worker for all clients that
	// match the workers scope and triggers an `oncontrollerchange` event for
	// the clients.
	return self.clients.claim();
});




/*
*	FETCH
*
*	Every single request comes through here
*/
self.addEventListener('fetch', function (event) {
	console.log('WORKER: fetch event in progress...');

	if (event.request.method !== 'GET') {
		// I don't care about anything that is not a GET request
		console.log('WORKER: fetch event ignored.', event.request.method, event.request.url);
		return;
	}

	event.respondWith(
		caches
			.match(event.request)
			.then(function (cached) {
				// I'm making a fetch event if I have the resource, this way it's going to cache the new version while immediately returning the cached version
				let networked = fetch(event.request)
								.then(
									function (response) {
										let cacheName;
										// store a clone of the request into the cache, we do this because response streams can only be read once (in this case: the original for the browser and the clone to the cache) (1/2)
										const responseClone = response.clone(); 

										console.log('WORKER: fetching from network 🌐', event.request.url);

										if (event.request.url === self.location.origin + '/') {
											status = 'online';
										}

										if (!!appShellFiles.find(x => x === event.request.url.replace(location.origin, ''))) {
											// Here are the files that belong to the app shell cache
											cacheName = appShellCacheName;
										} else {
											cacheName = contentCacheName;
										}

										caches
											.open(version + cacheName)
											.then(function (cache) {
												cache.put(event.request, responseClone);
											})
											.then(function () {
												console.log('WORKER: fetch response stored new version in cache 😘');
											});

										// now I'm free to let the browser read the original response stream (2/2)
										return response;
									},
									self.fetchFail
								)
								.catch(self.fetchFail);

				console.log('WORKER: fetching resource from: ', cached ? 'cache' : 'network', event.request.url);

				// OFFLINE-FIRST?
				// This is a strategy decision, we could use 'cached' first if we 
				// prefer a less disruptive experience, as in, the user would be ok
				// with delaying the updated data.
				return networked || cached; // Or the opposite, if we want offline-first
			})
	);
});


/*
*	MESSAGE
*
*	Messaging system between sw and client
*/
self.addEventListener('message', function (event) {
	let message = event.data || 'no message sent to SW'; 
	console.log('WORKER: message [' + message + ']');
	event.ports[0].postMessage(status);
});


/*
*	PUSH
*
*	✋=>
*/
self.addEventListener('push', function (event) {
	console.log(`WORKER: Push event received`)

	event.waitUntil(
		self.registration.showNotification('VoucherWallet Update', {
			body: 'We have new offers available to you!',
			icon: 'images/pound.png',
			tag: 'offer-tag',
			vibrate: [300, 100, 400],
			actions: [
				{ action: 'update', title: 'Update list', icon: 'images/done.png' },
				{ action: 'dismiss', title: 'Dismiss', icon: 'images/close.png' }
			]
		})
	);
});

	self.addEventListener('notificationclick', function(event) {
		console.log(`WORKER: sending notification action to client...`);
		
		// Post message to client with action
		self.clients.matchAll().then(function(clients) {
			clients.forEach(function(client) {
				client.postMessage(event.action);
			});
		});

		event.notification.close();
	});




/*
*		UTILITARY METHODS
*/
self.fetchFail = function () {

	// Update status
	status = 'offline';

	// TODO: cache this into the app foundation cache ?
	return new Response('<h1>Service Unavailable</h1>', {
		status: 503,
		statusText: 'Service Unavailable',
		headers: new Headers({
			'Content-Type': 'text/html'
		})
	});
}