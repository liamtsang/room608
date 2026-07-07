import * as migration_20250929_111647 from './20250929_111647';
import * as migration_20260228_225145_initial from './20260228_225145_initial';
import * as migration_20260331_201859_add_credits from './20260331_201859_add_credits';
import * as migration_20260401_add_awards from './20260401_add_awards';
import * as migration_20260623_141226_scan_effect from './20260623_141226_scan_effect';
import * as migration_20260701_115002_vimeo_url from './20260701_115002_vimeo_url';
import * as migration_20260707_project_slug from './20260707_project_slug';

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
    name: '20260331_201859_add_credits',
  },
  {
    up: migration_20260401_add_awards.up,
    down: migration_20260401_add_awards.down,
    name: '20260401_add_awards',
  },
  {
    up: migration_20260623_141226_scan_effect.up,
    down: migration_20260623_141226_scan_effect.down,
    name: '20260623_141226_scan_effect'
  },
  {
    up: migration_20260701_115002_vimeo_url.up,
    down: migration_20260701_115002_vimeo_url.down,
    name: '20260701_115002_vimeo_url'
  },
  {
    up: migration_20260707_project_slug.up,
    down: migration_20260707_project_slug.down,
    name: '20260707_project_slug'
  },
];
