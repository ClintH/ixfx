import { expect, it } from 'vitest';
import { runningiOS } from '../src/platform.js';

function setNavigator(props: Record<string, any>) {
  for (const [key, value] of Object.entries(props)) {
    Object.defineProperty(window.navigator, key, { value, configurable: true });
  }
}

it(`false on desktop platforms`, () => {
  setNavigator({ platform: `Win32`, userAgent: `Mozilla/5.0 Windows` });
  expect(runningiOS()).toBe(false);
});

it(`true for iPhone platform`, () => {
  setNavigator({ platform: `iPhone`, userAgent: `Mozilla/5.0` });
  expect(runningiOS()).toBe(true);
});

it(`true for iPad`, () => {
  setNavigator({ platform: `iPad`, userAgent: `Mozilla/5.0` });
  expect(runningiOS()).toBe(true);
});

it(`true for Mac touchscreen (iPadOS 13+)`, () => {
  setNavigator({ platform: `MacIntel`, userAgent: `Mozilla/5.0 (Macintosh)` });
  // Simulate touch support
  Object.defineProperty(document, `ontouchend`, { value: {}, configurable: true });
  expect(runningiOS()).toBe(true);
  // Clean up so other tests are unaffected
  delete (document as any).ontouchend;
});
