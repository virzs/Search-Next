# StorageDB

## 简介

类似 `mongodb` 的 `HTML5 Storage API` (`localStorage` 和 `sessionStorage`)

基于 [StorageDB](https://instapp.github.io/storagedb/) 编写，在源项目的基础上修改了存储数据的方式，及部分新操作，并支持ts。

## 功能

类似于 mongodb 的 API

- inset (docs)
- update (query)
- find (query, values, options)
- findOne (query, options)
- remove (query, options)
- drop ()

## 使用

### 引入

``` ts
import StorageDB from '@/utils/storage';

const db = new StorageDB({
    storage: window.localStorage,     // 使用的本地存储
    database: 'testdb',               // 数据库名称
    primaryKey: 'id'                  // 主键id字段，默认为 _id
})

// 创建集合(表)实例
const Users = db.get('users')
```

### 插入（insert）

``` ts
Users.insert([{
    id: 101,
    name: 'Larry',
    age: 21
}, {
    id: 102,
    name: 'Sergey',
    age: 21
}])

Users.insert({
    id: 100,
    name: 'Elon',
    age: 12
})
```

### 查找（find）

``` ts
Users.find([100, 102])

Users.find({
    name: /y$/,
    age: {
        $gte: 20
    }
}, {
    skip: 0,
    limit: 20,
    sort: {
        age: 1
    }
})
```

### 查找单个（findOne）

``` ts
Users.findOne(102)

Users.findOne({
    age: {
        $ne: 21
    }
})
```

### 更新（update）

``` ts
Users.update(100, {
    age: 47,
    company: 'The Avengers'
})

Users.update({
    age: 21
}, {
    age: 22
}, {
    multi: true
})
```

### 删除（remove）

``` ts
Users.remove(101)

Users.remove({
    age: 21
})
```

### drop

``` ts
Users.drop()
```

## 使用实例及 API 说明

### new StorageDB()

``` ts
const db = new StorageDB({
    storage: window.localStorage,
    database: 'database',
    primaryKey: 'id'
})
```

|    参数    |      说明      |              类型              |    默认值    | 可选 |
| :--------: | :------------: | :----------------------------: | :----------: | :--: |
|  storage   | 使用的存储类型 | localStorage \| sessionStorage | localStorage | true |
|  database  |   数据库名称   |             string             |      db      | true |
| primaryKey |   主键id名称   |             string             |     _id      | true |

### new StorageDB().get()

``` ts
const User = db.get('user');
```

### 查询参数 API (Operators)

```ts
'$eq' 	// 相等
'$gt' 	// 大于
'$gte'  // 大于等于
'$in' 	// 包含
'$lt' 	// 小于
'$lte' 	// 小于等于
'$ne' 	// 不等于
'$nin' 	// 不包含
```



### inset( )

``` ts
// 插入单条数据
const data = {username: '张三', age: '20', sex: '男'};

const result = User.inset(data);
// result {_id: 77f0c4aca2ee438aa7178cc91c248f53, username: '张三', age: '20', sex: '男'};

// 插入多条数据
const data = [
    {username: '张三', age: '20', sex: '男'},
    {username: '李四', age: '22', sex: '男'},
    {username: '王五', age: '18', sex: '女'},
];

const result = User.inset(data);
// result [{_id: 1d54e7911e824203af557c36964d9a5c, username: '张三', age: '20', sex: '男'}, {_id: 2de3accbb0944631b0321a5bf21ebb8d, username: '李四', age: '22', sex: '男'}, {_id: 91aabe48db834886858322e38eb1d0e8, username: '王五', age: '18', sex: '女'}];
```

### update(query, values, options)

```ts
const result = User.update('1d54e7911e824203af557c36964d9a5c', {
    username: '张3'
})

// age 小于 20 的数据，更新 age 为 22，批量更新
const result = User.update({
    age: {
        $lt: 20
    }
}, {
    age: 22
}, {
    multi: true
})
```

|  参数   |                说明                |                             类型                             | 默认值 | 可选  |
| :-----: | :--------------------------------: | :----------------------------------------------------------: | :----: | :---: |
|  query  | 查询参数 Operators参数详见上方说明 | string \| number \| { [x: string]: { [x: Operators]: any } } |        | false |
| values  |              更新参数              |                     { [x: string]: any }                     |        | false |
| options |        查询设置 multi 多选         |                      { multi?: any;  }                       |        | true  |

### find、findOne 

参数基本与 update 相同，但 find 和 findOne  没有 values 参数

```ts
Users.find([100, 102])

Users.find({
    name: /y$/,
    age: {
        $gte: 20
    }
}, {
    skip: 0,
    limit: 20,
    sort: {
        age: 1
    }
})
```

```ts
Users.findOne(102)

Users.findOne({
    age: {
        $ne: 21
    }
})
```

#### findOne options API

| 参数  |                说明                |          类型           | 默认值 | 可选 |
| :---: | :--------------------------------: | :---------------------: | :----: | :--: |
| skip  |            跳过数据个数            |         number          |        | true |
| limit |            返回数据个数            |         number          |        | true |
| sort  | 排序方式 Operators参数详见上方说明 | { [x: string]: number } |        | true |

### remove

```ts
Users.remove(101)

Users.remove({
    age: 21
})
```

