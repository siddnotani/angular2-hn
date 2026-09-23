import {Pipe, PipeTransform} from '@angular/core';

@Pipe({
    name: 'comment',
    pure: true,
    standalone: false
})
export class CommentPipe implements PipeTransform {
  transform(comment: number): string {
   if (comment > 0) {
     const st = comment === 1 ? 'comment' : 'comments';
     return `${comment} ${st}`;
   }
   return 'discuss';
  }
}
