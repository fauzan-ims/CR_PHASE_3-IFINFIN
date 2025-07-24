import { Component, OnInit, ElementRef, ViewChild, AfterViewInit } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { NgForm } from '@angular/forms';
import swal from 'sweetalert2';
import { DataTableDirective } from 'angular-datatables';
import { BaseComponent } from '../../../../../base.component';
import { DALService } from '../../../../../DALservice.service';
import { t } from '@angular/core/src/render3';

@Component({
  moduleId: module.id,
  selector: 'app-root',
  templateUrl: './allocationdetail.component.html'
})

export class AllocationdetailComponent extends BaseComponent implements OnInit {
  // get param from url
  param = this.getRouteparam.snapshot.paramMap.get('id');

  // variable
  public NumberOnlyPattern = this._numberonlyformat;
  public listallocationdetail: any = [];
  public allocationdetailData: any = [];
  public listcashiertransactiondetailData: any = [];
  public listallocationdetailData: any = [];
  public isReadOnly: Boolean = false;
  public isReadOnlyList: Boolean = false;
  public isButton: Boolean = false;
  public isrowCount: Boolean = false;
  public isSave: Boolean = false;
  public isCurrency: Boolean = false;
  public isLabel: Boolean = true;
  public isBreak: Boolean = false;
  public is_received_request: Boolean;
  public lookupbranch: any = [];
  public lookupagreement: any = [];
  public lookupdeposit: any = [];
  public lookupcashierreceivedrequest: any = [];
  public allocation_orig_amount: any = [];
  public allocation_exch_rate: any = [];
  public allocation_base_amount: any = [];
  public total_allocated: any = [];
  public lookupgllink: any = [];
  public agreement_exch_rate: any;
  private exch_rate: any = [];
  private valDate: any;
  private dataRoleTamp: any = [];
  private dataTamp: any = [];
  private setStyle: any = [];
  private dataTamps: any = [];
  public lookupapproval: any = [];

  //role access
  private RoleAccessCode = 'R00003260000327A';

  // API Controller
  private APIController: String = 'DepositAllocation';
  private APIControllerSysBranch: String = 'SysBranch';
  private APIControllerDepositAllocationDetail: String = 'DepositAllocationDetail';
  private APIControllerForDepositMain: String = 'AgreementDeposit';
  private APIControllerForJurnalGlLink: String = 'JournalGlLink';
  private APIControllerForAgreement: String = 'AgreementMain';
  private APIControllerCashierReceivedRequest: String = 'CashierReceivedRequest';
  private APIControllerSysCurrencyRate: String = 'SysCurrencyRate';
  private APIControllerApprovalSchedule: String = 'ApprovalSchedule';

  // API Function
  private APIRouteForLookup: String = 'GetRowsForLookup';
  private APIRouteForLookupDeposit: String = 'GetRowsForLookupDepositAllocation';
  private APIRouteForLookupGlLink: String = 'GetRowsForLookupByIsBank';
  private APIRouteForCashierReceivedRequestLookup: String = 'GetRowsForDepositAllocationDetailLookup';
  private APIRouteForGetRows: String = 'GetRows';
  private APIRouteForGetRow: String = 'GetRow';
  private APIRouteForGetRowForTopRate: String = 'ExecSpTopRate';
  private APIRouteForInsert: String = 'Insert';
  private APIRouteForDelete: String = 'Delete';
  private APIRouteForUpdate: String = 'Update';
  private APIRouteForDeleteByTransaction: String = 'DeleteByTransaction';
  private APIRouteForGenerate: String = 'ExecSpForGetGenerate';
  private APIRouteForAutoAllocation: String = 'ExecSpForGetAutoAllocation';
  private APIRouteForReversal: String = 'ExecSpForGetReversal';
  private APIRouteForPaid: String = 'ExecSpForGetPaid';
  private APIRouteForProceed: String = 'ExecSpForProceed';
  private APIRouteForCancel: String = 'ExecSpForGetCancel';

  // form 2 way binding
  model: any = {};

  // checklist
  public selectedAllTable: any;
  public selectedAllLookup: any;
  private checkedList: any = [];
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
    private _elementRef: ElementRef
  ) { super(); }

  ngOnInit() {
    this.Delimiter(this._elementRef);
    this.callGetRole(this.userId, this._elementRef, this.dalservice, this.RoleAccessCode, this.route);

    if (this.param != null) {
      // this.isReadOnly = true;

      // call web service
      this.callGetrow();
      this.loadData();
    } else {
      // this.callGetrowByUser();
      this.model.allocation_exch_rate = 1;
      this.model.allocation_orig_amount = 0;
      this.model.allocation_base_amount = 0
      this.allocation_orig_amount = 0;
      this.allocation_exch_rate = 1;
      this.allocation_base_amount = 0;
      this.model.allocation_status = 'HOLD';
      this.model.is_received_request = '0';
      this.showSpinner = false;
      this.is_received_request = false;
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
          'p_deposit_allocation_code': this.param
        });
        // end param tambahan untuk getrows dynamic
        this.dalservice.Getrows(dtParameters, this.APIControllerDepositAllocationDetail, this.APIRouteForGetRows).subscribe(resp => {
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

          this.listallocationdetail = parse.data;
          if (parse.data != null) {
            this.listallocationdetail.numberIndex = dtParameters.start;
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
      columnDefs: [{ orderable: false, width: '5%', targets: [0, 1, 8] }], // for disabled coloumn
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
          this.valDate = parsedata.allocation_value_date;
          const ngbGetrow = this.getrowNgb(parse.data[0]);

          this.isReadOnly = true;

          if (parsedata.allocation_status !== 'HOLD') {
            this.isButton = true;
          } else {
            this.isButton = false;
          }

          if (this.isSave) {
            if (this.allocation_orig_amount === parsedata.allocation_orig_amount) {
              this.isLabel = true;
            } else {
              this.isLabel = false;
            }
          }

          if (parsedata.rows_count !== 0) {
            this.isrowCount = true;
          } else {
            this.isrowCount = false;
          }

          // checkbox
          if (parsedata.is_received_request === '1') {
            this.is_received_request = true;
            // parsedata.is_received_request = true;
          } else {
            this.is_received_request = false;
            // parsedata.is_received_request = false;
          }
          // end checkbox

          this.allocation_orig_amount = parsedata.allocation_orig_amount;
          this.allocation_exch_rate = parsedata.allocation_exch_rate;
          this.allocation_base_amount = parsedata.allocation_base_amount;

          // mapper dbtoui
          Object.assign(this.model, ngbGetrow);
          // end mapper dbtoui

          this.callGetrowTopRate(this.model.allocation_currency_code, this.valDate, false, false)
          this.callGetrowTopRate(this.model.currency_code, this.valDate, false, true)
          this.showSpinner = false;
        },
        error => {
          console.log('There was an error while Retrieving Data(API) !!!' + error);
        });
  }
  //#endregion  getrow data

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
              this.model.allocation_exch_rate = parsedata.exch_rate
              // this.exch_rate = parsedata.exch_rate
              // this.model.allocation_orig_amount = (this.model.allocation_base_amount / parsedata.exch_rate);
              if (this.param == null) {
                this.model.allocation_base_amount = (this.model.allocation_orig_amount * parsedata.exch_rate);
              } else {
                this.model.allocation_orig_amount = (this.model.allocation_base_amount / parsedata.exch_rate);
              }
            }
          }
        },
        error => {
          console.log('There was an error while Retrieving Data(API) !!!' + error);
        });
  }
  //#endregion  getrow data rate

  //#region  getrow data rate Request
  callGetrowTopRateRequest(currency: any, date: Date, index: any) {
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
          this.exch_rate.splice(index, 0, {
            'rate': parsedata.exch_rate
          })
        },
        error => {
          console.log('There was an error while Retrieving Data(API) !!!' + error);
        });
  }
  //#endregion  getrow data rate Request

  //#region ddl receivedType
  receivedType(event: any) {
    this.model.is_received_request = event.target.value;
    if (this.model.is_received_request === '1') {
      this.is_received_request = true;
      // this.allocation_orig_amount = 0;
      // this.model.allocation_orig_amoun = 0;
    } else {
      this.is_received_request = false;
    }
  }
  //#endregion ddl receivedType

  //#region  getrow data by user
  // callGetrowByUser() {
  //   // param tambahan untuk getrow dynamic
  //   this.dataTamp = [{
  //     'p_employee_code': this.userId,
  //   }];
  //   // end param tambahan untuk getrow dynamic
  //   this.dalservice.Getrow(this.dataTamp, this.APIControllerCashierMain, this.APIRouteForGetRowByEmployeeCode)
  //     .subscribe(
  //       res => {
  //         const parse = JSON.parse(res);
  //         const parsedata = this.getrowNgb(parse.data[0]);

  //         this.model.cashier_code = parsedata.code
  //         this.model.cashier_name = parsedata.employee_name
  //         this.model.branch_code = parsedata.branch_code
  //         this.model.branch_name = parsedata.branch_name
  //         this.model.allocation_trx_date = parsedata.cashier_open_date


  //       },
  //       error => {
  //         console.log('There was an error while Retrieving Data(API) !!!' + error);
  //       });
  // }
  //#endregion  getrow data by user

  //#region form submit
  onFormSubmit(allocationdetailForm: NgForm, isValid: boolean) {
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

    this.allocationdetailData = this.JSToNumberFloats(allocationdetailForm);

    if (this.allocationdetailData.p_allocation_trx_date === '') {
      this.allocationdetailData.p_allocation_trx_date = undefined;
    }

    if (this.is_received_request) {
      this.allocationdetailData.p_is_received_request = '1';
    } else {
      this.allocationdetailData.p_is_received_request = '0';
    }
    const usersJson: any[] = Array.of(this.allocationdetailData);
    if (this.param != null) {
      // call web service
      this.dalservice.Update(usersJson, this.APIController, this.APIRouteForUpdate)
        .subscribe(
          res => {
            this.showSpinner = false;
            const parse = JSON.parse(res);
            if (parse.result === 1) {
              this.showNotification('bottom', 'right', 'success');
              if (this.is_received_request) {
                if (this.allocationdetailData.p_is_received_request === '0') {
                  this.btnGenerate(this.param, this.allocationdetailData.p_allocation_orig_amount)
                }
              }
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

              if (this.allocationdetailData.p_is_received_request === '0') {
                this.btnGenerate(parse.code, this.allocationdetailData.p_allocation_orig_amount)
              }

              this.route.navigate(['/depositmanagement/suballocationlist/allocationdetail', parse.code]);
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

  //#region origAmount
  origAmount(event: any) {
    this.allocation_orig_amount = event.target.value;
    this.model.allocation_base_amount = this.allocation_orig_amount * this.allocation_exch_rate;
  }
  //#endregion origAmount

  //#region exchRate
  exchRate(event: any) {
    this.allocation_exch_rate = event.target.value;
    // this.model.allocation_orig_amount = this.allocation_base_amount / this.allocation_exch_rate;
    this.model.allocation_base_amount = this.model.allocation_orig_amount * this.allocation_exch_rate;
  }
  //#endregion exchRate

  //#region valueDate
  valueDate(event: any) {
    this.model.allocation_value_date = event;
    this.valDate = this.dateFormatList(event.singleDate.formatted);
    if (this.model.allocation_currency_code !== '') {
      this.callGetrowTopRate(this.model.allocation_currency_code, this.valDate, true, false)
    }
    if (this.model.currency_code !== '') {
      this.callGetrowTopRate(this.model.currency_code, this.valDate, false, true)
    }
  }
  //#endregion valueDate

  //#region button back
  btnBack() {
    this.route.navigate(['/depositmanagement/suballocationlist']);
    $('#datatableAllocationList').DataTable().ajax.reload();
  }
  //#endregion  button back

  //#region Lookup GlLink
  btnLookupGlLink() {
    $('#datatableLookupGlLink').DataTable().clear().destroy();
    $('#datatableLookupGlLink').DataTable({
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
          'p_is_bank': '1'
        });
        // end param tambahan untuk getrows dynamic
        this.dalservice.Getrows(dtParameters, this.APIControllerForJurnalGlLink, this.APIRouteForLookupGlLink).subscribe(resp => {
          const parse = JSON.parse(resp);
          this.lookupgllink = parse.data;
          if (parse.data != null) {
            this.lookupgllink.numberIndex = dtParameters.start;
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

  btnSelectRowGlLink(gl_link_code: String, gl_link_name: string) {
    this.model.deposit_gl_link_code = gl_link_code;
    this.model.deposit_gl_link_name = gl_link_name;
    $('#lookupModalGlLink').modal('hide');
  }
  //#endregion Lookup GlLink

  //#region button Reversal
  btnReversal() {
    // param tambahan untuk button Reversal dynamic
    this.dataRoleTamp = [{
      'p_code': this.param,
      'action': 'default'
    }];
    // param tambahan untuk button Reversal dynamic

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
        this.dalservice.ExecSp(this.dataRoleTamp, this.APIController, this.APIRouteForReversal)
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
  //#endregion button Reversal

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
    }

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

  //#region button Generate
  btnGenerate(Code: any, Amount: any) {
    // param tambahan untuk button Generate dynamic
    this.dataRoleTamp = [{
      'p_code': Code,
      'action': 'default'
    }];
    // param tambahan untuk button Generate dynamic

    this.dataTamp = [];
    // param tambahan untuk delete dynamic
    this.dataTamp.push({
      'p_deposit_allocation_code': Code,
    });
    // end param tambahan untuk delete dynamic

    // call web service
    this.dalservice.Delete(this.dataTamp, this.APIControllerDepositAllocationDetail, this.APIRouteForDeleteByTransaction)
      .subscribe(
        res => {
          this.showSpinner = false;
          const parse = JSON.parse(res);
          if (parse.result === 1) {
            // call web service
            this.dalservice.ExecSp(this.dataRoleTamp, this.APIController, this.APIRouteForGenerate)
              .subscribe(
                ress => {
                  this.showSpinner = false;
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

                        if (moduleData != null && moduleData !== '') {
                          // param tambahan untuk button Generate dynamic
                          this.dataRoleTamp = [{
                            'p_agreement_no': this.model.agreement_no, //'0000.AGR.2009.000201',
                            'p_date': this.valDate, //'2020-06-30',
                            'p_obligation_type': codeData,
                            'p_transaction_code': codeData,
                            'action': 'default'
                          }];
                          // param tambahan untuk button Generate dynamic
                          this.dalservice.ExecSpAll(this.dataRoleTamp, moduleData)
                            .subscribe(
                              resss => {
                                this.showSpinner = false;
                                const parsess = JSON.parse(resss);
                                this.dataTamps = [];
                                this.dataTamps = parsess.data;

                                if (parsess.result === 1) {
                                  if (this.dataTamps.length > 0) {
                                    this.listcashiertransactiondetailData = [];
                                    for (let JJ = 0; JJ < this.dataTamps.length; JJ++) {
                                      this.listcashiertransactiondetailData.push({
                                        'p_deposit_allocation_code': Code,
                                        'p_transaction_code': codeData,
                                        'p_is_paid': false,
                                        'p_innitial_amount': this.dataTamps[JJ].agreement_amount,
                                        'p_orig_amount': 0,
                                        'p_orig_currency_code': currencyData,
                                        'p_exch_rate': this.agreement_exch_rate,
                                        'p_base_amount': 0,
                                        'p_installment_no': this.dataTamps[JJ].billing_no,
                                        'p_remarks': nameData,
                                      });
                                    }

                                    this.dalservice.Insert(this.listcashiertransactiondetailData, this.APIControllerDepositAllocationDetail, this.APIRouteForInsert)
                                      .subscribe(
                                        ressss => {
                                          this.showSpinner = false;
                                          const parsesss = JSON.parse(ressss);

                                          if (parsesss.result === 1) {
                                            // this.showNotification('bottom', 'right', 'success');
                                            $('#datatableAllocationDetail').DataTable().ajax.reload();
                                            // this.callGetrow();
                                          } else {
                                            this.swalPopUpMsg(parsesss.data);
                                          }
                                        },
                                        error => {
                                          this.showSpinner = false;
                                          const parsesss = JSON.parse(error);
                                          this.swalPopUpMsg(parsesss.data);
                                        });
                                  }
                                } else {
                                  this.swalPopUpMsg(parsess.data);
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
                              'p_deposit_allocation_code': Code,
                              'p_transaction_code': codeData,
                              'p_is_paid': false,
                              'p_innitial_amount': 0,
                              'p_orig_amount': Amount,
                              'p_orig_currency_code': currencyData,
                              'p_exch_rate': this.agreement_exch_rate,
                              'p_base_amount': Amount * this.agreement_exch_rate,
                              'p_remarks': nameData,
                            });

                            this.dalservice.Insert(this.listcashiertransactiondetailData, this.APIControllerDepositAllocationDetail, this.APIRouteForInsert)
                              .subscribe(
                                resss => {
                                  this.showSpinner = false;
                                  const parsesss = JSON.parse(resss);

                                  if (parsesss.result === 1) {
                                    // this.showNotification('bottom', 'right', 'success');
                                    $('#datatableAllocationDetail').DataTable().ajax.reload();
                                    // this.callGetrow();
                                  } else {
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
                              'p_deposit_allocation_code': Code,
                              'p_transaction_code': codeData,
                              'p_is_paid': false,
                              'p_innitial_amount': 0,
                              'p_orig_amount': 0,
                              'p_orig_currency_code': currencyData,
                              'p_exch_rate': this.agreement_exch_rate,
                              'p_base_amount': 0,
                              'p_remarks': nameData,
                            });

                            this.dalservice.Insert(this.listcashiertransactiondetailData, this.APIControllerDepositAllocationDetail, this.APIRouteForInsert)
                              .subscribe(
                                resss => {
                                  this.showSpinner = false;
                                  const parsesss = JSON.parse(resss);

                                  if (parsesss.result === 1) {
                                    // this.showNotification('bottom', 'right', 'success');
                                    $('#datatableAllocationDetail').DataTable().ajax.reload();
                                    // this.callGetrow();
                                  } else {
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
                    }
                    // this.showNotification('bottom', 'right', 'success');
                  } else {
                    this.swalPopUpMsg(parses.data);
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

    // } else {
    //   this.showSpinner = false;
    // }
    // });
  }
  //#endregion button Generate

  //#region button Generate
  btnGenerateByClick(Code: any, Amount: any) {
    // param tambahan untuk button Generate dynamic
    this.dataRoleTamp = [{
      'p_code': Code,
      'action': 'default'
    }];
    // param tambahan untuk button Generate dynamic

    this.dataTamp = [];
    // param tambahan untuk delete dynamic
    this.dataTamp.push({
      'p_deposit_allocation_code': Code,
    });
    // end param tambahan untuk delete dynamic

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
        this.dalservice.Delete(this.dataTamp, this.APIControllerDepositAllocationDetail, this.APIRouteForDeleteByTransaction)
          .subscribe(
            res => {
              this.showSpinner = false;
              const parse = JSON.parse(res);
              if (parse.result === 1) {
                // call web service
                this.dalservice.ExecSp(this.dataRoleTamp, this.APIController, this.APIRouteForGenerate)
                  .subscribe(
                    ress => {
                      this.showSpinner = false;
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

                            if (moduleData != null && moduleData !== '') {
                              // param tambahan untuk button Generate dynamic
                              this.dataRoleTamp = [{
                                'p_agreement_no': this.model.agreement_no, //'0000.AGR.2009.000201',
                                'p_date': this.valDate, //'2020-06-30',
                                'p_obligation_type': codeData,
                                'p_transaction_code': codeData,
                                'action': 'default'
                              }];
                              // param tambahan untuk button Generate dynamic
                              this.dalservice.ExecSpAll(this.dataRoleTamp, moduleData)
                                .subscribe(
                                  resss => {
                                    this.showSpinner = false;
                                    const parsess = JSON.parse(resss);
                                    this.dataTamps = [];
                                    this.dataTamps = parsess.data;

                                    if (parsess.result === 1) {
                                      if (this.dataTamps.length > 0) {
                                        this.listcashiertransactiondetailData = [];
                                        for (let JJ = 0; JJ < this.dataTamps.length; JJ++) {
                                          this.listcashiertransactiondetailData.push({
                                            'p_deposit_allocation_code': Code,
                                            'p_transaction_code': codeData,
                                            'p_is_paid': false,
                                            'p_innitial_amount': this.dataTamps[JJ].agreement_amount,
                                            'p_orig_amount': 0,
                                            'p_orig_currency_code': currencyData,
                                            'p_exch_rate': this.agreement_exch_rate,
                                            'p_base_amount': 0,
                                            'p_installment_no': this.dataTamps[JJ].installment_no,
                                            'p_remarks': nameData,
                                          });
                                        }

                                        this.dalservice.Insert(this.listcashiertransactiondetailData, this.APIControllerDepositAllocationDetail, this.APIRouteForInsert)
                                          .subscribe(
                                            ressss => {
                                              this.showSpinner = false;
                                              const parsesss = JSON.parse(ressss);

                                              if (parsesss.result === 1) {
                                                // if (J === this.dataTamp.length - 1) {
                                                this.btnAutoAllocation();
                                                // }
                                              } else {
                                                this.swalPopUpMsg(parsesss.data);
                                              }
                                            },
                                            error => {
                                              this.showSpinner = false;
                                              const parsesss = JSON.parse(error);
                                              this.swalPopUpMsg(parsesss.data);
                                            });
                                      }
                                    } else {
                                      this.swalPopUpMsg(parsess.data);
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
                                  'p_deposit_allocation_code': Code,
                                  'p_transaction_code': codeData,
                                  'p_is_paid': false,
                                  'p_innitial_amount': 0,
                                  'p_orig_amount': Amount,
                                  'p_orig_currency_code': currencyData,
                                  'p_exch_rate': this.agreement_exch_rate,
                                  'p_base_amount': Amount * this.agreement_exch_rate,
                                  'p_remarks': nameData,
                                });

                                this.dalservice.Insert(this.listcashiertransactiondetailData, this.APIControllerDepositAllocationDetail, this.APIRouteForInsert)
                                  .subscribe(
                                    resss => {
                                      this.showSpinner = false;
                                      const parsesss = JSON.parse(resss);

                                      if (parsesss.result === 1) {
                                        // this.showNotification('bottom', 'right', 'success');
                                        $('#datatableAllocationDetail').DataTable().ajax.reload();
                                        //   this.callGetrow();
                                      } else {
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
                                  'p_deposit_allocation_code': Code,
                                  'p_transaction_code': codeData,
                                  'p_is_paid': false,
                                  'p_innitial_amount': 0,
                                  'p_orig_amount': 0,
                                  'p_orig_currency_code': currencyData,
                                  'p_exch_rate': this.agreement_exch_rate,
                                  'p_base_amount': 0,
                                  'p_remarks': nameData,
                                });

                                this.dalservice.Insert(this.listcashiertransactiondetailData, this.APIControllerDepositAllocationDetail, this.APIRouteForInsert)
                                  .subscribe(
                                    resss => {
                                      this.showSpinner = false;
                                      const parsesss = JSON.parse(resss);

                                      if (parsesss.result === 1) {
                                        // if (J === this.dataTamp.length - 1) {
                                        this.btnAutoAllocation();
                                        // }
                                      } else {
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
                        }
                        this.showNotification('bottom', 'right', 'success');
                      } else {
                        this.swalPopUpMsg(parses.data);
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

      } else {
        this.showSpinner = false;
      }
    });
  }
  //#endregion button Generate

  //#region button AutoAllocation
  btnAutoAllocation() {
    this.isSave = true;
    // param tambahan untuk button AutoAllocation dynamic
    this.dataRoleTamp = [{
      'p_code': this.param,
      'p_rate': this.agreement_exch_rate,
      'action': 'default'
    }];
    // param tambahan untuk button AutoAllocation dynamic

    // call web service
    this.dalservice.ExecSp(this.dataRoleTamp, this.APIControllerDepositAllocationDetail, this.APIRouteForAutoAllocation)
      .subscribe(
        res => {
          this.showSpinner = false;
          const parse = JSON.parse(res);
          if (parse.result === 1) {
            $('#datatableAllocationDetail').DataTable().ajax.reload();
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
    //   } else {
    //     this.showSpinner = false;
    //   }
    // });
  }
  //#endregion button AutoAllocation

  //#region Branch Lookup
  btnLookupSysBranch() {
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

  btnSelectRowSysBranch(code: String, name: String) {
    this.model.branch_code = code;
    this.model.branch_name = name;

    this.model.agreement_no = '';
    this.model.agreement_external_no = '';
    this.model.client_name = '';
    this.model.currency_code = '';

    this.model.deposit_code = '';
    this.model.allocation_currency_code = '';
    this.model.deposit_amount = 0;
    this.model.deposit_type = '';
    this.model.allocation_orig_amount = 0;
    this.allocation_orig_amount = 0;
    this.model.allocation_base_amount = 0;
    $('#lookupModalSysBranch').modal('hide');
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
          'p_branch_code': this.model.branch_code,
        });
        // end param tambahan untuk getrows dynamic
        this.dalservice.Getrows(dtParameters, this.APIControllerForAgreement, this.APIRouteForLookupDeposit).subscribe(resp => {
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

  btnSelectRowAgreement(agreement_no: String, agreement_external_no: string, client_name: string, currency_code: string) {
    this.model.agreement_no = agreement_no;
    this.model.agreement_external_no = agreement_external_no;
    this.model.client_name = client_name;
    this.model.currency_code = currency_code;
    if (this.model.allocation_value_date != null) {
      this.callGetrowTopRate(this.model.currency_code, this.valDate, false, true)
    }

    this.model.deposit_code = '';
    this.model.allocation_currency_code = '';
    this.model.deposit_amount = 0;
    this.model.deposit_type = '';
    this.model.allocation_orig_amount = 0;
    this.allocation_orig_amount = 0;
    this.model.allocation_base_amount = 0;
    $('#lookupModalAgreement').modal('hide');
  }
  //#endregion Lookup Agreement

  //#region Lookup Deposit
  btnLookupDeposit() {
    $('#datatableLookupDeposit').DataTable().clear().destroy();
    $('#datatableLookupDeposit').DataTable({
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
          'p_agreement_no': this.model.agreement_no
        });
        // end param tambahan untuk getrows dynamic
        this.dalservice.GetrowsOpl(dtParameters, this.APIControllerForDepositMain, this.APIRouteForLookup).subscribe(resp => {
          const parse = JSON.parse(resp);
          this.lookupdeposit = parse.data;
          if (parse.data != null) {
            this.lookupdeposit.numberIndex = dtParameters.start;
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

  btnSelectRowDeposit(deposit_code: String, deposit_currency_code: string, deposit_amount: string, deposit_type: string) {
    this.model.deposit_code = deposit_code;
    this.model.allocation_currency_code = deposit_currency_code;
    this.model.deposit_amount = deposit_amount;
    this.model.deposit_type = deposit_type;
    this.model.allocation_orig_amount = deposit_amount;
    this.allocation_orig_amount = deposit_amount;
    if (this.param == null) {
      this.model.allocation_base_amount = this.allocation_orig_amount * this.allocation_exch_rate;
    }
    if (this.model.allocation_value_date != null) {
      this.callGetrowTopRate(this.model.allocation_currency_code, this.valDate, true, false)
    }
    $('#lookupModalDeposit').modal('hide');
  }
  //#endregion Lookup Deposit

  //#region button save list
  btnSaveList() {

    this.isSave = true;
    this.listallocationdetailData = [];

    this.total_allocated = 0;

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

          this.listallocationdetailData.push(
            this.JSToNumberFloats({
              p_id: getID[i],
              p_deposit_allocation_code: this.param,
              p_base_amount: getAmount[i],
              p_is_paid: getIsPaid[i]
            })
          );

          if (getIsPaid[i]) {
            this.total_allocated = this.total_allocated + this.listallocationdetailData[i].p_base_amount
          }

          i++;
        }
        i++;
      }

      i++;
    }

    if (this.total_allocated > this.model.deposit_amount * this.model.allocation_exch_rate) {
      swal({
        title: 'Warning',
        text: 'Total Allocated Amount must be less than or equal to Outstanding Deposit Amount',
        buttonsStyling: false,
        confirmButtonClass: 'btn btn-danger',
        type: 'warning'
      }).catch(swal.noop)
      return;
    }


    //#region web service
    this.dalservice.Update(this.listallocationdetailData, this.APIControllerDepositAllocationDetail, this.APIRouteForUpdate)
      .subscribe(
        res => {
          const parse = JSON.parse(res);

          if (parse.result === 1) {
            this.showNotification('bottom', 'right', 'success');
            $('#datatableAllocationDetail').DataTable().ajax.reload();
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
        if (eventTemp < innitial_amount + 1) {
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

  //#region lookup cashier received request
  btnlookupCashiesrReceivedRequest() {
    $('#datatableLookupCashiesrReceivedRequest').DataTable().clear().destroy();
    $('#datatableLookupCashiesrReceivedRequest').DataTable({
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
          'p_branch_code': 'ALL', // this.model.branch_code,
          'p_agreement_no': this.model.agreement_no,
          'p_request_currency_code': this.model.currency_code,
          'p_deposit_allocation_code': this.param,
        });
        // end param tambahan untuk getrows dynamic

        this.dalservice.Getrows(dtParameters, this.APIControllerCashierReceivedRequest, this.APIRouteForCashierReceivedRequestLookup).subscribe(resp => {
          const parse = JSON.parse(resp);

          this.exch_rate = [];
          for (let i = 0; i < parse.data.length; i++) {
            this.callGetrowTopRateRequest(parse.data[i].request_currency_code, this.valDate, i)
          }

          // if use checkAll use this
          $('#checkallLookup').prop('checked', false);
          // end checkall

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
      columnDefs: [{ orderable: false, width: '5%', targets: [0, 1] }], // for disabled coloumn
      language: {
        search: '_INPUT_',
        searchPlaceholder: 'Search records',
        infoEmpty: '<p style="color:red;" > No Data Available !</p> '
      },
      searchDelay: 800 // pake ini supaya gak bug search
    });
  }
  //#endregion lookup cashier received request

  //#region checkbox all lookup
  btnSelectAllLookup() {
    this.isBreak = false;
    this.isSave = true;
    this.checkedLookup = [];
    for (let i = 0; i < this.lookupcashierreceivedrequest.length; i++) {
      if (this.lookupcashierreceivedrequest[i].selectedLookup) {
        this.checkedLookup.push({
          'code': this.lookupcashierreceivedrequest[i].code,
          'amount': this.lookupcashierreceivedrequest[i].request_amount,
          'currency': this.lookupcashierreceivedrequest[i].request_currency_code,
          'remarks': this.lookupcashierreceivedrequest[i].request_remarks,
          'rate': this.exch_rate[i].rate,
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

    this.dataTamp = [];

    let th = this;
    var J = 0;
    (function loopSelectAllLookup() {
      if (J < th.checkedLookup.length) {
        th.dataTamp = [{
          'p_deposit_allocation_code': th.param,
          'p_received_request_code': th.checkedLookup[J].code,
          'p_is_paid': true,
          'p_innitial_amount': th.checkedLookup[J].amount,
          'p_orig_amount': th.checkedLookup[J].amount,
          'p_orig_currency_code': th.checkedLookup[J].currency,
          'p_exch_rate': th.checkedLookup[J].rate,
          'p_base_amount': th.checkedLookup[J].amount * th.checkedLookup[J].rate,
          'p_remarks': th.checkedLookup[J].remarks,
        }];

        th.dalservice.Insert(th.dataTamp, th.APIControllerDepositAllocationDetail, th.APIRouteForInsert)
          .subscribe(
            res => {
              const parse = JSON.parse(res);
              if (parse.result === 1) {
                if (th.checkedLookup.length === J + 1) {
                  th.showSpinner = false;
                  th.showNotification('bottom', 'right', 'success');
                  $('#datatableAllocationDetail').DataTable().ajax.reload();
                  $('#datatableLookupCashiesrReceivedRequest').DataTable().ajax.reload();
                  th.callGetrow();
                } else {
                  J++;
                  loopSelectAllLookup();
                }
              } else {
                th.showSpinner = false;
                $('#datatableAllocationDetail').DataTable().ajax.reload();
                $('#datatableLookupCashiesrReceivedRequest').DataTable().ajax.reload();
                th.swalPopUpMsg(parse.data);
              }
            },
            error => {
              th.showSpinner = false;
              const parse = JSON.parse(error);
              th.swalPopUpMsg(parse.data);
            })
      }
    })();
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
  //#endregion checkbox all lookup

  //#region checkbox all table
  btnDeleteAll() {
    this.isSave = true;
    this.checkedList = [];
    for (let i = 0; i < this.listallocationdetail.length; i++) {
      if (this.listallocationdetail[i].selectedTable) {
        this.checkedList.push({
          'id': this.listallocationdetail[i].id,
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

        let th = this;
        var J = 0;
        (function loopDeleteAll() {
          if (J < th.checkedList.length) {
            th.dataTamp = [{
              'p_id': th.checkedList[J].id
            }];

            th.dalservice.Delete(th.dataTamp, th.APIControllerDepositAllocationDetail, th.APIRouteForDelete)
              .subscribe(
                res => {
                  const parse = JSON.parse(res);
                  if (parse.result === 1) {
                    if (J + 1 === th.checkedList.length) {
                      $('#datatableAllocationDetail').DataTable().ajax.reload();
                      th.showNotification('bottom', 'right', 'success');
                      th.callGetrow();
                    } else {
                      J++;
                      loopDeleteAll();
                    }
                  } else {
                    th.isBreak = true;
                    th.showSpinner = false;
                    $('#datatableAllocationDetail').DataTable().ajax.reload();
                    th.swalPopUpMsg(parse.data);
                  }
                },
                error => {
                  th.isBreak = true;
                  th.showSpinner = false;
                  const parse = JSON.parse(error);
                  th.swalPopUpMsg(parse.data);
                });
          }
        })();
      } else {
        this.showSpinner = false;
      }
    });
  }

  selectAllTable() {
    for (let i = 0; i < this.listallocationdetail.length; i++) {
      this.listallocationdetail[i].selectedTable = this.selectedAllTable;
    }
  }

  checkIfAllTableSelected() {
    this.selectedAllTable = this.listallocationdetail.every(function (item: any) {
      return item.selectedTable === true;
    })
  }
  //#endregion checkbox all table

  //#region button Proceed
  btnProceed(isValid: boolean) {
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
    }

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
  //#endregion button Proceed

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
          'p_reff_no': this.param
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

  // (+) Ari 2023-09-15 ket : add view approval for reversal
  //#region approval Lookup reversal
  btnViewApprovalReversal() {
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
  //#endregion approval Lookup reversal

}


