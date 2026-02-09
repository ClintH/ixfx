import { test, expect, describe } from 'vitest';
import { el, elRequery } from '../src/el.js';

describe('el', () => {
  describe('el', () => {
    test('creates wrapped element from single element', () => {
      const div = document.createElement('div');
      
      const wrapped = el(div);
      
      expect(wrapped.el()).toBe(div);
      expect(wrapped.els()).toEqual([div]);
    });

    test('text method sets text content', () => {
      const div = document.createElement('div');
      const wrapped = el(div);
      
      wrapped.text('Hello');
      
      expect(div.textContent).toBe('Hello');
    });

    test('html method sets inner HTML', () => {
      const div = document.createElement('div');
      const wrapped = el(div);
      
      wrapped.html('<b>Bold</b>');
      
      expect(div.innerHTML).toBe('<b>Bold</b>');
    });

    test('cssDisplay method sets display property', () => {
      const div = document.createElement('div');
      const wrapped = el(div);
      
      wrapped.cssDisplay('none');
      
      expect(div.style.display).toBe('none');
    });

    test('cssClass method adds class when true', () => {
      const div = document.createElement('div');
      const wrapped = el(div);
      
      wrapped.cssClass(true, 'active');
      
      expect(div.classList.contains('active')).toBe(true);
    });

    test('cssClass method removes class when false', () => {
      const div = document.createElement('div');
      div.classList.add('active');
      const wrapped = el(div);
      
      wrapped.cssClass(false, 'active');
      
      expect(div.classList.contains('active')).toBe(false);
    });

    test('cssToggle method toggles class', () => {
      const div = document.createElement('div');
      const wrapped = el(div);
      
      wrapped.cssToggle('toggle');
      expect(div.classList.contains('toggle')).toBe(true);
      
      wrapped.cssToggle('toggle');
      expect(div.classList.contains('toggle')).toBe(false);
    });

    test('works with string selector', () => {
      const container = document.createElement('div');
      container.innerHTML = '<span class="target"></span>';
      document.body.appendChild(container);
      
      const wrapped = el('.target');
      
      expect(wrapped.el()).toBeDefined();
      expect(wrapped.els().length).toBe(1);
      
      document.body.removeChild(container);
    });

    test('els returns all matching elements', () => {
      const container = document.createElement('div');
      container.innerHTML = '<span class="multi"></span><span class="multi"></span><span class="multi"></span>';
      document.body.appendChild(container);
      
      const wrapped = el('.multi');
      
      expect(wrapped.els().length).toBe(3);
      
      document.body.removeChild(container);
    });

    test('el returns first element when multiple match', () => {
      const container = document.createElement('div');
      container.innerHTML = '<span id="first" class="first-match"></span><span class="first-match"></span>';
      document.body.appendChild(container);
      
      const wrapped = el('.first-match');
      const first = wrapped.el();
      
      expect(first.id).toBe('first');
      
      document.body.removeChild(container);
    });
  });

  describe('elRequery', () => {
    test('re-queries selector on each operation', () => {
      const container = document.createElement('div');
      container.id = 'requery-container';
      document.body.appendChild(container);
      
      const wrapped = elRequery('#requery-container');
      
      expect(wrapped.el()).toBe(container);
      
      document.body.removeChild(container);
    });

    test('text method works with string selector', () => {
      const div = document.createElement('div');
      div.id = 'requery-text';
      document.body.appendChild(div);
      
      const wrapped = elRequery('#requery-text');
      wrapped.text('Dynamic Text');
      
      expect(div.textContent).toBe('Dynamic Text');
      
      document.body.removeChild(div);
    });

    test('html method works with string selector', () => {
      const div = document.createElement('div');
      div.id = 'requery-html';
      document.body.appendChild(div);
      
      const wrapped = elRequery('#requery-html');
      wrapped.html('<i>Italic</i>');
      
      expect(div.innerHTML).toBe('<i>Italic</i>');
      
      document.body.removeChild(div);
    });

    test('cssDisplay method works with string selector', () => {
      const div = document.createElement('div');
      div.id = 'requery-css';
      document.body.appendChild(div);
      
      const wrapped = elRequery('#requery-css');
      wrapped.cssDisplay('flex');
      
      expect(div.style.display).toBe('flex');
      
      document.body.removeChild(div);
    });

    test('cssClass method works with string selector', () => {
      const div = document.createElement('div');
      div.id = 'requery-class';
      document.body.appendChild(div);
      
      const wrapped = elRequery('#requery-class');
      wrapped.cssClass(true, 'test-class');
      
      expect(div.classList.contains('test-class')).toBe(true);
      
      document.body.removeChild(div);
    });

    test('cssToggle method works with string selector', () => {
      const div = document.createElement('div');
      div.id = 'requery-toggle';
      document.body.appendChild(div);
      
      const wrapped = elRequery('#requery-toggle');
      wrapped.cssToggle('toggle-class');
      
      expect(div.classList.contains('toggle-class')).toBe(true);
      
      document.body.removeChild(div);
    });

    test('els returns all matching elements', () => {
      const container = document.createElement('div');
      container.innerHTML = '<span class="requery-multi"></span><span class="requery-multi"></span>';
      document.body.appendChild(container);
      
      const wrapped = elRequery('.requery-multi');
      
      expect(wrapped.els().length).toBe(2);
      
      document.body.removeChild(container);
    });
  });
});
