import { Response } from '@angular/http';
import { Observable } from 'rxjs/Observable';
import 'rxjs/add/operator/map';
import 'rxjs/add/operator/catch';
import { HttpHeaders } from '@angular/common/http';
import swal from 'sweetalert2';
import { throwError } from 'rxjs';

export abstract class BaseService {
  //#region handleError
  // protected handleError(error: Response | any) {
  //   // In a real world app, you might use a remote logging infrastructure
  //   let errMsg: string;
  //   if (error instanceof Response) {
  //     const body = error.json() || '';
  //     const err = body.error || JSON.stringify(body);
  //     errMsg = `${error.status} - ${error.statusText || ''} ${err}`;
  //   } else {
  //     errMsg = error.message ? error.message : error.toString();
  //   }
  //   return Observable.throw(errMsg);
  // }
  //#endregion handleError

  //#region handleError 
  protected handleError(error: any) {
    let errorMessage = '';
    if (error.error instanceof ErrorEvent) {
      // client-side error
      errorMessage = `Error: ${error.error.message}`;
    } else {
      // server-side error
      errorMessage = `Error Code: ${error.status}\nMessage: ${error.message}`;
    }

    swal({
      allowOutsideClick: false,
      title: 'Warning',
      text: JSON.parse(error.error).message,
      buttonsStyling: false,
      confirmButtonClass: 'btn btn-warning',
      type: 'warning'
    }).catch(swal.noop);

    return throwError(() => {
      return errorMessage;
    });
  }
  //#endregion handleError

  //#region extractData
  protected extractData(res: Response) {
    const body = res.json();
    return body.data || {};
  }
  //#endregion extractData

  //#region encryptLogic
  protected encryptLogic(value: string) {

    if (value === null) {
      value = 'default';
    }

    const val = btoa(value.split('').reverse().join(''));
    const valNew = encodeURIComponent(val);
    return valNew;
  }
  //#endregion encryptLogic

  //#region decryptLogic
  protected decryptLogic(value: string) {

    if (value === null) {
      value = 'default';
    }

    const decodeURI = decodeURIComponent(value);
    const decode64 = atob(decodeURI);
    const returnAll = decode64.split('').reverse().join('');

    return returnAll;
  }
  //#endregion decryptLogic

  //#region AllModUrl
  protected AllModUrl(url: String) {

    let urlAll: any;
    let urlNow: any;
    let dataUrl: object = {};
    if ('U01JZ25pY25hbmlmSQ%3D%3D' in sessionStorage) {
      urlAll = this.decryptLogic(sessionStorage.getItem('U01JZ25pY25hbmlmSQ%3D%3D'));
      dataUrl = (JSON.parse(urlAll));
      urlNow = dataUrl[url.toString()];
    }
    else {
      urlNow = ''
    }

    return urlNow;

  }
  //#endregion AllModUrl


  public sysDate = this.AllModUrl('sysdate');
  protected toks = this.AllModUrl('keytoken');
  protected uid = this.AllModUrl('username');
  public userName = this.AllModUrl('name');
  protected branchCodes = this.AllModUrl('branch_code');
  protected branchNames = this.AllModUrl('branch_name');
  protected ipAddress = this.AllModUrl('ipAddress');
  public companyName = this.AllModUrl('company_name');
  public isWatermark = this.AllModUrl('isWatermark');
  public currentTime = new Date().toLocaleTimeString();
  public userLog = '';

  protected encryptUserId = this.encryptLogic(this.uid);
  protected encryptUserName = this.encryptLogic(this.userName);
  protected encryptIPAddress = this.encryptLogic(this.ipAddress);

  //#region httpOptions 
  protected httpOptions = {
    headers: new HttpHeaders({
      'Content-Type': 'application/json',
      'Authorization': 'Bearer ' + this.toks,
      'UserID': this.encryptUserId,
      'IPAddress': this.encryptIPAddress
    })
    ,
    responseType: 'text' as 'json'
  };
  //#endregion httpOptions

  //#region httpOptionsDownload
  protected httpOptionsDownload = {
    headers: new HttpHeaders({
      'Content-Type': 'application/json',
      'Authorization': 'Bearer ' + this.toks,
      'UserID': this.encryptUserId,
      'IPAddress': this.encryptIPAddress
    }),
    responseType: 'blob' as 'json',
    observe: 'response' as 'response'
  };
  //#endregion httpOptionsDownload

  //#region httpOptionsReport
  protected httpOptionsReport = {
    headers: new HttpHeaders({
      'Content-Type': 'application/json',
      'Authorization': 'Bearer ' + this.toks,
      'UserID': this.encryptUserId,
      'UserName': this.encryptUserName,
      'IPAddress': this.encryptIPAddress
    }),
    responseType: 'arraybuffer' as 'json',
    observe: 'response' as 'response'
  };
  //#endregion httpOptionsReport

  //#region httpOptionsRefreshToken 
  protected httpOptionsRefreshToken = {
    headers: new HttpHeaders({
      'Content-Type': 'application/json'
    })
    ,
    responseType: 'text' as 'json'
  };
  //#endregion httpOptionsRefreshToken
}
