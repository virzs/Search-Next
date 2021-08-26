/*
 * @Author: Vir
 * @Date: 2021-08-06 14:42:56
 * @Last Modified by: Vir
 * @Last Modified time: 2021-08-23 17:31:22
 */

interface Operators {
  $eq: (val: any, tar: any) => boolean;
  $gt: (val: number, tar: number) => boolean;
  $gte: (val: number, tar: number) => boolean;
  $in: (val: string | any[], tar: any) => boolean;
  $lt: (val: number, tar: number) => boolean;
  $lte: (val: number, tar: number) => boolean;
  $ne: (val: any, tar: any) => boolean;
  $nin: (val: string | any[], tar: any) => boolean;
  _checkExist: (op: string) => op is keyof Operators;
}

const ops = ['$eq', '$gt', '$gte', '$in', '$lt', '$lte', '$ne', '$nin'];

const isNotNumber = (val: any) => {
  return typeof val !== 'number';
};

const Operator: Operators = {
  // 相等
  $eq: (val, tar) => {
    return tar === val;
  },
  // 大于
  $gt: (val, tar) => {
    if (isNotNumber(val)) throw new Error("'$gt' value must be a number");
    return tar > val;
  },
  // 大于等于
  $gte: (val, tar) => {
    if (isNotNumber(val)) throw new Error("'$gte' value must be a number");
    return tar >= val;
  },
  // 包含
  $in: (val, tar) => {
    if (!(val instanceof Array))
      throw new Error("'$in' value must be an array");
    return val.includes(tar);
  },
  // 小于
  $lt: (val, tar) => {
    if (isNotNumber(val)) throw new Error("'$lt' value must be a number");
    return tar < val;
  },
  // 小于等于
  $lte: (val, tar) => {
    if (isNotNumber(val)) throw new Error("'$lte' value must be a number");
    return tar <= val;
  },
  // 不等于
  $ne: (val, tar) => {
    return tar !== val;
  },
  // 不包含
  $nin: (val, tar) => {
    if (!(val instanceof Array))
      throw new Error("'$nin' value must be an array");
    return !val.includes(tar);
  },
  // 检查存在
  _checkExist: (op): op is keyof Operators => {
    if (ops.includes(op)) {
      return true;
    }
    throw new Error("unknown operator: '" + op + "'");
  },
};

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

const isObject = (object: any) => {
  return object instanceof Object && object.constructor.name === 'Object';
};

const isArray = (array: any) => {
  return array instanceof Array && array.constructor.name === 'Array';
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

const queryMatch = (
  query: { [x: string]: any },
  target: { [x: string]: any },
) => {
  if (!query || !Object.keys(query).length) {
    return true;
  }

  for (let field of Object.keys(query)) {
    let val = query[field];
    let tar = target[field];

    if (val instanceof RegExp) {
      if (!val.test(tar)) {
        return false;
      }
    } else if (isObject(val)) {
      for (let op of Object.keys(val)) {
        if (Operator._checkExist(op) && !Operator[op](val[op], tar)) {
          return false;
        }
      }
    } else if (val !== tar) {
      return false;
    }
  }

  return true;
};

const sortCompare = (
  sort: { [x: string]: number },
  a: { [x: string]: number },
  b: { [x: string]: number },
  i?: number,
  fields?: string[],
): any => {
  i = i || 0;
  fields = fields || Object.keys(sort);

  let field = fields[i];

  if (!field) {
    return 0;
  }

  if (a[field] === b[field]) {
    i++;
    return sortCompare(sort, a, b, i, fields);
  }

  if (sort[field] === 1) {
    return a[field] - b[field];
  }

  if (sort[field] === -1) {
    return b[field] - a[field];
  }
};

class Collection {
  name: any;
  storage: any;
  cache: any[];
  path: string;
  cacheable: boolean;
  primaryKey: any;
  constructor(db: any, name: string, opts: DBOpts) {
    opts = opts || {};

    this.name = name; // 名称
    this.storage = db.storage; // 当前storage
    this.path = db.database + db.sep + name; // 路径
    this.primaryKey = opts.primaryKey || db.primaryKey;
    this.cache = []; // 缓存
    this.cacheable = false; // 是否可缓存
  }

  // 初始化缓存
  _initCache() {
    let cache: any[] = [];
    let filterExp = new RegExp('^' + this.path);

    for (let key of Object.keys(this.storage)) {
      if (filterExp.test(key)) {
        cache = JSON.parse(this.storage.getItem(key));
      }
    }
    this.cache = cache;
    this.cacheable = true;
  }

  _filter(filter: any | null, opts: { type: any; multi: any }) {
    opts.type = opts.type || 'data'; // data, id
    opts.multi = opts.multi || false;

    if (!this.cacheable) {
      this._initCache();
    }

    let res = [];
    let isFnFilter;
    let isTypeId = opts.type === 'id';

    if (typeof filter === 'string') {
      filter = new RegExp(filter);
    } else if (typeof filter === 'function') {
      isFnFilter = true;
    } else if (!filter) {
      let ret = isTypeId ? Object.keys(this.cache) : Object.values(this.cache);

      if (opts.multi) {
        return ret;
      } else {
        return ret[0] || null;
      }
    }

    for (let key of Object.keys(this.cache)) {
      let val = this.cache[Number(key)];

      if (isFnFilter) {
        if (filter(key, val)) {
          let ret = isTypeId ? key : val;

          if (opts.multi) {
            res.push(ret);
          } else {
            return ret;
          }
        }
      } else {
        if (filter.test(val[this.primaryKey])) {
          let ret = isTypeId ? key : val;

          if (opts.multi) {
            res.push(ret);
          } else {
            return ret;
          }
        }
      }
    }

    return opts.multi ? res : null;
  }

  inset(data: any, opts?: any) {
    let arrayInsert = isArray(data);
    let objectInset = isObject(data);

    if (arrayInsert) {
      if (data.length === 0) {
        return [];
      }
    } else {
      data = [data];
    }

    let pk = this.primaryKey;
    let cacheable = this.cacheable;
    let pathData = JSON.parse(this.storage.getItem(this.path) || '[]');

    for (let row of data) {
      if (!objectInset && !arrayInsert) {
        throw new Error(
          'TypeError: insert data must be an object or an object array',
        );
      }

      if (typeof row[pk] === 'undefined') {
        row[pk] = uuid();
      }

      if (cacheable) {
        this.cache = pathData.concat(row);
      }

      this.storage.setItem(this.path, JSON.stringify(pathData.concat(row)));
    }

    return arrayInsert ? data : data[0];
  }

  /**
   *
   * find('')
   * find(['', ''])
   *
   */

  find(
    query: any,
    opts?: { skip?: any; limit?: any; sort?: any; _filterType?: string },
  ) {
    query = query || {};
    opts = opts || {};
    opts.skip = opts.skip || 0;
    opts.limit = opts.limit;
    opts.sort = opts.sort;

    if (isArray(opts.sort)) {
      opts.sort = opts.sort.reduce(
        (res: { [x: string]: any }, item: string | any[]) => {
          if (typeof item === 'string') {
            res[item] = 1;
          } else if (item instanceof Array && item.length) {
            res[item[0]] = item[1] || 1;
          }
          return res;
        },
        {},
      );
    }

    let data;
    let ids = isObject(query) ? null : isArray(query) ? query : [query];
    let filterOpts = {
      type: 'data',
      multi: true,
    };

    if (ids) {
      // 当前查询参数为单个 id 或数组 ids
      let filterRegExp = new RegExp('^' + ids.join('|') + '$');
      data = this._filter(filterRegExp, filterOpts);
    } else if (Object.keys(query).length) {
      // by query
      data = this._filter((_key: any, val: any) => {
        return queryMatch(query, val);
      }, filterOpts);
    } else {
      data = this._filter(null, filterOpts);
    }

    // sort
    if (opts.sort) {
      data.sort((a: any, b: any) => {
        return sortCompare(opts?.sort, a, b);
      });
    }

    if (opts.limit) {
      data = data.slice(opts.skip, opts.skip + opts.limit);
    } else if (opts.skip) {
      data = data.slice(opts.skip);
    }

    return data;
  }

  findOne(
    query: any,
    opts?:
      | { skip?: any; limit?: any; sort?: any; _filterType?: any }
      | undefined,
  ) {
    query = query || {};
    opts = opts || {};

    let data;
    let id = isObject(query) ? null : query;
    let queryFields = query ? Object.keys(query) : [];
    let quickTarget = false;
    let needsSort = !!opts.sort;
    let filterOpts = {
      type: opts._filterType || 'data',
      multi: false,
    };

    if (queryFields.length && queryFields.includes(this.primaryKey)) {
      id = query[this.primaryKey];
      quickTarget = true;
    }

    if (id) {
      // by id
      data = this.storage.getItem(this.path);
      data = data ? JSON.parse(data) : null;

      if (data && quickTarget && !queryMatch(query, data)) {
        return null;
      }

      data = data
        ? data.find((i: any) => i[this.primaryKey] === id)
        : undefined;
    } else if (queryFields.length) {
      // by query
      if (needsSort) {
        data = this.find(query, opts);
      } else {
        data = this._filter((key: any, val: { [x: string]: any }) => {
          return queryMatch(query, val);
        }, filterOpts);
      }
    } else {
      if (needsSort) {
        data = this.find(query, opts);
      } else {
        data = this._filter(null, filterOpts);
      }
    }

    if (!id && needsSort && data) {
      data = data[0] || null;
    }

    return data;
  }

  remove(query: {}, opts?: { multi?: any; mulit?: any } | undefined) {
    if (!query) {
      throw new Error('remove needs a query');
    }

    opts = opts || {};
    opts.multi = typeof opts.multi === 'undefined' ? true : opts.multi;

    let data = JSON.parse(this.storage.getItem(this.path));

    let ids = opts.multi
      ? this.find(query, {
          _filterType: 'id',
        })
      : this.findOne(query, {
          _filterType: 'id',
        });

    let cacheable = this.cacheable;

    if ((opts.mulit && !ids.length) || (!opts.mulit && !ids)) {
      return 0;
    }

    if (!opts.multi) {
      ids = [ids];
    }

    for (let id of ids) {
      if (cacheable) {
        this.cache = this.cache.filter(
          (i: any) => i[this.primaryKey] !== id[this.primaryKey],
        );
      }
      data = data.filter(
        (i: any) => i[this.primaryKey] !== id[this.primaryKey],
      );

      this.storage.setItem(this.path, JSON.stringify(data));
    }

    return ids.length;
  }

  update(
    query: any,
    values: { [x: string]: any },
    opts?: { multi?: any; mulit?: any; _filterType?: string },
  ) {
    if (!query) {
      throw new Error('update needs a query');
    }
    if (!values || !isObject(values)) {
      throw new Error('update needs an object');
    }

    opts = opts || {};
    opts.multi = typeof opts.multi === 'undefined' ? false : opts.multi;

    let ids = opts.multi
      ? this.find(query, {
          _filterType: 'id',
        })
      : this.findOne(query, {
          _filterType: 'id',
        });

    let pk = this.primaryKey;
    let cacheable = this.cacheable;

    if ((opts.mulit && !ids.length) || (!opts.mulit && !ids)) {
      return 0;
    }

    if (!opts.multi) {
      let id = ids;
      let row = cacheable
        ? this.cache[id]
        : JSON.parse(this.storage.getItem(id));
      let isIdUpdated = values[pk] && values[pk] !== row[pk];
      let newId = isIdUpdated ? this.path + values[pk] : id;

      // check exist
      if (isIdUpdated && this.findOne(values[pk])) {
        throw new Error(
          "Duplicate value '" + values[pk] + "' for unique field '" + pk + "'",
        );
      }

      let data = Object.assign({}, row, values);

      if (cacheable) {
        this.cache[newId] = data;
        if (isIdUpdated) {
          delete this.cache[id];
        }
      }

      this.storage.setItem(newId, JSON.stringify(data));

      if (isIdUpdated) {
        this.storage.removeItem(id);
      }

      return data;
    } else {
      delete values[pk];

      if (!Object.keys(values).length) {
        return 0;
      }

      for (let id of ids) {
        let row = cacheable
          ? this.cache[id]
          : JSON.parse(this.storage.getItem(id));
        let data = Object.assign({}, row, values);

        if (cacheable) {
          this.cache[id] = data;
        }

        this.storage.setItem(id, JSON.stringify(data));
      }

      return ids.length;
    }
  }

  drop() {
    this.remove({});
    return true;
  }

  count() {
    let data = this.storage.getItem(this.path);

    return data ? JSON.parse(data).length : undefined;
  }
}
interface DBOpts {
  storage: Storage | null;
  database: string;
  primaryKey?: string;
  sep?: string;
}

class StorageDB {
  storage: Storage | null;
  database: string;
  primaryKey?: string;
  sep?: string;
  constructor(opts: DBOpts) {
    this.storage = opts.storage || (window && window.localStorage);
    this.database = opts.database || 'db';
    this.primaryKey = opts.primaryKey || '_id';
    this.sep = opts.sep || ':';

    if (!isSupported(this.storage)) {
      this.storage = null;
    }
  }

  // 使用数据库
  get(name: string, opts?: DBOpts) {
    return new Collection(
      this,
      name,
      opts || {
        storage: this.storage,
        database: this.database,
        primaryKey: this.primaryKey,
        sep: this.sep,
      },
    );
  }

  collection(name: string, opts?: DBOpts) {
    return this.get(name, opts);
  }

  // 当前数据库占用空间
  size() {
    let size = 0;
    for (let i in this.storage) {
      if (
        this.storage.hasOwnProperty(i) &&
        i.indexOf(this.database + ':') !== -1
      ) {
        const item = this.storage.getItem(i);
        size += item ? item.length : 0;
      }
    }
    return size;
  }
}

export default StorageDB;
