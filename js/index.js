const
	$statusEl = document.querySelectorAll('.js-status')[0],
	$offersContainer = document.querySelectorAll('.offer-container')[0],
	$offerTemplateElement = document.getElementById('offerTemplate');



/*
*	SERVICE WORKER
*/

if ('serviceWorker' in navigator) {
	console.log('CLIENT: serviceWorker registration starting...');
	// Service worker on the root as it is scoped on directory level
	navigator.serviceWorker.register('/sw.js').then(
		function () {
			console.log('CLIENT: serviceWorker registration complete 🙏');
			messageToSW().then(
				function (data) {
					updateStatus(data);
				},
				function () {
					updateStatus('online');
				});

		},
		function () {
			console.log('CLIENT: serviceWorker registration failed 🖕');
		}
	);
} else {
	console.log('CLIENT: serviceWorker it not supported in this browser 💩');
}



/*
*	MESSAGING
*/

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

		navigator.serviceWorker.controller.postMessage(message || '', [msgChannel.port2]);
	});
}



/*
*	ONLINE/OFFLINE STATUS
*/

function updateStatus (status) {
	if (status === 'offline') {
		$statusEl.className = $statusEl.className.replace('success', 'danger');
	}
	$statusEl.innerHTML = status;
}



/*
*	RENDER OFFERS
*/

function renderOffers(data) {
	let offersArray = data.offers,
		template = Handlebars.compile($offerTemplateElement.innerHTML),
		tempHTML = '';

	for (let offer of offersArray) {
		tempHTML += template(offer);
	}
	
	$offersContainer.innerHTML = tempHTML;
}



/*
*	GET OFFERS
*/

function getOffers () {
	return new Promise (function (resolve, reject) {
		let request = new XMLHttpRequest();

		request.open('GET', 'http://localhost:3000/offers');

		request.onload = function () {
			if (request.status == 200) {
				resolve(request.response);
			} else {
				console.error(request.statusText);
			}
		}

		request.send();
	});
}


/*
*	START APP
*/
getOffers().then(function (data) {
	renderOffers(JSON.parse(data));
});






// TODO HERE
// cache offers json?
// how to save offers?