//GitHub.com/jparishy/hackru-busreminder is the main repository and we have individual forks
var express = require('express');
var twilio = require('twilio');
var request = require('request');

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
/*
*textBack sends a response with the message in it
*
*calls the respond function, links it with the message
*
*
*/
var textBack = function(response, message) {

  respond(response, "<Response>\n<Message>" + message + "</Message>\n</Response>");
};
/*
* validateName is a boolean that makes sure that the name of the bus stop has characters that are only letters or spaces
* a count is created to check each character of the name
*the if statement checks if the charAt the count in the name is either between[A-z] or is [ ] 
* if that char is not any of these, it returns false
*/
var validateName = function(name) {

	var count=0;

	while(count < name.length){
		if(/[A-z]/.test(name.charAt(count)) || /[ ]/.test(name.charAt(count))){
			count++;
		}
		else{
			return false;
		}
	}
	return true;
}

var validateNumString = function(numString){
	var count=0;

	while(count<numString.length){
		if(/[0-9]/.test(numString.charAt(count)) || /[ ]/.test(numString.charAt(count))){
			count++;
		}
		else{
			return false;
		}
	}
	return true;
}


var validateBody = function(response, body) {

	var sep = body.split(", ");

	var start = sep[0];
	var dest = sep[1];
	var durationString = sep[2];

  if(!validateName(start))
  {
    textBack(response, "Start is invalid (" + start + ")");
    return false;
  }

  if(!validateName(dest))
  {
    textBack(response, "Dest is invalid (" + dest + ")");
    return false;
  }

  if(!validateNumString(durationString))
  {
    textBack(response, "Time is invalid (" + durationString + ")");
    return false;
  }

  return true;
};

/*
 * body is a string like:
 * "Scott Hall, College Hall, 10"
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

  var parts = body.split(", ");
  // parts = ["Scott Hall", "College Hall", "10"]

  var origin = parts[0];
  var destination = parts[1];
  var minutesString = parts[2];

  var minutes = parseInt(minutesString); //parse the String to an int

  return {
    "origin_stop": origin,
    "destination_stop": destination,
    "reminder_time": minutes
  };
};

var insertInformationIntoDatabase = function(information, reminderDate) {
  //Did not a have sufficient amount of time to finish inputing info into the database
  //Takes in the users text they send to Twilio and stores it onto the database
};

var generateResponseFromInformation = function(information) {

  return "Got it bro!"
};

var RouteTitlesToTagsMap = {
  "Weekend 1": "wknd1",
  "Weekend 2": "wknd2"
};

var commonRoutes = function(firstRoutes, secondRoutes) {

  var routes = [];

  for(var i = 0; i < firstRoutes.length; ++i){
	 var route1 = firstRoutes[i];
	 if(route1.predictions === null) {
   		continue;
   	}

    for(var j = 0; j < secondRoutes.length; ++j){
      var route2 = secondRoutes[j];

      if(route2.predictions === null) {
      	continue;
      }
      if(route1.title===route2.title){
      	routes.push(route2);
      }
    }
  }

  return routes;
};

var retrieveCommonRoutes = function(originTitle, destinationTitle, handler) {

  request.get("http://runextbus.herokuapp.com/stop/" + originTitle, function (error1, response1, body1) {

    request.get("http://runextbus.herokuapp.com/stop/" + destinationTitle, function (error2, response2, body2) {

      var firstRoutes = JSON.parse(body1);
      var secondRoutes = JSON.parse(body2);

      handler(commonRoutes(firstRoutes, secondRoutes));
    });
  });
};

var dateToRemind = function(minutesUntilBusComes, minutesBeforeItComesToRemind) {

  var now = new Date();
  var nowMinutes = now.getMinutes()
  var remindMinutes=nowMinutes+minutesUntilBusComes-minutesBeforeItComesToRemind

  now.setMinutes(remindMinutes);

  return now;
};

var selectShortestRoute = function(routes) {


  return routes[0]; //Which bus to take which is shortest
};

var nextBusTimeForRoute = function(route, minutesNeededBefore) {

  var nextTime = route.predictions;
  var minutesUntilBusComes = nextTime[0].minutes;

  if(nextTime.length() > 1){
    if(nextTime[0].minutes < minutesNeededBefore){
      return nextTime[1].minutes;
    }
  }

  return minutesUntilBusComes; //Next time for a certain bus
};

var handleMessage = function(response, body, from) {

  if(!validateBody(response, body))
  {
    return;
  }

  var information = parseInformation(body);

  var originStop = information["origin_stop"];
  var destinationStop = information["destination_stop"];

  retrieveCommonRoutes(originStop, destinationStop, function(theRoutes) {

    shortestRoute = selectShortestRoute(theRoutes);

    minutesBeforeItComesToRemind = information["reminder_time"];
    minutesUntilBusComes = nextBusTimeForRoute(shortestRoute, minutesBeforeItComesToRemind);
    
    if(minutesBeforeItComesToRemind > minutesUntilBusComes){
      var RemindNow = "Your bus is arriving before your reminder time."
      var RemindWithTime = RemindNow + " Your bus is arriving in " + minutesUntilBusComes + " minutes."
      textBack(response, RemindWithTime);
    }
    else{

      reminderDate = dateToRemind(minutesUntilBusComes, minutesBeforeItComesToRemind);

      insertInformationIntoDatabase(information, reminderDate);

      var responseMessage = generateResponseFromInformation(information);
      textBack(response, responseMessage);
    }
  });
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