import { test, expect, describe } from 'vitest';
import { 
  setCssClass, 
  setCssToggle, 
  setCssDisplay,
  getComputedPixels 
} from '../src/css.js';

describe('css', () => {
  describe('setCssClass', () => {
    test('adds class when value is true', () => {
      const el = document.createElement('div');
      
      setCssClass(el, true, 'active');
      
      expect(el.classList.contains('active')).toBe(true);
    });

    test('removes class when value is false', () => {
      const el = document.createElement('div');
      el.classList.add('active');
      
      setCssClass(el, false, 'active');
      
      expect(el.classList.contains('active')).toBe(false);
    });

    test('handles multiple elements', () => {
      const el1 = document.createElement('div');
      const el2 = document.createElement('div');
      
      setCssClass([el1, el2], true, 'highlight');
      
      expect(el1.classList.contains('highlight')).toBe(true);
      expect(el2.classList.contains('highlight')).toBe(true);
    });

    test('does nothing for empty selector', () => {
      // Should not throw
      setCssClass([], true, 'test');
    });

    test('works with string selector', () => {
      const container = document.createElement('div');
      container.innerHTML = '<span class="target"></span><span class="target"></span>';
      document.body.appendChild(container);
      
      setCssClass('.target', true, 'new-class');
      
      const targets = container.querySelectorAll('.target');
      targets.forEach(el => {
        expect(el.classList.contains('new-class')).toBe(true);
      });
      
      document.body.removeChild(container);
    });
  });

  describe('setCssToggle', () => {
    test('toggles class on element', () => {
      const el = document.createElement('div');
      
      setCssToggle(el, 'toggle-class');
      expect(el.classList.contains('toggle-class')).toBe(true);
      
      setCssToggle(el, 'toggle-class');
      expect(el.classList.contains('toggle-class')).toBe(false);
    });

    test('toggles class on multiple elements', () => {
      const el1 = document.createElement('div');
      const el2 = document.createElement('div');
      
      setCssToggle([el1, el2], 'toggle-all');
      
      expect(el1.classList.contains('toggle-all')).toBe(true);
      expect(el2.classList.contains('toggle-all')).toBe(true);
    });

    test('does nothing for empty selector', () => {
      // Should not throw
      setCssToggle([], 'test');
    });
  });

  describe('setCssDisplay', () => {
    test('sets display property', () => {
      const el = document.createElement('div');
      
      setCssDisplay(el, 'none');
      expect(el.style.display).toBe('none');
      
      setCssDisplay(el, 'flex');
      expect(el.style.display).toBe('flex');
    });

    test('sets display on multiple elements', () => {
      const el1 = document.createElement('div');
      const el2 = document.createElement('div');
      
      setCssDisplay([el1, el2], 'block');
      
      expect(el1.style.display).toBe('block');
      expect(el2.style.display).toBe('block');
    });

    test('does nothing for empty selector', () => {
      // Should not throw
      setCssDisplay([], 'test');
    });
  });

  describe('getComputedPixels', () => {
    test('parses pixel values from computed style', () => {
      const el = document.createElement('div');
      el.style.borderTopWidth = '10px';
      el.style.borderLeftWidth = '20px';
      document.body.appendChild(el);
      
      const result = getComputedPixels(el, 'borderTopWidth', 'borderLeftWidth');
      
      expect(result.borderTopWidth).toBe(10);
      expect(result.borderLeftWidth).toBe(20);
      
      document.body.removeChild(el);
    });

    test('throws for non-pixel values', () => {
      const el = document.createElement('div');
      // Mock getComputedStyle to return a non-px value
      const originalGetComputedStyle = window.getComputedStyle;
      window.getComputedStyle = () => ({
        fontSize: '1.5em'
      }) as CSSStyleDeclaration;
      
      document.body.appendChild(el);
      
      expect(() => {
        getComputedPixels(el, 'fontSize');
      }).toThrow("does not end in 'px'");
      
      window.getComputedStyle = originalGetComputedStyle;
      document.body.removeChild(el);
    });

    test('handles multiple properties', () => {
      const el = document.createElement('div');
      el.style.marginTop = '10px';
      el.style.marginBottom = '20px';
      el.style.marginLeft = '30px';
      el.style.marginRight = '40px';
      document.body.appendChild(el);
      
      const result = getComputedPixels(
        el, 
        'marginTop', 
        'marginBottom', 
        'marginLeft', 
        'marginRight'
      );
      
      expect(result.marginTop).toBe(10);
      expect(result.marginBottom).toBe(20);
      expect(result.marginLeft).toBe(30);
      expect(result.marginRight).toBe(40);
      
      document.body.removeChild(el);
    });
  });
});
