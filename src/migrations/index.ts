import * as migration_20250929_111647 from './20250929_111647';
import * as migration_20260228_225145_initial from './20260228_225145_initial';

export const migrations = [
  {
    up: migration_20250929_111647.up,
    down: migration_20250929_111647.down,
    name: '20250929_111647',
  },
  {
    up: migration_20260228_225145_initial.up,
    down: migration_20260228_225145_initial.down,
    name: '20260228_225145_initial'
  },
];
