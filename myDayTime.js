/*global generateResponse*/
/*global buildSpeechletResponse*/
var https = require('https');

exports.handler = (event, context) => {

  try {

    if (event.session.new) {
      // New Session
      console.log('NEW SESSION');
    }

    switch (event.request.type) {
      case "LaunchRequest":
        // Launch Request
        console.log(`LAUNCH REQUEST`);
         
        context.succeed(
          generateResponse(
            buildSpeechletResponse("Welcome to my day time, say what's the current time or day of week a given date falls on", false),
            {}
          )
        );
        break;

      case "IntentRequest":
        // Intent Request
        console.log(`INTENT REQUEST`);

        //global day array
        var DAY_ARRAY = ["Sunday", "Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday"];
        
        switch(event.request.intent.name) {

            case "GetTodayTime":
                
                var date = new Date();
                var utc = date.getTime() + (date.getTimezoneOffset() * 60000);
                var estDate = new Date(utc + (3600000*-5));
            
               var time = estDate.toLocaleString();
               time = time.split(' ');
               var hms = time[1].split(':');
               
                var hour = hms[0];
                var min  = hms[1];
                //4 additional seconds due to speech delay 
                var sec  = parseInt(hms[2])+4;
                var pmAm = time[2];
               
               //day time savings
               var hour = parseInt(hour) + 1;
               if(hour > 12) hour = hour - 12;
               
                context.succeed(
                  generateResponse(
                    buildSpeechletResponse(`Current time is ${hour} hours, ${min} minutes , and ${sec} seconds ${pmAm} eastern time`, true),
                    {}
                  )
                );
        
            break;
            case "DayOnDate":
                if (event.request.intent.slots.givenDate.value == null ||event.request.intent.slots.givenDate.value == ""){
                        context.succeed(
                      generateResponse(
                        buildSpeechletResponse(`Sorry, I did not catch that please include a month, day and year and try again`, false),
                        {}
                      )
                    )
                break;
                };
                
                var badResponse = 0;
                var arg = event.request.intent.slots.givenDate.value;
                var currentDay;
                var yearMonthDay;
                var space = 0;
                
                for(var i = 0; i < arg.length; i++){
                    if(arg.charAt(i) == '-') space++;
                }
                
                //need 2 hypens for complete date
               if(space == 2){
                    yearMonthDay = arg.split('-');
                    currentDay = new Date();
                    currentDay.setFullYear(parseInt(yearMonthDay[0]));
                    //months 0-11
                    currentDay.setMonth(parseInt(yearMonthDay[1])-1, parseInt(yearMonthDay[2]));
                    
               }else{
                   context.fail(
                      generateResponse(
                        buildSpeechletResponse('I did not catch that, please say the date again', false),
                        {}
                      )
                    );
                   break;
               }
                //get day of week from @DAY_ARRAY
                var dayOfWeek = DAY_ARRAY[currentDay.getDay()];
                
                //months 0-11, add 1 to get months 1-12
                var date = currentDay.getMonth()+1;
                var year = currentDay.getFullYear();
                
                if(daySpelled == null){
                    context.fail(
                      generateResponse(
                        buildSpeechletResponse('I did not catch that, please say the date again', false),
                        {}
                      )
                    );
                }else{
                    context.succeed(
                      generateResponse(
                        buildSpeechletResponse(`The day is ${dayOfWeek} for ${date} ${currentDay.getDate()} ${year}`, true),
                        {}
                      )
                    );
                }
            
            break;
            case "GetTodayDay":
                var month, day, year;
                
                date = new Date();
                utc = date.getTime() + (date.getTimezoneOffset() * 60000);
                estDate = new Date(utc + (3600000*-5));
            
                var date = estDate.toLocaleString();
                date = date.split(' ');
                var currentDate = date[0].split('/');
                month = currentDate[0];
                day = currentDate[1];
                year = currentDate[2];
                
                //get day of week from @DAY_ARRAY
                var dayOfWeek = DAY_ARRAY[estDate.getDay()];
                
                if(dayOfWeek == null){
                    context.fail(
                      generateResponse(
                        buildSpeechletResponse('I did not catch that, please try again', true),
                        {}
                      )
                    );
                }else{
                    context.succeed(
                      generateResponse(
                        buildSpeechletResponse(`Today is ${daySpelled} for ${month} ${day} ${year}`, true),
                        {}
                      )
                    );
                }
                break;
            case "AMAZON.HelpIntent":
                var helpMsg = "You can say tell me the time, or you can say stop... What can I help you with?";
                context.succeed(
                  generateResponse(
                    buildSpeechletResponse(helpMsg, false),
                    {}
                  )
                );
                break;
            case "AMAZON.CancelIntent":
                var bye = "Goodbye!";
                context.succeed(
                  generateResponse(
                    buildSpeechletResponse(bye, true),
                    {}
                  )
                );
                break;
             case "AMAZON.StopIntent":
                var bye = "Goodbye!";
                context.succeed(
                  generateResponse(
                    buildSpeechletResponse(bye, true),
                    {}
                  )
                );
                break;
        
          default:
            throw "Invalid intent";
        }
        break;
        

      case "SessionEndedRequest":
        //Session Ended Request
        console.log(`SESSION ENDED REQUEST`);
        break;
      default:
        context.fail(`INVALID REQUEST TYPE: ${event.request.type}`);
    }
  } catch(error) { context.fail(`Exception: ${error}`); }
}

//build speech
buildSpeechletResponse = (outputText, shouldEndSession) => {

return {
    outputSpeech: {
      type: "PlainText",
      text: outputText
    },
    shouldEndSession: shouldEndSession
  }
}
//build resonse
generateResponse = (speechletResponse, sessionAttributes) => {

  return {
    version: "1.0",
    sessionAttributes: sessionAttributes,
    response: speechletResponse
  }
}