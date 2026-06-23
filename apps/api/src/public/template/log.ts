interface FilterLogTemplateData {
  url: string;
  method: string;
  ip: string | string[];
  statusCode: number;
  response?: any;
}

interface TransformLogTemplateData
  extends Omit<FilterLogTemplateData, 'statusCode'> {
  user?: any;
}

interface LogTemplateData extends Omit<FilterLogTemplateData, 'response'> {
  cookies?: any;
  params?: any;
  query?: any;
  body?: any;
}

export const filterLogTemplate = (dataSource: FilterLogTemplateData) =>
  `<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<
  Request original url: ${dataSource.url}
  Method              : ${dataSource.method}
  IP                  : ${dataSource.ip}
  Status code         : ${dataSource.statusCode}
  Response data       : ${dataSource.response}
 <<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<`;

export const transformLogTemplate = (dataSource: TransformLogTemplateData) =>
  `<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<
  Request original url: ${dataSource.url}
  Method              : ${dataSource.method}
  IP                  : ${dataSource.ip}
  User data           : ${dataSource.user}
  Response data       : ${dataSource.response}
 <<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<`;

export const logTemplate = (dataSource: LogTemplateData) =>
  `>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>
  Request original url: ${dataSource.url}
  Method              : ${dataSource.method}
  IP                  : ${dataSource.ip}
  Status code         : ${dataSource.statusCode}
  Cookies             : ${JSON.stringify(dataSource.cookies)}
  Params              : ${JSON.stringify(dataSource.params)}
  Query               : ${JSON.stringify(dataSource.query)}
  Body                : ${JSON.stringify(dataSource.body)}
 >>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>`;
