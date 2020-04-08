const express = require('express');
const request = require('request');
let app = express();

app.use(express.static('public'));
app.set('view engine', 'pug');
app.use(express.json());

const PORT = process.env.PORT || 3000

app.get('/', function(req, res) {
    res.render('index.html');
});

app.post('/getstories', function(req, res) {
    let username = req.body.name;
    let result = {};
    let promise = new Promise(function(resolve, reject) {
        request(`https://api.storiesig.com/stories/${username}`, function (error, response, body) {
            if (error) {
                console.log('Не получилось достать сторис, возможно такого имени нет');
            } else {
                resolve(result.storysInfo = body);
            };
        });
        request(`https://www.instagram.com/${username}/?__a=1`, function (error, response, body) {
            if (error) {
                console.log('Не получилось достать сторис, возможно такого имени нет');
            } else {
                result.userInfo = body;
            };
        });
    }).then(function() {
        res.json(JSON.stringify(result));
    });


});

app.post('/search', function(req, res) {
    let val = req.body.name;
    request(`https://www.instagram.com/web/search/topsearch/?context=blended&query=${val}`, function (error, response, body) {
        res.json(body);
    });
});

app.post('/userinfo', function(req, res) {
    
    request(`https://www.instagram.com/00000000000001k/?__a=1`, function (error, response, body) {
        res.json(body);
    });
    
});


app.listen(PORT, function() {
    console.log('node express word on 3000');
});