# scraper-concurrent-single-thread
Simple scraper in single threaded app but with concurrent requests

node version: 10.15.3

`npm i`

`npm start`

```
Make the most out of the asynchronous behaviour. Node will not wait for a request to respond. Hence we can concurrently call multiple requests confidently. Thus we NEED not not have child processes as workers for 5 concurrent requests. We just need a counter.
```