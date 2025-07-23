/**
 * Kind of change
 */
export type ChangeKind = `mutate` | `add` | `del`

/**
 * Change record
 */
export type ChangeRecord<TKey extends string | number | symbol> = [ kind: ChangeKind, path: TKey, value: unknown ];

/**
 * Result of compareObjectData
 */
export type CompareChangeSet<TKey extends string | number> = {
  /**
   * _True_ if there are any changes
   */
  hasChanged: boolean
  /**
   * Results for child objects
   */
  children: Record<TKey, CompareChangeSet<string | number>>
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
  /**
   * _True_ if value is an array
   */
  isArray: boolean
  /**
   * Summary of changes
   */
  summary: ChangeRecord<TKey>[]
}