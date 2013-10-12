var express = require('express');
var app = express();

app.get("/", function(request, response) {

  response.send("Bus Reminder")
});

app.post("/receive", function(request, response) {

  response.send("ok");
});

var port = process.env.PORT || 5000;
app.listen(port);

console.log("Server started (8770)");