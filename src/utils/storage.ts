/*
 * @Author: Vir
 * @Date: 2021-08-06 14:42:56
 * @Last Modified by: Vir
 * @Last Modified time: 2021-08-06 15:25:19
 */

// 生成uuid
const uuid = (len?: number, radix?: number) => {
  var chars = '0123456789ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz'.split(
    '',
  );
  var uuid = [],
    i;
  radix = radix || chars.length;

  if (len) {
    // Compact form
    for (i = 0; i < len; i++) uuid[i] = chars[0 | (Math.random() * radix)];
  } else {
    // rfc4122, version 4 form
    var r;

    // rfc4122 requires these characters
    uuid[8] = uuid[13] = uuid[18] = uuid[23] = '-';
    uuid[14] = '4';

    // Fill in random data.  At i==19 set the high bits of clock sequence as
    // per rfc4122, sec. 4.1.5
    for (i = 0; i < 36; i++) {
      if (!uuid[i]) {
        r = 0 | (Math.random() * 16);
        uuid[i] = chars[i == 19 ? (r & 0x3) | 0x8 : r];
      }
    }
  }

  return uuid.join('');
};

// 检查是否支持 storage
const isSupported = (storage: Storage) => {
  if (!storage || !(storage instanceof Object)) {
    return false;
  }

  try {
    storage.setItem('_supported', '1');
    storage.removeItem('_supported');
    return true;
  } catch (e) {
    return false;
  }
};

class Collection {
  name: any;
  storage: any;
  cache!: { [x: string]: object };
  path: string;
  constructor(db: any, name: string, opts: DBOpts) {
    this.name = name;
    this.storage = db.storage;
    this.path = db.database + db.sep + name + db.sep;
  }

  _initCache() {
    let cache: { [x: string]: object } = {};
    for (let key of Object.keys(this.storage)) {
      cache[key] = JSON.parse(this.storage.getItem(key));
    }
    this.cache = cache;
  }

  inset(data: any, opts: any) {}
}
interface DBOpts {
  storage: Storage | null;
  database: string;
  primaryKey: string;
  sep: string;
}

class StorageDB {
  storage: Storage | null;
  database: string;
  primaryKey: string;
  sep: string;
  constructor(opts: DBOpts) {
    this.storage = opts.storage || (window && window.localStorage);
    this.database = opts.database || 'db';
    this.primaryKey = opts.primaryKey || '_id';
    this.sep = opts.sep || ':';

    if (!isSupported(this.storage)) {
      this.storage = null;
    }
  }

  get(name: string, opts: DBOpts) {
    return new Collection(this, name, opts);
  }

  collection(name: string, opts: DBOpts) {
    return this.get(name, opts);
  }
}

export default StorageDB;
