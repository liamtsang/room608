import * as migration_20250929_111647 from './20250929_111647';
import * as migration_20260228_225145_initial from './20260228_225145_initial';
import * as migration_20260331_201859_add_credits from './20260331_201859_add_credits';

export const migrations = [
  {
    up: migration_20250929_111647.up,
    down: migration_20250929_111647.down,
    name: '20250929_111647',
  },
  {
    up: migration_20260228_225145_initial.up,
    down: migration_20260228_225145_initial.down,
    name: '20260228_225145_initial',
  },
  {
    up: migration_20260331_201859_add_credits.up,
    down: migration_20260331_201859_add_credits.down,
    name: '20260331_201859_add_credits'
  },
];
