import type { GlobalConfig } from 'payload/types';

import { admins, anyone } from '../../access';
import {
  blockExampleArchiveBlog,
  blockExampleContactForm,
  blockExampleRichText,
} from '../../blocks';
import { getArchivePagination } from '../../endpoints';
import { populateGlobalsPublishedDate } from '../../hooks';

export const ArchiveBlog: GlobalConfig = {
  slug: `archive-blog`,
  label: `Blogs`,
  admin: {
    group: `Archives`,
  },
  access: {
    read: anyone,
    update: admins,
  },
  hooks: {
    beforeChange: [populateGlobalsPublishedDate],
  },
  endpoints: [
    getArchivePagination({
      slug: `archive-blog`,
      collection: `blogs`,
      blockType: `block-example-archive-blog`,
    }),
  ],
  fields: [
    {
      name: `publishedDate`,
      type: `date`,
      admin: {
        position: `sidebar`,
      },
    },
    {
      name: `limitPost`,
      type: `number`,
      required: true,
      min: 1,
      defaultValue: 10,
      admin: {
        position: `sidebar`,
      },
    },
    {
      name: `sortBy`,
      type: `select`,
      required: true,
      options: [`-publishedDate`, `publishedDate`],
      // TODO: OPEN DISCUSSION. Kasik label biar gampang adminnya ngerti
      // options: [
      //   {
      //     value: '-publishedDate',
      //     label: 'Latest Blogs',
      //   },
      //   {
      //     value: 'publishedDate',
      //     label: 'Oldest Blogs',
      //   },
      // ],
      defaultValue: `-publishedDate`,
      admin: {
        position: `sidebar`,
      },
    },
    {
      type: `tabs`,
      tabs: [
        {
          label: `Content`,
          fields: [
            {
              name: `layout`,
              type: `blocks`,
              blocks: [blockExampleArchiveBlog, blockExampleRichText, blockExampleContactForm],
            },
          ],
        },
      ],
    },
  ],
};
