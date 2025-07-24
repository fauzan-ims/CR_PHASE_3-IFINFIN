import { Component, OnInit, ElementRef, ViewChild, AfterViewInit } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { NgForm } from '@angular/forms';
import swal from 'sweetalert2';
import { DataTableDirective } from 'angular-datatables';
import { BaseComponent } from '../../../../../base.component';
import { DALService } from '../../../../../DALservice.service';
import { DatePipe } from '@angular/common';
import { style } from '@angular/animations';
import { ReturnStatement } from '@angular/compiler';

@Component({
  moduleId: module.id,
  selector: 'app-root',
  templateUrl: './accounttransferrequestdetail.component.html'
})

export class AccounttransferrequestdetailComponent extends BaseComponent implements OnInit {
  // get param from url
  param = this.getRouteparam.snapshot.paramMap.get('id');

  // variable
  public NumberOnlyPattern = this._numberonlyformat;
  public accounttransferrequestdetailData: any = [];
  public isReadOnly: Boolean = false;
  public isButton: Boolean = false;
  public isCurrencyFrom: Boolean = false;
  public isCurrencyTo: Boolean = false;
  public isFrom: Boolean = false;
  public isTo: Boolean = false;
  public lookupbranch: any = [];
  public listTableLookupDB: any = [];
  public lookupbank: any = [];
  public from_orig_amount: any;
  public from_exch_rate: any;
  public to_exch_rate: any;
  public base_currency: any;
  private id: any;
  private valDate: any;
  private setStyle: any = [];
  private dataRoleTamp: any = [];
  private dataTamp: any = [];
  private RoleAccessCode = 'R00017770000000A';

  // API Controller
  private APIController: String = 'FinInterfaceAccountTransfer';

  // API Function
  private APIRouteForGetRow: String = 'GetRow';
  private APIRouteForGetProceed: String = 'ExecSpForGetProceed';

  // form 2 way binding
  model: any = {};

  // spinner
  showSpinner: Boolean = true;
  // end

  // datatable
  @ViewChild(DataTableDirective)
  dtElement: DataTableDirective;
  dtOptions: DataTables.Settings = {};

  constructor(private dalservice: DALService,
    public getRouteparam: ActivatedRoute,
    public route: Router,
    private _elementRef: ElementRef, private datePipe: DatePipe
  ) { super(); }

  ngOnInit() {
    this.Delimiter(this._elementRef);
    this.callGetRole(this.userId, this._elementRef, this.dalservice, this.RoleAccessCode, this.route);
    this.isReadOnly = true;
    // call web service
    this.callGetrow();
  }

  //#region  set datepicker
  getStyles(isTrue: Boolean) {
    if (isTrue) {
      this.setStyle = {
        'pointer-events': 'none',
      }
    } else {
      this.setStyle = {
        'pointer-events': 'pointer',
      }
    }

    return this.setStyle;
  }
  //#endregion  set datepicker

  //#region  getrow data
  callGetrow() {
    // param tambahan untuk getrow dynamic
    this.dataTamp = [{
      'p_code': this.param,
    }];
    // end param tambahan untuk getrow dynamic
    this.dalservice.Getrow(this.dataTamp, this.APIController, this.APIRouteForGetRow)
      .subscribe(
        res => {
          const parse = JSON.parse(res);
          const ngbGetrow = this.getrowNgb(parse.data[0]);

          // mapper dbtoui
          Object.assign(this.model, ngbGetrow);
          // end mapper dbtoui

          this.showSpinner = false;
        },
        error => {
          console.log('There was an error while Retrieving Data(API) !!!' + error);
        });
  }
  //#endregion  getrow data

  //#region button Proceed
  btnProceed(code: string) {
    // param tambahan untuk getrole dynamic
    this.dataRoleTamp = [{
      'p_code': code,
    }];
    // param tambahan untuk getrole dynamic

    // call web service
    swal({
      title: 'Are you sure?',
      type: 'warning',
      showCancelButton: true,
      confirmButtonClass: 'btn btn-success',
      cancelButtonClass: 'btn btn-danger',
      confirmButtonText: this._deleteconf,
      buttonsStyling: false
    }).then((result) => {
      if (result.value) {
        this.dalservice.ExecSp(this.dataRoleTamp, this.APIController, this.APIRouteForGetProceed)
          .subscribe(
            res => {
              this.showSpinner = false;
              const parse = JSON.parse(res);
              if (parse.result === 1) {
                this.showNotification('bottom', 'right', 'success');
                this.callGetrow();
              } else {
                this.swalPopUpMsg(parse.data);
              }
            },
            error => {
              this.showSpinner = false;
              const parse = JSON.parse(error);
              this.swalPopUpMsg(parse.data);
            });
      } else {
        this.showSpinner = false;
      }
    })
  }
  //#endregion button Proceed

  //#region form submit
  onFormSubmit(accounttransferrequestForm: NgForm, isValid: boolean) {
  }
  //#endregion  form submit

  //#region button back
  btnBack() {
    this.route.navigate(['/interface/subaccounttransferrequestlist']);
    $('#datatableAccountTransferRequestList').DataTable().ajax.reload();
  }
  //#endregion  button back
}
