import { Component, OnInit, ElementRef, ViewChild, AfterViewInit } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { NgForm } from '@angular/forms';
import swal from 'sweetalert2';
import { DataTableDirective } from 'angular-datatables';
import { BaseComponent } from '../../../../../base.component';
import { DALService } from '../../../../../DALservice.service';

@Component({
  moduleId: module.id,
  selector: 'app-root',
  templateUrl: './pvmanualdetail.component.html',
})

export class PvmanualdetailComponent extends BaseComponent implements OnInit {
  // get param from url
  param = this.getRouteparam.snapshot.paramMap.get('id');

  // variable
  public NumberOnlyPattern = this._numberonlyformat;
  public pvmanualdetailData: any = [];
  public listpvmanualdetaildetail: any = [];
  public isReadOnly: Boolean = false;
  public isButton: Boolean = false;
  public isCurrency: Boolean = false;
  public lookupbranch: any = [];
  public lookupreason: any = [];
  public lookupsysbank: any = [];
  public lookupreceiptmain: any = [];
  public lookupbank: any = [];
  public lookupcurrency: any = [];
  public lookuppdccode: any = [];
  public cashier_type: any;
  public payment_orig_amount: any;
  public payment_exch_rate: any;
  public payment_base_amount: any;
  private dataRoleTamp: any = [];
  private valDate: any;
  private setStyle: any = [];
  private dataTamp: any = [];
  private RoleAccessCode = 'R00003140000315A';
  public lookupapproval: any = []; // (+) Ari 2023-09-07 ket : add view approval for reversal


  // API Controller
  private APIController: String = 'PaymentVoucher';
  private APIControllerPdcMain: String = 'PdcMain';
  private APIControllerSysBranchBank: String = 'SysBranchBank';
  private APIControllerSysCurrency: String = 'SysCurrency';
  private APIControllerSysBranch: String = 'SysBranch';
  private APIControllerPaymentVoucherDetail: String = 'PaymentVoucherDetail';
  private APIControllerSysBank: String = 'SysBank';
  private APIControllerSysCurrencyRate: String = 'SysCurrencyRate';
  private APIControllerApprovalSchedule: String = 'ApprovalSchedule'; // (+) Ari 2023-09-07 ket : add view approval for reversal

  // API Function
  private APIRouteForLookup: String = 'GetRowsForLookup';
  private APIRouteForGetRows: String = 'GetRows';
  private APIRouteForGetRow: String = 'GetRow';
  private APIRouteForGetRowForTopRate: String = 'ExecSpTopRate';
  private APIRouteForUpdate: String = 'Update';
  private APIRouteForInsert: String = 'Insert';
  private APIRouteForDelete: String = 'Delete';
  private APIRouteForReversalRequest: String = 'ExecSpForGetReverseRequest';
  private APIRouteForPaid: String = 'ExecSpForGetPaid';
  private APIRouteForCancel: String = 'ExecSpForGetCancel';

  // report
  private APIControllerReport: String = 'Report';
  private APIRouteForDownload: String = 'getReport';

  // form 2 way binding
  model: any = {};

  // spinner
  showSpinner: Boolean = true;
  // end

  // checklist
  public selectedAllTable: any;
  private checkedList: any = [];

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
      this.isReadOnly = true;

      // call web service
      this.loadData();
      this.callGetrow();
    } else {
      this.payment_orig_amount = 0;
      this.payment_exch_rate = 1;
      this.payment_base_amount = 0;
      this.model.payment_orig_amount = 0;
      this.model.payment_base_amount = 0;
      this.model.payment_exch_rate = 1;
      this.model.payment_status = 'HOLD';
      this.model.payment_type = 'TRANSFER';
      this.cashier_type = 'B';
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
          'p_payment_voucher_code': this.param
        });
        // end param tambahan untuk getrows dynamic
        this.dalservice.Getrows(dtParameters, this.APIControllerPaymentVoucherDetail, this.APIRouteForGetRows).subscribe(resp => {
          const parse = JSON.parse(resp)

          this.listpvmanualdetaildetail = parse.data;
          if (parse.data != null) {
            this.listpvmanualdetaildetail.numberIndex = dtParameters.start;
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
          this.valDate = parsedata.payment_value_date;
          const ngbGetrow = this.getrowNgb(parse.data[0]);

          if (parsedata.payment_status !== 'HOLD') {
            this.isButton = true;
          } else {
            this.isButton = false;
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
            this.model.payment_orig_amount = (this.model.payment_base_amount / parsedata.exch_rate);
          }
        },
        error => {
          console.log('There was an error while Retrieving Data(API) !!!' + error);
        });
  }
  //#endregion  getrow data rate

  valueDate(event: any) {
    this.model.payment_value_date = event;
    this.valDate = event;
    if (this.model.payment_orig_currency_code !== '') {
      this.callGetrowTopRate(this.model.payment_orig_currency_code, this.valDate, true)
    }
  }

  //#region form submit
  onFormSubmit(pvmanualdetailForm: NgForm, isValid: boolean) {
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

    this.pvmanualdetailData = this.JSToNumberFloats(pvmanualdetailForm);
    if (this.pvmanualdetailData.p_payment_transaction_date === '') {
      this.pvmanualdetailData.p_payment_transaction_date = undefined;
    }
    if (this.pvmanualdetailData.p_to_bank_name === '') {
      this.pvmanualdetailData.p_to_bank_name = undefined;
    }
    if (this.pvmanualdetailData.p_to_bank_account_name === '') {
      this.pvmanualdetailData.p_to_bank_account_name = undefined;
    }
    if (this.pvmanualdetailData.p_to_bank_account_no === '') {
      this.pvmanualdetailData.p_to_bank_account_no = undefined;
    }

    const usersJson: any[] = Array.of(this.pvmanualdetailData);
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
              this.route.navigate(['/pvorrvrequest/subpvmanuallist/pvmanualdetail', parse.code]);
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
    this.payment_orig_amount = event.target.value;
    this.model.payment_base_amount = this.payment_orig_amount * this.payment_exch_rate;
  }
  //#endregion origAmount

  //#region exchRate
  exchRate(event: any) {
    this.payment_exch_rate = event.target.value;
    this.model.payment_orig_amount = this.payment_base_amount / this.payment_exch_rate;
  }
  //#endregion exchRate

  //#region button back
  btnBack() {
    this.route.navigate(['/pvorrvrequest/subpvmanuallist']);
    $('#datatablePvManualList').DataTable().ajax.reload();
  }
  //#endregion  button back

  //#region button add
  btnAdd() {
    this.route.navigate(['/pvorrvrequest/subpvmanuallist/pvmanualdetaildetail', this.param]);
  }
  //#endregion button add

  //#region button edit
  btnEdit(codeEdit: string) {
    this.route.navigate(['/pvorrvrequest/subpvmanuallist/pvmanualdetaildetail', this.param, codeEdit]);
  }
  //#endregion button edit

  //#region ddl paymentType
  paymentType(event: any) {
    this.model.payment_type = event.target.value;
    if (this.model.payment_type === 'CASH') {
      this.cashier_type = 'CASH';
      this.btnLookupBank();
    } else if (this.model.payment_type === 'TRANSFER'){
      this.cashier_type = 'B';
    }
    else {
      this.cashier_type = '';
      this.model.branch_bank_code = '';
      this.model.branch_bank_name = '';
      this.model.payment_orig_currency_code = '';
      this.model.branch_gl_link_code = '';
    }
  }
  //#endregion ddl paymentType

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

  btnSelectRowBranch(branch_code: String, branch_name: String) {
    this.model.branch_code = branch_code;
    this.model.branch_name = branch_name;
    this.model.branch_bank_code = '';
    this.model.branch_bank_name = '';
    this.model.payment_orig_currency_code = '';
    $('#lookupModalSysBranch').modal('hide');
  }
  //#endregion lookup branch

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
          'p_type': this.cashier_type,
        });
        // end param tambahan untuk getrows 
        console.log(dtParameters.paramTamp,'1');
        
        this.dalservice.GetrowsSys(dtParameters, this.APIControllerSysBranchBank, this.APIRouteForLookup).subscribe(resp => {
          const parse = JSON.parse(resp);

          if (this.cashier_type === 'CASH' && parse.data.length !== 0) {
            this.model.branch_bank_code = parse.data[0].code;
            this.model.branch_bank_name = parse.data[0].description;
            this.model.payment_orig_currency_code = parse.data[0].currency_code;
            this.model.branch_gl_link_code = parse.data[0].gl_link_code;
          }

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

  btnSelectRowBank(bank_code: String, bank_name: string, payment_orig_currency_code: string, gl_link_code: string) {
    this.model.branch_bank_code = bank_code;
    this.model.branch_bank_name = bank_name;
    this.model.payment_orig_currency_code = payment_orig_currency_code;
    this.model.branch_gl_link_code = gl_link_code;
    if (this.model.payment_value_date != null) {
      this.callGetrowTopRate(this.model.payment_orig_currency_code, this.valDate, true);
    }
    $('#lookupModalBank').modal('hide');
  }
  //#endregion Lookup Bank

  //#region sys bank
  btnlookupSysBank() {
    $('#datatablelookupSysBank').DataTable().clear().destroy();
    $('#datatablelookupSysBank').DataTable({
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
          'default': ''
        });
        this.dalservice.GetrowsSys(dtParameters, this.APIControllerSysBank, this.APIRouteForLookup).subscribe(resp => {
          const parse = JSON.parse(resp);
          this.lookupsysbank = parse.data;
          if (parse.data != null) {
            this.lookupsysbank.numberIndex = dtParameters.start;
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

  btnSelectRowSysBank(name: String) {
    this.model.to_bank_name = name;
    $('#lookupModalSysBank').modal('hide');
  }

  btnClearSysBank() {
    this.model.to_bank_name = '';
  }
  //#endregion sys bank

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

  //#region Lookup Currency
  btnLookupCurrency() {
    $('#datatableLookupCurrency').DataTable().clear().destroy();
    $('#datatableLookupCurrency').DataTable({
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
        this.dalservice.GetrowsSys(dtParameters, this.APIControllerSysCurrency, this.APIRouteForLookup).subscribe(resp => {
          const parse = JSON.parse(resp);
          this.lookupcurrency = parse.data;
          if (parse.data != null) {
            this.lookupcurrency.numberIndex = dtParameters.start;
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

  btnSelectRowCurrency(currency_code: String, currency_desc: string) {
    this.model.currency_code = currency_code;
    this.model.currency_desc = currency_desc;
    $('#lookupModalCurrency').modal('hide');
  }
  //#endregion Lookup Currency

  //#region btnPrint
  btnPrint(p_code: string, rpt_code: string, report_name: string) {
    this.showSpinner = true;

    const rptParam = {
      p_user_id: this.userId,
      p_pv_no: p_code,
      p_code: rpt_code,
      p_report_name: report_name,
      p_print_option: 'PDF'
    }

    const dataParam = {
      TableName: this.model.table_name,
      SpName: this.model.sp_name,
      reportparameters: rptParam
    };

    this.dalservice.ReportFile(dataParam, this.APIControllerReport, this.APIRouteForDownload).subscribe(res => {
      this.showSpinner = false;
      this.printRptNonCore(res);
    }, err => {
      this.showSpinner = false;
      const parse = JSON.parse(err);
      this.swalPopUpMsg(parse.data);
    });
  }
  //#endregion btnPrint

  //#region checkbox all table
  btnDeleteAll() {
    this.checkedList = [];
    for (let i = 0; i < this.listpvmanualdetaildetail.length; i++) {
      if (this.listpvmanualdetaildetail[i].selectedTable) {
        this.checkedList.push(this.listpvmanualdetaildetail[i].id);
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
      let th = this;
      var i = 0;
      (function loopDeliveryRequestProceed() {
        if (i < th.checkedList.length) {
          th.dataTamp = [{
            'p_id': th.checkedList[i],
          }];

          th.dalservice.Delete(th.dataTamp, th.APIControllerPaymentVoucherDetail, th.APIRouteForDelete)
            .subscribe(
              res => {
                   
                const parse = JSON.parse(res);
                if (parse.result === 1) {
                  if (th.checkedList.length == i + 1) {
                    th.showNotification('bottom', 'right', 'success');
                    $('#datatablesPvManualDetail').DataTable().ajax.reload();
                    th.showSpinner = false;
                  } else {
                    i++;
                    loopDeliveryRequestProceed();
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
        }
      })();
    } else {
      this.showSpinner = false;
    }
  });

    // jika tidak di checklist
    // if (this.checkedList.length === 0) {
    //   swal({
    //     title: 'No one selected!',
    //     buttonsStyling: false,
    //     confirmButtonClass: 'btn btn-danger'
    //   }).catch(swal.noop)
    //   return
    // }

    // this.dataTamp = [];
    // for (let J = 0; J < this.checkedList.length; J++) {
    //   const codeData = this.checkedList[J];
    //   // param tambahan untuk getrow dynamic
    //   this.dataTamp.push({
    //     'p_id': codeData
    //   });
    //   // end param tambahan untuk getrow dynamic
    // }

    // swal({
    //   title: 'Are you sure?',
    //   type: 'warning',
    //   showCancelButton: true,
    //   confirmButtonClass: 'btn btn-success',
    //   cancelButtonClass: 'btn btn-danger',
    //   confirmButtonText: this._deleteconf,
    //   buttonsStyling: false
    // }).then((result) => {
    //   this.showSpinner = true;
    //   if (result.value) {

    //     this.dalservice.Delete(this.dataTamp, this.APIControllerPaymentVoucherDetail, this.APIRouteForDelete)
    //       .subscribe(
    //         res => {
    //           this.showSpinner = false;
    //           const parse = JSON.parse(res);
    //           if (parse.result === 1) {
    //             this.showNotification('bottom', 'right', 'success');
    //             $('#datatablesPvManualDetail').DataTable().ajax.reload();
    //             this.callGetrow();
    //           } else {
    //             this.swalPopUpMsg(parse.data);
    //           }
    //         },
    //         error => {
    //           const parse = JSON.parse(error);
    //           this.swalPopUpMsg(parse.data);
    //         });
    //   } else {
    //     this.showSpinner = false;
    //   }
    // });
  }

  selectAllTable() {
    for (let i = 0; i < this.listpvmanualdetaildetail.length; i++) {
      this.listpvmanualdetaildetail[i].selectedTable = this.selectedAllTable;
    }
  }

  checkIfAllTableSelected() {
    this.selectedAllTable = this.listpvmanualdetaildetail.every(function (item: any) {
      return item.selectedTable === true;
    })
  }
  //#endregion checkbox all table

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


