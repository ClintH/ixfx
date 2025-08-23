import { test, expect, assert } from 'vitest';
import * as Midi from '../src/midi/index.js'

test(`notes`, () => {
  expect(Midi.noteNameToNumber(`c#8`)).toBe(109);
  expect(Midi.noteNameToNumber(`D4`)).toBe(62);
  expect(Midi.noteNameToNumber(`lorp`)).toBeNaN();

  expect(Midi.noteNumberToName(57)).toBe(`A3`);
  expect(Midi.noteNumberToName(32)).toBe(`G#1`);
  expect(Midi.noteNumberToName(129)).toBe(``);

  expect(Midi.noteNameToFrequency(`B0`)).toBe(30.868);
  expect(Midi.noteNameToFrequency(`A-1`)).toBe(13.750);


})