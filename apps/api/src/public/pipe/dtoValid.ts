import {
  ArgumentMetadata,
  BadRequestException,
  Injectable,
  PipeTransform,
  Type,
} from '@nestjs/common';
import { instanceToPlain, plainToClass } from 'class-transformer';
import { validate } from 'class-validator';
import { ValidationError } from 'class-validator';

const getFirstValidationMessage = (errors: ValidationError[]): string => {
  for (const error of errors) {
    if (error.constraints) {
      return Object.values(error.constraints)[0];
    }
    if (error.children?.length) {
      return getFirstValidationMessage(error.children);
    }
  }
  return '参数校验失败';
};

@Injectable()
class DefaultDTOValidationPipe implements PipeTransform<any> {
  private toValidate(metaType: Type<any>): boolean {
    const types = [String, Boolean, Number, Array, Object];
    return !types.find((type) => metaType === type);
  }

  async transform(value: any, { metatype }: ArgumentMetadata) {
    if (!value || !this.toValidate(metatype)) {
      return value;
    }
    const object = plainToClass(metatype, value, {
      excludeExtraneousValues: true,
    });
    // 删除未验证的值及非法值
    const deleteUndefined = instanceToPlain(object);

    for (const i in deleteUndefined) {
      if (deleteUndefined[i] === undefined) {
        delete deleteUndefined[i];
      }
    }

    const delObj = plainToClass(metatype, deleteUndefined);
    const errors = await validate(delObj);

    if (errors.length > 0) {
      const msg = getFirstValidationMessage(errors); // 只需要取第一个错误信息并返回即可
      throw new BadRequestException(`Validation failed: ${msg}`);
    }
    return deleteUndefined;
  }
}

export default DefaultDTOValidationPipe;
