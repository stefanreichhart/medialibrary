import { Pipe, PipeTransform } from '@angular/core';

@Pipe({ name: 'round' })
export class RoundPipe implements PipeTransform {

  transform(value: number, decimals: number): string {
    let defaultDecimals = decimals || 0;
    return value.toFixed(defaultDecimals);
  }
  
}