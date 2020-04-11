const express  = require('express');
const request  = require('request');
const download = require('download-file');
const fs       = require('fs');
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
    
        async function getStories() {
            await new Promise((resolve, reject) => {
                request(`https://api.storiesig.com/stories/${username}`, function (error, response, body) {
                    if (error) {
                        reject('не пришли данные о стори')
                    } else {
                        if (body[0] !== "<") {
                            resolve(result.storysInfo = JSON.parse(body));
                        } else {
                            reject('вместо объекта пришел html')
                        }
                    }
                });
            });
            await new Promise((resolve, reject) => {
                request(`https://www.instagram.com/${username}/?__a=1`, function (error, response, body) {
                    error ? reject('не пришли данные о пользователе') : resolve(result.userInfo = JSON.parse(body));
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
        };

        getStories().then(() => {
            res.render('storys.pug', {
                result: result,
                stories: stories
            });
        })
        .catch(e => {
            console.log(`Error! ${e}`);
            if (result.storysInfo == undefined || result.userInfo == undefined) {
                res.render('storys.pug', {
                    error: 'Внутренняя ошибка сервера, обновите страницу'
                });
            } else {
                res.render('storys.pug', {
                    result: result,
                    stories: stories,
                    notStorys : "У этого пользователя нет историй"
                });
            }
        });
});


app.post('/download', (req, res) => {
    const url = req.body.link;
    let options;
    if (url.indexOf('jpg') !== -1) {
        options = {
            directory: "./public/docs/",
            filename: url.match(/.{20}.jpg/)
        }
    } 
    if (url.indexOf('mp4') !== -1) {
        options = {
            directory: "./public/docs/",
            filename: url.match(/.{20}.mp4/)
        }
    }
    download(url, options, function(err){
        if (err) throw err
        res.json(options.filename);
    }) 
});

app.post('/removedoc', (req, res) => {
    let name = req.body.name;

    setTimeout(() => {
        fs.unlink('./public/docs/'+ name +'', function(err) {
            if (err) throw err;
            console.log('file deleted');
        });
    }, 500);


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
