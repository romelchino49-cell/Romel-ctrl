import { Pipe, PipeTransform } from '@angular/core';
@Pipe({ name: 'money', standalone: true })
export class MoneyPipe implements PipeTransform { transform(v: number | null | undefined) { return (v ?? 0).toLocaleString('es-PE', { minimumFractionDigits: 2, maximumFractionDigits: 2 }); } }
