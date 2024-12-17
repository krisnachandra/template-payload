import type { CollectionConfig } from 'payload/types';

import { admins, anyone } from '../../access';

export const Categories: CollectionConfig = {
  slug: `categories`,
  admin: {
    useAsTitle: `title`,
    defaultColumns: [`title`, `createdAt`, `updatedAt`],
  },
  access: {
    read: anyone,
    update: admins,
    create: admins,
    delete: admins,
  },
  fields: [
    {
      name: `title`,
      type: `text`,
      localized: true,
    },
  ],
};
