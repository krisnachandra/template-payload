import type { Block } from 'payload/types';

import { sectionID } from '../../fields';
import Image from './preview.jpg';

export const blockExampleVideo: Block = {
  slug: `block-example-video`,
  imageURL: `${Image}`,
  fields: [
    sectionID(),
    {
      type: `row`,
      fields: [
        {
          name: `video`,
          type: `upload`,
          relationTo: `media`,
          filterOptions: {
            mimeType: {
              contains: `video`,
            },
          },
        },
        {
          name: `poster`,
          type: `upload`,
          relationTo: `media`,
          filterOptions: {
            mimeType: {
              contains: `image`,
            },
          },
        },
      ],
    },
    {
      name: `autoplay`,
      type: `checkbox`,
    },
  ],
};
