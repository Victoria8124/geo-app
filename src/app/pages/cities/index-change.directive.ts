import {Directive, Output, inject} from '@angular/core';
import {VIRTUAL_SCROLL_STRATEGY} from '@angular/cdk/scrolling';
import {Observable} from 'rxjs';

@Directive({
  standalone: true,
  selector: '[indexScrolled]',
})
export class IndexScrolledDirective {
  @Output()
  readonly indexScrolled: Observable<number> =
    inject(VIRTUAL_SCROLL_STRATEGY).scrolledIndexChange;
}