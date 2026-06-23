import exifReader from 'exif-reader';

type ExifGps = { lat?: number; lng?: number };

export type ParsedExif = {
  make?: string;
  model?: string;
  software?: string;
  dateTime?: string;
  dateTimeOriginal?: string;
  gps?: ExifGps;
};

export type ExifParseMode = 'sharp' | 'exiftool';

export type ParseExifOptions = {
  mode?: ExifParseMode;
  exiftoolTags?: any;
};

function toNumber(v: any) {
  if (typeof v === 'number') return v;
  if (v && typeof v === 'object') {
    const n = v.numerator ?? v.num ?? v[0];
    const d = v.denominator ?? v.den ?? v[1];
    if (typeof n === 'number' && typeof d === 'number' && d !== 0) return n / d;
  }
  return undefined;
}

function gpsToDecimal(coord: any) {
  if (!coord) return undefined;
  if (typeof coord === 'number') return coord;
  if (Array.isArray(coord) && coord.length >= 3) {
    const d = toNumber(coord[0]);
    const m = toNumber(coord[1]);
    const s = toNumber(coord[2]);
    if (typeof d !== 'number') return undefined;
    return (
      d +
      (typeof m === 'number' ? m : 0) / 60 +
      (typeof s === 'number' ? s : 0) / 3600
    );
  }
  return undefined;
}

export function parseExifFromBuffer(
  exif: Buffer | undefined,
  options?: ParseExifOptions,
): any {
  if (options?.mode === 'exiftool') {
    const tags = options?.exiftoolTags;
    if (!tags || typeof tags !== 'object') return {};
    const out: any = { ...tags };
    delete out.SourceFile;
    delete out.Directory;
    delete out.FileName;
    return JSON.parse(JSON.stringify(out));
  }

  if (!exif || exif.length < 14) return {};

  try {
    const parsed = (exifReader(exif) ?? {}) as any;
    const image = parsed?.image ?? {};
    const exifBlock = parsed?.exif ?? {};
    const gpsBlock = parsed?.gps ?? {};

    const gps: ExifGps = {};

    const lat = gpsToDecimal(gpsBlock.GPSLatitude ?? gpsBlock.latitude);
    const lng = gpsToDecimal(gpsBlock.GPSLongitude ?? gpsBlock.longitude);

    if (typeof lat === 'number') {
      const ref = gpsBlock.GPSLatitudeRef ?? gpsBlock.latitudeRef;
      gps.lat = ref === 'S' ? -lat : lat;
    }
    if (typeof lng === 'number') {
      const ref = gpsBlock.GPSLongitudeRef ?? gpsBlock.longitudeRef;
      gps.lng = ref === 'W' ? -lng : lng;
    }

    const out: ParsedExif = {
      make: image.Make,
      model: image.Model,
      software: image.Software,
      dateTime: image.DateTime,
      dateTimeOriginal: exifBlock.DateTimeOriginal,
    };

    if (typeof gps.lat === 'number' || typeof gps.lng === 'number') {
      out.gps = gps;
    }

    return out;
  } catch {
    return {};
  }
}
