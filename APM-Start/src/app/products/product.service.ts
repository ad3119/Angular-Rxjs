import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { catchError, tap, map, scan } from 'rxjs/operators';
import { Product } from './product';
import { SupplierService } from '../suppliers/supplier.service';
import { throwError, combineLatest, BehaviorSubject, Subject, merge } from 'rxjs';
import { ProductCategoryService } from '../product-categories/product-category.service';

@Injectable({
  providedIn: 'root'
})
export class ProductService {
  private productsUrl = 'api/products';
  private suppliersUrl = this.supplierService.suppliersUrl;

  private insertActionSubject = new Subject<Product>();
  insertAction$ = this.insertActionSubject.asObservable();

  private selectedProductSubject = new BehaviorSubject<number>(0);
  selectedProduct$ = this.selectedProductSubject.asObservable();

  products$ = this.http.get<Product[]>(this.productsUrl)
    .pipe(
      tap(data => console.log('Products', JSON.stringify(data))),
      catchError(this.handleError)
    );

  mergedProducts$ = merge(
    this.products$, 
    this.insertAction$
  ).pipe(
    scan((acc: Product[], value:Product) => [...acc, value])
  );

  productWithCategory$ = combineLatest([
    this.mergedProducts$, 
    this.productCategoryService.productCategories$
  ]).pipe(
    map(([products, categories]) => 
      {
        return products.
          map(product => ({
            ...product,
            price: product.price * 1.5,
            category: categories.find(c => product.categoryId === c.id).name,
            searhKey: [product.productName]
          }) as Product);
      }
    )
  );

  selectedproducts$ = combineLatest([
    this.productWithCategory$, 
    this.selectedProduct$
  ])
  .pipe(
      map(([products, selectedproduct]) => 
        products.find(product => product.id === selectedproduct)
        ),
      tap(product => console.log('Selected ', product))
  );

  setSelectedProductSubject(categoryId: number) {
    this.selectedProductSubject.next(categoryId);
  }

  addFakeProduct(){
    this.insertActionSubject.next(this.fakeProduct())
  }

  constructor(private http: HttpClient, 
              private productCategoryService: ProductCategoryService, 
              private supplierService: SupplierService) { }


  private fakeProduct() {
    return {
      id: 42,
      productName: 'Another One',
      productCode: 'TBX-0042',
      description: 'Our new product',
      price: 8.9,
      categoryId: 3,
      category: 'Toolbox',
      quantityInStock: 30
    };
  }

  private handleError(err: any) {
    // in a real world app, we may send the server to some remote logging infrastructure
    // instead of just logging it to the console
    let errorMessage: string;
    if (err.error instanceof ErrorEvent) {
      // A client-side or network error occurred. Handle it accordingly.
      errorMessage = `An error occurred: ${err.error.message}`;
    } else {
      // The backend returned an unsuccessful response code.
      // The response body may contain clues as to what went wrong,
      errorMessage = `Backend returned code ${err.status}: ${err.body.error}`;
    }
    console.error(err);
    return throwError(errorMessage);
  }
}
