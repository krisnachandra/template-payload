import type { GlobalConfig } from 'payload/types';

import { admins, anyone } from '../../access';
import { linkGroup } from '../../fields';

export const Settings: GlobalConfig = {
  slug: `settings`,
  typescript: {
    interface: `Settings`,
  },
  graphQL: {
    name: `Settings`,
  },
  access: {
    read: anyone,
    update: admins,
  },
  admin: {
    group: `Theme Settings`,
  },
  fields: [
    {
      type: `tabs`,
      tabs: [
        {
          name: `siteSettings`,
          fields: [
            {
              name: `searchEngineVisibility`,
              type: `checkbox`,
              defaultValue: false,
              admin: {
                description: `Search engines will be able to index this site`,
              },
            },
            {
              name: `title`,
              type: `text`,
            },
            {
              name: `homepage`,
              type: `relationship`,
              relationTo: `pages`,
              admin: {
                description: `Select the page that you wanted to show for the Homepage`,
              },
            },
            // DON'T DELETE, for typescript in NextJS
            linkGroup({
              name: `linkType`,
              overrides: {
                maxRows: 1,
                admin: {
                  hidden: true,
                },
              },
            }),
          ],
        },
        {
          name: `socialLinks`,
          fields: [
            {
              name: `facebook`,
              type: `text`,
            },
            {
              name: `instagram`,
              type: `text`,
            },
            {
              name: `linkedin`,
              type: `text`,
            },
            {
              name: `tiktok`,
              type: `text`,
            },
            {
              name: `whatsapp`,
              type: `text`,
              validate: value => {
                if (value && !value.match(`^[0-9]*$`)) {
                  return `Must be a number`;
                }

                return true;
              },
              admin: {
                description: `Add country code without +, example: if your number is +62081999999 you add 6281999999`,
              },
            },
          ],
        },
      ],
    },
  ],
};
