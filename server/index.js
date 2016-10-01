const
	express = require('express'),
	app = express(),
	path = require('path'),
	fs = require('fs');

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
app.listen(3000, function () {
	console.log('Server listening on port 3000')
});

app.get('/', function (req, res) {
	res.sendFile(__dirname + '/../index.html');
})