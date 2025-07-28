import { Component, OnInit, ElementRef, ViewChild, AfterViewInit, ChangeDetectorRef } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { NgForm } from '@angular/forms';
import swal from 'sweetalert2';
import { DataTableDirective } from 'angular-datatables';
import { BaseComponent } from '../../../../../base.component';
import { DALService } from '../../../../../DALservice.service';
import { DatePipe } from '@angular/common';
import { ParseSourceFile } from '@angular/compiler';
import { generate } from 'rxjs';

// call function from js shared
declare function headerPage(controller, route): any;
declare function hideButtonLink(idbutton): any;
declare function hideTabWizard(): any;

@Component({
  moduleId: module.id,
  selector: 'app-root',
  templateUrl: './cashiertransactiondetail.component.html'
})

export class CashiertransactiondetailComponent extends BaseComponent implements OnInit {
  // get param from url
  param = this.getRouteparam.snapshot.paramMap.get('id');

  // variable
  public NumberOnlyPattern = this._numberonlyformat;
  public listcashiertransactiondetail: any = [];
  public listReversal: any = [];
  public listcashiertransactiondetailData: any = [];
  public cashiertransactiondetailData: any = [];
  public isBreak: Boolean = false;
  public isReadOnly: Boolean = false;
  public isButton: Boolean = false;
  public isPdc: Boolean = false;
  public isCash: Boolean = false;
  public isRequest: Boolean = true;
  public isCurrency: Boolean = false;
  public isrowCount: Boolean = false;
  public isSuspend: Boolean = false;
  public isAmount: Boolean = false;
  public isSave: Boolean = false;
  public isLabel: Boolean = true;
  public isAgreement: Boolean = false;
  public isWizard: Boolean = false;
  public is_received_request: Boolean;
  public lookupbranch: any = [];
  public lookupcollector: any = [];
  public lookupcashierreceivedrequest: any = [];
  public lookupagreement: any = [];
  public lookupcashier: any = [];
  public lookupJurnalGlLink: any = [];
  public lookupbank: any = [];
  public lookuppdccode: any = [];
  public lookupreceiptmain: any = [];
  public cashier_orig_amount: any;
  public cashier_exch_rate: any;
  public tampstatus = ''; //set untuk status agreement
  public agreement_exch_rate: any;
  public cashier_base_amount: any;
  public deposit_used_amount: any;
  public cashier_type: any;
  public bank_type: any;
  public agreementno: any;
  public valDate: any;
  private dataTempProcess: any = [];
  private dataTampModule: any = [];
  private dataTampGenerate: any = [];
  private dataTampAgreement: any = [];
  private dataTampReversal: any = [];
  private dataTampDoc: any = [];
  private dataTampAll: any = [];
  private dataTampAllExecSP: any = [];
  private dataTampReversalDetail: any = [];
  private dataTamp: any = [];
  private dataTampStatus: any = [];
  private dataTampDetail: any = [];
  private setStyle: any = [];
  private dataTamps: any = [];
  private RoleAccessCode = 'R00003180000319A';
  public lookupapproval: any = []; // (+) Ari 2023-09-07 ket : add view approval for reversal
  public lookupclientname: any = []; //-- Louis Kamis, 26 Juni 2025 10.53.52 -- 

  // API Controller
  private APIController: String = 'CashierTransaction';
  private APIControllerCashierTransactionDetail: String = 'CashierTransactionDetail';
  private APIControllerMasterReversal: String = 'MasterReversalValidation';
  private APIControllerMasterTransaction: String = 'MasterTransaction';
  private APIControllerDepositMain: String = 'AgreementDeposit';
  private APIControllerForReceiptMain: String = 'ReceiptMain';
  private APIControllerForAgreement: String = 'AgreementMain';
  private APIControllerCashierMain: String = 'CashierMain';
  private APIControllerPdcMain: String = 'PdcMain';
  private APIControllerSysBranchBank: String = 'SysBranchBank';
  private APIControllerMasterCollector: String = 'MasterCollector';
  private APIControllerSysCurrencyRate: String = 'SysCurrencyRate';
  private APIControllerCashierReceivedRequest: String = 'CashierReceivedRequest';
  private APIControllerForGetStatus: String = 'AgreementMain';
  private APIControllerReversal: String = 'ReversalMain'
  private APIControllerApprovalSchedule: String = 'ApprovalSchedule'; // (+) Ari 2023-09-07 ket : add view approval for reversal
  private APIControllerClientName: String = 'ClientMain';

  // API Function
  private APIRouteForLookup: String = 'GetRowsForLookup';
  private APIRouteForReceivedRequestLookup: String = 'GetRowsForByAgreement';
  private APIRouteForGetRows: String = 'GetRows';
  private APIRouteForGetRow: String = 'GetRow';
  private APIRouteForGetRowReversal: String = 'ExecSpGetRowReversal';
  private APIRouteForGetRowReversalDetail: String = 'ExecSpForReversalDetail';
  private APIRouteForGetRowByAgreement: String = 'GetRowByAgreement';
  private APIRouteForGetAgreement: String = 'ExecSpForGetStatus';
  private APIRouteForGetRowForTopRate: String = 'ExecSpTopRate';
  private APIRouteForGetRowByEmployeeCode: String = 'GetRowByEmployeeCode';
  private APIRouteForInsert: String = 'Insert';
  private APIRouteForUpdate: String = 'Update';
  private APIRouteForDelete: String = 'Delete';
  private APIRouteForDeleteByTransaction: String = 'DeleteByTransaction';
  private APIRouteForPaid: String = 'ExecSpForGetPaid';
  private APIRouteForCancel: String = 'ExecSpForGetCancel';
  private APIRouteForGenerate: String = 'ExecSpForGetGenerate';
  private APIRouteForReversal: String = 'ExecSpForReversal';
  private APIRouteForAutoAllocation: String = 'ExecSpForGetAutoAllocation';
  private APIRouteForGetStatus: String = 'ExecSpStatus';
  private APIRouteForReversalFromCahsier: String = 'ExecSpforReversalFromCashierTransaction';

  // form 2 way binding
  model: any = {};

  // checklist
  public selectedAllTable: any;
  private checkedList: any = [];
  public selectedAllLookup: any;
  private checkedLookup: any = [];

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
    private cdRef: ChangeDetectorRef,
    private _elementRef: ElementRef, private datePipe: DatePipe
  ) { super(); }

  ngOnInit() {
    this.callGetRole(this.userId, this._elementRef, this.dalservice, this.RoleAccessCode, this.route);
    this.Delimiter(this._elementRef);
    if (this.param != null) {
      // this.isReadOnly = true;

      // call web service
      this.callGetrow();
      this.callWizard();
    } else {
      this.callGetrowByUser();
      this.cashier_orig_amount = 0;
      this.cashier_exch_rate = 1;
      this.cashier_base_amount = 0;
      this.model.cashier_exch_rate = 1;
      this.model.cashier_orig_amount = 0;
      this.model.cashier_base_amount = 0;
      this.model.cashier_type = 'TRANSFER';
      this.bank_type = 'B'
      this.model.cashier_status = 'HOLD';
      this.model.received_from = 'CLIENT';
      this.model.is_received_request = '0';
      this.model.deposit_used_amount = 0;
      this.model.received_amount = 0;
      this.model.deposit_amount = 0;
      this.model.is_use_deposit = false;
      this.deposit_used_amount = 0;
      this.is_received_request = false;
      this.showSpinner = false;
      this.isPdc = false;
      this.model.branch_bank_code = $('#branchBankCode').val();
      this.model.branch_bank_name = $('#branchbankname').val();
      this.model.cashier_currency_code = $('#cashierCurrencyCode').val();
      this.model.bank_account_no = $('#bankaccountno').val();
      this.model.bank_account_name = $('#bankaccountname').val();
      this.model.bank_gl_link_code = $('#bankGlLinkCode').val();
    }
  }

  onRouterOutletActivate(event: any) {
  }

  //to remove wizzard
  callWizard() {

    setTimeout(() => {
      const factoringtype = $('#factoringtype').val();
      if (factoringtype === '' || factoringtype === null) {
        $('#cashiertransactioninvoicewiz').remove();
        this.cashiertransactionallocationwiz();
      }
      else {
        this.cashiertransactionallocationwiz();
      }
      this.wizard();
    }, 500);
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

  //#region allocation list tabs
  cashiertransactionallocationwiz() {
    this.route.navigate(['/cashier/subcashiertransactionlist/cashiertransactiondetail/' + this.param + '/cashiertransactionallocationlist', this.param], { skipLocationChange: true });
  }
  //#endregion allocation list tabs

  //#region invoice list tabs
  cashiertransactioninvoicewiz() {
    this.route.navigate(['/cashier/subcashiertransactionlist/cashiertransactiondetail/' + this.param + '/cashiertransactioninvoicelist', this.param], { skipLocationChange: true });
  }
  //#endregion invoice list tabs

  //#region ddl receivedType
  receivedType(event: any) {
    this.model.is_received_request = event.target.value;

    if (this.model.is_received_request === '1') {
      this.is_received_request = true;
      this.isAgreement = false;

    } else {
      this.is_received_request = false;
    }
  }
  //#endregion ddl receivedType

  //#region load all data
  loadData() {
    this.dtOptions = {
      pagingType: 'full_numbers',
      responsive: true,
      serverSide: true,
      processing: true,
      lengthChange: false, // hide lengthmenu
      paging: true,
      'lengthMenu': [
        [500],
        [500]
      ],
      ajax: (dtParameters: any, callback) => {
        // param tambahan untuk getrows dynamic
        dtParameters.paramTamp = [];
        dtParameters.paramTamp.push({
          'p_cashier_transaction_code': this.param
        });
        // end param tambahan untuk getrows dynamic
        this.dalservice.Getrows(dtParameters, this.APIControllerCashierTransactionDetail, this.APIRouteForGetRows).subscribe(resp => {
          const parse = JSON.parse(resp)
          for (let i = 0; i < parse.data.length; i++) {
            if (parse.data[i].is_paid === '1') {
              parse.data[i].is_paid = true;
            } else {
              parse.data[i].is_paid = false;
            }

            if (parse.data[i].is_module === '1') {
              parse.data[i].is_module = true;
              if (parse.data[i].is_partial === '1') {
                parse.data[i].is_partial = false;
                parse.data[i].is_module = false;
              } else {
                parse.data[i].is_partial = true;
              }
            } else {
              parse.data[i].is_module = false;
              parse.data[i].is_partial = false;
            }
          }
          this.listcashiertransactiondetail = parse.data;
          if (parse.data != null) {
            this.listcashiertransactiondetail.numberIndex = dtParameters.start;
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
      // order: [['1', 'asc']],
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
          this.valDate = parsedata.cashier_value_date;
          parsedata.cashier_value_date2 = parsedata.cashier_value_date;
          const ngbGetrow = this.getrowNgb(parse.data[0]);

          //wizard
          // this.callWizard();
          this.isReadOnly = true;

          if (this.isSave) {
            if (this.cashier_orig_amount === parsedata.cashier_orig_amount) {
              this.isLabel = true;
            } else {
              this.isLabel = false;
            }
          }

          this.agreementno = parsedata.agreement_no;
          this.cashier_type = parsedata.cashier_type;

          if (parsedata.cashier_type === 'CASH' || parsedata.cashier_type === 'FIELD COLL' || parsedata.cashier_type === 'SKT') {
            this.bank_type = 'CASH';
          } else if (parsedata.cashier_type === 'TRANSFER' || parsedata.cashier_type === 'EDC') {
            this.bank_type = 'B'
          }
          else {
            this.bank_type = ''
          }

          if (parsedata.rows_count !== 0 && parsedata.is_received_request === '1' && parsedata.bank_gl_link_code != null) {
            this.isrowCount = true;
          } else {
            this.isrowCount = false;
          }

          if (parsedata.cashier_status !== 'HOLD') {
            this.isButton = true;
          } else {
            this.isButton = false;
          }

          if (parsedata.cashier_type === 'PDC') {
            this.isPdc = true;
          } else {
            this.isPdc = false;
          }

          if (parsedata.agreement_no == null || parsedata.agreement_no === '') {
            this.isSuspend = true;
          } else {
            this.isSuspend = false;
          }

          // checkbox is_use_deposit
          if (parsedata.is_use_deposit === '1') {
            parsedata.is_use_deposit = true;
          } else {
            parsedata.is_use_deposit = false;
          }
          // end checkbox is_use_deposit

          // checkbox
          if (parsedata.is_received_request === '1') {
            this.is_received_request = true;
          } else {
            this.is_received_request = false;
          }
          // end checkbox
          if (parsedata.cashier_type === 'PDC' || parsedata.cashier_type === 'FIELD COLL' || parsedata.cashier_type === 'SKT') {
            this.isRequest = false
          }
          else {
            this.isRequest = true
          }

          this.cashier_orig_amount = parsedata.cashier_orig_amount;
          this.cashier_exch_rate = parsedata.cashier_exch_rate;
          this.cashier_base_amount = parsedata.cashier_base_amount;
          this.deposit_used_amount = parsedata.deposit_used_amount;
          this.isReadOnly = true;

          // mapper dbtoui
          Object.assign(this.model, ngbGetrow);
          // end mapper dbtoui

          this.callGetrowTopRate(this.model.cashier_currency_code, this.valDate, false, false) //cashier rate
          this.callGetrowTopRate(this.model.currency_code, this.valDate, false, true) //set agreement rate

          this.showSpinner = false;
        },
        error => {
          console.log('There was an error while Retrieving Data(API) !!!' + error);
        });
  }
  //#endregion  getrow data

  //#region  getrow data by user
  callGetrowByUser() {
    // param tambahan untuk getrow dynamic
    this.dataTamp = [{
      'p_employee_code': this.userId,
    }];

    // end param tambahan untuk getrow dynamic
    this.dalservice.Getrow(this.dataTamp, this.APIControllerCashierMain, this.APIRouteForGetRowByEmployeeCode)
      .subscribe(
        res => {
          const parse = JSON.parse(res);
          const parsedata = this.getrowNgb(parse.data[0]);

          this.model.cashier_main_code = parsedata.code
          this.model.cashier_name = parsedata.employee_name
          this.model.branch_code = parsedata.branch_code
          this.model.branch_name = parsedata.branch_name
          this.model.cashier_trx_date = parsedata.cashier_open_date

        },
        error => {
          console.log('There was an error while Retrieving Data(API) !!!' + error);
        });
  }
  //#endregion  getrow data by user

  //#region  getrow data deposit by agreement
  callGetrowDeposit(agreement: any, currency: any) {

    // param tambahan untuk getrow dynamic
    this.dataTamp = [{
      'p_agreement_no': agreement,
      'p_currency_code': currency,
    }];

    // end param tambahan untuk getrow dynamic
    this.dalservice.GetrowsOpl(this.dataTamp, this.APIControllerDepositMain, this.APIRouteForGetRowByAgreement)
      .subscribe(
        res => {
          const parse = JSON.parse(res);
          const parsedata = parse.data[0];

          this.model.deposit_code = parsedata.code
          this.model.deposit_amount = parsedata.deposit_amount

        },
        error => {
          console.log('There was an error while Retrieving Data(API) !!!' + error);
        });
  }
  //#endregion  getrow data deposit by agreement

  //#region  getrow data rate
  callGetrowTopRate(currency: any, date: any, change: Boolean, agreement: Boolean) {
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
          const parsedata = parse.data[0];

          if (agreement) {
            this.agreement_exch_rate = parsedata.exch_rate

          } else {
            if (parsedata.code === currency) {
              this.isCurrency = true;
            } else {
              this.isCurrency = false;
            }

            if (change) {
              this.model.cashier_exch_rate = parsedata.exch_rate
              this.cashier_exch_rate = parsedata.exch_rate
              if (this.model.is_received_request === '1') {
                this.model.cashier_orig_amount = (this.model.cashier_base_amount / parsedata.exch_rate);
              } else {
                this.model.cashier_base_amount = (parsedata.exch_rate * this.cashier_orig_amount);
              }
            }

          }
        },
        error => {
          console.log('There was an error while Retrieving Data(API) !!!' + error);
        });
  }
  //#endregion  getrow data rate

  //#region form submit
  onFormSubmit(cashiertransactiondetailForm: NgForm, isValid: boolean) {
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

    this.cashiertransactiondetailData = this.JSToNumberFloats(cashiertransactiondetailForm);
    if (this.cashiertransactiondetailData.p_agreement_no === '') {
      this.cashiertransactiondetailData.p_agreement_no = undefined;
    }

    if (this.cashiertransactiondetailData.p_pdc_no === '') {
      this.cashiertransactiondetailData.p_pdc_no = undefined;
      this.cashiertransactiondetailData.p_pdc_code = undefined;
    }

    if (this.is_received_request) {
      this.cashiertransactiondetailData.p_is_received_request = '1';
    } else {
      this.cashiertransactiondetailData.p_is_received_request = '0';
    }

    if (this.isRequest) {
      this.cashiertransactiondetailData.p_received_request_code = undefined;
    }

    const usersJson: any[] = Array.of(this.cashiertransactiondetailData);

    if (this.param != null) {

      // call web service
      this.dalservice.Update(usersJson, this.APIController, this.APIRouteForUpdate)
        .subscribe(
          res => {
            const parse = JSON.parse(res);

            if (parse.result === 1) {
              this.showNotification('bottom', 'right', 'success');

              //jika entry dan value date diedit
              if (this.cashiertransactiondetailData.p_is_received_request === '0') {

                if (this.cashiertransactiondetailData.p_cashier_value_date !== this.cashiertransactiondetailData.p_cashier_value_date2) {
                  this.btnGenerate(this.param, this.cashiertransactiondetailData.p_cashier_orig_amount)
                } else {
                  this.showSpinner = false;
                }

              } else {
                this.showSpinner = false;
              }
              this.callGetrow();
              $('#datatableCashierTransactionList').DataTable().ajax.reload();
              // $('#datatabless').DataTable().ajax.reload();
            } else {
              this.showSpinner = false;
              this.swalPopUpMsg(parse.data);
            }
          },
          error => {
            this.showSpinner = false;
            const parse = JSON.parse(error);
            this.swalPopUpMsg(parse.data);
          });
    } else {
      //1310
      this.dataTampAgreement = [];

      this.dataTampAgreement.push({
        'p_agreement_no': this.cashiertransactiondetailData.p_agreement_no,
        'action': 'getResponse'
      });

      if ((this.cashiertransactiondetailData.p_agreement_no == null || this.cashiertransactiondetailData.p_agreement_no === '') && (this.cashiertransactiondetailData.p_client_no == null || this.cashiertransactiondetailData.p_client_no === '')) {
        this.dalservice.Insert(usersJson, this.APIController, this.APIRouteForInsert)
          .subscribe(
            res => {
              const parse = JSON.parse(res);
              if (parse.result === 1) {
                this.showSpinner = false;
                this.showNotification('bottom', 'right', 'success');

                if (this.cashiertransactiondetailData.p_is_received_request === '0') {
                  this.btnGenerate(parse.code, this.cashiertransactiondetailData.p_cashier_orig_amount)
                }
                this.route.navigate(['/cashier/subcashiertransactionlist/cashiertransactiondetail', parse.code]);
              } else {
                this.showSpinner = false;
                this.swalPopUpMsg(parse.data);
              }
            },
            error => {
              this.showSpinner = false;
              const parse = JSON.parse(error);
              this.swalPopUpMsg(parse.data);
            });
      }
      else {
        if ((this.cashiertransactiondetailData.p_agreement_no != null && this.cashiertransactiondetailData.p_agreement_no !== '' && this.cashiertransactiondetailData.p_agreement_no != undefined)) {
          this.dalservice.ExecSp(this.dataTampAgreement, this.APIControllerMasterTransaction, this.APIRouteForGetAgreement)
            .subscribe(
              res => {
                this.showSpinner = false;
                const parseagreement = JSON.parse(res);

                if (parseagreement.result === 1) {

                  this.dataTampAgreement = parseagreement.data;

                  if (this.dataTampAgreement.length > 0) {
                    for (let J = 0; J < this.dataTampAgreement.length; J++) {
                      const moduleData = this.dataTampAgreement[J].module_name;

                      this.dataTampAllExecSP = [{
                        'p_agreement_no': this.cashiertransactiondetailData.p_agreement_no,
                        'action': 'getResponse'
                      }];

                      this.dalservice.ExecSpAll(this.dataTampAllExecSP, moduleData)
                        .subscribe(
                          resss => {
                            this.showSpinner = false;
                            const parsevalidasi = JSON.parse(resss);

                            if (parsevalidasi.data[0].status !== '' && parsevalidasi.data[0].status != null) {
                              this.tampstatus = parsevalidasi.data[0].status
                            }

                            if (J + 1 === this.dataTampAgreement.length) {

                              if (this.tampstatus === '' || this.tampstatus === 'REPO I' || this.tampstatus === 'REPO II') {

                                // call web service
                                this.dalservice.Insert(usersJson, this.APIController, this.APIRouteForInsert)
                                  .subscribe(
                                    res => {
                                      this.showSpinner = false;
                                      const parse = JSON.parse(res);
                                      if (parse.result === 1) {
                                        this.showNotification('bottom', 'right', 'success');
                                        //type entry
                                        if (this.cashiertransactiondetailData.p_is_received_request === '0') {
                                          this.btnGenerate(parse.code, this.cashiertransactiondetailData.p_cashier_orig_amount)
                                        }
                                        this.route.navigate(['/cashier/subcashiertransactionlist/cashiertransactiondetail', parse.code]);
                                      } else {
                                        this.showSpinner = false;
                                        this.swalPopUpMsg(parse.data);
                                        this.tampstatus = '';
                                      }
                                    },
                                    error => {
                                      this.tampstatus = '';
                                      this.showSpinner = false;
                                      const parse = JSON.parse(error);
                                      this.swalPopUpMsg(parse.data);
                                    });
                              }
                              else {
                                this.showSpinner = false;
                                this.swalPopUpMsg(this.tampstatus);
                                this.tampstatus = '';
                              }
                            }
                          },
                          error => {
                            this.tampstatus = '';
                            this.showSpinner = false;
                            const parse = JSON.parse(error);
                            this.swalPopUpMsg(parse.data);
                          });
                    }
                  } else {
                    this.dalservice.Insert(usersJson, this.APIController, this.APIRouteForInsert)
                      .subscribe(
                        res => {
                          const parse = JSON.parse(res);
                          if (parse.result === 1) {
                            this.showSpinner = false;
                            this.showNotification('bottom', 'right', 'success');
                            if (this.cashiertransactiondetailData.p_is_received_request === '0') {
                              this.btnGenerate(parse.code, this.cashiertransactiondetailData.p_cashier_orig_amount)
                            }
                            this.route.navigate(['/cashier/subcashiertransactionlist/cashiertransactiondetail', parse.code]);
                          } else {
                            this.showSpinner = false;
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
                else {
                  this.swalPopUpMsg(parseagreement.data);
                }
              },
              error => {
                this.showSpinner = false;
                const parseagreement = JSON.parse(error);
                this.swalPopUpMsg(parseagreement.data);
              });
        } else {
          this.dalservice.Insert(usersJson, this.APIController, this.APIRouteForInsert)
            .subscribe(
              res => {
                const parse = JSON.parse(res);
                if (parse.result === 1) {
                  this.showSpinner = false;
                  this.showNotification('bottom', 'right', 'success');

                  this.route.navigate(['/cashier/subcashiertransactionlist/cashiertransactiondetail', parse.code]);
                } else {
                  this.showSpinner = false;
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
    }
  }
  //#endregion  form submit

  //#region btnReversal
  btnReversal() {
    this.dataTampReversal = [{
      'p_code': this.param,
      'action': ''
    }]

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

        this.dalservice.ExecSp(this.dataTampReversal, this.APIControllerReversal, this.APIRouteForReversalFromCahsier)
          .subscribe(
            res => {
              this.showSpinner = false;
              const parseReversal = JSON.parse(res);
              if (parseReversal.result === 1) {
                this.showSpinner = false;
                this.showNotification('bottom', 'right', 'success');
                this.callGetrow();
                $('#reloadWiz').click();
              } else {
                this.showSpinner = false;
                this.swalPopUpMsg(parseReversal.data);
              }
            },
            error => {
              this.showSpinner = false;
              const parse = JSON.parse(error);
              this.swalPopUpMsg(parse.data);
            });
      }

    });
  }
  //#endregion btnReversal

  //#region button btnreversal
  // btnReversal() {
  //   this.dataTampReversal = [{
  //     'action': 'getResponse'
  //   }];

  //   this.dataTampReversalDetail = [{
  //     'p_code': this.param,
  //     'action': 'getResponse'
  //   }];

  //   swal({
  //     title: 'Are you sure?',
  //     type: 'warning',
  //     showCancelButton: true,
  //     confirmButtonClass: 'btn btn-success',
  //     cancelButtonClass: 'btn btn-danger',
  //     confirmButtonText: this._deleteconf,
  //     buttonsStyling: false
  //   }).then((result) => {
  //     this.showSpinner = true;
  //     if (result.value) {

  //       this.dalservice.ExecSp(this.dataTampReversalDetail, this.APIController, this.APIRouteForGetRowReversalDetail)
  //         .subscribe(
  //           res => {
  //             this.showSpinner = false;
  //             const parseReversal = JSON.parse(res);

  //             if (parseReversal.result === 1) {
  //               this.dataTampDoc = parseReversal.data;

  //               this.dalservice.ExecSp(this.dataTampReversal, this.APIControllerMasterReversal, this.APIRouteForGetRowReversal)
  //                 .subscribe(
  //                   ress => {
  //                     this.showSpinner = false;
  //                     const parse = JSON.parse(ress);

  //                     if (parse.result === 1) {
  //                       this.dataTamp = parse.data;

  //                       if (this.dataTamp.length > 0) {
  //                         for (let I = 0; I < this.dataTampDoc.length; I++) {
  //                           for (let J = 0; J < this.dataTamp.length; J++) {
  //                             const ApiData = this.dataTamp[J].api_validation;

  //                             this.dataTampReversalDetail = [{
  //                               'p_code': this.param,
  //                               'p_doc_ref_code': this.dataTampDoc[I].doc_ref_code,
  //                               'p_transaction_code': this.dataTampDoc[I].transaction_code,
  //                               'p_is_received_request': this.dataTampDoc[I].is_received_request,
  //                               'p_agreement_no': this.dataTampDoc[I].agreement_no,
  //                               // 'p_agreement_cashier_transaction': this.dataTampDoc[I].agreement_cashier_transaction,
  //                               'p_amount': this.dataTampDoc[I].amount,
  //                               'p_installment_no': this.dataTampDoc[I].installment_no,
  //                               'action': 'getResponse'
  //                             }];

  //                             this.dalservice.ExecSpAll(this.dataTampReversalDetail, ApiData)
  //                               .subscribe(
  //                                 resss => {
  //                                   this.showSpinner = false;
  //                                   const parsevalidasi = JSON.parse(resss);

  //                                   if (parsevalidasi.data[0].status !== '' && parsevalidasi.data[0].status != null) {
  //                                     this.tampstatus = parsevalidasi.data[0].status
  //                                   }
  //                                   if (I + 1 === this.dataTampDoc.length && J + 1 === this.dataTamp.length) {
  //                                     if (this.tampstatus === '') {

  //                                       this.listReversal.push({
  //                                         'p_code': this.param,
  //                                       });

  //                                       this.dalservice.Insert(this.listReversal, this.APIController, this.APIRouteForReversal)
  //                                         .subscribe(
  //                                           res => {
  //                                             this.showSpinner = false;
  //                                             const parse = JSON.parse(res);

  //                                             if (parse.result === 1) {
  //                                               this.showNotification('bottom', 'right', 'success');
  //                                               this.callGetrow();
  //                                             } else {
  //                                               this.swalPopUpMsg(parse.data);
  //                                             }
  //                                           },
  //                                           error => {
  //                                             this.showSpinner = false;
  //                                             const parse = JSON.parse(error);
  //                                             this.swalPopUpMsg(parse.data);
  //                                           });
  //                                     }
  //                                     else {
  //                                       this.swalPopUpMsg(this.tampstatus);
  //                                     }
  //                                   }
  //                                 },
  //                                 error => {
  //                                   this.showSpinner = false;
  //                                   const parse = JSON.parse(error);
  //                                   this.swalPopUpMsg(parse.data);
  //                                 });
  //                           }
  //                         }
  //                       }
  //                     }
  //                   },
  //                   error => {
  //                     this.showSpinner = false;
  //                     const parse = JSON.parse(error);
  //                     this.swalPopUpMsg(parse.data);
  //                   });
  //             }
  //           },
  //           error => {
  //             this.showSpinner = false;
  //             const parse = JSON.parse(error);
  //             this.swalPopUpMsg(parse.data);
  //           });
  //     }

  //   });
  // }
  //#endregion button btnreversal

  //#region UseDeposit
  UseDeposit(event: any) {
    this.model.is_use_deposit = event.target.checked;
    if (this.model.is_use_deposit) {
      this.model.deposit_used_amount = this.model.deposit_amount;

      if (this.model.cashier_base_amount == 0) {
        this.model.received_amount = this.model.cashier_orig_amount;
        this.model.cashier_base_amount = this.model.deposit_used_amount
      }
      else if (this.model.cashier_base_amount <= this.model.deposit_amount) {
        this.model.cashier_orig_amount = 0;
        this.model.deposit_used_amount = this.model.cashier_base_amount;
      }
      else {
        this.model.cashier_orig_amount = (this.model.received_amount * 1) - (this.model.deposit_used_amount * 1);
      }
    } else {
      this.model.cashier_orig_amount = this.model.received_amount;
      this.model.deposit_used_amount = 0;
      if (this.param === null) {
        this.model.cashier_base_amount = this.model.cashier_orig_amount;
        this.model.received_amount = this.model.cashier_orig_amount;
      }
      else {
        this.model.cashier_orig_amount = this.model.received_amount;
        this.model.cashier_base_amount = this.model.cashier_orig_amount * this.model.cashier.exch_rate;
        this.model.received_amount = this.model.cashier_orig_amount;
      }
    }
  }
  //#endregion UseDeposit

  //#region valueDate
  valueDate(event: any) {
    this.model.cashier_value_date = event;
    this.valDate = this.dateFormatList(event.singleDate.formatted);

    if (this.model.cashier_currency_code !== '') {
      this.callGetrowTopRate(this.model.cashier_currency_code, this.valDate, true, false)
    }
    if (this.model.currency_code !== '') {
      this.callGetrowTopRate(this.model.currency_code, this.valDate, false, true)
    }

  }
  //#endregion valueDate

  //#region button back
  btnBack() {
    this.route.navigate(['/cashier/subcashiertransactionlist']);
    $('#datatableCashierTransactionList').DataTable().ajax.reload();
  }
  //#endregion  button back

  //#region button edit
  btnEdit(codeEdit: string) {
    this.route.navigate(['/cashier/subcashiertransactionlist/receiptconfirmdetaildetail', this.param, codeEdit]);
  }
  //#endregion button edit

  //#region depositUsedAmount
  depositUsedAmount(event: any) {
    this.model.deposit_used_amount = event.target.value * 1;

    this.model.cashier_base_amount = (this.model.received_amount + this.model.deposit_used_amount) * this.cashier_exch_rate;
  }
  //#endregion depositUsedAmount

  //#region origAmount
  origAmount(event: any) {
    this.model.received_amount = (event.target.value.replace(/\,/g, '') * 1);
    this.cashier_orig_amount = event.target.value.replace(/\,/g, '') * 1;

    this.model.cashier_base_amount = (this.model.received_amount + this.model.deposit_used_amount) * this.cashier_exch_rate;
  }
  //#endregion origAmount

  //#region useAmount
  useAmount(event: any) {
    this.deposit_used_amount = event;
    this.model.received_amount = (this.cashier_orig_amount * 1);
    this.model.cashier_base_amount = (event * 1) + (this.cashier_orig_amount * 1) * this.cashier_exch_rate;

  }
  //#endregion useAmount

  //#region exchRate
  exchRate(event: any) {
    if (this.model.is_received_request === '1') {
      this.model.received_amount = this.cashier_base_amount / event;
      this.model.cashier_orig_amount = (this.model.received_amount * 1) - (this.deposit_used_amount * 1);
    } else {
      this.model.cashier_base_amount = (event * this.model.received_amount);
    }
    this.cashier_exch_rate = event;
  }
  //#endregion exchRate

  //#region ddl cashierType
  cashierType(event: any) {
    if (event.target.value === 'PDC' || event.target.value === 'FIELD COLL' || event.target.value === 'SKT') {
      this.isRequest = false
      this.model.is_received_request = '0'
    }
    else {
      this.isRequest = true
    }

    if (event.target.value === 'CASH' || event.target.value === 'PDC' || event.target.value === 'FIELD COLL' || event.target.value === 'SKT') {
      this.model.cashier_exch_rate = 1;
      this.cashier_exch_rate = 1;
      this.isCash = true;
      this.bank_type = 'CASH';
      this.btnLookupReceiptMain();
      this.model.cashier_base_amount = (this.model.cashier_exch_rate * this.cashier_orig_amount);
      if (event.target.value !== 'PDC') {
        this.btnLookupBank();
      }
    } else if (event.target.value === 'TRANSFER' || event.target.value === 'EDC') {
      this.bank_type = 'B';
      this.isCash = false;
    }
    else {
      this.bank_type = '';
      this.isCash = false;
    }

    this.model.cashier_type = event.target.value;
    if (this.model.cashier_type !== 'TRANSFER') {
      if (this.model.is_received_request === '1') {
        this.isAgreement = false;
      } else {
        this.isAgreement = true;
      }
    } else {
      this.isAgreement = false;
    }

    this.model.branch_bank_code = '';
    this.model.branch_bank_name = '';
    this.model.cashier_currency_code = '';
    this.model.received_request_code = '';
    this.model.pdc_code = '';
    this.model.pdc_no = '';
  }
  //#endregion ddl cashierType

  //#region button Paid
  btnPaid() {
    // param tambahan untuk button Paid dynamic
    this.dataTempProcess = [{
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
        this.dalservice.ExecSp(this.dataTempProcess, this.APIController, this.APIRouteForPaid)
          .subscribe(
            res => {
              this.showSpinner = false;
              const parse = JSON.parse(res);
              if (parse.result === 1) {
                this.showNotification('bottom', 'right', 'success');
                this.callGetrow();
                $('#reloadWiz').click();
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
    this.dataTempProcess = [{
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
        this.dalservice.ExecSp(this.dataTempProcess, this.APIController, this.APIRouteForCancel)
          .subscribe(
            res => {
              this.showSpinner = false;
              const parse = JSON.parse(res);
              if (parse.result === 1) {
                this.showNotification('bottom', 'right', 'success');
                this.callGetrow();
                $('#reloadWiz').click();
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

  //#region button AutoAllocation
  btnAutoAllocation() {
    // param tambahan untuk button AutoAllocation dynamic
    this.dataTampAll = [{
      'p_code': this.param,
      'p_rate': this.agreement_exch_rate,
      'action': 'default'
    }];
    // param tambahan untuk button AutoAllocation dynamic

    this.dalservice.ExecSp(this.dataTampAll, this.APIControllerCashierTransactionDetail, this.APIRouteForAutoAllocation)
      .subscribe(
        res => {
          const parse = JSON.parse(res);
          if (parse.result === 1) {
            $('#datatableCashierTransactionAllocationList').DataTable().ajax.reload();
            setTimeout(() => {
              this.isLabel = true;
              this.callGetrow();
            }, 500);
          } else {
            this.showSpinner = false;
            this.swalPopUpMsg(parse.data);
          }
        },
        error => {
          this.showSpinner = false;
          const parse = JSON.parse(error);
          this.swalPopUpMsg(parse.data);
        });
  }
  //#endregion button AutoAllocation

  //#region lookup cashier received request
  btnlookupCashiesrReceivedRequest() {
    $('#datatableLookupReceivedRequest').DataTable().clear().destroy();
    $('#datatableLookupReceivedRequest').DataTable({
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
          'p_agreement_no': this.model.agreement_no,
          'p_doc_ref_flag': this.model.cashier_type
        });
        // end param tambahan untuk getrows dynamic

        this.dalservice.Getrows(dtParameters, this.APIControllerCashierReceivedRequest, this.APIRouteForReceivedRequestLookup).subscribe(resp => {
          const parse = JSON.parse(resp);
          this.lookupcashierreceivedrequest = parse.data;
          if (parse.data != null) {
            this.lookupcashierreceivedrequest.numberIndex = dtParameters.start;
          }

          callback({
            draw: parse.draw,
            recordsTotal: parse.recordsTotal,
            recordsFiltered: parse.recordsFiltered,
            data: []
          });
        }, err => console.log('There was an error while retrieving Data(API) !!!' + err));
      },
      columnDefs: [{ orderable: false, width: '5%', targets: [0, 1, 6] }], // for disabled coloumn
      language: {
        search: '_INPUT_',
        searchPlaceholder: 'Search records',
        infoEmpty: '<p style="color:red;" > No Data Available !</p> '
      },
      searchDelay: 800 // pake ini supaya gak bug search
    });
  }

  btnSelectRowCashiesrReceivedRequest(code: String, amount: string, pdc_code: String, pdc_no: string, branch_bank_code: string, branch_bank_name: string, request_currency_code: string) {
    this.model.received_request_code = code;
    this.model.pdc_code = pdc_code;
    this.model.pdc_no = pdc_no;
    this.model.cashier_orig_amount = amount;
    this.model.received_amount = amount;
    this.model.cashier_base_amount = (this.model.received_amount + this.model.deposit_used_amount) * this.cashier_exch_rate;
    this.model.branch_bank_code = branch_bank_code;
    this.model.branch_bank_name = branch_bank_name;
    this.model.cashier_currency_code = request_currency_code;
    $('#lookupModalReceivedRequest').modal('hide');
  }
  //#endregion lookup cashier received request

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
          'p_type': this.bank_type,
          'p_default_flag': '1'
        });
        // end param tambahan untuk getrows dynamic

        this.dalservice.GetrowsSys(dtParameters, this.APIControllerSysBranchBank, this.APIRouteForLookup).subscribe(resp => {
          const parse = JSON.parse(resp);
          this.lookupbank = parse.data;

          if (parse.data != null) {
            this.lookupbank.numberIndex = dtParameters.start;
          }

          if (this.isCash) {
            if (parse.data.length > 0) {
              this.model.branch_bank_code = parse.data[0].code;
              this.model.branch_bank_name = parse.data[0].bank_account_name;
              this.model.cashier_currency_code = parse.data[0].currency_code;
              this.model.bank_account_no = parse.data[0].bank_account_no;
              this.model.bank_account_name = parse.data[0].description;
              this.model.bank_gl_link_code = parse.data[0].gl_link_code;
              this.callGetrowDeposit(this.model.agreement_no, this.model.cashier_currency_code);
            }
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

  btnSelectRowBank(bank_code: String, description: string, bank_account_no: string, bank_account_name: string, cashier_currency_code: string, gl_link_code: string) {
    this.model.branch_bank_code = bank_code;
    this.model.branch_bank_name = description;
    this.model.cashier_currency_code = cashier_currency_code;
    this.model.bank_account_no = bank_account_no;
    this.model.bank_account_name = bank_account_name;
    this.model.bank_gl_link_code = gl_link_code;
    if (this.model.cashier_value_date != null) {
      this.callGetrowTopRate(this.model.cashier_currency_code, this.valDate, true, false)
    }
    this.callGetrowDeposit(this.model.agreement_no, this.model.cashier_currency_code);
    $('#lookupModalBank').modal('hide');
  }
  //#endregion Lookup Bank

  //#region Collector Lookup
  btnLookupCollector() {
    $('#datatableLookupCollector').DataTable().clear().destroy();
    $('#datatableLookupCollector').DataTable({
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
        this.dalservice.GetrowsColl(dtParameters, this.APIControllerMasterCollector, this.APIRouteForLookup).subscribe(resp => {
          const parse = JSON.parse(resp);
          this.lookupcollector = parse.data;
          if (parse.data != null) {
            this.lookupcollector.numberIndex = dtParameters.start;
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

  btnSelectRowCollector(code: String, collector_name: String) {
    this.model.received_collector_code = code;
    this.model.received_collector_name = collector_name;
    $('#lookupModalCollector').modal('hide');
  }
  //#endregion lookup branch

  //#region Lookup Agreement
  btnLookupAgreement() {
    $('#datatableLookupAgreement').DataTable().clear().destroy();
    $('#datatableLookupAgreement').DataTable({
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
          'p_branch_code': 'ALL',
          'p_client_code': this.model.client_no
        });
        // end param tambahan untuk getrows dynamic
        this.dalservice.Getrows(dtParameters, this.APIControllerForAgreement, this.APIRouteForLookup).subscribe(resp => {
          const parse = JSON.parse(resp);
          this.lookupagreement = parse.data;
          if (parse.data != null) {
            this.lookupagreement.numberIndex = dtParameters.start;
          }

          callback({
            draw: parse.draw,
            recordsTotal: parse.recordsTotal,
            recordsFiltered: parse.recordsFiltered,
            data: []
          });
        }, err => console.log('There was an error while retrieving Data(API) !!!' + err));
      },
      columnDefs: [{ orderable: false, width: '5%', targets: [0, 1, 5] }],
      language: {
        search: '_INPUT_',
        searchPlaceholder: 'Search records',
        infoEmpty: '<p style="color:red;" > No Data Available !</p> '
      },
      searchDelay: 800 // pake ini supaya gak bug search
    });
  }

  btnSelectRowAgreement(agreement_no: String, agreement_external_no: string, client_name: string, currency_code: string, factoring_type: string) {
    this.model.agreement_no = agreement_no;
    this.model.agreement_external_no = agreement_external_no;
    // this.model.client_name = client_name;
    this.model.currency_code = currency_code;
    this.model.factoring_type = factoring_type;
    if (this.model.cashier_value_date != null) {
      this.callGetrowTopRate(this.model.currency_code, this.valDate, false, true)
    }

    this.model.received_request_code = undefined;
    this.model.pdc_code = undefined;
    this.model.pdc_no = undefined;
    this.callGetrowDeposit(this.model.agreement_no, this.model.cashier_currency_code); // (+) Ari 2023-09-27 call deposit kembali jika pilih agreement
    // this.model.branch_bank_code = undefined;
    // this.model.branch_bank_name = undefined;
    $('#lookupModalAgreement').modal('hide');
  }

  btnClearAgreement() {
    if (this.cashiertransactiondetailData.p_status !== 'HOLD') {
      this.model.received_request_code = undefined;
      this.model.pdc_code = undefined;
      this.model.pdc_no = undefined;
      this.model.agreement_no = undefined;
      this.model.agreement_external_no = undefined;
      this.model.client_name = undefined;
      this.model.currency_code = undefined;
    }
  }
  //#endregion Lookup Agreement

  //#region Lookup ReceiptMain
  btnLookupReceiptMain() {
    $('#datatableLookupReceiptMain').DataTable().clear().destroy();
    $('#datatableLookupReceiptMain').DataTable({
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
          'p_cashier_code': this.model.cashier_main_code,
          'p_branch_code': this.model.branch_code,
        });
        // end param tambahan untuk getrows dynamic
        this.dalservice.Getrows(dtParameters, this.APIControllerForReceiptMain, this.APIRouteForLookup).subscribe(resp => {
          const parse = JSON.parse(resp);
          this.lookupreceiptmain = parse.data;
          if (parse.data != null) {
            this.lookupreceiptmain.numberIndex = dtParameters.start;
          }

          if (this.isCash) {
            if (parse.data.length > 0) {
              this.model.receipt_code = parse.data[0].code;
              this.model.receipt_no = parse.data[0].receipt_no;
            }
          }
          callback({
            draw: parse.draw,
            recordsTotal: parse.recordsTotal,
            recordsFiltered: parse.recordsFiltered,
            data: []
          });
        }, err => console.log('There was an error while retrieving Data(API) !!!' + err));
      },
      columnDefs: [{ orderable: false, width: '5%', targets: [0, 1, 3] }],
      language: {
        search: '_INPUT_',
        searchPlaceholder: 'Search records',
        infoEmpty: '<p style="color:red;" > No Data Available !</p> '
      },
      searchDelay: 800 // pake ini supaya gak bug search
    });
  }

  btnSelectRowReceiptMain(receipt_code: String, receipt_no: string) {
    this.model.receipt_code = receipt_code;
    this.model.receipt_no = receipt_no;
    $('#lookupModalReceiptMain').modal('hide');
  }

  btnClearReceiptMain() {
    this.model.receipt_code = '';
    this.model.receipt_no = '';
  }
  //#endregion Lookup ReceiptMain

  //#region btnSelectAllLookup
  btnSelectAllLookup() {
    this.isBreak = false;
    this.checkedLookup = [];
    for (let i = 0; i < this.lookupcashierreceivedrequest.length; i++) {
      if (this.lookupcashierreceivedrequest[i].selectedLookup) {
        this.checkedLookup.push({
          'code': this.lookupcashierreceivedrequest[i].code,
          'amount': this.lookupcashierreceivedrequest[i].request_amount,
          'currency': this.lookupcashierreceivedrequest[i].request_currency_code,
          'remarks': this.lookupcashierreceivedrequest[i].request_remarks,
          'agreement_no': this.lookupcashierreceivedrequest[i].agreement_no
        });
      }
    }

    // jika tidak di checklist
    if (this.checkedLookup.length === 0) {
      swal({
        title: this._listdialogconf,
        buttonsStyling: false,
        confirmButtonClass: 'btn btn-danger'
      }).catch(swal.noop)
      return
    } else {
      this.showSpinner = true;
    }

    this.dataTampDetail = [];
    for (let J = 0; J < this.checkedLookup.length; J++) {
      if (this.model.agreement_no == null) {
        this.callGetrowTopRate(this.checkedLookup[J].currency, this.valDate, false, true)
      }
      // param tambahan untuk getrow dynamic
      this.dataTampDetail = [{
        'p_cashier_transaction_code': this.param,
        'p_received_request_code': this.checkedLookup[J].code,
        'p_agreement_no': this.checkedLookup[J].agreement_no,
        'p_is_paid': true,
        'p_innitial_amount': this.checkedLookup[J].amount,
        'p_orig_amount': this.checkedLookup[J].amount,
        'p_orig_currency_code': this.checkedLookup[J].currency,
        'p_exch_rate': this.agreement_exch_rate,
        'p_base_amount': this.checkedLookup[J].amount * this.agreement_exch_rate,
        'p_remarks': this.checkedLookup[J].remarks,
      }];
      // end param tambahan untuk getrow dynamic
      this.dalservice.Insert(this.dataTampDetail, this.APIControllerCashierTransactionDetail, this.APIRouteForInsert)
        .subscribe(
          res => {
            const parse = JSON.parse(res);
            if (parse.result === 1) {
              if (J + 1 === this.checkedLookup.length) {
                this.showSpinner = false;
                this.showNotification('bottom', 'right', 'success');
                $('#datatableCashierTransactionList').DataTable().ajax.reload();
                $('#datatableLookupReceivedRequest').DataTable().ajax.reload();
                this.callGetrow();
              }
            } else {
              this.isBreak = true;
              this.showSpinner = false;
              $('#datatableCashierTransactionList').DataTable().ajax.reload();
              $('#datatableLookupReceivedRequest').DataTable().ajax.reload();
              this.swalPopUpMsg(parse.data);
            }
          },
          error => {
            this.isBreak = true;
            this.showSpinner = false;
            const parse = JSON.parse(error);
            this.swalPopUpMsg(parse.data);
          })
      if (this.isBreak) {
        break;
      }
    }
  }

  selectAllLookup() {
    for (let i = 0; i < this.lookupcashierreceivedrequest.length; i++) {
      this.lookupcashierreceivedrequest[i].selectedLookup = this.selectedAllLookup;
    }
  }

  checkIfAllLookupSelected() {
    this.selectedAllLookup = this.lookupcashierreceivedrequest.every(function (item: any) {
      return item.selectedLookup === true;
    })
  }
  //#endregion btnSelectAllLookup

  //#region btnDeleteAll
  btnDeleteAll() {
    this.isBreak = false;
    this.checkedList = [];
    for (let i = 0; i < this.listcashiertransactiondetail.length; i++) {
      if (this.listcashiertransactiondetail[i].selectedTable) {
        this.checkedList.push({
          'id': this.listcashiertransactiondetail[i].id,
        });
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
        this.dataTamp = [];
        for (let J = 0; J < this.checkedList.length; J++) {
          const idData = this.checkedList[J].id;
          // param tambahan untuk getrow dynamic
          this.dataTamp = [{
            'p_id': idData,
          }];
          // end param tambahan untuk getrow dynamic
          this.dalservice.Delete(this.dataTamp, this.APIControllerCashierTransactionDetail, this.APIRouteForDelete)
            .subscribe(
              res => {
                const parse = JSON.parse(res);
                if (parse.result === 1) {
                  if (J + 1 === this.checkedList.length) {
                    this.showSpinner = false;
                    this.showNotification('bottom', 'right', 'success');
                    $('#datatableCashierTransactionList').DataTable().ajax.reload();
                    this.callGetrow();
                  }
                } else {
                  this.isBreak = false;
                  this.showSpinner = false;
                  $('#datatableCashierTransactionList').DataTable().ajax.reload();
                  this.swalPopUpMsg(parse.data);
                }
              },
              error => {
                this.isBreak = false;
                this.showSpinner = false;
                const parse = JSON.parse(error);
                this.swalPopUpMsg(parse.data);
              });
          if (this.isBreak) {
            break;
          }
        }
      } else {
        this.showSpinner = false;
      }
    });
  }

  selectAllTable() {
    for (let i = 0; i < this.listcashiertransactiondetail.length; i++) {
      this.listcashiertransactiondetail[i].selectedTable = this.selectedAllTable;
    }
  }

  checkIfAllTableSelected() {
    this.selectedAllTable = this.listcashiertransactiondetail.every(function (item: any) {
      return item.selectedTable === true;
    })
  }
  //#endregion btnDeleteAll

  //#region button Generate
  btnGenerate(Code: any, Amount: any) {

    this.dataTampGenerate = [];

    this.dataTampGenerate = [{
      'p_code': Code,
      'p_status': '',
      'action': 'default'
    }];

    this.dataTamp = [];

    this.dataTamp.push({
      'p_cashier_transaction_code': Code,
    });

    this.dalservice.Delete(this.dataTamp, this.APIControllerCashierTransactionDetail, this.APIRouteForDeleteByTransaction)
      .subscribe(
        res => {
          const parse = JSON.parse(res);

          if (parse.result === 1) {

            // call web service
            this.dalservice.ExecSp(this.dataTampGenerate, this.APIController, this.APIRouteForGenerate)
              .subscribe(
                ress => {
                  const parses = JSON.parse(ress);

                  if (parses.result === 1) {
                    this.dataTamp = [];
                    this.dataTamp = parses.data;

                    let th = this;
                    var i = 0;
                    (function loopCashierTransactionGenerate() {

                      if (i < th.dataTamp.length) {

                        const codeData = th.dataTamp[i].code;
                        const currencyData = th.dataTamp[i].currency_code;
                        const nameData = th.dataTamp[i].transaction_name;
                        const moduleData = th.dataTamp[i].module_name;

                        if (moduleData !== null && moduleData !== '') {

                          th.dataTampModule = [{
                            'p_agreement_no': th.model.agreement_no,
                            'p_date': th.valDate, //'2020-06-30',
                            'p_obligation_type': codeData,
                            'p_transaction_code': codeData,
                            'action': 'default'
                          }];

                          th.dalservice.ExecSpAll(th.dataTampModule, moduleData)
                            .subscribe(
                              resss => {
                                const parsess = JSON.parse(resss);

                                th.dataTamps = [];
                                th.dataTamps = parsess.data;

                                if (parsess.result === 1) {
                                  if (th.dataTamps.length > 0) {
                                    th.listcashiertransactiondetailData = [];
                                    for (let JJ = 0; JJ < th.dataTamps.length; JJ++) {
                                      th.listcashiertransactiondetailData.push({
                                        'p_cashier_transaction_code': Code,
                                        'p_transaction_code': codeData,
                                        'p_agreement_no': th.model.agreement_no,
                                        'p_is_paid': false,
                                        'p_innitial_amount': th.dataTamps[JJ].agreement_amount,
                                        'p_orig_amount': 0,
                                        'p_orig_currency_code': currencyData,
                                        'p_exch_rate': th.agreement_exch_rate,
                                        'p_base_amount': 0,
                                        'p_installment_no': th.dataTamps[JJ].billing_no,
                                        'p_remarks': nameData,
                                      });

                                    }

                                    th.dalservice.Insert(th.listcashiertransactiondetailData, th.APIControllerCashierTransactionDetail, th.APIRouteForInsert)
                                      .subscribe(
                                        ressss => {
                                          const parsesss = JSON.parse(ressss);

                                          if (parsesss.result === 1) {
                                            if (th.dataTamp.length == i + 1) {
                                              setTimeout(() => {
                                                $('#datatableCashierTransactionAllocationList').DataTable().ajax.reload();
                                                $('#reloadWiz').click();
                                              }, 200);
                                              th.showSpinner = false;
                                            } else {
                                              i++;
                                              loopCashierTransactionGenerate();
                                            }
                                          } else {
                                            th.showSpinner = false;
                                            th.swalPopUpMsg(parsesss.data);
                                          }
                                        },
                                        error => {
                                          th.showSpinner = false;
                                          const parsesss = JSON.parse(error);
                                          th.swalPopUpMsg(parsesss.data);
                                        });
                                  }
                                } else {
                                  th.swalPopUpMsg(parsess.data);
                                  th.showSpinner = false;
                                }
                              },
                              error => {
                                th.showSpinner = false;
                                const parsess = JSON.parse(error);
                                th.swalPopUpMsg(parsess.data);
                              });
                        } else {

                          th.listcashiertransactiondetailData = [];

                          if (codeData === 'SPND') {
                            th.listcashiertransactiondetailData.push({
                              'p_cashier_transaction_code': Code,
                              'p_transaction_code': codeData,
                              'p_agreement_no': th.model.agreement_no,
                              'p_is_paid': true,
                              'p_innitial_amount': 0,
                              'p_orig_amount': Amount,
                              'p_orig_currency_code': currencyData,
                              'p_exch_rate': th.cashier_exch_rate,
                              'p_base_amount': Amount * th.cashier_exch_rate,
                              'p_remarks': nameData,
                            });

                            th.dalservice.Insert(th.listcashiertransactiondetailData, th.APIControllerCashierTransactionDetail, th.APIRouteForInsert)
                              .subscribe(
                                resss => {
                                  const parsesss = JSON.parse(resss);

                                  if (parsesss.result === 1) {
                                    if (th.dataTamp.length == i + 1) {
                                      setTimeout(() => {
                                        $('#datatableCashierTransactionAllocationList').DataTable().ajax.reload();
                                        $('#reloadWiz').click();
                                      }, 200);
                                      th.callGetrow();
                                    } else {
                                      i++;
                                      loopCashierTransactionGenerate();
                                    }
                                  } else {
                                    th.swalPopUpMsg(parsesss.data);
                                    th.showSpinner = false;
                                  }
                                },
                                error => {
                                  th.showSpinner = false;
                                  const parsesss = JSON.parse(error);
                                  th.swalPopUpMsg(parsesss.data);
                                });

                          } else {
                            th.listcashiertransactiondetailData.push({
                              'p_cashier_transaction_code': Code,
                              'p_transaction_code': codeData,
                              'p_agreement_no': th.model.agreement_no,
                              'p_is_paid': false,
                              'p_innitial_amount': 0,
                              'p_orig_amount': 0,
                              'p_orig_currency_code': currencyData,
                              'p_exch_rate': th.agreement_exch_rate,
                              'p_base_amount': 0,
                              'p_remarks': nameData,
                            });

                            th.dalservice.Insert(th.listcashiertransactiondetailData, th.APIControllerCashierTransactionDetail, th.APIRouteForInsert)
                              .subscribe(
                                resss => {
                                  const parsesss = JSON.parse(resss);

                                  if (parsesss.result === 1) {
                                    if (th.dataTamp.length == i + 1) {
                                      setTimeout(() => {
                                        $('#datatableCashierTransactionAllocationList').DataTable().ajax.reload();
                                        $('#reloadWiz').click();
                                      }, 200);
                                      th.showSpinner = false;
                                    } else {
                                      i++;
                                      loopCashierTransactionGenerate();
                                    }
                                  } else {
                                    th.swalPopUpMsg(parsesss.data);
                                  }
                                },
                                error => {
                                  th.showSpinner = false;
                                  const parsesss = JSON.parse(error);
                                  th.swalPopUpMsg(parsesss.data);
                                });
                          }
                        }
                      }
                    })();
                    // this.showNotification('bottom', 'right', 'success');
                  } else {
                    this.swalPopUpMsg(parses.data);
                    this.showSpinner = false;
                  }
                },
                error => {
                  this.showSpinner = false;
                  const parses = JSON.parse(error);
                  this.swalPopUpMsg(parses.data);
                });
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
  //#endregion button Generate

  //#region btnGenerateByClick
  btnGenerateByClick(Code: any, Amount: any, isValid: boolean) {
    if (this.model.cashier_base_amount > 0) { // (+) Ari 2023-10-10 ket : jika base amount 0 tidak lakukan calculate
      $('#btnSubmitCashierTransactionDetail').click();
      setTimeout(() => {
        this.allocationGenerate(Code, Amount, isValid);
      }, 500);
    }
    else {
      this.showSpinner = false;
      this.swalPopUpMsg('Please input Base Amount');
    }
  }

  allocationGenerate(Code: any, Amount: any, isValid: boolean) {
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

    this.dataTampStatus = [];

    this.dataTampStatus.push({
      'p_code': Code,
      'p_cashier_transaction_code': Code,
      'action': 'getResponse'
    });

    // call web service
    this.dalservice.Delete(this.dataTampStatus, this.APIControllerCashierTransactionDetail, this.APIRouteForDeleteByTransaction)
      .subscribe(
        res => {
          const parse = JSON.parse(res);
          if (parse.result === 1) {
            // call web service
            this.dalservice.ExecSp(this.dataTampStatus, this.APIController, this.APIRouteForGenerate)
              .subscribe(
                ress => {
                  const parses = JSON.parse(ress);

                  if (parses.result === 1) {
                    this.dataTamp = [];
                    this.dataTamp = parses.data;

                    if (this.dataTamp.length > 0) {
                      for (let J = 0; J < this.dataTamp.length; J++) {
                        const codeData = this.dataTamp[J].code;
                        const currencyData = this.dataTamp[J].currency_code;
                        const nameData = this.dataTamp[J].transaction_name;
                        const moduleData = this.dataTamp[J].module_name;
                        console.log(moduleData)
                        if (moduleData != null && moduleData !== '') {

                          // param tambahan untuk button Generate dynamic
                          this.dataTempProcess = [{
                            'p_agreement_no': this.model.agreement_no,
                            'p_date': this.valDate,
                            'p_obligation_type': codeData,
                            'p_transaction_code': codeData,
                            'action': 'default'
                          }];
                          // param tambahan untuk button Generate dynamic

                          this.dalservice.ExecSpAll(this.dataTempProcess, moduleData)
                            .subscribe(
                              resss => {
                                const parsess = JSON.parse(resss);
                                this.dataTamps = [];
                                this.dataTamps = parsess.data;

                                if (parsess.result === 1) {
                                  if (this.dataTamps.length > 0) {
                                    for (let JJ = 0; JJ < this.dataTamps.length; JJ++) {
                                      this.listcashiertransactiondetailData = [];
                                      this.listcashiertransactiondetailData.push({
                                        'p_cashier_transaction_code': Code,
                                        'p_transaction_code': codeData,
                                        'p_agreement_no': this.model.agreement_no,
                                        'p_is_paid': false,
                                        'p_innitial_amount': this.dataTamps[JJ].agreement_amount,
                                        'p_orig_amount': 0,
                                        'p_orig_currency_code': currencyData,
                                        'p_exch_rate': this.agreement_exch_rate,
                                        'p_base_amount': 0,
                                        'p_installment_no': this.dataTamps[JJ].installment_no,
                                        'p_remarks': nameData,
                                      });

                                      this.dalservice.Insert(this.listcashiertransactiondetailData, this.APIControllerCashierTransactionDetail, this.APIRouteForInsert)
                                        .subscribe(
                                          ressss => {
                                            const parsesss = JSON.parse(ressss);

                                            if (parsesss.result === 1) {
                                              this.btnAutoAllocation();
                                              this.showSpinner = false;
                                            } else {
                                              if (J + 1 == this.dataTamp.length) {
                                                this.showSpinner = false;
                                                this.swalPopUpMsg(parsesss.data);
                                              }
                                            }
                                          },
                                          error => {
                                            this.showSpinner = false;
                                            const parsesss = JSON.parse(error);
                                            if (J + 1 == this.dataTamp.length) {
                                              this.swalPopUpMsg(parsesss.data);
                                            }
                                          });
                                    }
                                  }
                                } else {
                                  this.swalPopUpMsg(parsess.data);
                                  this.showSpinner = false;
                                }
                              },
                              error => {
                                this.showSpinner = false;
                                const parsess = JSON.parse(error);
                                this.swalPopUpMsg(parsess.data);
                              });
                        } else {
                          this.listcashiertransactiondetailData = [];
                          if (codeData === 'SPND') {
                            this.listcashiertransactiondetailData.push({
                              'p_cashier_transaction_code': Code,
                              'p_transaction_code': codeData,
                              'p_agreement_no': this.model.agreement_no,
                              'p_is_paid': true,
                              'p_innitial_amount': 0,
                              'p_orig_amount': Amount,
                              'p_orig_currency_code': currencyData,
                              'p_exch_rate': this.cashier_exch_rate,
                              'p_base_amount': Amount * this.cashier_exch_rate,
                              'p_remarks': nameData,
                            });

                            this.dalservice.Insert(this.listcashiertransactiondetailData, this.APIControllerCashierTransactionDetail, this.APIRouteForInsert)
                              .subscribe(
                                resss => {
                                  const parsesss = JSON.parse(resss);

                                  if (parsesss.result === 1) {
                                    this.callGetrow();
                                  } else {
                                    this.showSpinner = false;
                                    this.swalPopUpMsg(parsesss.data);
                                  }
                                },
                                error => {
                                  this.showSpinner = false;
                                  const parsesss = JSON.parse(error);
                                  this.swalPopUpMsg(parsesss.data);
                                });

                          } else {
                            this.listcashiertransactiondetailData.push({
                              'p_cashier_transaction_code': Code,
                              'p_transaction_code': codeData,
                              'p_agreement_no': this.model.agreement_no,
                              'p_is_paid': false,
                              'p_innitial_amount': 0,
                              'p_orig_amount': 0,
                              'p_orig_currency_code': currencyData,
                              'p_exch_rate': this.agreement_exch_rate,
                              'p_base_amount': 0,
                              'p_remarks': nameData,
                            });

                            this.dalservice.Insert(this.listcashiertransactiondetailData, this.APIControllerCashierTransactionDetail, this.APIRouteForInsert)
                              .subscribe(
                                resss => {
                                  const parsesss = JSON.parse(resss);

                                  if (parsesss.result === 1) {
                                    this.btnAutoAllocation();
                                  } else {
                                    this.showSpinner = false;
                                    this.swalPopUpMsg(parsesss.data);
                                  }
                                },
                                error => {
                                  this.showSpinner = false;
                                  const parsesss = JSON.parse(error);
                                  this.swalPopUpMsg(parsesss.data);
                                });
                          }
                        }

                      }
                    } else {
                      this.showSpinner = false;
                      this.swalPopUpMsg(parses.data);
                    }
                  } else {
                    this.showSpinner = false;
                    this.swalPopUpMsg(parses.data);
                  }
                },
                error => {
                  this.showSpinner = false;
                  const parses = JSON.parse(error);
                  this.swalPopUpMsg(parses.data);
                });
          } else {
            this.showSpinner = false;
            this.swalPopUpMsg(parse.data);
          }
        },
        error => {
          this.showSpinner = false;
          const parse = JSON.parse(error);
          this.swalPopUpMsg(parse.data);
        });
  }
  //#endregion btnGenerateByClick

  //#region button save list
  btnSaveList() {
    this.isSave = true;
    this.listcashiertransactiondetailData = [];

    var i = 0;

    var getID = $('[name="p_id"]')
      .map(function () { return $(this).val(); }).get();

    var getAmount = $('[name="p_base_amount"]')
      .map(function () { return $(this).val(); }).get();

    var getIsPaid = $('[name="p_is_paid"]')
      .map(function () { return $(this).prop('checked'); }).get();

    while (i < getID.length) {

      while (i < getAmount.length) {

        while (i < getIsPaid.length) {
          this.listcashiertransactiondetailData.push(
            this.JSToNumberFloats({
              p_id: getID[i],
              p_cashier_transaction_code: this.param,
              p_base_amount: getAmount[i],
              p_is_paid: getIsPaid[i]
            })
          );

          i++;
        }
        i++;
      }

      i++;
    }

    //#region web service
    this.dalservice.Update(this.listcashiertransactiondetailData, this.APIControllerCashierTransactionDetail, this.APIRouteForUpdate)
      .subscribe(
        res => {
          const parse = JSON.parse(res);

          if (parse.result === 1) {
            this.showNotification('bottom', 'right', 'success');
            $('#datatableCashierTransactionList').DataTable().ajax.reload();
            this.callGetrow();
          } else {
            this.swalPopUpMsg(parse.data);
          }
        },
        error => {
          const parse = JSON.parse(error);
          this.swalPopUpMsg(parse.data);

        });
    //#endregion web service

  }

  //#region onBlur
  onBlur(event, i, type) {
    var getRate = $('[name="p_exch_rate"]')
      .map(function () { return $(this).val(); }).get();

    var getAmount = $('[name="p_innitial_amount"]')
      .map(function () { return $(this).val(); }).get();
    var innitial_amount = getAmount[i] * getRate[i];

    var eventTemp;

    if (type === 'amount') {
      if (event.target.value.match('[0-9]+(,[0-9]+)')) {
        if (event.target.value.match('(\.\d+)')) {

          event = '' + event.target.value;
          event = event.trim();
          eventTemp = ~~event;
          event = event.replace(/(\d)(?=(\d\d\d)+(?!\d))/g, '$1,');
        } else {
          event = '' + event.target.value;
          event = event.trim();
          eventTemp = ~~event.replace(/[ ]*,[ ]*|[ ]+/g, '');
          event = parseFloat(event.replace(/,/g, '')).toFixed(2); // ganti jadi 6 kalo mau pct
          event = event.replace(/(\d)(?=(\d\d\d)+(?!\d))/g, '$1,');
        }
      } else {
        event = '' + event.target.value;
        event = event.trim();
        eventTemp = ~~event;
        event = parseFloat(event).toFixed(2); // ganti jadi 6 kalo mau pct
        event = event.replace(/(\d)(?=(\d\d\d)+(?!\d))/g, '$1,');
      }

      // event = '' + event.target.value;
      // event = event.trim();
      if (eventTemp > 0) {
        if (eventTemp <= innitial_amount) {
          $('#is_paid' + i)
            .map(function () { return $(this).prop('checked', true); }).get();
        } else if (innitial_amount == 0) {
          $('#is_paid' + i)
            .map(function () { return $(this).prop('checked', true); }).get();
        } else {
          $('#is_paid' + i)
            .map(function () { return $(this).prop('checked', false); }).get();
        }
      } else {
        $('#is_paid' + i)
          .map(function () { return $(this).prop('checked', false); }).get();
      }

      // event = parseFloat(event).toFixed(2); // ganti jadi 6 kalo mau pct
      // event = event.replace(/(\d)(?=(\d\d\d)+(?!\d))/g, '$1,');
    } else {
      event = '' + event.target.value;
      event = event.trim();
      event = parseFloat(event).toFixed(6);
    }

    if (event === 'NaN') {
      event = 0;
      event = parseFloat(event).toFixed(2);
    }

    if (type === 'amount') {
      $('#base_amount' + i)
        .map(function () { return $(this).val(event); }).get();
    } else {
      $('#base_amount' + i)
        .map(function () { return $(this).val(event); }).get();
    }
  }
  //#endregion onBlur

  //#region onFocus
  onFocus(event, i, type) {
    event = '' + event.target.value;

    if (event != null) {
      event = event.replace(/[ ]*,[ ]*|[ ]+/g, '');
    }

    if (type === 'amount') {
      $('#base_amount' + i)
        .map(function () { return $(this).val(event); }).get();
    } else {
      $('#base_amount' + i)
        .map(function () { return $(this).val(event); }).get();
    }
  }
  //#endregion onFocus
  //#endregion button save list

  //#region OnPaid
  OnPaid(event, index: any) {

    var getAmount = $('[name="p_innitial_amount"]')
      .map(function () { return $(this).val(); }).get();

    var getRate = $('[name="p_exch_rate"]')
      .map(function () { return $(this).val(); }).get();

    var getIsPaid = $('[name="p_is_paid"]')
      .map(function () { return $(this).prop('checked'); }).get();

    if (getIsPaid[index]) {
      event = getAmount[index] * getRate[index];
    } else {
      event = 0;
    }
    event = parseFloat(event).toFixed(2);
    event = event.replace(/(\d)(?=(\d\d\d)+(?!\d))/g, '$1,');
    $('#base_amount' + index)
      .map(function () { return $(this).val(event); }).get();

  }
  //#endregion OnPaid

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

  //#region ClientName
  btnLookupClientName() {
    $('#datatableLookupClientName').DataTable().clear().destroy();
    $('#datatableLookupClientName').DataTable({
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
          'p_cre_by': this.uid,
        });

        this.dalservice.GetrowsOpl(dtParameters, this.APIControllerClientName, this.APIRouteForLookup).subscribe(resp => {
          const parse = JSON.parse(resp);
          this.lookupclientname = parse.data;
          if (parse.data != null) {
            this.lookupclientname.numberIndex = dtParameters.start;

          }
          callback({
            draw: parse.draw,
            recordsTotal: parse.recordsTotal,
            recordsFiltered: parse.recordsFiltered,
            data: []
          })
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

  btnSelectRowClientName(client_no: String, client_name: String) {
    this.model.client_no = client_no;
    this.model.client_name = client_name;
    this.model.received_request_code = undefined;
    this.model.pdc_code = undefined;
    this.model.pdc_no = undefined;
    this.model.agreement_no = undefined;
    this.model.agreement_external_no = undefined;
    this.model.currency_code = undefined;
    $('#lookupModalClientName').modal('hide');
  }

  resetClientAndAgreement() {
    this.model.client_no = undefined;
    this.model.client_name = undefined;
    this.model.agreement_no = undefined;
    this.model.agreement_external_no = undefined;
    this.model.currency_code = undefined;
    this.model.received_request_code = undefined;
    this.model.pdc_code = undefined;
    this.model.pdc_no = undefined;
  }

  resetAgreement() {
    this.model.agreement_no = undefined;
    this.model.agreement_external_no = undefined;
    this.model.currency_code = undefined;
  }
  //#endregion ClientName
}


