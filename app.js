var express = require('express');
var twilio = require('twilio');

var app = express();

app.configure(function() {

  app.use(express.bodyParser());
  app.use(app.router);
});

var twilio = new twilio.RestClient("AC2c3b364a9ee85a3422bbe0e6603c8588", "6a0cf57047fe549c324924108b5e4c6b");

var respond = function(response, data) {

  var fullData = "<?xml version=\"1.0\" encoding=\"UTF-8\"?>\n" + data;
  response.writeHead(200, { "Content-Type" : "text/xml", "Content-Length" : fullData.length });
  response.write(fullData);
  response.end();
};

var textBack = function(response, message) {

  respond(response, "<Response>\n<Message>" + message + "</Message>\n</Response>");
};

/*
 * body is a string like:
 * "Scott Hall, College Hall, 10min"
 * or
 * "<Origin Stop>, <Destination Stop>, <Amount of minutes before bus comes to send reminder>"
 *
 * The response should looks like:
 * {
 *   "origin_stop": <Origin stop>,
 *   "destination_stop": <Destination stop>,
 *   "reminder_time": <Reminder time>
 * }
 */
var parseInformation = function(body) {

};

var insertInformationIntoDatabase = function(information) {

};

var generateResponseFromInformation = function(information) {

};

var handleMessage = function(response, body, from) {

  var information = parseInformation(body);
  insertInformationIntoDatabase(information);

  var response = generateResponseFromInformation(information);
  textBack(response, response);
};

app.get("/", function(request, response) {

  response.send("Bus Reminder")
});

app.post("/receive", function(request, response) {

  body = request.body["Body"];
  from = request.body["From"];

  handleMessage(response, body, from);
});

var port = process.env.PORT || 5000;
app.listen(port);

console.log("Server started (8770)");