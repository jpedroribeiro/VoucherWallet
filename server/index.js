const
	express = require('express'),
	app = express(),
	path = require('path'),
	fs = require('fs');

app.use('/offers', express.static(__dirname + '/offers.json'));

app.listen(8000, function () {
	console.log('Offers server listening on port 8000')
});