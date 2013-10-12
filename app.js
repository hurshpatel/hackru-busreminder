var express = require('express');
var twilio = require('twilio');

var app = express();
var twilio = new twilio.RestClient("AC2c3b364a9ee85a3422bbe0e6603c8588", "6a0cf57047fe549c324924108b5e4c6b");

app.get("/", function(request, response) {

  response.send("Bus Reminder")
});

var respond = function(response, data) {

  var fullData = "<?xml version=\"1.0\" encoding=\"UTF-8\"?>\n" + data;
  response.writeHead(200, { "Content-Type" : "text/xml", "Content-Length" : fullData.length });
  response.write(fullData);
  response.end();
};

app.post("/receive", function(request, response) {

  respond(response, "<Response>\n<Message>Sup, yo</Message>\n</Response>");
});

var port = process.env.PORT || 5000;
app.listen(port);

console.log("Server started (8770)");