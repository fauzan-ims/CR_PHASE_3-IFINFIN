import { Injectable } from '@angular/core';
import { BaseService } from '../../../base.service';
import { HttpHeaders, HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { tap, catchError } from 'rxjs/operators';
import { Router } from '@angular/router';
import { DALService } from '../../../DALservice.service';


const httpOptions = { headers: new HttpHeaders({ 'Content-Type': 'application/x-www-form-urlencoded', }), responseType: 'text' as 'json' };

@Injectable()
export class LoginService extends BaseService {

  constructor(
    private _http: HttpClient,
    private _dalservice: DALService,
    public route: Router) {
    super();
  }

  // tslint:disable-next-line:member-ordering
  getToken(username: string, password: string, urlToken): Observable<any> {

    // jika memakai x-www-form-urlencoded
    const body = new URLSearchParams();
    body.set('username', username);
    body.set('password', password);
    // end 

    const url = `${urlToken}`;
    return this._http.post<any[]>(url, body.toString(), httpOptions).pipe(
      tap(_ => console.log(`Success!`)),
      catchError(this.handleError)
    );
  }


  getTokenThirdParty(username: string, password: string, ip_source: string, urlToken): Observable<any> {

    // jika memakai x-www-form-urlencoded
    const body = new URLSearchParams();
    body.set('username', username);
    body.set('password', password);
    body.set('app_code', 'IFINANCE');
    body.set('ip_source', 'IFINANCE');
    // end 

    const url = `${urlToken}`;
    return this._http.post<any[]>(url, body.toString(), httpOptions).pipe(
      tap(_ => console.log(`Success!`)),
      catchError(this.handleError)
    );
  }
}