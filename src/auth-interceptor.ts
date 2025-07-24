import { Injectable } from '@angular/core';
import { HttpInterceptor, HttpRequest, HttpHandler, HttpEvent, HttpResponse, HttpErrorResponse } from '@angular/common/http';
import { BehaviorSubject, Observable, throwError } from 'rxjs';
import { Router } from '@angular/router';
import 'rxjs/add/operator/do';
import { BaseComponent } from './base.component';
import { DALService } from './DALservice.service';
import { parse } from 'querystring';
import { catchError, filter, switchMap, take } from 'rxjs/operators';

@Injectable()
export class AuthInterceptor extends BaseComponent implements HttpInterceptor {

  constructor(public route: Router, private _dalService: DALService) {
    super();
  }
  private isRefreshing = false;
  private refreshTokenSubject: BehaviorSubject<any> = new BehaviorSubject<any>(null);

  intercept(req: HttpRequest<any>, next: HttpHandler): Observable<HttpEvent<Object>> {
    let authReq = req;
    const token = this.AllModUrl('keytoken');
    if (token) {
      authReq = this.addTokenHeader(req, token);
    }
    return next.handle(authReq).pipe(catchError(error => {

      if (error instanceof HttpErrorResponse && error.status.toString() === '401') {
        return this.handle401Error(authReq, next);
      }
      return throwError(() => error);
    }));
  }


  private handle401Error(request: HttpRequest<any>, next: HttpHandler) {

    if (!this.isRefreshing) {
      this.isRefreshing = true;
      this.refreshTokenSubject.next(null);
      var jsonContent = {
        "token": this.AllModUrl('keytoken'),
        "refreshTokenExpiryTime": this.AllModUrl('refreshTokenExpiryTime'),
      }

      return this._dalService.RefreshToken(jsonContent).pipe(
        switchMap((resRefreshToken: any) => {
          const parseRefreshToken = JSON.parse(resRefreshToken);
          if (parseRefreshToken.status.toString() === '1') {
            this._dalService.getJSON().subscribe(dataGetJSON => {

              dataGetJSON.addressUrlAll.username = this.AllModUrl('username');
              dataGetJSON.addressUrlAll.idleTime = this.AllModUrl('idleTime');
              dataGetJSON.addressUrlAll.keytoken = parseRefreshToken.token;
              dataGetJSON.addressUrlAll.newkeytoken = parseRefreshToken.token;
              dataGetJSON.addressUrlAll.refreshTokenExpiryTime = this.AllModUrl('refreshTokenExpiryTime');
              dataGetJSON.addressUrlAll.sysdate = this.AllModUrl('sysdate');
              dataGetJSON.addressUrlAll.name = this.AllModUrl('name');
              dataGetJSON.addressUrlAll.idpp = this.AllModUrl('idpp');
              dataGetJSON.addressUrlAll.company_code = this.AllModUrl('company_code');
              dataGetJSON.addressUrlAll.company_name = this.AllModUrl('company_name');
              dataGetJSON.addressUrlAll.branch_code = this.AllModUrl('branch_code');
              dataGetJSON.addressUrlAll.branch_name = this.AllModUrl('branch_name');
              dataGetJSON.addressUrlAll.ipAddress = this.AllModUrl('ipAddress');

              sessionStorage.removeItem('U01JZ25pY25hbmlmSQ%3D%3D');

              sessionStorage.setItem(this.encryptLogic('IfinancingIMS'), this.encryptLogic(JSON.stringify(dataGetJSON.addressUrlAll))); //U01JZ25pY25hbmlmSQ%3D%3D

              this.isRefreshing = false;

              this.refreshTokenSubject.next(parseRefreshToken.token);
            })

            return next.handle(this.addTokenHeader(request, parseRefreshToken.token));
          }
          else {
            sessionStorage.clear(); // hapus semua sessionStorage
            window.location.href = this.mainMenuPath;
          }
        }),
        catchError((err) => {
          this.isRefreshing = false;
          return throwError(() => err);
        })
      );
    }
    return this.refreshTokenSubject.pipe(
      filter(token => token !== null),
      take(1),
      switchMap((token) => next.handle(this.addTokenHeader(request, this.AllModUrl('keytoken'))))
    );
  }
  private addTokenHeader(request: HttpRequest<any>, authToken: any) {
    if (authToken) {
      return request = request.clone({
        setHeaders: {
          'Authorization': `Bearer ${authToken}`,
        },
      })
    } else {
      return request;
    }
  }
}