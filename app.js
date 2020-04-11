const express = require('express');
const request = require('request');
let app = express();

app.use(express.static('public'));
app.set('view engine', 'pug');
app.use(express.json());

const PORT = process.env.PORT || 3000;

app.get('/', (req, res) => {
    res.render('index.html');
});

app.get('/storys', (req, res) => {
        let username = req.query.name;
        let result = {};
        let stories = [];
    
        // new Promise((resolve, reject) => {
        //     request(`https://api.storiesig.com/stories/${username}`, function (error, response, body) {
        //         error ? reject(console.log(error)) : resolve(result.storysInfo = JSON.parse(body));
        //     });
        // }).then(() => {
        //     console.log(result.storysInfo)
        // })

        async function getStories() {
                await new Promise((resolve, reject) => {
                    request(`https://api.storiesig.com/stories/${username}`, function (error, response, body) {
                        error ? reject(console.log(error)) : resolve(result.storysInfo = JSON.parse(body));
                    });
                });
                await new Promise((resolve, reject) => {
                    request(`https://www.instagram.com/${username}/?__a=1`, function (error, response, body) {
                        error ? reject(console.log(error)) : resolve(result.userInfo = JSON.parse(body));
                    });
                });
                await new Promise((resolve, reject) => {
                    let storysInfo = result.storysInfo;
                    if (storysInfo.items.length == 0) {
                        reject('У пользователя нет историй');
                    } else {
                        for(let i = 0; i < storysInfo.items.length; i++) {
                            if (storysInfo.items[i].video_versions === undefined) {
                                stories.push(storysInfo.items[i].image_versions2.candidates[0].url);
                            } else {
                                stories.push(storysInfo.items[i].video_versions[0].url);
                            }
                            if (i + 1 == storysInfo.items.length) {
                                resolve();
                            }
                        };
                    }
                });
                res.render('storys.pug', {
                    result: result,
                    stories: stories
                });
        };

        getStories().catch(e => {
            console.log(`Error! ${e}`);
            res.render('storys.pug', {
                result: result,
                stories: stories,
                notStorys : "У этого пользователя нет историй"
            });
        })
});


app.post('/search', (req, res) => {
    let val = req.body.name;
    request(`https://www.instagram.com/web/search/topsearch/?context=blended&query=${val}`, function (error, response, body) {
        error == null ? res.json(body) : console.log('error');
    });
});

app.listen(PORT, function() {
    console.log(`node express word on ${PORT}`);
});
