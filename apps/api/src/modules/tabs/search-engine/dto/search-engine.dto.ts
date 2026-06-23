import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { Expose } from 'class-transformer';
import {
  IsBoolean,
  IsNotEmpty,
  IsOptional,
  IsString,
  MaxLength,
  registerDecorator,
  ValidationOptions,
} from 'class-validator';
// Add custom validator utilities

// ---------------- Safe JS validator for jsonpCode ----------------
function isSafeJsonpCode(value: string): boolean {
  if (typeof value !== 'string') return false;
  // 1) Size limit (avoid overly large payloads)
  if (value.length > 4000) return false;

  const lower = value.toLowerCase();
  // 2) Blocklist common dangerous tokens (server and browser)
  const banned = [
    'window',
    'document',
    'globalthis',
    'process',
    'require',
    'module',
    'exports',
    'import',
    'fetch',
    'xmlhttprequest',
    'websocket',
    'function constructor',
    'constructor(',
    'eval',
    'new function',
    'settimeout',
    'setinterval',
    'location',
    'navigator',
    'localstorage',
    'sessionstorage',
    'child_process',
    'fs',
  ];
  if (banned.some((k) => lower.includes(k))) return false;

  // 3) Enforce shape: a plain function expression without invocation
  //    e.g. (function(data){ /*...*/ }) 或 (function(){ /*...*/ })
  //    Not allowing trailing () to avoid IIFE execution semantics
  const shape =
    /^\s*\(\s*function\s*\(\s*(?:[a-zA-Z_$][\w$]*(?:\s*,\s*[a-zA-Z_$][\w$]*)*)?\s*\)\s*\{[\s\S]*\}\s*\)\s*$/;
  if (!shape.test(value)) return false;

  // 4) Must contain at least one return (encourage pure transform)
  if (!/\breturn\b/.test(value)) return false;

  return true;
}

export function IsSafeJsonpCode(validationOptions?: ValidationOptions) {
  return function (object: any, propertyName: string) {
    registerDecorator({
      name: 'isSafeJsonpCode',
      target: object.constructor,
      propertyName,
      options: validationOptions,
      validator: {
        validate(value: any) {
          // allow empty/undefined (will use default in schema)
          if (value === undefined || value === null || value === '')
            return true;
          if (typeof value !== 'string') return false;
          try {
            // Syntax check without executing user code
            // new Function will only compile, not run the function body
            // We wrap with `return` to ensure value parses to an expression
            // Also avoid accidental IIFE by forbidding trailing `()` in regex above
            // eslint-disable-next-line no-new-func
            new Function('return ' + value);
          } catch (e) {
            return false;
          }
          return isSafeJsonpCode(value);
        },
        defaultMessage() {
          return 'jsonpCode 不安全或格式不正确：必须是形如 (function(...){ /*...*/ }) 的函数表达式（允许参数），且不包含危险API、长度不超过4000字节，并包含 return 语句';
        },
      },
    });
  };
}

// ---------------- URL placeholder validators ----------------
export function ContainsKeywordPlaceholder(
  validationOptions?: ValidationOptions,
) {
  return function (object: any, propertyName: string) {
    registerDecorator({
      name: 'containsKeywordPlaceholder',
      target: object.constructor,
      propertyName,
      options: validationOptions,
      validator: {
        validate(value: any) {
          if (value === undefined || value === null || value === '')
            return true; // allow optional
          if (typeof value !== 'string') return false;
          return value.includes('{keyword}');
        },
        defaultMessage() {
          return 'URL 必须包含 {keyword} 占位符';
        },
      },
    });
  };
}

export function ContainsKeywordAndJsonpPlaceholders(
  validationOptions?: ValidationOptions,
) {
  return function (object: any, propertyName: string) {
    registerDecorator({
      name: 'containsKeywordAndJsonpPlaceholders',
      target: object.constructor,
      propertyName,
      options: validationOptions,
      validator: {
        validate(value: any) {
          if (value === undefined || value === null || value === '')
            return true; // allow optional
          if (typeof value !== 'string') return false;
          return value.includes('{keyword}') && value.includes('{jsonp}');
        },
        defaultMessage() {
          return 'URL 必须同时包含 {keyword} 与 {jsonp} 占位符';
        },
      },
    });
  };
}

// ---------------- Template URL validator (supports {keyword}/{jsonp}) ----------------
export function IsTemplateUrlWithPlaceholders(
  required: Array<'keyword' | 'jsonp'>,
  validationOptions?: ValidationOptions,
) {
  return function (object: any, propertyName: string) {
    registerDecorator({
      name: 'isTemplateUrlWithPlaceholders',
      target: object.constructor,
      propertyName,
      options: validationOptions,
      validator: {
        validate(value: any) {
          if (value === undefined || value === null || value === '')
            return true; // allow optional
          if (typeof value !== 'string') return false;
          // ensure required placeholders exist
          const needKeyword = required.includes('keyword');
          const needJsonp = required.includes('jsonp');
          if (needKeyword && !value.includes('{keyword}')) return false;
          if (needJsonp && !value.includes('{jsonp}')) return false;
          // replace placeholders with safe samples then parse with URL
          let replaced = value;
          replaced = replaced.replace(/\{keyword\}/g, 'kw');
          replaced = replaced.replace(/\{jsonp\}/g, 'cb');
          try {
            // must be absolute URL with protocol
            const u = new URL(replaced);
            // optional: restrict protocols to http/https
            if (!(u.protocol === 'http:' || u.protocol === 'https:'))
              return false;
            return true;
          } catch (e) {
            return false;
          }
        },
        defaultMessage() {
          const parts = [] as string[];
          if (required.includes('keyword')) parts.push('{keyword}');
          if (required.includes('jsonp')) parts.push('{jsonp}');
          return `URL 不合法：需为包含协议的绝对地址，并包含占位符 ${parts.join('、')}（示例：https://example.com?q={keyword}&callback={jsonp}）`;
        },
      },
    });
  };
}

// ---------------- Inline SVG validator ----------------
export function IsInlineSafeSvg(validationOptions?: ValidationOptions) {
  return function (object: any, propertyName: string) {
    registerDecorator({
      name: 'isInlineSafeSvg',
      target: object.constructor,
      propertyName,
      options: validationOptions,
      validator: {
        validate(value: any) {
          if (value === undefined || value === null || value === '')
            return true; // optional
          if (typeof value !== 'string') return false;
          const trimmed = value.trim();
          if (!trimmed.toLowerCase().startsWith('<svg')) return false;
          if (!/<\/svg\s*>\s*$/i.test(trimmed)) return false;
          const lower = trimmed.toLowerCase();
          // 禁止 script 标签
          if (lower.includes('<script')) return false;
          // 禁止内联事件处理器 on*
          if (/\son[a-z]+\s*=\s*['"][^'"]*['"]/i.test(lower)) return false;
          // 限制长度，避免过大payload
          if (trimmed.length > 10000) return false;
          return true;
        },
        defaultMessage() {
          return 'icon 必须为内联 SVG 字符串（以 <svg 开头，以 </svg> 结束），且不得包含 <script> 或 on* 事件属性，长度不超过 10000 字符';
        },
      },
    });
  };
}

export class CreateSearchEngineDto {
  @ApiProperty({ description: '名称', example: 'Baidu' })
  @IsString()
  @IsNotEmpty()
  @MaxLength(100)
  @Expose()
  name: string;

  @ApiPropertyOptional({ description: '描述', example: '百度搜索' })
  @IsOptional()
  @IsString()
  @MaxLength(500)
  @Expose()
  description?: string;

  @ApiProperty({
    description: '搜索网址，需包含 {keyword} 占位符',
    example: 'https://www.google.com/search?q={keyword}',
  })
  @IsString()
  @IsNotEmpty()
  @ContainsKeywordPlaceholder({
    message: 'searchUrl 必须包含 {keyword} 占位符',
  })
  @IsTemplateUrlWithPlaceholders(['keyword'], {
    message: 'searchUrl 必须为包含协议的绝对地址，并包含 {keyword} 占位符',
  })
  @MaxLength(500)
  @Expose()
  searchUrl: string;

  @ApiPropertyOptional({
    description:
      '搜索提示词 JSONP 接口地址，需包含 {keyword} 和 {jsonp} 占位符',
    example: 'https://suggest.example.com/su?q={keyword}&callback={jsonp}',
  })
  @IsOptional()
  @IsString()
  @ContainsKeywordAndJsonpPlaceholders({
    message: 'suggestUrl 必须同时包含 {keyword} 与 {jsonp} 占位符',
  })
  @IsTemplateUrlWithPlaceholders(['keyword', 'jsonp'], {
    message:
      'suggestUrl 必须为包含协议的绝对地址，并包含 {keyword} 与 {jsonp} 占位符',
  })
  @MaxLength(500)
  @Expose()
  suggestUrl?: string;

  @ApiPropertyOptional({
    description: 'JSONP 获取提示词代码（函数表达式）',
    example: '(function(data){ return []; })',
  })
  @IsOptional()
  @IsString()
  @IsSafeJsonpCode()
  @Expose()
  jsonpCode?: string;

  @ApiPropertyOptional({ description: '图标（内联 SVG 字符串）' })
  @IsOptional()
  @IsString()
  @IsInlineSafeSvg()
  @Expose()
  icon?: string;

  @ApiPropertyOptional({ description: '是否启用', example: true })
  @IsOptional()
  @IsBoolean()
  @Expose()
  isEnabled?: boolean;
}

export class UpdateSearchEngineDto extends CreateSearchEngineDto {}

export class SearchEngineQueryDto {
  @ApiPropertyOptional({ description: '关键词', example: 'nest' })
  @IsOptional()
  @IsString()
  @Expose()
  q?: string;
}

export class ToggleEnableDto {
  @ApiProperty({ description: '是否启用', example: true })
  @IsBoolean()
  @Expose()
  isEnabled: boolean;
}
