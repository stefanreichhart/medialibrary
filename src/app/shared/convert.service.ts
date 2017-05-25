import { Injectable } from '@angular/core';

@Injectable()
export class ConvertService {

  constructor() { }

  asNumber(text:any, defaultValue:number): number {
    try {
      return Number.parseInt(('' + text).trim()) || defaultValue;
    } catch (error) {
      return defaultValue;
    }
  }

  list2string(items: string[], separator: string): string {
    let result = '';
    items.forEach((item, index) => {
      result = result + (index > 0 ? ',' : '') + item;
    });
    return result;
  }


  normalizeText(text: string): string {
    return ('' + (text || '')).trim();
  }

  normalizeParameter = function(text: string): string {
    return this.normalizeText(text).replace(/( )+/g, '+').toLowerCase();
  }
  
}
