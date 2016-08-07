let version = 'v1-',
	status = 'onlin';

/*
*		INSTALL 
*/
self.addEventListener('install', function (event) {
	console.log('WORKER: install event in progress...');

	event.waitUntil(
		caches
			.open(version + 'app-shell')
			.then(function (cache) {
				return cache.addAll([
					'/',
					'/css/index.css',
					'/js/index.js'	
				]);
			})
			.then(function () {
				console.log('WORKER: installation complete 🌟');
			})
	);
});



/*
*		FETCH
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
  				// I'm making a fetch even if I have the resource, this way it's going to cache the new version while immediately returning the cached version
  				let networked = fetch(event.request)
  								.then(
  									function (response) {
	  									console.log('WORKER: fetching from network 🌐', event.request.url);

	  									if (event.request.url === self.location.origin + '/') {
	  										status = 'online';
	  									}

	  									caches
	  										.open(version + 'content')
	  										.then(function (cache) {
	  											// store a clone of the request into the cache, we do this because response streams can only be read once (in this case: the original for the browser and the clone to the cache) (1/2)
	  											cache.put(event.request, response.clone());
	  										})
	  										.then(function () {
	  											console.log('WORKER: fetch response stored new version in cache 😘');
	  										});

										// now I'm free to let the browser read the original response stream (2/2)
										return response;
									},
									self.unableToResolve
								)
  								.catch(self.unableToResolve);

				console.log('WORKER: fetching resource from: ', cached ? 'cache' : 'network', event.request.url);
				return cached || networked;
  			})
	);
});


/*
*		MESSAGE
*/
self.addEventListener('message', function (event) {
	console.log('WORKER: message [' + event.data + ']');

	// TODO HERE *********************************************************
	// i can read client messages but not reply back :-/
	event.ports[0].postMessage(status);
});


// TODO: phase out from css trick tutorial

/*
*		UTILITARY METHODS
*/
self.unableToResolve = function () {
	// This is when everything (cache + network) fails
	console.log('WORKER: fetch and cache failed 😣');

	// Update status
	status = 'offline';

	// TODO: cache this into the app foundation cache
	return new Response('<h1>Service Unavailable</h1>', {
		status: 503,
		statusText: 'Service Unavailable',
		headers: new Headers({
			'Content-Type': 'text/html'
		})
    });
}