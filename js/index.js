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
        // For Push notification actions
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

		request.open('GET', '/offers');

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
// es6ify everything



/* 

Quick Guide to Push via cli

1) Run server and load web app
2) Check console for client registration id
3) Get API key from Firebase: https://console.firebase.google.com/
4) Replace both in the command below, as per the model:
curl --header "Authorization: key=<YOUR_API_KEY>" --header
"Content-Type: application/json" https://android.googleapis.com/gcm/send -d
"{\"registration_ids\":[\"<YOUR_REGISTRATION_ID>\"]}"

A) Working example with both API key and registration ID:
curl --header "Authorization: key=AIzaSyBKaVb7nTC_v3R_H7kjfX40J_F5Qc2hkcs" --header "Content-Type: application/json" https://android.googleapis.com/gcm/send -d "{\"registration_ids\":[\"dTotemAQydE:APA91bHUMvnV5TU7OUwjPUhnMBVMYcK7VZAQbLHEVj_IHcCa0ekEyu9iRG06xLs7nMzZNQ2GwxmJFyjdQauDW0zCiT7rvqamNTo2jcGNEj3p8rynnA-FyS4sFAackV-Pzt-D3jTKqtkE\"]}"

*/
