/**
 * Visualiser component
 *
 * Usage: import visualiser.js. Instantiate on document load, and pass in the
 * parent element into the constructor.
 *
 * eg: const v = new Visualiser(document.getElementById('renderer'));
 *
 * Data must be passed to the component via renderFreq or renderWave.
 *
 * Draws on https://developer.mozilla.org/en-US/docs/Web/API/Web_Audio_API/Visualizations_with_Web_Audio_API
 */

import { numberTracker } from '../data/NumberTracker.js';
import { AudioAnalyser } from './AudioAnalyser.js';
import type { Point } from '../geometry/point/PointType.js';
import { minMaxAvg } from '../collections/arrays/MinMaxAvg.js';

// TODO: This is an adaption of old code. Needs to be smartened up further
export default class AudioVisualiser {
  freqMaxRange = 200;
  audio: AudioAnalyser;
  parent: HTMLElement;

  lastPointer: Point = { x: 0, y: 0 };
  pointerDown = false;
  pointerClicking = false;
  pointerClickDelayMs = 100;
  pointerDelaying = false;

  waveTracker;
  freqTracker;
  el: HTMLElement;

  constructor(parentElem: HTMLElement, audio: AudioAnalyser) {
    this.audio = audio;
    this.parent = parentElem;
    this.waveTracker = numberTracker();
    this.freqTracker = numberTracker();

    // Add HTML
    parentElem.innerHTML = `
    <section>
      <button id="rendererComponentToggle">🔼</button>
      <div>
        <h1>Visualiser</h1>
        <div style="display:flex; flex-wrap: wrap">
          <div class="visPanel">
            <h2>Frequency distribution</h2>
            <br />
            <canvas id="rendererComponentFreqData" height="200" width="400"></canvas>
          </div>
          <div class="visPanel">
            <h2>Waveform</h2>
            <button id="rendererComponentWaveReset">Reset</button>
            <div>
              Press and hold on wave to measure
            </div>
            <br />
            <canvas id="rendererComponentWaveData" height="200" width="400"></canvas>
          </div>
        </div>
      </div>
    </section>
    `;
    this.el = parentElem.children[ 0 ] as HTMLElement;

    document
      .getElementById(`rendererComponentToggle`)
      ?.addEventListener(`click`, () => {
        this.setExpanded(!this.isExpanded());
      });
    this.el.addEventListener(`pointermove`, (e) => this.onPointer(e));
    //this.el.addEventListener(`touchbegin`, (e) => this.onPointer(e));
    this.el.addEventListener(`pointerup`, () => {
      this.pointerDelaying = false;
      this.pointerDown = false;
    });
    this.el.addEventListener(`pointerdown`, () => {
      this.pointerDelaying = true;
      setTimeout(() => {
        if (this.pointerDelaying) {
          this.pointerDelaying = false;
          this.pointerDown = true;
        }
      }, this.pointerClickDelayMs);
    });
    this.el.addEventListener(`pointerleave`, () => {
      this.pointerDelaying = false;
      this.pointerDown = false;
    });

    document
      .getElementById(`rendererComponentWaveReset`)
      ?.addEventListener(`click`, () => {
        this.clear();
      });
  }

  renderFreq(freq: readonly number[]) {
    if (!this.isExpanded()) return; // Don't render if collapsed
    if (!freq) return; // Data is undefined/null

    const canvas = document.getElementById(
      `rendererComponentFreqData`
    ) as HTMLCanvasElement;
    if (canvas === null) throw new Error(`Cannot find canvas element`);
    const g = canvas.getContext(`2d`);
    if (g === null) throw new Error(`Cannot create drawing context`);

    const bins = freq.length;
    const canvasWidth = canvas.clientWidth;
    const canvasHeight = canvas.clientHeight;
    g.clearRect(0, 0, canvasWidth, canvasHeight);

    const pointer = this.getPointerRelativeTo(canvas);
    const width = canvasWidth / bins;
    const minMax = minMaxAvg(freq);

    //eslint-disable-next-line functional/no-let
    for (let i = 0; i < bins; i++) {
      if (!Number.isFinite(freq[ i ])) continue;

      const value = freq[ i ] - minMax.min;
      const valueRelative = value / this.freqMaxRange;
      const height = Math.abs(canvasHeight * valueRelative);
      const offset = canvasHeight - height;

      const hue = (i / bins) * 360;
      const left = i * width;
      g.fillStyle = `hsl(` + hue + `, 100%, 50%)`;

      // Show info about data under pointer
      if (
        pointer.y > 0 &&
        pointer.y <= canvasHeight &&
        pointer.x >= left &&
        pointer.x <= left + width
      ) {
        // Keep track of data
        if (this.freqTracker.id !== i.toString()) {
          this.freqTracker = numberTracker({ id: i.toString() });
        }
        this.freqTracker.seen(freq[ i ]);

        const freqMma = this.freqTracker.getMinMaxAvg();

        // Display
        g.fillStyle = `black`;
        if (this.audio) {
          g.fillText(
            `Frequency (${ i }) at pointer: ${ this.audio
              .getFrequencyAtIndex(i)
              .toLocaleString(`en`) } - ${ this.audio
                .getFrequencyAtIndex(i + 1)
                .toLocaleString(`en`) }`,
            2,
            10
          );
        }
        g.fillText(`Raw value: ${ freq[ i ].toFixed(2) }`, 2, 20);
        g.fillText(`Min: ${ freqMma.min.toFixed(2) }`, 2, 40);
        g.fillText(`Max: ${ freqMma.max.toFixed(2) }`, 60, 40);
        g.fillText(`Avg: ${ freqMma.avg.toFixed(2) }`, 120, 40);
      }
      g.fillRect(left, offset, width, height);
    }
  }

  isExpanded() {
    const contentsElem = this.el.querySelector(`div`);
    if (contentsElem === null) throw new Error(`contents div not found`);
    return contentsElem.style.display === ``;
  }

  setExpanded(value: boolean) {
    const contentsElem = this.el.querySelector(`div`);
    const button = this.el.querySelector(`button`);

    if (button === null) throw new Error(`Button element not found`);
    if (contentsElem === null) throw new Error(`Contents element not found`);
    if (value) {
      contentsElem.style.display = ``;
      button.innerText = `🔼`;
    } else {
      contentsElem.style.display = `none`;
      button.innerText = `🔽`;
    }
  }

  clear() {
    this.clearCanvas(
      document.getElementById(`rendererComponentFreqData`) as HTMLCanvasElement
    );
    this.clearCanvas(
      document.getElementById(`rendererComponentWaveData`) as HTMLCanvasElement
    );
  }

  // Clears a canvas to white
  clearCanvas(canvas: HTMLCanvasElement | null) {
    if (canvas === null) throw new Error(`Canvas is null`);
    const g = canvas.getContext(`2d`);
    if (g === null) throw new Error(`Cannot create drawing context`);
    g.fillStyle = `white`;
    g.fillRect(0, 0, canvas.clientWidth, canvas.clientHeight);
  }

  // Renders waveform data.
  // Adapted from MDN's AnalyserNode.getFloatTimeDomainData() example
  renderWave(wave: readonly number[], bipolar = true) {
    if (!this.isExpanded()) return; // Don't render if collapsed
    if (!wave) return; // Undefined or null data
    const canvas = document.getElementById(
      `rendererComponentWaveData`
    ) as HTMLCanvasElement;
    if (canvas === null) throw new Error(`Cannot find wave canvas`);

    const g = canvas.getContext(`2d`);
    if (g === null) throw new Error(`Cannot create drawing context for wave`);

    const canvasWidth = canvas.clientWidth;
    const canvasHeight = canvas.clientHeight;
    const pointer = this.getPointerRelativeTo(canvas);
    const infoAreaHeight = 20;
    const infoAreaWidth = 60;
    const bins = wave.length;
    g.fillStyle = `white`;
    g.fillRect(0, 0, infoAreaWidth, infoAreaHeight);

    const width = canvasWidth / bins;

    // Clears the screen with very light tint of white
    // to fade out last waveform. Set this higher to remove effect
    g.fillStyle = `rgba(255, 255, 255, 0.03)`;
    g.fillRect(0, 20, canvasWidth, canvasHeight);

    g.fillStyle = `red`;
    if (bipolar) {
      g.fillRect(0, canvasHeight / 2, canvasWidth, 1);
    } else {
      g.fillRect(0, canvasHeight - 1, canvasWidth, 1);
    }

    g.lineWidth = 1;
    g.strokeStyle = `black`;
    g.beginPath();

    //eslint-disable-next-line functional/no-let
    let x = 0;

    //eslint-disable-next-line functional/no-let
    for (let i = 0; i < bins; i++) {
      const height = wave[ i ] * canvasHeight;
      const y = bipolar ? canvasHeight / 2 - height : canvasHeight - height;

      if (i === 0) {
        g.moveTo(x, y);
      } else {
        g.lineTo(x, y);
      }
      x += width;

      if (this.pointerDown) this.waveTracker.seen(wave[ i ]);
    }
    g.lineTo(canvasWidth, bipolar ? canvasHeight / 2 : canvasHeight); //canvas.height / 2);
    g.stroke();

    // Draw
    if (this.pointerDown) {
      const waveMma = this.waveTracker.getMinMaxAvg();
      g.fillStyle = `rgba(255,255,0,1)`;
      g.fillRect(infoAreaWidth, 0, 150, 20);
      g.fillStyle = `black`;
      g.fillText(`Min: ` + waveMma.min.toFixed(2), 60, 10);
      g.fillText(`Max: ` + waveMma.max.toFixed(2), 110, 10);
      g.fillText(`Avg: ` + waveMma.avg.toFixed(2), 160, 10);
    } else {
      this.waveTracker.reset();
    }

    // Show info about data under pointer
    if (
      pointer.y > 0 &&
      pointer.y <= canvasHeight &&
      pointer.x >= 0 &&
      pointer.x <= canvasWidth
    ) {
      g.fillStyle = `black`;
      g.fillText(
        `Level: ` + (1.0 - pointer.y / canvasHeight).toFixed(2),
        2,
        10
      );
    }
  }

  // Yields pointer position relative to given element
  getPointerRelativeTo(elem: HTMLElement) {
    const rect = elem.getBoundingClientRect();
    return {
      x: this.lastPointer.x - rect.left - window.scrollX, //elem.offsetLeft + window.scrollX,
      y: this.lastPointer.y - rect.top - window.scrollY, //elem.offsetTop + window.scrollY
    };
  }

  // Keeps track of last pointer position in page coordinate space
  onPointer(evt: MouseEvent | PointerEvent) {
    this.lastPointer = {
      x: evt.pageX,
      y: evt.pageY,
    };
    evt.preventDefault();
  }

  // getMinMax(data, start = 0, end = data.length) {
  //   if (end > data.length) throw new Error(`end is past size of array`);
  //   if (start < 0) throw new Error(`start should be at least 0`);
  //   if (end <= start) throw new Error(`end should be greater than start`);

  //   let max = Number.MIN_SAFE_INTEGER;
  //   let min = Number.MAX_SAFE_INTEGER;
  //   for (let i = start; i < end; i++) {
  //     max = Math.max(data[i], max);
  //     min = Math.min(data[i], min);
  //   }
  //   if (!Number.isFinite(max)) max = 0;
  //   if (!Number.isFinite(min)) min = 0;

  //   return {max: max, min: min};
  // }
}
