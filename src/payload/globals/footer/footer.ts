import type { GlobalConfig } from 'payload/types';

import { admins, anyone } from '../../access';
import { link } from '../../fields';

export const Footer: GlobalConfig = {
  slug: `footer`,
  access: {
    read: anyone,
    update: admins,
  },
  admin: {
    group: `Theme Settings`,
  },
  fields: [
    {
      name: `navItems`,
      type: `array`,
      maxRows: 7,
      fields: [link()],
    },
  ],
};
