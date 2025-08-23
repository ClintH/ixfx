import * as Colour from '../../../packages/visual/src/colour/index.js';
import {Midi} from '../../../packages/io/src/index.js';

const mm = new Midi.MidiManager();

let encoder = 1;

const mf = new Midi.MidiFighter();
mf.addEventListener(`state`, event => {
  console.log(`State: ${event.state}`);
  if (event.state === `ready`) {
    mf.bank = 1;
  } else {
  }
});
mf.addEventListener(`bankChange`, event => {
  console.log(`Bank change: ${event.prev} -> ${event.current} implicit: ${event.implicit}`);
});

mf.addEventListener(`sideButton`, event => {
  console.log(`Side button:`, event);
});

mf.addEventListener(`encoder`, event => {
  const encoder = event.encoder;
  console.log(`Encoder: ${encoder.bank}.${encoder.encoder} ${event.previous} -> ${event.value}`);
})
mf.addEventListener(`switch`, event => {
  const encoder = event.encoder;
  console.log(`Switch: ${encoder.bank}.${encoder.encoder} ${event.previous} -> ${event.value}`);
})
// control.addEventListener(`change`, event => {
//   console.log(`Control change: v: ${event.velocity} scaled: ${event.velocityScaled}`);
// })

mm.addEventListener(`deviceConnected`, event => {
  console.log(`deviceConnected: ${event.port.name}`);
})
mm.addEventListener(`deviceDisconnected`, event => {
  console.log(`deviceDisconnected: ${event.port.name}`);
});
mm.addEventListener(`open`, event => {
  console.log(`open: ${event.port.name}`);
  if (event.port.name === `Midi Fighter Twister`) {
    mf.setPort(event.port);
  }
});

mm.addEventListener(`close`, event => {
  console.log(`close: ${event.port.name}`);
});
// mm.addEventListener(`message`, event => {
//   let handled = control.onInputMessage(event);
//   if (handled) return;
  
//   console.log(`message: `,event);
// });

await mm.scan();

document.querySelector(`#btnDump`)?.addEventListener(`click`,() => {
  console.log(mm.dumpToStringLines().join('\n'));
})

document.querySelector(`#inColour`)?.addEventListener(`input`, (event) => {
  const v = /** @type HTMLInputElement */(event.target).value;
  //const c = Colour.toColour(v);
  const hsl = Colour.HslSpace.fromCss(v);

  console.log(hsl);
  const enc = mf.getEncoder(encoder);
  enc?.setSwitchColourHue(hsl.h);
  //enc?.setLedRing(v);
  //fbKnob.sendRaw(v);

})

document.querySelector(`#testVisual2`)?.addEventListener(`change`, (event) => {
  const v = /** @type HTMLInputElement */(event.target).valueAsNumber;
  const enc = mf.getEncoder(encoder);
  enc?.setSwitchEffect(`none`);
  enc?.setSwitchColourRaw(v);
  //fbKnobColour.sendRaw(v);

});

document.querySelector(`#selBank`)?.addEventListener(`change`, (event) => {
  const v = /** @type HTMLInputElement */(event.target).valueAsNumber;
  mf.bank = v;
});
document.querySelector(`#selEncoder`)?.addEventListener(`change`, (event) => {
  const v = /** @type HTMLInputElement */(event.target).valueAsNumber;
  encoder = v;
});