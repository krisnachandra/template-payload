import type { GlobalConfig } from 'payload/types';

import { admins, anyone } from '../../access';
import { link, linkGroup } from '../../fields';

export const Header: GlobalConfig = {
  slug: `header`,
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
      maxRows: 10,
      fields: [
        {
          name: `haveChild`,
          label: `Sub Menu?`,
          type: `checkbox`,
          defaultValue: false,
          admin: {
            description: `Check this menu if this menu is actually only a dropdown to another menu.`,
          },
        },
        {
          name: `title`,
          type: `text`,
          admin: {
            condition: (_, _siblingData) => {
              if (_siblingData.haveChild) return true;

              return false;
            },
          },
        },
        linkGroup({
          overrides: {
            maxRows: 1,
            admin: {
              condition: (_data, _siblingData) => {
                if (_siblingData.haveChild) return false;

                return true;
              },
            },
          },
        }),
        {
          name: `navChildItems`,
          type: `array`,
          admin: {
            condition: (_data, _siblingData) => {
              if (_siblingData.haveChild) return true;

              return false;
            },
          },
          fields: [link()],
        },
      ],
    },
  ],
};
