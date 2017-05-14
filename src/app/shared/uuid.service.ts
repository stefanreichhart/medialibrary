import { Injectable } from '@angular/core';

@Injectable()
export class UuidService {

  private chars: string = 'abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789';

  constructor() { }

  generate(length: number = 8): string {
    return Array(length).join().split(',').map(() => { 
      return this.chars.charAt(Math.floor(Math.random() * this.chars.length)); 
    }).join('');
  }

}
