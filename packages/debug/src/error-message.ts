/**
 * Returns a string representation of an error
 * @param error
 * @returns strign
 */
export function getErrorMessage(error: unknown): string {
  if (typeof error === `string`)
    return error;
  if (error instanceof Error) {
    return error.message;
  }
  return error as string;
}