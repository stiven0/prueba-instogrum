
  import { Pipe, PipeTransform  } from '@angular/core';
  import { register, format } from 'timeago.js';

  @Pipe({
    name : 'pipeFecha'
  })

  export class PipeTimeAgo implements PipeTransform {

    transform(fecha : string): string{

      const horaLocal = (number, index, total_sec) => {

        // mensaje de retorno dependiendo de la hora
        return [
          [ 'justo ahora' ],
          [ 'hace %s segundos' ],
          [ 'hace 1 minuto' ],
          [ 'hace %s minutos' ],
          [ 'hace 1 hora' ],
          [ 'hace %s horas' ],
          [ 'hace 1 dia' ],
          [ 'hace %s dias'],
          [ 'hace una semana' ],
          [ 'hace %s semanas' ],
          [ 'hace 1 mes' ],
          [ 'hace %s meses' ],
          [ 'hace 1 año' ],
          [ 'hace %s años' ]
        ][index];
      }
      register('hora-local', (horaLocal as any) ); // registramos la fecha en español
      return format(fecha, 'hora-local'); // damos formato a la fecha
    }


  }
