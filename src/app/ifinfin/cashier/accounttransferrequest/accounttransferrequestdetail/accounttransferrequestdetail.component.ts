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
  private RoleAccessCode = 'R00003210000322A';

  // API Controller
  private APIController: String = 'AccountTransferRequest';
  private APIControllerSysbBranchBank: String = 'SysBranchBank';
  private APIControllerSysBranch: String = 'SysBranch';
  private APIControllerSysCurrencyRate: String = 'SysCurrencyRate';

  // API Function
  private APIRouteForGetRowForTopRate: String = 'ExecSpTopRate';
  private APIRouteForGetRow: String = 'GetRow';
  private APIRouteForInsert: String = 'Insert';
  private APIRouteForUpdate: String = 'Update';
  private APIRouteForLookup: String = 'GetRowsForLookup';
  private APIRouteForPaid: String = 'ExecSpForGetPaid';
  private APIRouteForCancel: String = 'ExecSpForGetCancel';

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

    if (this.param != null) {
      this.isReadOnly = true;

      // call web service
      this.callGetrow();
    } else {
      this.from_orig_amount = 0;
      this.model.from_orig_amount = 0;
      this.from_exch_rate = 1;
      this.model.from_exch_rate = 1;
      this.to_exch_rate = 1;
      this.model.to_exch_rate = 1;
      this.model.transfer_status = 'HOLD';
      this.model.cashier_code = '';
      this.showSpinner = false;
    }
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
          const parsedata = parse.data[0];
          this.valDate = parsedata.transfer_value_date;
          const ngbGetrow = this.getrowNgb(parse.data[0]);

          if (parsedata.transfer_status !== 'HOLD') {
            this.isButton = true;
          } else {
            this.isButton = false;
          }

          if (parsedata.iscashier === '1') {
            this.isFrom = true;
            this.isTo = false;
          } else if (parsedata.iscashier === '2') {
            this.isFrom = false;
            this.isTo = true;
          } else {
            this.isFrom = false;
            this.isTo = false;
          }

          // if (!this.isTo) {
            this.callGetrowTopRate(parsedata.from_currency_code, this.valDate, 'from', false);
          // }

          // if (!this.isFrom) {
            this.callGetrowTopRate(parsedata.to_currency_code, this.valDate, 'to', false);
          // }

          this.from_orig_amount = parsedata.from_orig_amount;
          this.from_exch_rate = parsedata.from_exch_rate;
          this.to_exch_rate = parsedata.to_exch_rate;

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

  //#region  getrow data rate
  callGetrowTopRate(currency: any, date: any, change: any, isfrom: boolean) {
    // param tambahan untuk getrow dynamic
    this.dataTamp = [{
      'p_currency_code': currency,
      'p_date': date,
      'action': 'getResponse'
    }];
    // end param tambahan untuk getrow dynamic

    this.dalservice.ExecSpSys(this.dataTamp, this.APIControllerSysCurrencyRate, this.APIRouteForGetRowForTopRate)
      .subscribe(
        res => {
          const parse = JSON.parse(res);
          const parsedata = this.getrowNgb(parse.data[0]);
          this.base_currency = parsedata.code;

          if (change === 'from') {
            if (parsedata.code === currency) {
              this.isCurrencyFrom = true;
            } else {
              this.isCurrencyFrom = false;
            }

            if (isfrom) {
              this.model.from_exch_rate = parsedata.exch_rate
              this.from_exch_rate = parsedata.exch_rate
              if (this.isTo) {
                this.model.from_orig_amount = (this.model.to_orig_amount * this.to_exch_rate) / parsedata.exch_rate;
              } else {
                this.model.to_orig_amount = (this.from_orig_amount * parsedata.exch_rate) / this.to_exch_rate;
              }
            }
          } else {
            if (parsedata.code === currency) {
              this.isCurrencyTo = true;
            } else {
              this.isCurrencyTo = false;
            }

            if (isfrom) {
              this.model.to_exch_rate = parsedata.exch_rate
              this.to_exch_rate = parsedata.exch_rate
              this.model.to_orig_amount = (this.from_orig_amount * this.from_exch_rate) / parsedata.exch_rate;
            }
          }
        },
        error => {
          console.log('There was an error while Retrieving Data(API) !!!' + error);
        });
  }
  //#endregion  getrow data rate

  //#region form submit
  onFormSubmit(accounttransferrequestForm: NgForm, isValid: boolean) {
    // validation form submit
    if (!isValid) {
      swal({
        title: 'Warning',
        text: 'Please Fill a Mandatory Field OR Format Is Invalid',
        buttonsStyling: false,
        confirmButtonClass: 'btn btn-danger',
        type: 'warning'
      }).catch(swal.noop)
      return;
    } else {
      this.showSpinner = true;
    }

    this.accounttransferrequestdetailData = this.JSToNumberFloats(accounttransferrequestForm);
    if (this.accounttransferrequestdetailData.p_transfer_base_amount === '') {
      this.accounttransferrequestdetailData.p_transfer_base_amount = undefined;
    }
    if (this.accounttransferrequestdetailData.p_transfer_trx_date === '') {
      this.accounttransferrequestdetailData.p_transfer_trx_date = undefined;
    }
    const usersJson: any[] = Array.of(this.accounttransferrequestdetailData);
    if (this.param != null) {
      // call web service
      this.dalservice.Update(usersJson, this.APIController, this.APIRouteForUpdate)
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
      // call web service
      this.dalservice.Insert(usersJson, this.APIController, this.APIRouteForInsert)
        .subscribe(
          res => {
            this.showSpinner = false;
            const parse = JSON.parse(res);
            if (parse.result === 1) {
              this.showNotification('bottom', 'right', 'success');
              this.route.navigate(['/cashier/subaccounttransferrequestlist/accounttransferrequestdetail', parse.code]);
            } else {
              this.swalPopUpMsg(parse.data);
            }
          },
          error => {
            this.showSpinner = false;
            const parse = JSON.parse(error);
            this.swalPopUpMsg(parse.data);
          });
    }
  }
  //#endregion  form submit

  //#region button back
  btnBack() {
    this.route.navigate(['/cashier/subaccounttransferrequestlist']);
    $('#datatableAccountTransferRequestList').DataTable().ajax.reload();
  }
  //#endregion  button back

  //#region trxDate
  trxDate(event: any) {
    this.model.transfer_value_date = event.target.value;
  }
  //#endregion trxDate

  //#region button Paid
  btnPaid() {
    // param tambahan untuk button Paid dynamic
    this.dataRoleTamp = [{
      'p_code': this.param,
      'action': 'default'
    }];
    // param tambahan untuk button Paid dynamic

    swal({
      title: 'Are you sure?',
      type: 'warning',
      showCancelButton: true,
      confirmButtonClass: 'btn btn-success',
      cancelButtonClass: 'btn btn-danger',
      confirmButtonText: this._deleteconf,

      buttonsStyling: false
    }).then((result) => {
      this.showSpinner = true;
      if (result.value) {
        // call web service
        this.dalservice.ExecSp(this.dataRoleTamp, this.APIController, this.APIRouteForPaid)
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
    });
  }
  //#endregion button Paid

  //#region button Cancel
  btnCancel() {
    // param tambahan untuk button Cancel dynamic
    this.dataRoleTamp = [{
      'p_code': this.param,
      'action': 'default'
    }];
    // param tambahan untuk button Cancel dynamic

    swal({
      title: 'Are you sure?',
      type: 'warning',
      showCancelButton: true,
      confirmButtonClass: 'btn btn-success',
      cancelButtonClass: 'btn btn-danger',
      confirmButtonText: this._deleteconf,

      buttonsStyling: false
    }).then((result) => {
      this.showSpinner = true;
      if (result.value) {
        // call web service
        this.dalservice.ExecSp(this.dataRoleTamp, this.APIController, this.APIRouteForCancel)
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
    });
  }
  //#endregion button Cancel

  //#region Lookup Bank
  btnLookupFromBank() {
    this.id = 1;
    $('#datatableLookupBank').DataTable().clear().destroy();
    $('#datatableLookupBank').DataTable({
      'pagingType': 'first_last_numbers',
      'pageLength': 5,
      'processing': true,
      'serverSide': true,
      responsive: true,
      lengthChange: false, // hide lengthmenu
      searching: true, // jika ingin hilangin search box nya maka false
      ajax: (dtParameters: any, callback) => {
        // param tambahan untuk getrows dynamic
        dtParameters.paramTamp = [];
        if (this.isTo) {
          dtParameters.paramTamp.push({
            'p_branch_code': this.model.from_branch_code,
            'p_type': 'B',
            'p_currency_code': this.base_currency,
          });
        } else {
          dtParameters.paramTamp.push({
            'p_branch_code': this.model.from_branch_code,
            'p_type': 'B'
          });
        }
        // end param tambahan untuk getrows dynamic
        this.dalservice.GetrowsSys(dtParameters, this.APIControllerSysbBranchBank, this.APIRouteForLookup).subscribe(resp => {
          const parse = JSON.parse(resp);

          this.lookupbank = parse.data;
          if (parse.data != null) {
            this.lookupbank.numberIndex = dtParameters.start;
          }

          callback({
            draw: parse.draw,
            recordsTotal: parse.recordsTotal,
            recordsFiltered: parse.recordsFiltered,
            data: []
          });
        }, err => console.log('There was an error while retrieving Data(API) !!!' + err));
      },
      columnDefs: [{ orderable: false, width: '5%', targets: [0, 1, 6] }],
      language: {
        search: '_INPUT_',
        searchPlaceholder: 'Search records',
        infoEmpty: '<p style="color:red;" > No Data Available !</p> '
      },
      searchDelay: 800 // pake ini supaya gak bug search
    });
  }
  //#endregion Lookup Bank

  //#region Lookup Bank
  btnLookupToBank() {
    this.id = 2;
    $('#datatableLookupBank').DataTable().clear().destroy();
    $('#datatableLookupBank').DataTable({
      'pagingType': 'first_last_numbers',
      'pageLength': 5,
      'processing': true,
      'serverSide': true,
      responsive: true,
      lengthChange: false, // hide lengthmenu
      searching: true, // jika ingin hilangin search box nya maka false
      ajax: (dtParameters: any, callback) => {
        // param tambahan untuk getrows dynamic
        dtParameters.paramTamp = [];
        dtParameters.paramTamp.push({
          'p_array_data': JSON.stringify(this.listTableLookupDB),
          'p_branch_code': this.model.to_branch_code,
          'p_type': 'B'
        });
        // end param tambahan untuk getrows dynamic
        this.dalservice.GetrowsSys(dtParameters, this.APIControllerSysbBranchBank, this.APIRouteForLookup).subscribe(resp => {
          const parse = JSON.parse(resp);
          this.lookupbank = parse.data;
          if (parse.data != null) {
            this.lookupbank.numberIndex = dtParameters.start;
          }

          callback({
            draw: parse.draw,
            recordsTotal: parse.recordsTotal,
            recordsFiltered: parse.recordsFiltered,
            data: []
          });
        }, err => console.log('There was an error while retrieving Data(API) !!!' + err));
      },
      columnDefs: [{ orderable: false, width: '5%', targets: [0, 1, 6] }],
      language: {
        search: '_INPUT_',
        searchPlaceholder: 'Search records',
        infoEmpty: '<p style="color:red;" > No Data Available !</p> '
      },
      searchDelay: 800 // pake ini supaya gak bug search
    });
  }
  //#endregion Lookup Bank

  //#region btn select lookup bank
  btnSelectRowBank(bank_code: String, bank_name: string, transfer_currency_code: string, gl_link_code: string) {
    if (this.id === 1) {
      this.model.from_branch_bank_code = bank_code;
      this.model.from_branch_bank_name = bank_name;
      this.model.from_gl_link_code = gl_link_code;
      this.model.from_currency_code = transfer_currency_code;
      if (this.model.transfer_value_date != null) {
        this.callGetrowTopRate(this.model.from_currency_code, this.valDate, 'from', true);
      }

      if (!this.isTo) {
        this.model.to_branch_bank_code = '';
        this.model.to_branch_bank_name = '';
        this.model.to_currency_code = '';
        this.model.to_gl_link_code = '';
        this.listTableLookupDB = [];
        this.listTableLookupDB.push({
          'bank_code': bank_code
        });
      }
    } else {
      this.model.to_branch_bank_code = bank_code;
      this.model.to_branch_bank_name = bank_name;
      this.model.to_currency_code = transfer_currency_code;
      this.model.to_gl_link_code = gl_link_code;
      if (this.model.transfer_value_date != null) {
        this.callGetrowTopRate(this.model.to_currency_code, this.valDate, 'to', true);
      }

    }
    $('#lookupModalBank').modal('hide');
  }
  //#endregion  btn select lookup bank

  //#region Branch Lookup
  btnLookupFromSysBranch() {
    this.id = 1;
    $('#datatableLookupSysBranch').DataTable().clear().destroy();
    $('#datatableLookupSysBranch').DataTable({
      'pagingType': 'first_last_numbers',
      'pageLength': 5,
      'processing': true,
      'serverSide': true,
      responsive: true,
      lengthChange: false, // hide lengthmenu
      searching: true, // jika ingin hilangin search box nya maka false
      ajax: (dtParameters: any, callback) => {
        // param tambahan untuk getrows dynamic
        dtParameters.paramTamp = [];
        dtParameters.paramTamp.push({
          'default': ''
        });
        // end param tambahan untuk getrows dynamic
        this.dalservice.GetrowsSys(dtParameters, this.APIControllerSysBranch, this.APIRouteForLookup).subscribe(resp => {
          const parse = JSON.parse(resp);
          this.lookupbranch = parse.data;
          if (parse.data != null) {
            this.lookupbranch.numberIndex = dtParameters.start;
          }

          callback({
            draw: parse.draw,
            recordsTotal: parse.recordsTotal,
            recordsFiltered: parse.recordsFiltered,
            data: []
          });
        }, err => console.log('There was an error while retrieving Data(API) !!!' + err));
      },
      columnDefs: [{ orderable: false, width: '5%', targets: [0, 1, 4] }], // for disabled coloumn
      language: {
        search: '_INPUT_',
        searchPlaceholder: 'Search records',
        infoEmpty: '<p style="color:red;" > No Data Available !</p> '
      },
      searchDelay: 800 // pake ini supaya gak bug search
    });
  }
  //#endregion lookup branch

  //#region Branch Lookup
  btnLookupToSysBranch() {
    this.id = 2;
    $('#datatableLookupSysBranch').DataTable().clear().destroy();
    $('#datatableLookupSysBranch').DataTable({
      'pagingType': 'first_last_numbers',
      'pageLength': 5,
      'processing': true,
      'serverSide': true,
      responsive: true,
      lengthChange: false, // hide lengthmenu
      searching: true, // jika ingin hilangin search box nya maka false
      ajax: (dtParameters: any, callback) => {
        // param tambahan untuk getrows dynamic
        dtParameters.paramTamp = [];
        dtParameters.paramTamp.push({
          // 'p_array_data': JSON.stringify(this.listTableLookupDB),
          'default': ''
        });
        // end param tambahan untuk getrows dynamic
        this.dalservice.GetrowsSys(dtParameters, this.APIControllerSysBranch, this.APIRouteForLookup).subscribe(resp => {
          const parse = JSON.parse(resp);
          this.lookupbranch = parse.data;
          if (parse.data != null) {
            this.lookupbranch.numberIndex = dtParameters.start;
          }

          callback({
            draw: parse.draw,
            recordsTotal: parse.recordsTotal,
            recordsFiltered: parse.recordsFiltered,
            data: []
          });
        }, err => console.log('There was an error while retrieving Data(API) !!!' + err));
      },
      columnDefs: [{ orderable: false, width: '5%', targets: [0, 1, 4] }], // for disabled coloumn
      language: {
        search: '_INPUT_',
        searchPlaceholder: 'Search records',
        infoEmpty: '<p style="color:red;" > No Data Available !</p> '
      },
      searchDelay: 800 // pake ini supaya gak bug search
    });
  }
  //#endregion lookup branch

  //#region btn select lookup branch
  btnSelectRowSysBranch(branch_code: String, branch_name: string) {
    if (this.id === 1) {
      this.model.from_branch_code = branch_code;
      this.model.from_branch_name = branch_name;
      this.model.to_branch_code = '';
      this.model.to_branch_name = '';

      this.model.from_branch_bank_code = '';
      this.model.from_branch_bank_name = '';
      this.model.from_gl_link_code = '';
      this.model.from_currency_code = '';
      this.model.to_branch_bank_code = '';
      this.model.to_branch_bank_name = '';
      this.model.to_currency_code = '';
      this.model.to_gl_link_code = '';
    } else {
      this.model.to_branch_code = branch_code;
      this.model.to_branch_name = branch_name;
    }
    $('#lookupModalSysBranch').modal('hide');
  }
  //#endregion  btn select lookup branch

  //#region origAmount
  origAmount(event: any) {
    this.model.to_orig_amount = (event.target.value * this.model.from_exch_rate) / this.model.to_exch_rate;
    this.from_orig_amount = event.target.value;
  }
  //#endregion origAmount

  //#region valueDate
  valueDate(event: any) {
    this.model.transfer_value_date = event;
    this.valDate = this.dateFormatList(event.singleDate.formatted);

    if (this.model.from_currency_code !== '') {
        this.callGetrowTopRate(this.model.from_currency_code, this.valDate, 'from', true);
    }
    if (this.model.to_currency_code !== '') {
        this.callGetrowTopRate(this.model.to_currency_code, this.valDate, 'to', true);
    }

  }
  //#endregion valueDate

  //#region exchRate
  exchRate(event: any, by: any) {
    if (by === 'from') {
      if (this.isTo) {
        this.model.from_orig_amount = (this.model.to_orig_amount * this.to_exch_rate) / event.target.value;
      } else {
        this.model.to_orig_amount = (this.from_orig_amount * event.target.value) / this.to_exch_rate;
      }
      this.from_exch_rate = event.target.value;
    } else {
      this.model.to_orig_amount = (this.from_orig_amount * this.from_exch_rate) / event.target.value;
      this.to_exch_rate = event.target.value;
    }
  }
  //#endregion exchRate
}
