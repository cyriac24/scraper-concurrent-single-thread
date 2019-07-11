const fs = require('fs');
const request = require("request-promise");
const Queue = require('./queue');

const urlQueue = new Queue();
urlQueue.enqueue('https://medium.com'); // start with homepage
let currentConcReqCounter = 0; // current concurrent requests counter
const MAX_CONCURRENCY = 5;

const fileWriter = fs.createWriteStream('urls.txt'); // to write the urls to

function getInternalUrls(body) {
    return [...new Set( body    // to remove duplicates
        .match(/<a(.+?)>/g) // get all anchors
        .map(a => a.match(/href="(http.+?)"/)) // regex match for hrefs in all anchors
        .map(el => el && el[1])  // extract url from regex match result
        .filter(link => link && link.includes('medium.com'))    // get internal links and remove nulls
    )];
}

function writeToFilePromise(writer, data) { // helper function promisifying the write function
    return new Promise((resolve, reject) => {
        writer.write(data, (err) => {
            if(err) return reject(err);
            return resolve();
        })
    })
}

async function scrape(url) {
    console.log('scraping ', url);
    const res = await request(url);

    console.time("getInternalUrls");
    const allInternalLinks = getInternalUrls(res);
    console.timeEnd("getInternalUrls");

    //Write to file
    await writeToFilePromise(fileWriter, allInternalLinks.join('\n'));
    
    // add to queue
    urlQueue.enqueueChunk(allInternalLinks);
    throttler();
}

throttler();    // start scraping!

function throttler() {  // this function is called continuously (after every scrape or update to queue) 
    console.log('queue size: ', urlQueue.size, 'currentConcReqCounter: ', currentConcReqCounter);
    while(urlQueue.size){
        if(currentConcReqCounter > MAX_CONCURRENCY) return;

        currentConcReqCounter++;
        scrape(urlQueue.dequeue()).then(()=>{
            currentConcReqCounter--;
        }).catch(err => {
            if(err) console.error(err);
        });
    }
}

process.on('SIGTERM', () => {
    console.log('closing fileWriter');
    fileWriter.close();
})