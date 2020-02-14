const express = require('express')
const app = express()
const port = process.env.PORT || 3001
const puppeteer = require('puppeteer');


app.get('/api/search-film?:keyword', (req, res) => {
    (async() => {
        const browser = await puppeteer.launch();
        const page = await browser.newPage();
        await page.goto("https://motphim.net/tim-kiem/" + req.query.key + "/");
        const film = await page.evaluate(() => {
            let items = document.querySelectorAll('.item > a')
            let names = document.querySelectorAll('.item > a > .name > span')
            let images = document.querySelectorAll('.item > a > img')
            let links = []
            names.forEach((item, i) => {
                links.push({
                    name: item.innerHTML,
                    image: images[i].src,
                    title: items[i].getAttribute('title'),
                    link: 'https://motphim.net' + items[i].getAttribute('href'),
                })
            })
            return links
        })

        res.send(film)
        await browser.close();
    })();
})

app.get('/api/watch?:keyword', (req, res) => {
    (async() => {
        if (req.query.href) {
            const browser = await puppeteer.launch();
            const page = await browser.newPage();
            await page.goto(req.query.href);
            const stream_link = await page.evaluate(() => {
                let btn_stream = document.querySelectorAll('.btn.adspruce-streamlink')
                let result = {
                    name: document.querySelector('span[class="title"]').innerHTML,
                    description: document.querySelector('.detail > .tabs-content > .tab > div').innerHTML,
                    url: btn_stream[1].href,
                }
                return result
            })

            res.send(stream_link)
            await browser.close();
        } else {
            res.send({
                error: 'parameter href not required'
            })
        }
    })();
})

app.listen(port, () => console.log(`Example app listening on port ${port}!`))