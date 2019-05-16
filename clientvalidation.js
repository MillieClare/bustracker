const Postcode = require("postcode");

function validation(postcode, stopNumber, radius) {
    let stopNumberValue = getElementById('stopNumber').value;
    let radiusValue = getElementById('radius').value;
    let postcodeValue = getElementById('postcode').value;
    let numberError = (isNaN(parseInt(stopNumberValue)) || isNaN(parseInt(radiusValue)));
    let postcodeError = (!Postcode.isValid(postcodeValue));
    let errorMessage;
    if (numberError && postcodeError){
        errorMessage = 'Please check that you have entered a valid postcode and numbers for stops and radius.';
    } else if (numberError){
        errorMessage = 'Please enter a valid number';
    } else if (postcodeError){
        errorMessage = 'Please enter a valid postcode';
    } else {
        window.location.href = `http://localhost:3000/submit?postcode=${postcodeValue}&stopNumber=${stopNumberValue}&radius=${radiusValue}`
    }
}