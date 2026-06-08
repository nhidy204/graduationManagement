import { PipeTransform, Injectable, BadRequestException } from '@nestjs/common';
import { Types } from 'mongoose';

@Injectable()
export class ParseObjectIdPipe implements PipeTransform {
  transform(value: string) {
    if (!Types.ObjectId.isValid(value)) {
      throw new BadRequestException(`"${value}" không phải ObjectId hợp lệ`);
    }
    return new Types.ObjectId(value);
  }
}
