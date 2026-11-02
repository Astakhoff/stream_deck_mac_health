import streamDeck from '@elgato/streamdeck';
import {createRequire} from 'node:module';
import {execFile} from 'node:child_process';
import {promisify} from 'node:util';
const require=createRequire(import.meta.url);
const {Monitor}=require('./monitor');
const {createController}=require('./controller');
const run=promisify(execFile);
const controller=createController(streamDeck,new Monitor(),bundle=>run('/usr/bin/open',['-b',bundle]));
const timer=setInterval(()=>controller.paintAll(),1000);
function stop(){clearInterval(timer);controller.stop();process.exit(0);}
process.on('SIGTERM',stop);process.on('SIGINT',stop);
await streamDeck.connect();
