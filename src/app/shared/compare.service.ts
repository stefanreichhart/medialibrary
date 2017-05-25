import { Injectable } from '@angular/core';

@Injectable()
export class CompareService {

  constructor() { }

  equals(text1: string, text2: string): boolean {
    return text1 === text2 || text1 == text2 || this._normalize(text1) == this._normalize(text2);
  }

  _normalize(text: string): string {
    return (text || '').trim().replace(/( )+/g, '').toLowerCase();
  }
  
}
