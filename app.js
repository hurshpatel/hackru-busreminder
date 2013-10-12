var express = require('express');
var app = express();

app.get("/", function(request, response) {

  response.send("Bus Reminder")
});

app.get("/foo", function(request, response) {

  response.send("jkhjk")
});

app.listen(8770);

console.log("Server started (8770)");""