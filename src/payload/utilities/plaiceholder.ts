// FIXME: bug on `yarn build`

import type { OutputInfo } from 'sharp';

import sharp, { type Metadata, type Sharp } from 'sharp';

/* Utils
   =========================================== */

const arrayChunk = (arr, size) =>
  arr.length > size ? [arr.slice(0, size), ...arrayChunk(arr.slice(size), size)] : [arr];

type ToRGBAStringOptions = { a?: number; b: number; g: number; r: number };

const toRGBAString = ({ r, g, b, a }: ToRGBAStringOptions) => {
  if (typeof a === `undefined`) return `rgb(${[r, g, b].join(`,`)})`;

  return `rgba(${[r, g, b, a].join(`,`)})`;
};

/* getPixels
   =========================================== */

interface GetPixelsOptions {
  data: Buffer;
  info: sharp.OutputInfo;
}

type GetPixelsReturn = ReturnType<typeof getPixels>;

const getPixels = ({ data, info }: GetPixelsOptions) => {
  const { channels, width } = info;

  const rawBuffer = [].concat(...data) as number[];
  const allPixels = arrayChunk(rawBuffer, channels) as number[][][];
  const rows = arrayChunk(allPixels, width) as number[][][];

  const pixels = rows.map(row =>
    row.map(pixel => {
      const [r, g, b, a] = pixel;

      return {
        r,
        g,
        b,
        ...(typeof a === `undefined` ? {} : { a: Math.round((a / 255) * 1000) / 1000 }),
      };
    }),
  );

  return pixels;
};

/* getCSS
   =========================================== */

interface GetCSSOptions {
  info: OutputInfo;
  pixels: GetPixelsReturn;
}

type GetCSSReturn = ReturnType<typeof getCSS>;

const getCSS = ({ pixels, info }: GetCSSOptions) => {
  const linearGradients = pixels.map(row => {
    const rowPixels = row.map(pixel => toRGBAString(pixel));

    const gradient = rowPixels
      .map((pixel, i) => {
        const start = i === 0 ? `` : ` ${(i / rowPixels.length) * 100}%`;
        const end = i === rowPixels.length ? `` : ` ${((i + 1) / rowPixels.length) * 100}%`;

        return `${pixel}${start}${end}`;
      })
      .join(`,`);

    return `linear-gradient(90deg, ${gradient})`;
  });

  if (linearGradients.length !== info.height) {
    console.error(
      `Woops! Something went wrong here and caused the color height to differ from the source height.`,
    );
  }

  const backgroundPosition = linearGradients
    .map((_, i) => (i === 0 ? `0 0 ` : `0 ${(i / (linearGradients.length - 1)) * 100}%`))
    .join(`,`);

  const backgroundSize = `100% ${100 / linearGradients.length}%`;

  return {
    backgroundImage: linearGradients.join(`,`),
    backgroundPosition,
    backgroundSize,
    backgroundRepeat: `no-repeat`,
  };
};

/* getSVG
   =========================================== */

type TRects = [
  'rect',
  Record<'fill', object & string> &
    Record<'fillOpacity' | 'height' | 'width' | 'x' | 'y', number & object>,
];

interface IGetSVGOptions {
  info: OutputInfo;
  pixels: GetPixelsReturn;
}

type GetSVGReturn = [
  'svg',
  {
    height: string;
    preserveAspectRatio: string;
    shapeRendering: string;
    style: any;
    viewBox: string;
    width: string;
    xmlns: string;
  },
  TRects[],
];

interface IGetSVG {
  (options: IGetSVGOptions): GetSVGReturn;
}

const getSVG: IGetSVG = ({ pixels, info }) => {
  const chunkRects = pixels.map((row, y) =>
    row.map(({ a, ...rgb }, x) => {
      const colorProps =
        typeof a !== `undefined`
          ? { fill: toRGBAString(rgb), 'fill-opacity': a }
          : { fill: toRGBAString(rgb), 'fill-opacity': 1 };

      return [
        `rect`,
        {
          ...colorProps,
          width: 1,
          height: 1,
          x,
          y,
        },
      ];
    }),
  );

  if (chunkRects.length !== info.height) {
    console.error(
      `Woops! Something went wrong here and caused the color height to differ from the source height.`,
    );
  }

  const rects: TRects[] = [].concat(...chunkRects);

  return [
    `svg`,
    {
      xmlns: `http://www.w3.org/2000/svg`,
      width: `100%`,
      height: `100%`,
      shapeRendering: `crispEdges`,
      preserveAspectRatio: `none`,
      viewBox: `0 0 ${info.width} ${info.height}`,
      style: {
        position: `absolute`,
        top: `50%`,
        left: `50%`,
        transformOrigin: `top left`,
        transform: `translate(-50%, -50%)`,
        right: 0,
        bottom: 0,
      },
    },
    rects,
  ];
};

/* getPlaiceholder
   =========================================== */

type SharpFormatOptions = Parameters<Sharp['toFormat']>;
type SharpModulateOptions = NonNullable<Parameters<Sharp['modulate']>[0]>;

export type GetPlaiceholderSrc = Buffer;

export interface GetPlaiceholderOptions extends SharpModulateOptions {
  autoOrient?: boolean;
  format?: SharpFormatOptions;
  removeAlpha?: boolean;
  size?: number;
}

export interface GetPlaiceholderReturn {
  base64: string;
  color: {
    b: number;
    g: number;
    hex: string;
    r: number;
  };
  css: GetCSSReturn;
  metadata: Omit<Metadata, 'height' | 'width'> & Required<Pick<Metadata, 'height' | 'width'>>;
  pixels: GetPixelsReturn;
  svg: GetSVGReturn;
}

export const getPlaiceholder = async (
  src: GetPlaiceholderSrc,
  {
    autoOrient = false,
    size = 4,
    format = [`png`],
    brightness = 1,
    saturation = 1.2,
    removeAlpha = false,
    ...options
  }: GetPlaiceholderOptions = {},
) => {
  /* Optimize
    ---------------------------------- */

  const metadata = await sharp(src)
    .metadata()
    .then(({ width, height, ...metadata }) => {
      if (!width || !height) {
        throw Error(`Could not get required image metadata`);
      }

      return { width, height, ...metadata };
    });

  const sizeMin = 4;
  const sizeMax = 64;

  const isSizeValid = sizeMin <= size && size <= sizeMax;

  !isSizeValid &&
    console.error([`Please enter a \`size\` value between`, sizeMin, `and`, sizeMax].join(` `));

  // initial optimization
  const pipelineStage1 = sharp(src)
    .resize(size, size, {
      fit: `inside`,
    })
    .toFormat(...format)
    .modulate({
      brightness,
      saturation,
      ...(options?.hue ? { hue: options?.hue } : {}),
      ...(options?.lightness ? { lightness: options?.lightness } : {}),
    });

  // alpha
  const pipelineStage2 = removeAlpha === false ? pipelineStage1 : pipelineStage1.removeAlpha();

  // autoOrientation
  const pipelineStage3 = autoOrient === false ? pipelineStage2 : pipelineStage2.rotate();

  const pipeline = pipelineStage3;

  /* Return
    ---------------------------------- */

  const color = await pipeline
    .clone()
    .stats()
    .then(({ dominant: { r, g, b } }) => {
      return {
        r,
        g,
        b,
        hex: `#` + [r, g, b].map(x => x.toString(16).padStart(2, `0`)).join(``),
      };
    });

  const base64 = await pipeline
    .clone()
    .normalise()
    .toBuffer({ resolveWithObject: true })
    .then(({ data, info }) => `data:image/${info.format};base64,${data.toString(`base64`)}`)
    .catch(err => {
      console.error(`base64 generation failed`, err);
      throw err;
    });

  const { pixels, css, svg } = await pipeline
    .clone()
    .raw()
    .toBuffer({ resolveWithObject: true })
    .then(({ data, info }) => {
      const pixels = getPixels({ data, info });
      const css = getCSS({ pixels, info });
      const svg = getSVG({ pixels, info });

      return {
        pixels,
        css,
        svg,
      };
    })
    .catch(err => {
      console.error(`pixel generation failed`, err);
      throw err;
    });

  return {
    color,
    css,
    base64,
    metadata,
    pixels,
    svg,
  };
};
