import process from 'node:process';
import registerCompletionHandler from 'ava';

// @ts-ignore
registerCompletionHandler(() => {
	//console.log(`completion handler?`);
	process.exit();
});