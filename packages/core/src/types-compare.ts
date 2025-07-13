export type ChangeKind = `mutate` | `add` | `del`
export type ChangeRecord<TKey extends string | number | symbol> = [ kind: ChangeKind, path: TKey, value: unknown ];

/**
 * Result of {@link compareObjectData}
 */
export type CompareChangeSet<TKey extends string | number> = {
  /**
   * _True_ if there are any changes
   */
  hasChanged: boolean
  /**
   * Results for child objects
   */
  children: Record<TKey, CompareChangeSet<string|number>>
  /**
   * Values that have changed
   */
  changed: Record<TKey, unknown>
  /**
   * Fields that have been added
   */
  added: Record<TKey, unknown>
  /**
   * Fields that have been removed
   */
  removed: TKey[]
  isArray: boolean
  /**
   * Summary of changes
   */
  summary: ChangeRecord<TKey>[]
}