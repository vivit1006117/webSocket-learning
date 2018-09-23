var WebSocketServer = require("ws").Server,
	wss = new WebSocketServer({port: 8181});
var uuid = require('node-uuid'),
	_     = require('lodash')._;

var stock = {
	"AAPL": 95.0,
	"MSFT": 50.0,
	"AMZN": 300.0,
	"GOOG": 550.0,
	"YHOO": 35.0
};

function randomInterval(min, max) {
	return Math.floor(Math.random() * (max - min + 1) + min);
}

var stockUpdater;

var randomStockUpdater = function () {
	for (var symbol in stock) {
		if (stock.hasOwnProperty(symbol)) {
			var randomizedChange = randomInterval(-150, 150);
			stock[symbol] += randomizedChange / 100;
		}
	}
	var randomMSTime = randomInterval(500, 2500);
	stockUpdater = setTimeout(function () {
		randomStockUpdater();
	}, randomMSTime)
};

randomStockUpdater();

wss.on("connection", function (ws) {
	var client_uuid = uuid.v4();
	console.log('client [%s] connected', client_uuid);

	var clientStockUpdater;
	var sendStockUpdates = function (ws) {
		if (ws.readyState === 1) {
			var stocksObj = {};
			for (var i = 0; i < clientStocks.length; i++) {
				var symbol = clientStocks[i];
				stocksObj[symbol] = stock[symbol];
			}
			ws.send(JSON.stringify(stocksObj));
		}
	};

	clientStockUpdater = setInterval(function () {
		sendStockUpdates(ws);
	}, 1000);

	var clientStocks = [];

	ws.on("message", function (message) {
		var stock_request = JSON.parse(message);
		clientStocks = stock_request['stocks'];
		console.log(clientStocks);
		sendStockUpdates(ws);
	});

	ws.on('close', function () {
		if (typeof clientStockUpdater !== "undefined") {
			clearInterval(clientStockUpdater);
		}
	})
});

console.log("wtf");
