import { Pipe, PipeTransform } from '@angular/core';

@Pipe({ name: 'duration' })
export class DurationPipe implements PipeTransform {

  transform(value: number, unit: string): string {
    return value ? value + '' + unit : '';
  }
  
}