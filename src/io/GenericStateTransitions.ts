export const genericStateTransitionsInstance = Object.freeze({
  ready: `connecting`,
  connecting: [ `connected`, `closed` ],
  connected: [ `closed` ],
  closed: `connecting`,
});