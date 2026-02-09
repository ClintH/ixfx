import { test, expect, describe } from 'vitest';
import { setText, setHtml, setProperty } from '../src/set-property.js';

describe('set-property', () => {
  describe('setText', () => {
    test('sets text content immediately when value provided', () => {
      const el = document.createElement('div');
      
      setText(el, 'Hello World');
      
      expect(el.textContent).toBe('Hello World');
    });

    test('returns setter function when no value provided', () => {
      const el = document.createElement('div');
      
      const setter = setText(el);
      expect(typeof setter).toBe('function');
      
      setter('Dynamic Text');
      expect(el.textContent).toBe('Dynamic Text');
    });

    test('handles numeric values', () => {
      const el = document.createElement('div');
      
      setText(el, 42);
      
      expect(el.textContent).toBe('42');
    });

    test('handles multiple elements', () => {
      const el1 = document.createElement('div');
      const el2 = document.createElement('div');
      
      setText([el1, el2], 'Shared Text');
      
      expect(el1.textContent).toBe('Shared Text');
      expect(el2.textContent).toBe('Shared Text');
    });

    test('returns set value', () => {
      const el = document.createElement('div');
      
      const result = setText(el, 'Test');
      
      expect(result).toBe('Test');
    });
  });

  describe('setHtml', () => {
    test('sets innerHTML immediately when value provided', () => {
      const el = document.createElement('div');
      
      setHtml(el, '<strong>Bold</strong>');
      
      expect(el.innerHTML).toBe('<strong>Bold</strong>');
    });

    test('returns setter function when no value provided', () => {
      const el = document.createElement('div');
      
      const setter = setHtml(el);
      expect(typeof setter).toBe('function');
      
      setter('<em>Italic</em>');
      expect(el.innerHTML).toBe('<em>Italic</em>');
    });

    test('parses HTML elements correctly', () => {
      const el = document.createElement('div');
      
      setHtml(el, '<p>Paragraph</p><span>Span</span>');
      
      expect(el.children.length).toBe(2);
      expect(el.children[0].tagName).toBe('P');
      expect(el.children[1].tagName).toBe('SPAN');
    });

    test('handles multiple elements', () => {
      const el1 = document.createElement('div');
      const el2 = document.createElement('div');
      
      setHtml([el1, el2], '<b>Bold</b>');
      
      expect(el1.innerHTML).toBe('<b>Bold</b>');
      expect(el2.innerHTML).toBe('<b>Bold</b>');
    });
  });

  describe('setProperty', () => {
    test('sets arbitrary property on element', () => {
      const el = document.createElement('input');
      
      setProperty('value', el, 'test value');
      
      expect((el as HTMLInputElement).value).toBe('test value');
    });

    test('returns setter function when no value provided', () => {
      const el = document.createElement('input');
      
      const setter = setProperty('value', el);
      expect(typeof setter).toBe('function');
      
      setter('setter value');
      expect((el as HTMLInputElement).value).toBe('setter value');
    });

    test('serializes objects to JSON on non-readonly properties', () => {
      const el = document.createElement('div');
      const data = { name: 'test', value: 123 };
      
      // Use a custom property that isn't read-only
      setProperty('customData', el, data);
      
      expect((el as any).customData).toBe(JSON.stringify(data));
    });

    test('handles boolean values', () => {
      const el = document.createElement('input');
      
      setProperty('disabled', el, true);
      
      // Boolean values are coerced to string 'true' by the function
      expect((el as any).disabled).toBe(true);
    });

    test('handles multiple elements', () => {
      const el1 = document.createElement('div');
      const el2 = document.createElement('div');
      
      setProperty('title', [el1, el2], 'Tooltip');
      
      expect(el1.title).toBe('Tooltip');
      expect(el2.title).toBe('Tooltip');
    });

    test('reuses resolved elements on subsequent calls', () => {
      const el = document.createElement('div');
      
      const setter = setProperty('textContent', el);
      setter('First');
      setter('Second');
      setter('Third');
      
      expect(el.textContent).toBe('Third');
    });
  });
});
