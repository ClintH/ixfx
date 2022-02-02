/* eslint-disable */
import {fromEvent, debounceTime} from 'rxjs';
import {map } from  'rxjs/operators';
import {ArcEditor} from '../../components/ArcEditor';
import * as Arcs from '~/geometry/Arc';
import {createAfter, createIn} from '~/dom';
import json5 from 'json5';
import {degreeToRadian} from '~/geometry/Math';

// @ts-ignore
window.degreeToRadian = degreeToRadian;

document.querySelectorAll(`.arc`).forEach((el:HTMLInputElement) => {  
  const id = el.id;
  const editorId = id.replace(`Txt`, ``);

  const editor = document.getElementById(editorId) as ArcEditor;
  if (editor === null) {
    console.warn(`Could not find editor ${editorId}`);
    return;
  }

  const starting = el.value;
  const errorEl = createAfter(el, `div`);
  errorEl.classList.add(`arcError`);
  errorEl.style.borderRadius = `3px`;
  errorEl.style.color = `pink`;
  errorEl.style.display = `none`;

  const update = () => {
    try {
      const a = eval(`(` + el.value + `)`); //json5.parse(el.value);
      if (Arcs.isArc(a)) {
        const arc = a as Arcs.Arc;
        try {
          Arcs.guard(arc); // throws on invalid arc fields
          editor.setArc(arc);
          const editorBounds= editor.getBounds();
          if (arc.radius > editorBounds.width/2 || arc.radius > editorBounds.height/2) {
            showError(`Arc might be too large to see. You probably want a radius of less than ${Math.floor(editorBounds.height/2)}`);
          } else {
            hideError();
          }
        } catch (guardError) {
          showError(guardError);
        }
      } else {
        showError(`Arcs need to have radius, startRadian and endRadian defined.`);
      }
    } catch (e) {
      console.error(e);
      showError(`Syntax error`);
    }
  }

  const errorMsg = createIn(errorEl, `div`);
  errorMsg.style.paddingBottom = `1em`;

  const errorReset = createIn(errorEl, `button`);
  errorReset.innerText = `Reset`;
  errorReset.addEventListener(`click`, () => {
    el.value = starting;
    el.setAttribute(`value`, starting);
    update();
  });

  const showError = (msg:string) => {
    errorMsg.innerText = msg;
    errorEl.style.display = `block`;
  }

  const hideError = () => {
    errorEl.style.display = `none`;
  }

  fromEvent(el, `input`)
    .pipe(
      debounceTime(400))
    .subscribe(v => {
      update();
  });

});