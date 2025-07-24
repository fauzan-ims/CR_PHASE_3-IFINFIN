import { Injectable } from '@angular/core';
import { HttpHeaders, HttpClient } from '@angular/common/http';
import { catchError, tap } from 'rxjs/operators';
import { BaseService } from './base.service';
import { ActivatedRoute } from '@angular/router';
import { Observable } from 'rxjs/Observable';

// const httpOptions = { headers: new HttpHeaders({ 'Content-Type': 'application/json', }), responseType: 'text' as 'json' };

@Injectable()
export class DALService extends BaseService {

  constructor(private _http: HttpClient, public getRouteparam: ActivatedRoute) {
    super();
  }

  //#region getJsonCnv
  public getJSON(): Observable<any> {
    return this._http.get("./assets/js/" + "configEnv" + ".json");
  }
  //#endregion getJsonCnv 

  protected urlAddr = this.AllModUrl('urlAddressFin');
  protected urlAddrLos = this.AllModUrl('urlAddressLos');
  protected urlAddrSys = this.AllModUrl('urlAddressSys');
  protected urlAddrCms = this.AllModUrl('urlAddressCms');
  protected urlAddrPdc = this.AllModUrl('urlAddressPdc');
  protected urlAddrCore = this.AllModUrl('urlAddressCore');
  protected urlAddrOpl = this.AllModUrl('urlAddressOpl');
  protected urlAddrApv = this.AllModUrl('urlAddressApv');
  protected urlAddrColl = this.AllModUrl('urlAddressColl');
  protected urlAddrRep = this.AllModUrl('urlAddressRep');
  protected urlAddrIns = this.AllModUrl('urlGetToken');
  protected urlReport = this.AllModUrl('urlReportFin');

  protected _urlAddress = this.urlAddr;
  protected _urlAddressSys = this.urlAddrSys;
  protected _urlAddressLos = this.urlAddrLos;
  protected _urlAddressCms = this.urlAddrCms;
  protected _urlAddressPdc = this.urlAddrPdc;
  protected _urlAddressCore = this.urlAddrCore;
  protected _urlAddressOpl = this.urlAddrOpl;
  protected _urlAddressApv = this.urlAddrApv;
  protected _urlAddressColl = this.urlAddrColl;
  protected _urlAddressRep = this.urlAddrRep;
  protected _urlAddressIns = this.urlAddrIns;
  protected _urlReport = this.urlReport;

  //#region RefreshToken 
  RefreshToken(jsonContent: any): Observable<any> {
    return this._http.post<any[]>(this.AllModUrl('urlRefreshToken'), jsonContent, this.httpOptionsRefreshToken).pipe(
      tap(_ => console.log(`Success!`)),
      catchError(this.handleError)
    );
  }
  //#endregion RefreshToken

  Getrows(data: any, controller: String, route: String): Observable<any> {
    const url = `${this._urlAddress + controller + '/' + route}`;
    return this._http.post<any[]>(url, data, this.httpOptions).pipe(
      tap(_ => console.log(`Success!`)),
      catchError(this.handleError)
    );
  }

  Getrow(data: any, controller: String, route: String): Observable<any> {
    const url = `${this._urlAddress + controller + '/' + route}`;
    return this._http.post<any[]>(url, data, this.httpOptions).pipe(
      tap(_ => console.log(`Success!`)),
      catchError(this.handleError)
    );
  }

  Insert(data: any, controller: String, route: String): Observable<any> {
    const result = JSON.stringify(data);
    const url = `${this._urlAddress + controller + '/' + route}`;
    return this._http.post<any[]>(url, result, this.httpOptions).pipe(
      tap(_ => console.log(`inserted success code=${data[0].p_code}`)),
      catchError(this.handleError)
    );
  }

  Update(data: any, controller: String, route: String): Observable<any> {
    const result = JSON.stringify(data);
    const url = `${this._urlAddress + controller + '/' + route}`;
    return this._http.post<any[]>(url, result, this.httpOptions).pipe(
      tap(_ => console.log(`updated success code=${data[0].p_code}`)),
      catchError(this.handleError)
    );
  }

  Delete(data: any, controller: String, route: String): Observable<any> {
    const url = `${this._urlAddress + controller + '/' + route}`;
    return this._http.post<any[]>(url, data, this.httpOptions).pipe(
      tap(_ => console.log(`Success!`)),
      catchError(this.handleError)
    );
  }

  ExecSp(data: any, controller: String, route: String): Observable<any> {
    const url = `${this._urlAddress + controller + '/' + route}`;
    return this._http.post<any[]>(url, data, this.httpOptions).pipe(
      tap(_ => console.log(`Success!`)),
      catchError(this.handleError)
    );
  }

  ExecSpSys(data: any, controller: String, route: String): Observable<any> {
    const url = `${this._urlAddressSys + controller + '/' + route}`;
    return this._http.post<any[]>(url, data, this.httpOptions).pipe(
      tap(_ => console.log(`Success!`)),
      catchError(this.handleError)
    );
  }

  ExecSpLos(data: any, controller: String, route: String): Observable<any> {
    const url = `${this._urlAddressLos + controller + '/' + route}`;
    return this._http.post<any[]>(url, data, this.httpOptions).pipe(
      tap(_ => console.log(`Success!`)),
      catchError(this.handleError)
    );
  }

  //#region this for IFINLOS Lookup ModulCode
  GetrowsLos(data: any, controller: String, route: String): Observable<any> {
    const url = `${this._urlAddressLos + controller + '/' + route}`;
    return this._http.post<any[]>(url, data, this.httpOptions).pipe(
      tap(_ => console.log(`Success!`)),
      catchError(this.handleError)
    );
  }
  //#endregion this for IFINLOS Lookup ModulCode

  UploadFile(data: any, controller: String, route: String): Observable<any> {
    const result = JSON.stringify(data);
    const url = `${this._urlAddress + controller + '/' + route}`;
    return this._http.post<any[]>(url, result, this.httpOptions).pipe(
      tap(_ => console.log(`inserted success code=${data[0].p_code}`)),
      catchError(this.handleError)
    );
  }

  PriviewFile(data: any, controller: String, route: String): Observable<any> {
    const result = JSON.stringify(data);
    const url = `${this._urlAddress + controller + '/' + route}`;
    return this._http.post<any[]>(url, result, this.httpOptions).pipe(
      tap(_ => console.log(`priview image=${data[0].p_file_name}`)),
      catchError(this.handleError)
    );
  }

  DownloadFile(controller: String, route: String): Observable<any> {
    const url = `${this._urlAddress + controller + '/' + route}`;
    return this._http.get(url, this.httpOptionsDownload).pipe(
      tap(data => data),
      catchError(this.handleError)
    );

  }

  DeleteFile(data: any, controller: String, route: String): Observable<any> {
    const result = JSON.stringify(data);
    const url = `${this._urlAddress + controller + '/' + route}`;
    return this._http.post<any[]>(url, result, this.httpOptions).pipe(
      tap(_ => console.log(`deleted image=${data[0].p_code}`)),
      catchError(this.handleError)
    );
  }

  //#region this for IFINSYS Lookup ModulCode
  GetrowsSys(data: any, controller: String, route: String): Observable<any> {
    const url = `${this._urlAddressSys + controller + '/' + route}`;
    return this._http.post<any[]>(url, data, this.httpOptions).pipe(
      tap(_ => console.log(`Success!`)),
      catchError(this.handleError)
    );
  }
  //#endregion this for IFINSYS Lookup ModulCode

  GetrowCore(data: any, controller: String, route: String): Observable<any> {
    const url = `${this._urlAddressCore + controller + '/' + route}`;
    return this._http.post<any[]>(url, data, this.httpOptions).pipe(
      tap(_ => console.log(`Success!`)),
      catchError(this.handleError)
    );
  }

  //#region this for Lookup ModulCode
  GetrowsCore(data: any, controller: String, route: String): Observable<any> {
    const url = `${this._urlAddressCore + controller + '/' + route}`;
    return this._http.post<any[]>(url, data, this.httpOptions).pipe(
      tap(_ => console.log(`Success!`)),
      catchError(this.handleError)
    );
  }
  //#endregion this for Lookup ModulCode

  //#region this for Lookup ModulOPL
  GetrowsOpl(data: any, controller: String, route: String): Observable<any> {
    const url = `${this._urlAddressOpl + controller + '/' + route}`;
    return this._http.post<any[]>(url, data, this.httpOptions).pipe(
      tap(_ => console.log(`Success!`)),
      catchError(this.handleError)
    );
  }
  //#endregion this for Lookup ModulOPL

  GetrowOpl(data: any, controller: String, route: String): Observable<any> {
    const url = `${this._urlAddressOpl + controller + '/' + route}`;
    return this._http.post<any[]>(url, data, this.httpOptions).pipe(
      tap(_ => console.log(`Success!`)),
      catchError(this.handleError)
    );
  }

  //#region this for Lookup ModulAPV
  GetrowsApv(data: any, controller: String, route: String): Observable<any> {
    const url = `${this._urlAddressApv + controller + '/' + route}`;
    return this._http.post<any[]>(url, data, this.httpOptions).pipe(
      tap(_ => console.log(`Success!`)),
      catchError(this.handleError)
    );
  }
  //#endregion this for Lookup ModulAPV

  //#region this for IFINAPV Lookup ModulCode
  ExecSpApv(data: any, controller: String, route: String): Observable<any> {
    const url = `${this._urlAddressApv + controller + '/' + route}`;
    return this._http.post<any[]>(url, data, this.httpOptions).pipe(
      tap(_ => console.log(`Success!`)),
      catchError(this.handleError)
    );
  }
  //#endregion this for IFINAPV Lookup ModulCode

  //#region this for IFINPDC Lookup ModulCode
  GetrowsPdc(data: any, controller: String, route: String): Observable<any> {
    const url = `${this._urlAddressPdc + controller + '/' + route}`;
    return this._http.post<any[]>(url, data, this.httpOptions).pipe(
      tap(_ => console.log(`Success!`)),
      catchError(this.handleError)
    );
  }
  //#endregion this for IFINPDC Lookup ModulCode

  //#region this for IFINCORE Lookup ModulCode
  ExecSpCore(data: any, controller: String, route: String): Observable<any> {
    const url = `${this._urlAddressCore + controller + '/' + route}`;
    return this._http.post<any[]>(url, data, this.httpOptions).pipe(
      tap(_ => console.log(`Success!`)),
      catchError(this.handleError)
    );
  }
  //#endregion this for IFINCORE Lookup ModulCode

  //#region this for IFINCOLL Lookup ModulCode
  GetrowsColl(data: any, controller: String, route: String): Observable<any> {
    const url = `${this._urlAddressColl + controller + '/' + route}`;
    return this._http.post<any[]>(url, data, this.httpOptions).pipe(
      tap(_ => console.log(`Success!`)),
      catchError(this.handleError)
    );
  }
  //#endregion this for IFINCOLL Lookup ModulCode

  //#region this for IFINCORE Lookup ModulCode
  ExecSpRep(data: any, controller: String, route: String): Observable<any> {
    const url = `${this._urlAddressRep + controller + '/' + route}`;
    return this._http.post<any[]>(url, data, this.httpOptions).pipe(
      tap(_ => console.log(`Success!`)),
      catchError(this.handleError)
    );
  }
  //#endregion this for IFINCORE Lookup ModulCode

  //#region this for All Modle
  ExecSpAll(data: any, urlAddress: String): Observable<any> {
    const url = `${urlAddress}`;

    return this._http.post<any[]>(url, data, this.httpOptions).pipe(
      tap(_ => console.log(`Success!`)),
      catchError(this.handleError)
    );
  }
  //#endregion this for All Modle

  //report non core
  ReportFile(data: any, controller: String, route: String): Observable<any> {
    const url = `${this._urlReport + controller + '/' + route}`;
    return this._http.post<any[]>(url, data, this.httpOptionsReport).pipe(
      tap(_ => console.log(`Success!`)),
      catchError(this.handleError)
    );
  }

  DownloadFileWithParam(data: any, controller: String, route: String): Observable<any> {
    const result = JSON.stringify(data);
    const url = `${this._urlAddress + controller + '/' + route}`;
    return this._http.post<any[]>(url, result, this.httpOptionsDownload).pipe(
      tap(data => data),
      catchError(this.handleError)
    );
  }

  DownloadFileWithData(data: any, controller: String, route: String): Observable<any> {
    const result = JSON.stringify(data);
    const url = `${this._urlAddress + controller + '/' + route}`;
    return this._http.post<any[]>(url, result, this.httpOptionsDownload).pipe(
      tap(data => data),
      catchError(this.handleError)
    )
  }
}
