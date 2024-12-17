import type { Block } from 'payload/types';

import { linkGroup, richTextSlate, sectionID } from '../../fields';
import Image from './preview.jpg';

export const blockExampleSlider: Block = {
  slug: `block-example-slider`,
  imageURL: `${Image}`,
  fields: [
    sectionID(),
    {
      type: `tabs`,
      tabs: [
        {
          label: `Content`,
          fields: [
            richTextSlate({
              name: `title`,
              elements: [`h`, `link`],
              localized: true,
            }),
            richTextSlate({
              name: `desc`,
              label: `Description`,
              elements: [`ol`, `ul`, `link`],
              localized: true,
            }),
            linkGroup({
              name: `links`,
              linkAppearances: [`Default`, `Outline`],
              overrides: {
                maxRows: 2,
              },
            }),
          ],
        },
        {
          label: `Slider`,
          fields: [
            {
              name: `sliders`,
              type: `array`,
              maxRows: 10,
              fields: [
                {
                  name: `image`,
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
          ],
        },
      ],
    },
  ],
};
