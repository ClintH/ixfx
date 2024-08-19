
import {reconnectingWebsocket} from '../../../dist/io.js';

// const ws = new WebSocket(`ws://localhost:8080`);
// const result = await eventRace(ws, [`open`, `close`,`error`], {timeout:2000});
// console.log(`result`, result);

const ws = await reconnectingWebsocket(`ws://localhost:8080`, {onMessage:(msg) => {
  console.log(msg);
}});

// setInterval(() => {
//    console.log(`Ping`);
//    try {
//     ws.send(`ping`);
//    } catch (error) {}
// }, 1000);