
import * as Rx from '../../../dist/rx.js';
/**
 * @typedef {{
*  text:string
*  id:number
* }} Todo
*/

let idIndex = 0;

/**
 * 
 * @param {*} event 
 * @returns 
 */
const deleteHandler = event => {
  /** @type HTMLElement */
  const el = event.target;
  if (!el) return;
  const id = Number.parseInt(el.getAttribute(`data-id`) ?? `-1`);
  if (!id || id < 0) return;
  todos.deleteWhere(v => v.id === id);
}

const addHandler = event => {
  const text = window.prompt(`Todo`, `blah`);
  if (!text || text.length === 0) return;
  todos.push(create(text));
  console.log(todos.last());
}

/**
 * Create todo
 * @param {string} text 
 * @returns Todo
 */
const create = (text) => ({text, id: ++idIndex});

// Responsive array
const todos = Rx.From.array([ create(`one`),create(`two`),create(`three`)]);

// Render array
Rx.lit(`#test`, todos, todos => {
  return Rx.LitHtml`<h1>Todos</h1>
  <ol>
  ${todos?.map(t => Rx.LitHtml`<li >${t.text} <button data-id="${t.id}" @click=${deleteHandler}>✓</button></li>`)}
  </ol>
  <button @click=${addHandler}>+</button>`
});