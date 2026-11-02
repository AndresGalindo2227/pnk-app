import type { PipeTransform } from '@angular/core';
import { Pipe } from '@angular/core';

import { TEXTS_ES } from './texts.es';

/**
 * Resolves a dotted key of the text catalog: {{ 'auth.login.title' | text }}.
 * Unknown keys are returned as-is so missing texts are visible during development.
 */
@Pipe({ name: 'text' })
export class TextPipe implements PipeTransform {
  transform(key: string): string {
    const value = key
      .split('.')
      .reduce<unknown>((node, part) => (node as Record<string, unknown> | undefined)?.[part], TEXTS_ES);
    return typeof value === 'string' ? value : key;
  }
}
