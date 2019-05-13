const request = require('request');
const readlineSync = require('readline-sync');
const _ = require('lodash');

let postcode = readlineSync.question("What postcode would you like to check for: ").toUpperCase().replace(/ +/g, "");
let postcodeUrl = `https://api.postcodes.io/postcodes/${postcode}`;

getLongLat().then(getNearestStop).then(getNextBuses).then((busArrivals)=>console.log(busArrivals)).catch(()=>console.log('ruh roh'));

function getLongLat() {
    let longPromise = new Promise(function (resolve, reject) {
        request(postcodeUrl, function (error, response, postCodeBody) {
            let postCodeParsed = JSON.parse(postCodeBody);
            longitude = postCodeParsed.result.longitude;
            latitude = postCodeParsed.result.latitude;

            let tflLongLat = `https://api.tfl.gov.uk/StopPoint?stopTypes=NaptanPublicBusCoachTram&useStopPointHierarchy=false&lat=${latitude}&lon=${longitude}`;
            resolve(tflLongLat);
        });
    })
    return longPromise;
}

function getNearestStop(tflLongLat) {
    let stopPromise = new Promise(function (resolve, reject) {
        request(tflLongLat, function (error, response, longLatBody) {
            let longLatBodyParsed = JSON.parse(longLatBody);
            let nearestStop = longLatBodyParsed.stopPoints[0].naptanId;

            console.log(nearestStop);
            let stopUrl = `https://api.tfl.gov.uk/StopPoint/${nearestStop}/Arrivals?app_id=ca0313f5&app_key=5b1573cd9eacad4fd33c83db084f1f4f`;
            resolve(stopUrl);
        });
    })
    return stopPromise;
}

function getNextBuses(stopUrl) {
    let nextBusPromise = new Promise(function (resolve, reject) {
        request(stopUrl, function (error, response, bodyTFLBus) {
            let parsedBody = JSON.parse(bodyTFLBus);
            let sortedParsedBody = _.sortBy(parsedBody, ['timeToStation']);
            let nextBuses = [];
            //console.log(sortedParsedBody);
            for (let busArrival of sortedParsedBody.slice(0,5)) {
                let minutes = Math.floor(busArrival.timeToStation / 60);
                let seconds = (busArrival.timeToStation % 60);
                let minutesWord = 'minutes';
                let secondsWord = 'seconds';
                if (seconds === 1) {
                    secondsWord = 'second';
                }
                if (minutes === 1) {
                    minutesWord = 'minute';
                }
                if(busArrival.towards === 'null') {
                    nextBuses.push(`Bus ${busArrival.lineName} will terminate at ${busArrival.stationName} in ${minutes} ${minutesWord} and ${seconds} ${secondsWord}`);
                } else {
                    nextBuses.push(`Bus ${busArrival.lineName} will arrive at ${busArrival.stationName} towards ${busArrival.towards} will arrive in ${minutes} ${minutesWord} and ${seconds} ${secondsWord}`);
                }
                
            }
            resolve (nextBuses.join('\n'));
        });
    })
    return nextBusPromise;
}