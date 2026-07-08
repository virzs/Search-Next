interface FilterLogTemplateData {
  url: string;
  method: string;
  ip: string | string[];
  statusCode: number;
  response?: any;
}

interface TransformLogTemplateData extends Omit<
  FilterLogTemplateData,
  "statusCode"
> {
  user?: any;
}

interface LogTemplateData extends Omit<FilterLogTemplateData, "response"> {
  cookies?: any;
  params?: any;
  query?: any;
  body?: any;
}

const SENSITIVE_KEY_PATTERN = /password|token|secret|captcha|authorization/i;

export const redactSensitiveValues = (value: unknown): unknown => {
  if (Array.isArray(value)) {
    return value.map((item) => redactSensitiveValues(item));
  }

  if (!value || typeof value !== "object") {
    return value;
  }

  return Object.fromEntries(
    Object.entries(value).map(([key, item]) => [
      key,
      SENSITIVE_KEY_PATTERN.test(key)
        ? "[REDACTED]"
        : redactSensitiveValues(item),
    ]),
  );
};

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
  Cookies             : ${JSON.stringify(redactSensitiveValues(dataSource.cookies))}
  Params              : ${JSON.stringify(redactSensitiveValues(dataSource.params))}
  Query               : ${JSON.stringify(redactSensitiveValues(dataSource.query))}
  Body                : ${JSON.stringify(redactSensitiveValues(dataSource.body))}
 >>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>`;
