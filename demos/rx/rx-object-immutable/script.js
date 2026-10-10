import * as Data from '../../../dist/data.js';
import * as Numbers from '../../../dist/numbers.js';

let settings = {
  name:`jane`,
  age:10
}
const ic = Data.interceptChanges(settings, {
  onFieldChange: {
    age: (v,prev,field) => {
      console.log(`age: ${v} field: ${field} prev: ${prev}`);
      return 1000;
    },
    name: (v => {
      console.log(`name: ${v}`);
      return `hello ${v}`;
    })
  }
});
let x = ic({...settings, age:1});
console.log(`final`,x);