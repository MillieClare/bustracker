const request = require('request');
const _ = require('lodash');


function getAndSendBusTimes(postcode, stopNumber, radius) {
    let postcodeUrl = `https://api.postcodes.io/postcodes/${postcode}`;
    return getLongLat(postcodeUrl, radius).then((tflLongLat) => getNearestStop(tflLongLat, stopNumber)).then(getNextBuses).catch((error) => console.log('ruh roh', error));
}

function getLongLat(postcodeUrl, radiusValue) {
    let longPromise = new Promise(function (resolve, reject) {
        request(postcodeUrl, function (error, response, postCodeBody) {
            let postCodeParsed = JSON.parse(postCodeBody);
            longitude = postCodeParsed.result.longitude;
            latitude = postCodeParsed.result.latitude;
            radius = radiusValue;

            let tflLongLat = `https://api.tfl.gov.uk/StopPoint?stopTypes=NaptanPublicBusCoachTram&useStopPointHierarchy=false&lat=${latitude}&lon=${longitude}&radius=${radius}`;
            resolve(tflLongLat);
        });
    })
    return longPromise;
}

function getNearestStop(tflLongLat, numberOfStops) {
    let stopPromise = new Promise(function (resolve, reject) {
        request(tflLongLat, function (error, response, longLatBody) {
            let longLatBodyParsed = JSON.parse(longLatBody);
            let nearestStops = [];
            for(let stops of longLatBodyParsed.stopPoints.slice(0, numberOfStops)) {
                let currentStop = stops.naptanId;
                nearestStops.push(`https://api.tfl.gov.uk/StopPoint/${currentStop}/Arrivals?app_id=ca0313f5&app_key=5b1573cd9eacad4fd33c83db084f1f4f`);
            }
            resolve(nearestStops);
        });
    })
    return stopPromise;
}

function getNextBuses(nearestStops) {
    let promiseArray = [];
    for (let stop of nearestStops) {
        let nextBusPromise = new Promise(function (resolve, reject) {
            request(stop, function (error, response, bodyTFLBus) {
                let parsedBody = JSON.parse(bodyTFLBus);
                let sortedParsedBody = _.sortBy(parsedBody, ['timeToStation']);
                let nextBuses = [];
                //console.log(sortedParsedBody);
                for (let busArrival of sortedParsedBody.slice(0, 5)) {
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
                    if (busArrival.towards === 'null') {
                        nextBuses.push(`Bus ${busArrival.lineName} will terminate at ${busArrival.stationName} in ${minutes} ${minutesWord} and ${seconds} ${secondsWord}`);
                    } else {
                        nextBuses.push(`Bus ${busArrival.lineName} will arrive at ${busArrival.stationName} towards ${busArrival.towards} will arrive in ${minutes} ${minutesWord} and ${seconds} ${secondsWord}`);
                    }

                }
                resolve(nextBuses);
            })
        });
        promiseArray.push(nextBusPromise); //make sure this is within for loop scope
    }
    return Promise.all(promiseArray);
}
module.exports = getAndSendBusTimes;