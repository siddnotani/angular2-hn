import { Component, Input, OnInit, ChangeDetectionStrategy } from '@angular/core';

import { Comment } from '../../shared/models/comment';

@Component({
    selector: 'app-comment',
    templateUrl: './comment.component.html',
    styleUrls: ['./comment.component.scss'],
    changeDetection: ChangeDetectionStrategy.Eager,
    standalone: false
})
export class CommentComponent implements OnInit {
  @Input() comment: Comment;
  collapse: boolean;

  ngOnInit() {
    this.collapse = false;
  }
}
