/**
 * Returns _true_ if it seems like the code is running on iOS (iPad/iPhone)
 * @returns 
 */
export const runningiOS = () =>
  [
    `iPad Simulator`,
    `iPhone Simulator`,
    `iPod Simulator`,
    `iPad`,
    `iPhone`,
    `iPod`,
  ].includes(navigator.platform) ||
  // iPad on iOS 13 detection
  (navigator.userAgent.includes(`Mac`) && `ontouchend` in document);