const
	express = require('express'),
	app = express(),
	path = require('path'),
	fs = require('fs');

app.use('/offers', express.static(__dirname + '/offers.json'));
app.use(express.static(__dirname + '/../'));

app.listen(3000, function () {
	console.log('Server listening on port 3000')
});

app.get('/', function (req, res) {
	res.sendFile(__dirname + '/../index.html');
})