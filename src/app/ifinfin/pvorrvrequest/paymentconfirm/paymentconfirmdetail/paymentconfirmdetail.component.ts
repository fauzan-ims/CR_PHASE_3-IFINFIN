import { Component, OnInit, ElementRef, ViewChild, AfterViewInit } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { NgForm } from '@angular/forms';
import swal from 'sweetalert2';
import { DataTableDirective } from 'angular-datatables';
import { BaseComponent } from '../../../../../base.component';
import { DALService } from '../../../../../DALservice.service';
import { DatePipe } from '@angular/common';

@Component({
  moduleId: module.id,
  selector: 'app-root',
  templateUrl: './paymentconfirmdetail.component.html'
})

export class PaymentconfirmdetailComponent extends BaseComponent implements OnInit {
  // get param from url
  param = this.getRouteparam.snapshot.paramMap.get('id');

  // variable
  public NumberOnlyPattern = this._numberonlyformat;
  public listpaymentconfirmdetaildetail: any = [];
  public paymentconfirmdetailData: any = [];
  public isReadOnly: Boolean = false;
  public isButton: Boolean = false;
  public isHide: Boolean = false;
  public isCurrency: Boolean = false;
  public lookupbranch: any = [];
  public lookupJurnalGlLink: any = [];
  public lookupbank: any = [];
  public lookuppdccode: any = [];
  public payment_orig_amount: any = [];
  public payment_exch_rate: any = [];
  public payment_base_amount: any = [];
  private valDate: any;
  private dataRoleTamp: any = [];
  private setStyle: any = [];
  private dataTamp: any = [];
  private dataTempDefaultValue: any = [];
  public branch_bank_code_param: String;
  public lookupapproval: any = []; // (+) Ari 2023-09-07 ket : add view approval for reversal

  //role code
  private RoleAccessCode = 'R00003110000312A';

  // API Controller
  private APIController: String = 'PaymentTransaction';
  private APIControllerPaymentTransactionDetail: String = 'PaymentTransactionDetail';
  private APIControllerPdcMain: String = 'PdcMain';
  private APIControllerSysBranchBank: String = 'SysBranchBank';
  private APIControllerJurnalGlLink: String = 'JournalGlLink';
  private APIControllerSysCurrencyRate: String = 'SysCurrencyRate';
  private APIControllerUploadDownloadSFTP: String = 'SFTPUploadAndDownload';
  private APIControllerSysGlobalParam: String = 'SysGlobalParam';
  private APIControllerApprovalSchedule: String = 'ApprovalSchedule'; // (+) Ari 2023-09-07 ket : add view approval for reversal

  // API Function
  private APIRouteForLookupGlLink: String = 'GetRowsForLookupByIsBank';
  private APIRouteForLookup: String = 'GetRowsForLookup';
  private APIRouteForGetRows: String = 'GetRows';
  private APIRouteForGetRow: String = 'GetRow';
  private APIRouteForGetRowForTopRate: String = 'ExecSpTopRate';
  private APIRouteForUpdate: String = 'Update';
  private APIRouteForDelete: String = 'Delete';
  private APIRouteForReversalRequest: String = 'ExecSpForGetReverseRequest';
  private APIRouteForPaid: String = 'ExecSpForGetPaid';
  private APIRouteForGetForGeneral: String = 'GetRowForGeneral';
  private APIRouteForCancel: String = 'ExecSpForGetCancel';
  private APIRouteForProceed: String = 'ExecSpForGetProceed';
  private APIRouteForGenerateTextFileMUFG: String = 'ExecSpForGenerateTextFileMUFG';
  private APIRouteForGenerateTextFileMUFGWithoutFTP: String = 'ExecSpForGenerateTextFileMUFGWithoutFTP';
  private APIRouteForGenerateTextFile: String = 'ExecSpForGenerateTextFile'
  private APIRouteForUploadSFTP: String = 'UploadSftp';

  // form 2 way binding
  model: any = {};

  // checklist
  public selectedAllTable: any;
  private checkedList: any = [];

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
      this.callGetGlobalParam();
      // call web service
      this.loadData();
      this.callGetrow();
    } else {
      this.payment_orig_amount = 0;
      this.payment_exch_rate = 1;
      this.payment_base_amount = 0;
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
            if (parsedata[i].code === 'BANKCODE') {
              this.branch_bank_code_param = parsedata[i].value
            }
          } setTimeout(() => {
            $('#datatablesPaymentConfirmDetail').DataTable().ajax.reload();
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
        // param tambahan untuk getrows dynamic
        dtParameters.paramTamp = [];
        dtParameters.paramTamp.push({
          'p_payment_transaction_code': this.param
        });
        // end param tambahan untuk getrows dynamic
        this.dalservice.Getrows(dtParameters, this.APIControllerPaymentTransactionDetail, this.APIRouteForGetRows).subscribe(resp => {
          const parse = JSON.parse(resp)
          this.listpaymentconfirmdetaildetail = parse.data;
          if (parse.data != null) {
            this.listpaymentconfirmdetaildetail.numberIndex = dtParameters.start;
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
      columnDefs: [{ orderable: false, width: '5%', targets: [0, 1, 7] }], // for disabled coloumn
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
      'p_code': this.param,
    }];
    // end param tambahan untuk getrow dynamic
    this.dalservice.Getrow(this.dataTamp, this.APIController, this.APIRouteForGetRow)
      .subscribe(
        res => {
          const parse = JSON.parse(res);
          const parsedata = parse.data[0];
          this.valDate = parsedata.payment_value_date;
          const ngbGetrow = this.getrowNgb(parse.data[0]);

          if (parsedata.payment_status !== 'HOLD') {
            this.isButton = true;
          } else {
            this.isButton = false;
          }

          if (parsedata.payment_status == 'HOLD' || parsedata.payment_status == 'CANCEL') {
            this.isHide = true;
          } else {
            this.isHide = false;
          }

          this.payment_orig_amount = parsedata.payment_orig_amount;
          this.payment_exch_rate = parsedata.payment_exch_rate;
          this.payment_base_amount = parsedata.payment_base_amount;


          // mapper dbtoui
          Object.assign(this.model, ngbGetrow);
          // end mapper dbtoui

          this.callGetrowTopRate(this.model.payment_orig_currency_code, this.valDate, false);
          this.showSpinner = false;
        },
        error => {
          console.log('There was an error while Retrieving Data(API) !!!' + error);
        });
  }
  //#endregion  getrow data

  //#region  getrow data rate
  callGetrowTopRate(currency: any, date: any, change: boolean) {
    // param tambahan untuk getrow dynamic
    this.dataTamp = [this.JSToNumberFloats({
      'p_currency_code': currency,
      'p_date': date,
      'action': 'getResponse'
    })];
    // end param tambahan untuk getrow dynamic
    this.dalservice.ExecSpSys(this.dataTamp, this.APIControllerSysCurrencyRate, this.APIRouteForGetRowForTopRate)
      .subscribe(
        res => {
          const parse = JSON.parse(res);
          const parsedata = this.getrowNgb(parse.data[0]);

          if (parsedata.code === currency) {
            this.isCurrency = true;
          } else {
            this.isCurrency = false;
          }

          if (change) {
            this.model.payment_exch_rate = parsedata.exch_rate
            this.payment_exch_rate = parsedata.exch_rate
            this.model.payment_orig_amount = (this.model.payment_base_amount / parsedata.exch_rate);
          }
        },
        error => {
          console.log('There was an error while Retrieving Data(API) !!!' + error);
        });
  }
  //#endregion  getrow data rate

  //#region form submit
  onFormSubmit(paymentconfirmdetailForm: NgForm, isValid: boolean) {
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

    this.paymentconfirmdetailData = this.JSToNumberFloats(paymentconfirmdetailForm);
    const usersJson: any[] = Array.of(this.paymentconfirmdetailData);
    // call web service
    this.dalservice.Update(usersJson, this.APIController, this.APIRouteForUpdate)
      .subscribe(
        res => {
          this.showSpinner = false;
          const parse = JSON.parse(res);
          if (parse.result === 1) {
            this.showNotification('bottom', 'right', 'success');
            this.callGetrow();
            $('#datatablesPaymentConfirmDetail').DataTable().ajax.reload();
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
  //#endregion  form submit

  //#region origAmount
  origAmount(event: any) {
    this.payment_orig_amount = event.target.value;
    this.model.payment_base_amount = this.payment_orig_amount * this.payment_exch_rate;
  }
  //#endregion origAmount

  //#region exchRate
  exchRate(event: any) {
    // this.model.payment_base_amount = this.payment_exch_rate * this.payment_orig_amount;
    this.model.payment_orig_amount = this.payment_base_amount / event;
    this.payment_exch_rate = event;
  }
  //#endregion exchRate

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
          'p_branch_code': this.model.branch_code,
          'p_type': 'B'
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

  btnSelectRowBank(bank_code: String, bank_name: string, payment_orig_currency_code: string, gl_link_code: string, bank_account_no: string) {
    this.model.branch_bank_code = bank_code;
    this.model.branch_bank_name = bank_name;
    this.model.payment_orig_currency_code = payment_orig_currency_code;
    this.model.bank_gl_link_code = gl_link_code;
    this.model.branch_bank_account_no = bank_account_no;
    if (this.model.payment_value_date != null) {
      this.callGetrowTopRate(this.model.payment_orig_currency_code, this.valDate, true);
    }
    $('#lookupModalBank').modal('hide');
  }
  //#endregion Lookup Bank

  valueDate(event: any) {
    this.model.payment_value_date = event;
    this.valDate = event;
    if (this.model.payment_orig_currency_code !== '') {
      this.callGetrowTopRate(this.model.payment_orig_currency_code, this.valDate, true)
    }
  }

  //#region button back
  btnBack() {
    this.route.navigate(['/pvorrvrequest/subpaymentconfirmlist']);
    $('#datatablePaymentConfirmList').DataTable().ajax.reload();
  }
  //#endregion  button back

  //#region button ReversalRequest
  btnReversalRequest() {
    // param tambahan untuk button ReversalRequest dynamic
    this.dataRoleTamp = [{
      'p_code': this.param,
      'action': 'default'
    }];
    // param tambahan untuk button ReversalRequest dynamic

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
        this.dalservice.ExecSp(this.dataRoleTamp, this.APIController, this.APIRouteForReversalRequest)
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
  //#endregion button ReversalRequest

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

  //#region button Paid
  btnPaid(isValid: boolean) {
    // param tambahan untuk button Paid dynamic
    this.dataRoleTamp = [{
      'p_code': this.param,
      'action': 'default'
    }];
    // param tambahan untuk button Paid dynamic

    if (!isValid) {
      swal({
        title: 'Warning',
        text: 'Please Fill a Mandatory Field OR Format Is Invalid',
        buttonsStyling: false,
        confirmButtonClass: 'btn btn-danger',
        type: 'warning'
      }).catch(swal.noop)
      return;
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

  //#region button edit
  btnEdit(codeEdit: string) {
    this.route.navigate(['/pvorrvrequest/subpaymentconfirmlist/paymentconfirmdetaildetaildetail', this.param, codeEdit]);
  }
  //#endregion button edit

  //#region Lookup PdcCode
  btnLookupPdcCode() {
    $('#datatableLookupPdcCode').DataTable().clear().destroy();
    $('#datatableLookupPdcCode').DataTable({
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
        this.dalservice.GetrowsPdc(dtParameters, this.APIControllerPdcMain, this.APIRouteForLookup).subscribe(resp => {
          const parse = JSON.parse(resp);
          this.lookuppdccode = parse.data;
          if (parse.data != null) {
            this.lookuppdccode.numberIndex = dtParameters.start;
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
  }

  btnSelectRowPdcCode(pdc_code: String, pdc_no: string) {
    this.model.pdc_code = pdc_code;
    this.model.pdc_no = pdc_no;
    $('#lookupModalPdcCode').modal('hide');
  }
  //#endregion Lookup PdcCode

  //#region Jurnal Gl Link Name
  btnLookupJurnalGlLink() {
    $('#datatableLookupJurnalGlLink').DataTable().clear().destroy();
    $('#datatableLookupJurnalGlLink').DataTable({
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
          'p_is_bank': '1',
        });
        // end param tambahan untuk getrows dynamic
        this.dalservice.Getrows(dtParameters, this.APIControllerJurnalGlLink, this.APIRouteForLookupGlLink).subscribe(resp => {
          const parse = JSON.parse(resp);
          this.lookupJurnalGlLink = parse.data;
          if (parse.data != null) {
            this.lookupJurnalGlLink.numberIndex = dtParameters.start;
          }

          callback({
            draw: parse.draw,
            recordsTotal: parse.recordsTotal,
            recordsFiltered: parse.recordsFiltered,
            data: []
          })
        }, err => console.log('There was an error while retrieving Data(API) !!!' + err));
      },
      columnDefs: [{ orderable: false, width: '5%', targets: [0, 1, 3] }], // for disabled coloumn
      language: {
        search: '_INPUT_',
        searchPlaceholder: 'Search records',
        infoEmpty: '<p style="color:red;">No Data Available !</p>'
      },
      searchDelay: 800 // pake ini supaya gak bug search
    });
  }

  btnSelectRowJurnalGlLink(code: String, name: String) {
    this.model.bank_gl_link_code = code;
    this.model.bank_gl_link_name = name;
    $('#lookupModalJurnalGlLink').modal('hide');
  }
  //#endregion Jurnal Gl Link lookup

  //#region checkbox all table
  btnDeleteAll() {
    this.checkedList = [];
    for (let i = 0; i < this.listpaymentconfirmdetaildetail.length; i++) {
      if (this.listpaymentconfirmdetaildetail[i].selectedTable) {
        this.checkedList.push(this.listpaymentconfirmdetaildetail[i].id);
      }
    }

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
        for (let J = 0; J < this.checkedList.length; J++) {
          const codeData = this.checkedList[J];
          // param tambahan untuk getrow dynamic
          this.dataTamp = [{
            'p_id': codeData
          }];
          // end param tambahan untuk getrow dynamic
          this.dalservice.Delete(this.dataTamp, this.APIControllerPaymentTransactionDetail, this.APIRouteForDelete)
            .subscribe(
              res => {
                this.showSpinner = false;
                const parse = JSON.parse(res);
                if (parse.result === 1) {
                  if (J + 1 == this.checkedList.length) {
                    this.showNotification('bottom', 'right', 'success');
                    $('#datatablesPaymentConfirmDetail').DataTable().ajax.reload();
                    this.callGetrow();
                  }
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
      } else {
        this.showSpinner = false;
      }
    });
  }

  selectAllTable() {
    for (let i = 0; i < this.listpaymentconfirmdetaildetail.length; i++) {
      this.listpaymentconfirmdetaildetail[i].selectedTable = this.selectedAllTable;
    }
  }

  checkIfAllTableSelected() {
    this.selectedAllTable = this.listpaymentconfirmdetaildetail.every(function (item: any) {
      return item.selectedTable === true;
    })
  }
  //#endregion checkbox all table

  //#region btn btnLookupBranch
  btnLookupBranch() {

  }
  //#endregion

  //#region btnProceed
  btnProceed() {
    this.showSpinner = true;

    this.dataRoleTamp = [{
      'p_code': this.param,
      'action': 'default'
    }];

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
        this.dalservice.ExecSp(this.dataRoleTamp, this.APIController, this.APIRouteForProceed)
          .subscribe(
            res => {
              const parse = JSON.parse(res);
              if (parse.result === 1) {

                const paramtxt = [
                  {
                    'p_code': this.param,
                    'p_file_name': 'PAYMENT_TRANSACTION_MUFG'
                  }
                ];
                if (this.model.branch_bank_code === this.branch_bank_code_param) {
                  this.dalservice.DownloadFileWithParam(paramtxt, this.APIController, this.APIRouteForGenerateTextFileMUFG).subscribe(
                    res => {

                      var contentDisposition = res.headers.get('content-disposition');

                      var filename = contentDisposition.split(';')[1].split('filename')[1].split('=')[1].trim();

                      const blob = new Blob([res.body], { type: 'application/vnd.opentxtformats-officedocument.spreadsheetml.sheet' });
                      const url = window.URL.createObjectURL(blob);
                      var link = document.createElement('a');
                      link.href = url;
                      link.download = filename;
                      link.click();

                      // this.dalservice.ExecSp(this.dataTamp, this.APIControllerUploadDownloadSFTP, this.APIRouteForUploadSFTP)
                      // .subscribe(
                      //   res => {
                      //     this.showSpinner = false;
                      //     const parse = JSON.parse(res);
                      //     if (parse.result === 1){
                      //     } else {
                      //       this.showSpinner = false;
                      //     }
                      //   }
                      // )

                      this.showNotification('bottom', 'right', 'success');
                      $('#datatablesPaymentConfirmDetail').DataTable().ajax.reload();
                      setTimeout(() => {
                        this.callGetrow();
                      }, 200);
                    }, err => {
                      this.showSpinner = false;
                      const parse = JSON.parse(err);
                      this.swalPopUpMsg(parse.data);
                    });
                }
                else {
                  this.showNotification('bottom', 'right', 'success');
                  $('#datatablesPaymentConfirmDetail').DataTable().ajax.reload();
                  this.callGetrow();
                }
              } else {
                this.swalPopUpMsg(parse.data);
                this.showSpinner = false;
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
  //#endregion btnProceed

  //#region btnProceed
  btnDownloadCsv() {
    this.showSpinner = true;

    this.dataRoleTamp = [{
      'p_code': this.param,
      'action': 'default'
    }];

    this.showSpinner = true;

    this.dalservice.DownloadFileWithParam(this.dataRoleTamp, this.APIController, this.APIRouteForGenerateTextFileMUFGWithoutFTP).subscribe(
      res => {

        var contentDisposition = res.headers.get('content-disposition');

        var filename = contentDisposition.split(';')[1].split('filename')[1].split('=')[1].trim();

        const blob = new Blob([res.body], { type: 'application/vnd.opentxtformats-officedocument.spreadsheetml.sheet' });
        const url = window.URL.createObjectURL(blob);
        var link = document.createElement('a');
        link.href = url;
        link.download = filename;
        link.click();

        // this.showNotification('bottom', 'right', 'success');
        $('#datatablesPaymentConfirmDetail').DataTable().ajax.reload();
        setTimeout(() => {
          this.callGetrow();
        }, 200);
      }, err => {
        this.showSpinner = false;
        const parse = JSON.parse(err);
        this.swalPopUpMsg(parse.data);
      });
  }
  //#endregion btnProceed

  //#region approval Lookup
  btnViewApproval() {
    $('#datatableLookupApproval').DataTable().clear().destroy();
    $('#datatableLookupApproval').DataTable({
      'pagingType': 'first_last_numbers',
      'pageLength': 5,
      'processing': true,
      'serverSide': true,
      responsive: true,
      lengthChange: false, // hide lengthmenu
      searching: true, // jika ingin hilangin search box nya maka false

      ajax: (dtParameters: any, callback) => {
        dtParameters.paramTamp = [];
        dtParameters.paramTamp.push({
          'p_reff_no': this.model.rev_code
        });

        this.dalservice.GetrowsApv(dtParameters, this.APIControllerApprovalSchedule, this.APIRouteForLookup).subscribe(resp => {
          const parse = JSON.parse(resp);
          this.lookupapproval = parse.data;
          if (parse.data != null) {
            this.lookupapproval.numberIndex = dtParameters.start;
          }

          callback({
            draw: parse.draw,
            recordsTotal: parse.recordsTotal,
            recordsFiltered: parse.recordsFiltered,
            data: []
          });
        }, err => console.log('There was an error while retrieving Data(API) !!!' + err));
      },
      columnDefs: [{ orderable: false, width: '5%', targets: [0, 1] }], // for disabled coloumn
      order: [[5, 'ASC']],
      language: {
        search: '_INPUT_',
        searchPlaceholder: 'Search records',
        infoEmpty: '<p style="color:red;" > No Data Available !</p> '
      },
      searchDelay: 800 // pake ini supaya gak bug search
    });
  }
  //#endregion approval Lookup
}