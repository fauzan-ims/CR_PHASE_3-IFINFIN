import { OnInit, ViewChild, Component, ElementRef } from '@angular/core';
import 'rxjs/add/operator/map'
import { Router } from '@angular/router';
import { DataTableDirective } from 'angular-datatables';
import { BaseComponent } from '../../../../../base.component';
import { DALService } from '../../../../../DALservice.service';
import swal from 'sweetalert2';
import { DatePipe, Location } from '@angular/common';
import { NgForm } from '@angular/forms';

@Component({
  moduleId: module.id,
  selector: 'app-root',
  templateUrl: './paymentrequestlist.component.html'
})

export class PaymentrequestlistComponent extends BaseComponent implements OnInit {
  // variable
  public listrequest: any = [];
  public remark: any;
  public branch_code: String;
  public branchCode: String;
  public branch_name: String;
  public from_branch_code: String;
  public from_branch_name: String;
  public listpaymentrequest: any = [];
  public lookupbranch: any = [];
  public tampStatus: String;
  public tempSourceType: String;
  private click_by: any;
  private exch_rate: any;
  private dataTamp: any = [];
  private dataTempCancelPayment: any = [];
  private dataTamps: any = [];
  public bank_gl_link_code: String;
  public branch_bank_code: String;
  public branch_bank_name: String;
  public branch_bank_account_no: String;
  public branch_bank_account_name: String;
  public currency_code: String;
  public cashier_currency_code: String;
  public lookupbank: any = [];
  private dataTempDefaultValue: any = [];
  // (+) Ari 2023-11-03 ket : get max limit, outstanding, and current payment transaction
  public transaction_limit: any = 0;
  public outstanding_limit: any = 0;
  public current_total_transaction: any = 0;
  public total_selected_amount: any = 0;
  private dataTempDefaultLimit: any = [];
  // (+) Ari 2023-11-03
  datePipe: DatePipe = new DatePipe('en-US');


  private RoleAccessCode = 'R00003100000311A';

  // API Controller
  private APIController: String = 'PaymentRequest';
  private APIControllerSysBranch: String = 'SysBranch';
  private APIControllerSysCurrencyRate: String = 'SysCurrencyRate';
  private APIControllerSysBranchBank: String = 'SysBranchBank';
  private APIControllerCashierMain: String = 'CashierMain';
  private APIControllerSysGlobalParam: String = 'SysGlobalParam';

  // API Function
  private APIRouteForLookup: String = 'GetRowsForLookup';
  private APIRouteForGetProceed: String = 'ExecSpForGetProceed';
  private APIRouteForCancel: String = 'ExecSpForGetCancel';
  private APIRouteForGetPaymentSource: String = 'ExecSpForGetPaymentSource';
  private APIRouteForGetRowForTopRate: String = 'ExecSpTopRate';
  private APIRouteForGetRows: String = 'GetRows';
  private APIRouteForGetRowByEmployee: String = 'GetRowByEmployeeCode';
  private APIRouteForGetForGeneral: String = 'GetRowForGeneral';
  private APIRouteForGetLimit: String = 'GetrowForLimit';

  // form 2 way binding
  model: any = {};

  // spinner
  showSpinner: Boolean = false;
  // end

  // ini buat datatables
  @ViewChild(DataTableDirective)
  dtElement: DataTableDirective;
  dtOptions: DataTables.Settings = {};

  // checklist
  public selectedAll: any;
  public checkedList: any = [];

  constructor(private dalservice: DALService,
    public route: Router,
    private _location: Location,
    private _elementRef: ElementRef,
    public datepipe: DatePipe) { super(); }

  ngOnInit() {
    this.callGetRole(this.userId, this._elementRef, this.dalservice, this.RoleAccessCode, this.route);
    this.compoSide(this._location, this._elementRef, this.route);

    this.tampStatus = 'HOLD';
    this.tempSourceType = 'ALL';
    this.from_branch_code = 'ALL';
    this.branch_code = '';
    this.getSourceType();
    this.callGetGlobalParam();
    this.loadData();
    this.callGetrow();
    this.callGetrowLimit();
    this.showSpinner = false;
  }

  //#region load all data
  loadData() {
    this.dtOptions = {
      pagingType: 'full_numbers',
      responsive: true,
      serverSide: true,
      processing: true,
      paging: true,
      'lengthMenu': [
        [10, 25, 50, 100],
        [10, 25, 50, 100]
      ],
      ajax: (dtParameters: any, callback) => {
        //  param tambahan untuk getrows dynamic
        dtParameters.paramTamp = [];
        dtParameters.paramTamp.push({
          'p_branch_code': this.branch_code,
          'p_payment_branch_code': this.from_branch_code,
          'p_payment_status': this.tampStatus,
          'p_payment_source': this.tempSourceType
        });
        // param tambahan untuk getrows dynamic
        this.dalservice.Getrows(dtParameters, this.APIController, this.APIRouteForGetRows).subscribe(resp => {
          const parse = JSON.parse(resp)

          this.listpaymentrequest = parse.data;
          if (parse.data != null) {
            this.exch_rate = [];
            for (let i = 0; i < parse.data.length; i++) {
              this.callGetrowTopRate(parse.data[i].payment_currency_code, parse.data[i].date_rate, parse.data[i].code)
              // (+) Ari 2023-11-03 ket : get max limit, outstanding, and current payment transaction
              // if (this.branch_bank_name === 'MUFG') {
              //   this.transaction_limit = parse.data[i].transaction_limit;
              //   this.outstanding_limit = parse.data[i].outstanding_limit;
              // }
              // else {
              //   this.transaction_limit = 0;
              //   this.outstanding_limit = 0;
              //   this.current_total_transaction = 0;
              // }
              // (+) Ari 2023-11-03
            }

            this.listpaymentrequest.numberIndex = dtParameters.start;
          }

          // if use checkAll use this
          $('#checkalltable').prop('checked', false);
          // end checkall

          callback({
            draw: parse.draw,
            recordsTotal: parse.recordsTotal,
            recordsFiltered: parse.recordsFiltered,
            data: []
          });
        }, err => console.log('There was an error while retrieving Data(API) !!!' + err));
      },
      columnDefs: [{ orderable: false, width: '5%', targets: [0, 1] }], // for disabled coloumn
      order: [[5, 'desc']],
      language: {
        search: '_INPUT_',
        searchPlaceholder: 'Search records',
        infoEmpty: '<p style="color:red;" > No Data Available !</p> '
      },
      searchDelay: 800 // pake ini supaya gak bug search
    }
  }
  //#endregion load all data

  //#region  getrow data
  callGetrow() {
    // param tambahan untuk getrow dynamic
    this.dataTamp = [{
      'p_employee_code': this.userId,
    }];
    // end param tambahan untuk getrow dynamic
    this.dalservice.Getrow(this.dataTamp, this.APIControllerCashierMain, this.APIRouteForGetRowByEmployee)
      .subscribe(
        res => {
          const parse = JSON.parse(res);
          const parsedata = this.getrowNgb(parse.data[0]);

          this.branchCode = parsedata.branch_code;

        },
        error => {
          console.log('There was an error while Retrieving Data(API) !!!' + error);
        });
  }
  //#endregion  getrow data

  //#region getSourceType
  getSourceType() {
    let th = this;
    var i;
    (function () { // don't leak
      th.dataTamp = [{
        'action': 'getResponse'
      }];
      th.dalservice.ExecSp(th.dataTamp, th.APIController, th.APIRouteForGetPaymentSource)
        .subscribe(
          res => {
            const parse = JSON.parse(res);
            if (parse.result === 1) {
              if (parse.data.length > 0) {
                var elm = document.getElementById('sourceType'), // get the select
                  df = document.createDocumentFragment(); // create a document fragment to hold the options while we create them
                for (i = 0; i <= parse.data.length; i++) {
                  var option = document.createElement('option'); // create the option element
                  option.value = parse.data[i].payment_source; // set the value property
                  option.appendChild(document.createTextNode(parse.data[i].payment_source)); // set the textContent in a safe way.
                  df.appendChild(option); // append the option to the document fragment 
                  elm.appendChild(df); // append the document fragment to the DOM. this is the better way rather than setting innerHTML a bunch of times (or even once with a long string)
                }
              }
            } else {
              th.swalPopUpMsg(parse.data);
              th.showSpinner = false;
            }
          },
          error => {
            const parse = JSON.parse(error);
            th.swalPopUpMsg(parse.data);
            th.showSpinner = false;
          });
    }());
  }
  //#endregion getSourceType

  //#region form submit
  onFormSubmitPayment(CancelPaymentForm: NgForm, isValid: boolean) {
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
    this.dataTamp = CancelPaymentForm;
    this.dataTempCancelPayment = this.dataTamp.p_payment_remarks

    swal({
      title: 'Are you sure?',
      type: 'warning',
      showCancelButton: true,
      confirmButtonClass: 'btn btn-success',
      cancelButtonClass: 'btn btn-danger',
      confirmButtonText: this._deleteconf,
      allowOutsideClick: false,
      buttonsStyling: false
    }).then((result) => {
      this.showSpinner = true;
      if (result.value) {
        let th = this;
        var i = 0;
        (function loopDeliveryRequestProceed() {
          if (i < th.checkedList.length) {
            th.dataTamp = [{
              'p_code': th.checkedList[i],
              'p_payment_remarks': th.dataTempCancelPayment,
              'action': ''
            }];
            th.dalservice.ExecSp(th.dataTamp, th.APIController, th.APIRouteForCancel)
              .subscribe(
                res => {
                  const parse = JSON.parse(res);
                  if (parse.result === 1) {
                    if (th.checkedList.length == i + 1) {
                      th.callGetrowLimit();
                      th.showNotification('bottom', 'right', 'success');
                      $('#datatablePaymentRequestList').DataTable().ajax.reload();
                      $('#lookupCancelPayment').modal('hide');
                      th.btnLookupClose()
                      th.showSpinner = false;
                    } else {
                      i++;
                      loopDeliveryRequestProceed();
                    }
                  } else {
                    th.callGetrowLimit();
                    th.swalPopUpMsg(parse.data);
                    th.showSpinner = false;
                  }
                },
                error => {
                  const parse = JSON.parse(error);
                  th.swalPopUpMsg(parse.data);
                  th.showSpinner = false;
                });
          }
        })();
      } else {
        this.showSpinner = false;
      }
    });
  }
  //#endregion form submit

  //#region btnCancelLookup
  btnCancelLookup() {
    this.btnLookupClose()
    this.checkedList = [];
    for (let i = 0; i < this.listpaymentrequest.length; i++) {
      if (this.listpaymentrequest[i].selected) {
        this.checkedList.push(this.listpaymentrequest[i].code,);
      }
    }

    // jika tidak di checklist
    if (this.checkedList.length <= 0) {
      swal({
        title: this._listdialogconf,
        buttonsStyling: false,
        allowOutsideClick: false,
        confirmButtonClass: 'btn btn-danger'
      }).catch(swal.noop)
      return
    } else {
      this.dataTamp = [];
    }
  }
  //#endregion btnCancelLookup

  //#region getrow data rate
  callGetrowTopRate(currency: any, date: Date, code: any) {
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
          const parsedata = parse.data[0];
          this.exch_rate.push({
            'rate': parsedata.exch_rate,
            'code': code
          })

          // this.exch_rate.splice(index, 0, {
          //   'rate': parsedata.exch_rate
          // })
        },
        error => {
          console.log('There was an error while Retrieving Data(API) !!!' + error);
        });
  }
  //#endregion  getrow data rate

  //#region getGlobalParam
  callGetGlobalParam() {

    this.dataTempDefaultValue = [{
      'p_type': "DEFAULT",
      'action': "getResponse"
    }];

    this.dalservice.ExecSp(this.dataTempDefaultValue, this.APIControllerSysGlobalParam, this.APIRouteForGetForGeneral)
      .subscribe(
        res => {
          const parse = JSON.parse(res);
          const parsedata = this.getrowNgb(parse.data);

          for (let i = 0; i < parsedata.length; i++) {
            if (parsedata[i].code === 'HO') {
              this.branch_code = parsedata[i].value,
                this.branch_name = parsedata[i].description
            } else if (parsedata[i].code === 'BANKCODE') {
              this.branch_bank_code = parsedata[i].value
            } else if (parsedata[i].code === 'BANKNO') {
              this.branch_bank_account_no = parsedata[i].value
            } else if (parsedata[i].code === 'BANK') {
              this.branch_bank_name = parsedata[i].value
            } else if (parsedata[i].code === 'BANKNAME') {
              this.branch_bank_account_name = parsedata[i].value
            } else if (parsedata[i].code === 'BANKCRY') {
              this.cashier_currency_code = parsedata[i].value
            } else if (parsedata[i].code === 'BANKGLLINK') {
              this.bank_gl_link_code = parsedata[i].value
            }
          } setTimeout(() => {
            $('#datatablePaymentRequestList').DataTable().ajax.reload();
          }, 200);
          this.showSpinner = false;
        },
        error => {
          this.showSpinner = false;
          const parse = JSON.parse(error);
          this.swalPopUpMsg(parse.data);
        });
  }
  //#endregion getGlobalParam

  //#region ddl PageStatus
  sourceType(event: any) {
    this.tempSourceType = event.target.value;
    $('#datatablePaymentRequestList').DataTable().ajax.reload();
  }
  //#endregion ddl PageStatus

  //#region ddl PageStatus
  PageStatus(event: any) {
    this.tampStatus = event.target.value;
    $('#datatablePaymentRequestList').DataTable().ajax.reload();
  }
  //#endregion ddl PageStatus

  //#region button Proceed
  btnProceed() {
    var FlagDate = new Date();
    let latest_date = this.datepipe.transform(FlagDate, 'yyyy-MM-dd HH:mm:ss');

    this.checkedList = [];
    for (let i = 0; i < this.listpaymentrequest.length; i++) {
      if (this.listpaymentrequest[i].selected) {
        for (let a = 0; a < this.exch_rate.length; a++) {
          if (this.exch_rate[a].code == this.listpaymentrequest[i].code) {
            this.checkedList.push({
              'code': this.listpaymentrequest[i].code,
              'rate': this.exch_rate[a].rate,
            });
          }

        }
      }
    }

    // (+) Ari 2023-11-03 ket : validasi jika total transaksi lebih besar dari payment limit
    if (this.total_selected_amount > this.transaction_limit) {
      swal({
        title: 'Transaction Amount cannot bigger than Payment limit',
        buttonsStyling: false,
        confirmButtonClass: 'btn btn-danger'
      }).catch(swal.noop)
      return
    }
    else if (this.total_selected_amount > this.outstanding_limit) {
      swal({
        title: 'Transaction Amount cannot bigger than Outstanding limit',
        buttonsStyling: false,
        confirmButtonClass: 'btn btn-danger'
      }).catch(swal.noop)
      return
    }
    // (+) Ari 2023-11-03

    // jika tidak di checklist
    if (this.checkedList.length === 0) {
      swal({
        title: this._listdialogconf,
        buttonsStyling: false,
        confirmButtonClass: 'btn btn-danger'
      }).catch(swal.noop)
      return
    }
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
        let th = this;
        var i = 0;
        (function loopDeliveryRequestProceed() {
          if (i < th.checkedList.length) {
            th.dataTamp = [{
              'p_code': th.checkedList[i].code,
              'p_rate': th.checkedList[i].rate,
              'p_branch_bank_code': th.branch_bank_code,
              'p_branch_bank_name': th.branch_bank_name,
              'p_branch_bank_account_no': th.branch_bank_account_no,
              'p_branch_bank_account_name': th.branch_bank_account_name,
              'p_payment_orig_currency_code': th.cashier_currency_code,
              'p_bank_gl_link_code': th.bank_gl_link_code,
              'p_process_date': latest_date,
              'action': ''
            }];

            th.dalservice.ExecSp(th.dataTamp, th.APIController, th.APIRouteForGetProceed)
              .subscribe(
                res => {
                  const parse = JSON.parse(res);
                  if (parse.result === 1) {
                    if (th.checkedList.length == i + 1) {
                      th.callGetrowLimit();
                      th.showNotification('bottom', 'right', 'success');
                      // th.btnClearBank()
                      $('#datatablePaymentRequestList').DataTable().ajax.reload();
                      th.showSpinner = false;
                    } else {
                      i++;
                      loopDeliveryRequestProceed();
                    }
                  } else {
                    th.callGetrowLimit();
                    th.swalPopUpMsg(parse.data);
                    th.showSpinner = false;
                  }
                },
                error => {
                  const parse = JSON.parse(error);
                  th.swalPopUpMsg(parse.data);
                  th.showSpinner = false;
                });
          }
        })();
      } else {
        this.showSpinner = false;
      }
    });
  }

  selectAllTable() {
    this.total_selected_amount = 0;
    for (let i = 0; i < this.listpaymentrequest.length; i++) {
      this.listpaymentrequest[i].selected = this.selectedAll;

      // (+) Ari 2023-11-03 ket : get total amount selected
      if (this.listpaymentrequest[i].selected) {
        this.total_selected_amount += this.listpaymentrequest[i].payment_amount
      }
    }
    this.current_total_transaction = this.total_selected_amount;
  }

  checkIfAllTableSelected() {
    this.total_selected_amount = 0;
    this.selectedAll = this.listpaymentrequest.every(function (item: any) {
      return item.selected === true;
    })

    // (+) Ari 2023-11-03 ket : get total amount selected
    for (let i = 0; i < this.listpaymentrequest.length; i++) {
      if (this.listpaymentrequest[i].selected) {
        this.total_selected_amount += this.listpaymentrequest[i].payment_amount
      }
    }
    this.current_total_transaction = this.total_selected_amount;
  }
  //#endregion button Proceed

  //#region lookup branch
  btnLookupSysBranch(click: String) {
    this.click_by = [];
    this.click_by = click;
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
        // param tambahan untuk getrows dynamic
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
      columnDefs: [{ orderable: false, width: '5%', targets: [0, 1, 4] }],
      language: {
        search: '_INPUT_',
        searchPlaceholder: 'Search records',
        infoEmpty: '<p style="color:red;" > No Data Available !</p> '
      },
      searchDelay: 800 // pake ini supaya gak bug search
    });
    // } , 1000);
  }
  btnSelectRowSysBranch(branch_code: String, branch_name: String) {
    if (this.click_by === '') {
      this.branch_code = branch_code;
      this.branch_name = branch_name;
    } else {
      this.from_branch_code = branch_code;
      this.from_branch_name = branch_name;
    }

    $('#lookupModalSysBranch').modal('hide');
    $('#datatablePaymentRequestList').DataTable().ajax.reload();
  }

  btnClearSysBranch() {
    this.from_branch_code = 'ALL';
    this.from_branch_name = '';
    $('#lookupModalSysBranch').modal('hide');
    $('#datatablePaymentRequestList').DataTable().ajax.reload();
  }

  btnClearBranch() {
    this.branch_code = '';
    this.branch_name = '';
    $('#lookupModalSysBranch').modal('hide');
    $('#datatablePaymentRequestList').DataTable().ajax.reload();
  }
  //#endregion lookup branch

  //#region btn lookup close
  btnLookupClose() {
    this.remark = null
  }
  //#endregion btn lookup close

  //#region Lookup Bank
  btnLookupBank() {
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
          'p_branch_code': this.branchCode,
          'p_type': '',
          'p_default_flag': '1'
        });
        // end param tambahan untuk getrows dynamic

        this.dalservice.GetrowsSys(dtParameters, this.APIControllerSysBranchBank, this.APIRouteForLookup).subscribe(resp => {
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

  btnSelectRowBank(bank_code: String, description: string, cashier_currency_code: string, gl_link_code: string, branch_bank_account_no: String) {
    this.branch_bank_code = bank_code;
    this.branch_bank_name = description;
    this.branch_bank_account_no = branch_bank_account_no;
    this.cashier_currency_code = cashier_currency_code;
    this.bank_gl_link_code = gl_link_code;
    $('#lookupModalBank').modal('hide');
  }

  btnClearBank() {
    this.branch_bank_code = undefined;
    this.branch_bank_name = undefined;
    this.branch_bank_account_no = undefined;
    this.branch_bank_account_name = undefined;
    this.cashier_currency_code = undefined;
    this.bank_gl_link_code = undefined;
    $('#lookupModalBank').modal('hide');
  }
  //#endregion Lookup Bank

  //#region limit
  callGetrowLimit() {

    this.dataTempDefaultLimit = [{
      'p_code': 'MBTD'
    }]

    this.dalservice.ExecSp(this.dataTempDefaultLimit, this.APIControllerSysGlobalParam, this.APIRouteForGetLimit).subscribe(
      res => {
        const parse = JSON.parse(res);
        const parsedata = this.getrowNgb(parse.data);
        console.log(parsedata)
        this.transaction_limit = parse.data[0].transaction_limit;
        this.outstanding_limit = parse.data[0].outstanding_limit;

        // for (let i = 0; i < parse.data.length; i++) {
        //   if (this.branch_bank_name === 'MUFG') { 
        //     this.transaction_limit = parse.data[i].transaction_limit;
        //     this.outstanding_limit = parse.data[i].outstanding_limit;
        //   }
        //   else {
        //     this.transaction_limit = 0;
        //     this.outstanding_limit = 0;
        //     this.current_total_transaction = 0;
        //   }
        // }
        this.showSpinner = false;

      },
      error => {
        this.showSpinner = false;
        const parse = JSON.parse(error);
        this.swalPopUpMsg(parse.data);
      });
  }
  //#endregion limit
}
