export type Result<T> = {
  success: boolean
  value?: T
  error?: Error | string
}

export type ResultOk<T> = {
  success: true
  value: T
}

export type ResultError = {
  success: false
  error: Error | string
}
