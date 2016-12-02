const
	express = require('express'),
	app = express(),
	path = require('path'),
	fs = require('fs'),
	port = process.env.PORT || 8080;

/*
*		OFFERS LIST ENDPOINT
*/
app.use('/offers', express.static(__dirname + '/offers.json'));


/*
*		ENABLE STATIC ASSETS
*/
app.use(express.static(__dirname + '/../'));


/*
*		FRONTEND
*/
app.listen(port, function () {
	console.log('Server listening on port ' + port);
});

app.get('/', function (req, res) {
	res.sendFile(__dirname + '/../index.html');
})