import type { Block } from 'payload/types';

import { sectionID } from '../../fields';
import Image from './preview.jpg';

export const blockExampleInstagramFeeds: Block = {
  slug: `block-example-instagram-feeds`,
  imageURL: `${Image}`,
  fields: [
    sectionID(),
    {
      name: `username`,
      type: `text`,
    },
    {
      name: `instagramTokenUrl`,
      type: `text`,
      admin: {
        description: `Using service https://ig-token.app.kesato.io`,
      },
    },
  ],
};
