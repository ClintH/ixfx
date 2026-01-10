export const genericStateTransitionsInstance = {
  ready: `connecting`,
  connecting: [ `connected`, `closed` ],
  connected: [ `closed` ],
  closed: `connecting`,
} as const;