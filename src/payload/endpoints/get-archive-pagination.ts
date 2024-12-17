import type { Endpoint } from 'payload/config';

import type { Config } from '../payload-types';

export type GetArchivePagination = (args: {
  blockType: string;
  collection: keyof Config['collections'];
  slug: keyof Pick<Config['globals'], `archive-blog`>;
}) => Omit<Endpoint, 'root'>;

export const getArchivePagination: GetArchivePagination = ({ slug, collection, blockType }) => {
  return {
    path: `/page/:pagination`,
    method: `get`,
    handler: async (req, res, next) => {
      try {
        const pagination = req.params.pagination;

        // check if not number
        if (!pagination.match(/^\d+$/)) {
          res.status(404).send(`Cannot GET /api/globals/${slug}/page/${pagination}`);
          return;
        }

        // TODO: pilih pake cara mana, kalo sekarang masih pake cara 2
        /**
         * Cara 1 : await di setiap looping block, sebenernya ga boleh karena ada query di dalam looping, tapi bakal berguna kalo pake limit dan sort di dalam block-list
         * Cara 2 : query sekali di awal, nanti assign datanya di setiap looping block. Jadi data limit & sort ambil dari archive, lebih aman di query looping. Tapi user ga leluasa buat bikin limit dan sort di setiap block
         */
        const data = await req.payload.findGlobal({ slug });
        const collectionsData = await req.payload.find({
          collection,
          limit: data.limitPost || 9,
          sort: data.sortBy || `-publishedDate`,
          page: Number(pagination),
        });

        // check if total pages is less than pagination
        if (collectionsData.totalPages < Number(pagination)) {
          res.status(404).send(`Cannot GET /api/globals/${slug}/page/${pagination}`);
          return;
        }

        for (const layout of data.layout as { blockType: string }[]) {
          if (layout.blockType === blockType) {
            Object.assign(layout, collectionsData);
          }
        }

        res.json(data);
      } catch (error) {
        next(error);
      }
    },
  };
};
