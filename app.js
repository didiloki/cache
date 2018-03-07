const express = require('express');
const mongoose = require('mongoose');
const bodyParser = require('body-parser');
const randomstring = require("randomstring");
const methodOverride = require('method-override')
const NodeCache = require("node-cache");
const myCache = new NodeCache();

require('./models/cache');
const Cache = mongoose.model('caches');

const app = express();

mongoose.Promise = global.Promise;
mongoose.connect('mongodb://localhost:27017/cache')
    .then(() => console.log('connected'))
    .catch(err => console.log(err));

app.use(bodyParser.urlencoded({ extended: false }))
app.use(bodyParser.json())
app.use(methodOverride('_method'))

app.get('/', (req, res) => {
    res.send('visit /cache/new to create a new cache');
})

app.post('/cache/new', (req, res) => {
    Cache.find({ key: req.body.key })
        .then(cache => {
            if (cache) {
                res.send("status " + res.statusCode + ' Key is already exist');
            } else {
                var newCache = {
                    key: req.body.key,
                    name: req.body.name,
                    value: req.body.value,
                    ttl: req.body.ttl
                }

                new Cache(newCache)
                    .save()
                    .then(cache => {
                        myCache.set(newCache.key, newCache, req.body.ttl, (err,success) => {
                            if (!err && success) {
                                console.log(success);
                            } else {
                                console.log(err)
                            }
                        });
                        res.send("status " + res.statusCode + " " + myCache.get(newCache.key));
                        myCache.on("expired", function (key, value) {
                            res.send(`expired`);
                        });
                    })
            }
        })
})


app.get('/cache/show/all', (req, res) => {
    mykeys = myCache.keys();

    Cache.find({})
        .then(caches => {
            res.send("status " + res.statusCode + " " + caches);
        })
});

app.put('/cache/update/:key', (req, res) => {
    Cache.findOne({ key: req.params.key })
        .then(cache => {
            cache.key = req.params.key;
            cache.name = req.body.name;
            cache.value = req.body.value;
            cache.ttl = req.body.ttl;

            myCache.set(req.params.key, cache, req.body.ttl);

            cache.save()
                .then(cache => {
                    res.send("status " + res.statusCode + " " + myCache.get(cache.key));
                    myCache.on("expired", function (key, value) {
                        console.log(`${key} expired`);
                        key = randomstring.generate({
                            length: 7,
                            charset: 'alphabetic'
                        });
                        value = randomstring.generate({
                            length: 7,
                            charset: 'numeric'
                        });
                    });
                })
        })
});

app.delete('/cache/delete/:key', (req, res) => {
    value = myCache.del(req.params.key);
    Cache.remove({ key: req.params.key })
        .then(() => {
            res.send("status " + res.statusCode + ' key removed');
        })
});

app.delete('/cache/delete', (req, res) => {
    value = myCache.del([]);
    Cache.remove({})
        .then(() => {
            res.send("status " + res.statusCode + ' All Keys removed');
        })
});

app.get('/cache/:key', (req, res) => {
    Cache.findOne({ key: req.params.key })
        .then(data => {
            if (!data) {
                var newObj = {
                    key: req.params.key,
                    name: randomstring.generate({
                        length: 7,
                        charset: 'alphabetic'
                    }),
                    value: randomstring.generate({
                        length: 7,
                        charset: 'numeric'
                    }),
                    ttl: randomstring.generate({
                        length: 2,
                        charset: 'numeric'
                    })
                }

                new Cache(newObj)
                    .save()
                    .then(newObj => {
                        myCache.set(req.params.key, newObj, newObj.ttl, (err,success) => {
                            if (!err && success) {
                                console.log(success);
                            } else {
                                console.log(err)
                            }
                        });
                        res.send("status " + res.statusCode + ' Cache miss but we created a new one' + '<br>' + newObj);
                        myCache.on("expired", function (key, value) {
                            console.log(`${key} expired`);
                            key = randomstring.generate({
                                length: 7,
                                charset: 'alphabetic'
                            });
                            value = randomstring.generate({
                                length: 7,
                                charset: 'numeric'
                            })
                        });
                    })
            } else if (data) {
                res.send("status " + res.statusCode + ' Cache hit' + data);
                myCache.set(data.key, data, data.ttl, (err,success) => {
                    if (!err && success) {
                        console.log(success);
                    } else {
                        console.log(err)
                    }
                });
                myCache.on("expired", function (key, value) {
                    console.log(`${key} expired`);
                    key = randomstring.generate({
                        length: 7,
                        charset: 'alphabetic'
                    });
                    value = randomstring.generate({
                        length: 7,
                        charset: 'numeric'
                    });
                });
            }
        })
});

var port = process.env.PORT || 2500;

app.listen(port, () => {
    console.log(`server is going on port ${port}`)
});