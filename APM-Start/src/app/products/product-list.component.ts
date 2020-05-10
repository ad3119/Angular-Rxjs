import { Component,  ChangeDetectionStrategy } from '@angular/core';

import { EMPTY, BehaviorSubject, Subject, combineLatest, merge } from 'rxjs';

import { ProductService } from './product.service';
import { catchError, filter, map, tap } from 'rxjs/operators';
import { ProductCategoryService } from '../product-categories/product-category.service';

@Component({
  templateUrl: './product-list.component.html',
  styleUrls: ['./product-list.component.css'],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class ProductListComponent {
  pageTitle = 'Product List';

  private errorMessageSubject = new Subject();
  
  errorMessage$ = this.errorMessageSubject.asObservable();

  private categorySelectedSubject = new BehaviorSubject<number>(0);
  categorySelectedAction$ = this.categorySelectedSubject.asObservable();
  
  categories$ = this.productCategoryService.productCategories$
    .pipe(
      catchError(err => {
        this.errorMessageSubject.next(err);
        return EMPTY;
      })
    );

  products$ = combineLatest([
    this.productService.productWithCategory$, 
    this.categorySelectedAction$
  ])
    .pipe(
      map(([products, selectedCatgoryId]) =>  
        products.filter(product => 
          selectedCatgoryId ? product.categoryId === selectedCatgoryId : true
        )),
      catchError(err=>  {
        this.errorMessageSubject.next(err);
        return EMPTY;
    })
  );
  
  
  constructor(private productService: ProductService, 
    private productCategoryService: ProductCategoryService) { }

  onAdd(): void {
    this.productService.addFakeProduct();
  }

  onSelected(categoryId: string): void {
    console.log("Selected : ",categoryId)
    this.categorySelectedSubject.next(+categoryId);
  }
}
