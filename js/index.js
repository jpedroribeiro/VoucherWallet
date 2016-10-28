const
	$statusEl = document.querySelectorAll('.js-status')[0],
	$offersContainer = document.querySelectorAll('.offer-container')[0],
	$offerTemplateElement = document.getElementById('offerTemplate'),
	$offersCounter = document.querySelectorAll('.js-offers')[0];


/*
*	SERVICE WORKER
*/

if ('serviceWorker' in navigator) {
	console.log('CLIENT: serviceWorker registration starting...');

	// Service worker on the root as it is scoped on directory level
	navigator.serviceWorker.register('/sw.js')
		.then(
			function () {
				console.log('CLIENT: serviceWorker registration complete 🙏');

				// Update online status
				messageToSW().then(
					function (data) {
						updateStatus(data);
					},
					function () {
						updateStatus('online');
					});

				// Carry on with registration down the chain
				return navigator.serviceWorker.ready;
			},
			function () {
				console.log('CLIENT: serviceWorker registration failed 🖕');
			}
		)
		.then(
			function (registration) {
				console.log('CLIENT: serviceWorker pushManager registration 📢');

				// Register push manager
				registration.pushManager.subscribe({userVisibleOnly: true}).then(function(sub) { console.log('CLIENT: endpoint =>:', sub.endpoint); });

			},
			function () {
				console.log('CLIENT: serviceWorker registration failed 🖕');
			}
		);

	// Listen to messages from SW
	navigator.serviceWorker.addEventListener('message', function(event){
        console.log(`CLIENT: Received Message: ${event.data}`, event);
        if (event.data === 'update') {
        	offers();
        }
    });
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
*	UPDATE OFFER COUNT
*/

function updateCounter (value) {
	$offersCounter.innerHTML = value;
}


/*
*	START APP
*/
function offers() {
	getOffers().then(function (data) {
		let parsedData = JSON.parse(data);
		renderOffers(parsedData);
		updateCounter(parsedData.offers.length);
	});	
}
offers();





// TODO
// push - make server do the push and not curl
// offline - make sure push offers actually updates offers but keeps other things in cache
// manifest (done?)
// es6ify everything
// try out async await from canary latest?




//curl --header "Authorization: key=AIzaSyBKaVb7nTC_v3R_H7kjfX40J_F5Qc2hkcs" --header "Content-Type: application/json" https://android.googleapis.com/gcm/send -d "{\"registration_ids\":[\"dlliORFPAg8:APA91bEwqJlBXNitTeuOvJexMxoVy2q0X8RzZkCqlLnekCNwb8XlFywDUSztFgFxMQdIRzEcZYoLFrLbq-IvWJzcphZ0YqDlKd-GyUuj6w-vo09VAh7kRKq9xKgyEfwyEPqzwlZkStkQ\"]}"







