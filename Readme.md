# Translink Adapter
A simple Cloudflare worker to adapt Translink's bulky JSON API responses for the Real-time Transit Information API's [Stop Estimates](https://www.translink.ca/about-us/doing-business-with-translink/app-developer-resources/rtti#stop-estimates) endpoint into something that small embedded systems like the NodeMCU can more easily handle.

## Request
Parameters are defined in headers.
* `ApiKey`: Your Translink-issued API key ([Register](https://www.translink.ca/about-us/doing-business-with-translink/app-developer-resources/register) or [log in](https://www.translink.ca/about-us/doing-business-with-translink/app-developer-resources/login) to be sent your key via email)
* `StopId`: The stop ID you wish to receive estimates for
* `LineId`: The line ID you wish to receive estimates for. Due to the response schema, unlike the RTTI API, this parameter is required.

## Response
### Success
`[BLOCK1][BLOCK2][BLOCK3]` where each `BLOCK` is in the format `[C][CO][S]`
* `C` is either `T` or `F`, whether the trip/stop has been cancelled
* `CO` is the countdown in minutes until the bus arrives.
* `S` is the status character provided by Translink. `+`: Ahead of schedule, `-`: delayed, `*`: on schedule. Translink also sometimes responds with an undocumented ` ` (space). Meaning unknown.

### Error
`E [INFO]`, with `INFO` being one of the following:
* `INVALIDREQ`: Invalid request. One of the request headers was not found.
* `NULL RESP `: Received a null / unparseable response from Translink
* `CODE [CODE]`: Recieved an error `CODE` from Translink. Error codes are documented [here](https://www.translink.ca/about-us/doing-business-with-translink/app-developer-resources/rtti#stop-estimates)

## Development
Clone the repo, and run `npm run start` to start a auto-reloading dev server with Wrangler.

## Deployment
Run `npm run deploy` to deploy to Cloudflare Workers via Wrangler. Note that you will need to authenticate with Cloudflare.
