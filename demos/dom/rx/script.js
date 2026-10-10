import {Reactive as Rx} from '../../../dist/data.js'
import * as Dom from '../../../dist/dom.js';

const data = Rx.fromProxy([`a`,`b`,`c`]);
Dom.Rx.elements(data.rx);