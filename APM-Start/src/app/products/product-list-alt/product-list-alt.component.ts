import { Component, ChangeDetectionStrategy } from '@angular/core';

import { catchError } from 'rxjs/operators';
import { EMPTY, Subject } from 'rxjs';
import { ProductService } from '../product.service';

@Component({
  selector: 'pm-product-list',
  templateUrl: './product-list-alt.component.html',
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class ProductListAltComponent {
  pageTitle = 'Products';
  private errorMessageSubject = new Subject();
  errorMessage$ = this.errorMessageSubject.asObservable();

  products$ = this.productService.productWithCategory$
  .pipe(
    catchError(err=>  {
      this.errorMessageSubject.next(err);
      return EMPTY;
    })
  );

  constructor(private productService: ProductService) { }

  onSelected(productId: number): void {
    this.productService.setSelectedProductSubject(productId);
  } 
}
