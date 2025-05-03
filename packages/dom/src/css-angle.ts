export type CssAngle = {
  value: number
  unit: `deg` | `rad` | `turn`
}

export const cssAngleParse = (value: string | number): CssAngle => {
  if (typeof value === `number`) {
    return {
      value, unit: `deg`
    }
  }
  value = value.toLowerCase();
  if (value.endsWith(`rad`)) {
    return {
      value: Number.parseFloat(value.substring(0, value.length - 3)),
      unit: `rad`
    }
  }
  if (value.endsWith(`turn`)) {
    return {
      value: Number.parseFloat(value.substring(0, value.length - 4)),
      unit: `turn`
    }
  }

  if (value.endsWith(`deg`)) {
    return {
      value: Number.parseFloat(value.substring(0, value.length - 3)),
      unit: `deg`
    }
  }

  return {
    value: Number.parseFloat(value),
    unit: `deg`
  }
}