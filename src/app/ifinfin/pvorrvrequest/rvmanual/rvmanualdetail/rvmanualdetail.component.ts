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
  templateUrl: './rvmanualdetail.component.html'
})

export class RvmanualdetailComponent extends BaseComponent implements OnInit {
  // get param from url
  param = this.getRouteparam.snapshot.paramMap.get('id');

  // variable
  public NumberOnlyPattern = this._numberonlyformat;
  public rvmanualdetailData: any = [];
  public listrvmanualdetaildetail: any = [];
  public isReadOnly: Boolean = false;
  public isButton: Boolean = false;
  public isCurrency: Boolean = false;
  public lookupbranch: any = [];
  public lookupreason: any = [];
  public lookupreceiptmain: any = [];
  public lookupgllink: any = [];
  public lookupbank: any = [];
  public lookupcurrency: any = [];
  public received_orig_amount: any = [];
  public received_exch_rate: any = [];
  public received_base_amount: any = [];
  private valDate: any;
  private dataRoleTamp: any = [];
  private setStyle: any = [];
  private dataTamp: any = [];
  public reportData: any = [];
  private RoleAccessCode = 'R00003130000314A';
  public lookupapproval: any = []; // (+) Ari 2023-09-07 ket : add view approval for reversal


  // API Controller
  private APIController: String = 'ReceivedVoucher';
  private APIControllerReceivedVoucherDetail: String = 'ReceivedVoucherDetail';
  private APIControllerSysCurrency: String = 'SysCurrency';
  private APIControllerSysBranchBank: String = 'SysBranchBank';
  private APIControllerForJurnalGlLink: String = 'JournalGlLink';
  private APIControllerSysBranch: String = 'SysBranch';
  private APIControllerSysCurrencyRate: String = 'SysCurrencyRate';
  private APIControllerApprovalSchedule: String = 'ApprovalSchedule'; // (+) Ari 2023-09-07 ket : add view approval for reversal

  // API Function
  private APIRouteForLookup: String = 'GetRowsForLookup';
  private APIRouteForLookupGlLink: String = 'GetRowsForLookupByIsBank';
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
      this.received_orig_amount = 0;
      this.received_exch_rate = 1;
      this.received_base_amount = 0;
      this.model.received_orig_amount = 0;
      this.model.received_base_amount = 0;
      this.model.received_exch_rate = 1;
      this.model.received_status = 'HOLD';
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
          'p_received_voucher_code': this.param
        });
        // end param tambahan untuk getrows dynamic
        this.dalservice.Getrows(dtParameters, this.APIControllerReceivedVoucherDetail, this.APIRouteForGetRows).subscribe(resp => {
          const parse = JSON.parse(resp)
          this.listrvmanualdetaildetail = parse.data;
          if (parse.data != null) {
            this.listrvmanualdetaildetail.numberIndex = dtParameters.start;
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
          this.valDate = parsedata.received_value_date;
          const ngbGetrow = this.getrowNgb(parse.data[0]);

          if (parsedata.received_status !== 'HOLD') {
            this.isButton = true;
          } else {
            this.isButton = false;
          }

          this.received_orig_amount = parsedata.received_orig_amount;
          this.received_exch_rate = parsedata.received_exch_rate;
          this.received_base_amount = parsedata.received_base_amount;

          // mapper dbtoui
          Object.assign(this.model, ngbGetrow);
          // end mapper dbtoui

          this.callGetrowTopRate(this.model.received_orig_currency_code, this.valDate, false);
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
            this.model.received_exch_rate = parsedata.exch_rate
            this.model.received_orig_amount = (this.model.received_base_amount / parsedata.exch_rate);
          }
        },
        error => {
          console.log('There was an error while Retrieving Data(API) !!!' + error);
        });
  }
  //#endregion  getrow data rate


  //#region valueDate
  valueDate(event: any) {
    this.model.received_value_date = event;
    this.valDate = event;
    if (this.model.received_orig_currency_code !== '') {
      this.callGetrowTopRate(this.model.received_orig_currency_code, this.valDate, true)
    }
  }
  //#endregion valueDate

  //#region origAmount
  origAmount(event: any) {
    this.received_orig_amount = event.target.value;
    this.model.received_base_amount = this.received_orig_amount * this.received_exch_rate;
  }
  //#endregion origAmount

  //#region exchRate
  exchRate(event: any) {
    this.received_exch_rate = event.target.value;
    // this.model.received_base_amount = this.received_exch_rate * this.received_orig_amount;
    this.model.received_orig_amount = this.received_base_amount / this.received_exch_rate;
  }
  //#endregion exchRate

  //#region form submit
  onFormSubmit(rvmanualdetailForm: NgForm, isValid: boolean) {
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

    this.rvmanualdetailData = this.JSToNumberFloats(rvmanualdetailForm);
    if (this.rvmanualdetailData.p_received_transaction_date === '') {
      this.rvmanualdetailData.p_received_transaction_date = undefined;
    }

    const usersJson: any[] = Array.of(this.rvmanualdetailData);
    if (this.param != null) {
      // call web service
      this.dalservice.Update(usersJson, this.APIController, this.APIRouteForUpdate)
        .subscribe(
          res => {
            this.showSpinner = false;
            const parse = JSON.parse(res);
            if (parse.result === 1) {
              this.showNotification('bottom', 'right', 'success');
              this.route.navigate(['/pvorrvrequest/subrvmanuallist/rvmanualdetail', parse.code]);
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
              this.route.navigate(['/pvorrvrequest/subrvmanuallist/rvmanualdetail', parse.code]);
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
    this.route.navigate(['/pvorrvrequest/subrvmanuallist']);
    $('#datatableRvManualList').DataTable().ajax.reload();

  }
  //#endregion  button back

  //#region button add
  btnAdd() {
    this.route.navigate(['/pvorrvrequest/subrvmanuallist/rvmanualdetaildetail', this.param]);
  }
  //#endregion button add

  //#region button edit
  btnEdit(codeEdit: string) {
    this.route.navigate(['/pvorrvrequest/subrvmanuallist/rvmanualdetaildetail', this.param, codeEdit]);
  }
  //#endregion button edit

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
    this.model.received_orig_currency_code = '';
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

  btnSelectRowBank(bank_code: String, bank_name: string, received_orig_currency_code: string, gl_link_code: string) {
    this.model.branch_bank_code = bank_code;
    this.model.branch_bank_name = bank_name;
    this.model.received_orig_currency_code = received_orig_currency_code;
    this.model.branch_gl_link_code = gl_link_code;
    if (this.model.received_value_date != null) {
      this.callGetrowTopRate(this.model.received_orig_currency_code, this.valDate, true);
    }
    $('#lookupModalBank').modal('hide');
  }
  //#endregion Lookup Bank

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

  btnSelectRowGlLink(gl_link_code: String, gl_link_name: string, currency_code: string) {
    this.model.branch_gl_link_code = gl_link_code;
    this.model.branch_gl_link_name = gl_link_name;
    $('#lookupModalGlLink').modal('hide');
  }
  //#endregion Lookup GlLink

  //#region btnPrint
  btnPrint(p_code: string, rpt_code: string, report_name: string) {
    this.showSpinner = true;

    const rptParam = {
      p_user_id: this.userId,
      p_rv_no: p_code,
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
    for (let i = 0; i < this.listrvmanualdetaildetail.length; i++) {
      if (this.listrvmanualdetaildetail[i].selectedTable) {
        this.checkedList.push(this.listrvmanualdetaildetail[i].id);
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

            th.dalservice.Delete(th.dataTamp, th.APIControllerReceivedVoucherDetail, th.APIRouteForDelete)
              .subscribe(
                res => {

                  const parse = JSON.parse(res);
                  if (parse.result === 1) {
                    if (th.checkedList.length == i + 1) {
                      $('#datatablesRvManualDetail').DataTable().ajax.reload();
                      th.showNotification('bottom', 'right', 'success');
                      th.showSpinner = false;
                      th.callGetrow();
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

    // // jika tidak di checklist
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
    //     this.dalservice.Delete(this.dataTamp, this.APIControllerReceivedVoucherDetail, this.APIRouteForDelete)
    //       .subscribe(
    //         res => {
    //           this.showSpinner = false;
    //           const parse = JSON.parse(res);
    //           if (parse.result === 1) {
    //             this.showNotification('bottom', 'right', 'success');
    //             $('#datatablesRvManualDetail').DataTable().ajax.reload();
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
    for (let i = 0; i < this.listrvmanualdetaildetail.length; i++) {
      this.listrvmanualdetaildetail[i].selectedTable = this.selectedAllTable;
    }
  }

  checkIfAllTableSelected() {
    this.selectedAllTable = this.listrvmanualdetaildetail.every(function (item: any) {
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
  systemDate() {

    let sysdate = this.AllModUrl('sysdate');//sessionStorage.getItem('ZXRhZHN5cw%3D%3D');

    return sysdate;//this.decryptLogic(sysdate).toString();
  }

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


