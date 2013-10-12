var express = require('express');
var twilio = require('twilio');

var app = express();
var twilio = new Twilio.RestClient("AC2c3b364a9ee85a3422bbe0e6603c8588", "6a0cf57047fe549c324924108b5e4c6b");

app.get("/", function(request, response) {

  response.send("Bus Reminder")
});

app.post("/receive", function(request, response) {

  console.log(request);
  response.send("ok");
});

var port = process.env.PORT || 5000;
app.listen(port);

console.log("Server started (8770)");