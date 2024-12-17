import type { Block } from 'payload/types';

import { richTextSlate, sectionID } from '../../fields';
import Image from './preview.jpg';

export const blockExampleContactForm: Block = {
  slug: `block-example-contact-form`,
  imageURL: `${Image}`,
  fields: [
    sectionID(),
    richTextSlate({
      name: `title`,
      elements: [`h`, `link`],
      localized: true,
    }),
    {
      name: `mapIframe`,
      type: `textarea`,
    },
  ],
};
