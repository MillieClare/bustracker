const express = require('express');
const app = express()
const port = 3000;
const busCode = require('./bustrackerupdated');
const Postcode = require("postcode");
console.log(busCode);

app.use(express.urlencoded());
app.use(express.static('css'));
app.set('view engine', 'ejs');

app.get('/', (req, res) => {
    res.render('bustracker', {

    })
})
app.get('/submit', (req, res) => {
    
    let postcodeError = (!Postcode.isValid(req.query.postcode));
    let numberError = (isNaN(parseInt(req.query.stopNumber)) || isNaN(parseInt(req.query.radius)));
    console.log(postcodeError);
    console.log(numberError);
    if (postcodeError || numberError) {
        let message;
        if(postcodeError && numberError){
            message = 'Please check that you have entered a valid postcode and numbers for stops and radius.';
        } else if (postcodeError) {
            message = 'Please enter a valid postcode';
        } else if (numberError) {
            message = 'Please enter a valid number';
        }
        res.render('errorPage', {
            status: 400,
            message: message,
        })
    }
    else {
        console.log(req.query.postcode);
        console.log(req.query.stopNumber);
        console.log(req.query.radius);
        busCode(req.query.postcode, req.query.stopNumber, req.query.radius).then(busTimes => {
            console.log(busTimes);
            res.render('busResults', {
                busTimes
            })
        })
    }

})


app.listen(port, () => console.log(`Example app listening on port ${port}!`))