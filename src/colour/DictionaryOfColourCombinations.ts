/**
 * Matt DesLauriers
 * Source: https://github.com/mattdesl/dictionary-of-colour-combinations
 * "The data here has originally been compiled and open sourced by Dain M. Blodorn Kim (@dblodorn) 
 * for his interactive web version (dblodorn/sanzo-wada). In this fork, I've fixed some incorrect 
 * data from the original, used a more perceptual CMYK to RGB conversion, and encapsulated the dataset 
 * as a standalone and distributed project." - mattdesl's README.md
*/
import {randomElement} from '../collections/Lists.js';
import {data} from './DictionaryOfColourCombinationsData.js';

type Cmyk = readonly [number, number, number, number];
type Lab = readonly [number, number, number];
type Rgb = readonly [number, number, number];

export type DictColour = {
  readonly name:string
  readonly combinations: ReadonlyArray<number>
  readonly swatch: number
  readonly cmyk: Cmyk
  readonly lab: Lab
  readonly rgb: Rgb
  readonly hex: string
};

export const check = () => {
  // @ts-ignore
  const d = data.default;
  //eslint-disable-next-line  functional/no-loop-statement
  for (const v of d) {
    // @ts-ignore
    const c = v as DictColour;
    if (c.cmyk.length !== 4) {
      console.log(c.name);
    }
  }
  console.log(`All good.`);
};

export const randomPalette = (minColours:number = 3):readonly DictColour[] => {
  // @ts-ignore
  const d = data as DictColour[];
  
  // Get a random colour
  const c = randomElement(d);
  
  // And a random combination
  if (c.combinations.length < minColours) return randomPalette(minColours);
  const combo = randomElement(c.combinations);

  const palette = [];
  //eslint-disable-next-line  functional/no-loop-statement
  for (const v of d) {
    if (v.name === c.name) continue;
    if (v.combinations.includes(combo)) {
      //eslint-disable-next-line  functional/immutable-data
      palette.push(v);
    }
  }

  if (palette.length < minColours) return randomPalette(minColours);
  else return palette;

  // {
  //   "name": "Hermosa Pink",
  //   "combinations": [
  //     176,
  //     227,
  //     273
  //   ],
  //   "swatch": 0,
  //   "cmyk": [
  //     0,
  //     30,
  //     6,
  //     0
  //   ],
  //   "lab": [
  //     83.42717631799802,
  //     22.136186770428026,
  //     1.6381322957198563
  //   ],
  //   "rgb": [
  //     249,
  //     193,
  //     206
  //   ],
  //   "hex": "#f9c1ce"
  // },
};