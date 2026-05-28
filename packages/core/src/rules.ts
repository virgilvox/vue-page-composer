/**
 * Placement rules derived from the config. A zone may declare an allow-list of
 * component types it accepts; absent means it accepts any type. Keeping this in
 * core lets the editor and any future validator share one source of truth.
 */
import type { Config } from './types.js'

/** True when `zone` on a `parentType` component may hold a `childType` node. */
export function zoneAccepts<TRender>(
  config: Config<TRender>,
  parentType: string,
  zone: string,
  childType: string,
): boolean {
  const accepts = config.components[parentType]?.accepts?.[zone]
  return accepts ? accepts.includes(childType) : true
}
