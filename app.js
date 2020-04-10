const express = require('express');
const request = require('request');
let app = express();

app.use(express.static('public'));
app.set('view engine', 'pug');
app.use(express.json());

app.get('/', (req, res) => {
    res.render('index.html');
});

const PORT = process.env.PORT || 3000;

app.post('/getstories', (req, res) => {
    let username = req.body.name;
    let result = {};
    async () => {
        await new Promise((resolve, reject) => {
            request(`https://api.storiesig.com/stories/${username}`, function (error, response, body) {
                error ? console.log('Не получилось достать сторис, возможно такого имени нет') : resolve(result.storysInfo = body);
            });
        });
        await new Promise((resolve, reject) => {
            request(`https://www.instagram.com/${username}/?__a=1`, function (error, response, body) {
                error ? console.log('Не получилось достать сторис, возможно такого имени нет') : resolve(result.userInfo = body);
            });
        });
        res.json(JSON.stringify(result));
    };
});

app.post('/search', (req, res) => {
    let val = req.body.name;
    request(`https://www.instagram.com/web/search/topsearch/?context=blended&query=${val}`, function (error, response, body) {
        res.json(body);
    });
});

app.listen(PORT, function() {
    console.log('node express word on 3000');
});
