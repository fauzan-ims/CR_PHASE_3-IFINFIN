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
  templateUrl: './revenuedetail.component.html'
})

export class RevenuedetailComponent extends BaseComponent implements OnInit {
  // get param from url
  param = this.getRouteparam.snapshot.paramMap.get('id');

  // variable
  public NumberOnlyPattern = this._numberonlyformat;
  public revenuedetailData: any = [];
  public listrevenuedetailData: any = [];
  public listrevenuedetail: any = [];
  public isReadOnly: Boolean = false;
  public isButton: Boolean = false;
  public isCount: Boolean = false;
  public lookupbranch: any = [];
  public lookupsuspendmain: any = [];
  public lookupcurrency: any = [];
  private rolecode: any = [];
  private dataRoleTamp: any = [];
  private setStyle: any = [];
  private valDate: any;
  private dataTamp: any = [];
  private RoleAccessCode = 'R00003360000337A';

  // API Controller
  private APIController: String = 'SuspendRevenue';
  private APIControllerSuspendRevenueDetail: String = 'SuspendRevenueDetail';
  private APIControllerSuspendMain: String = 'SuspendMain';
  private APIControllerSysCurrency: String = 'SysCurrency';
  private APIControllerSysBranch: String = 'SysBranch';
  private APIControllerSysCurrencyRate: String = 'SysCurrencyRate';

  // API Function
  private APIRouteForLookup: String = 'GetRowsForLookup';
  private APIRouteForLookupSuspendMain: String = 'GetRowsLookupForSuspendRevenueDetail';
 private APIRouteForGetRowForTopRate: String = 'ExecSpTopRate';
  private APIRouteForGetRows: String = 'GetRows';
  private APIRouteForGetRow: String = 'GetRow';
  private APIRouteForUpdate: String = 'Update';
  private APIRouteForInsert: String = 'Insert';
  private APIRouteForDelete: String = 'Delete';
  private APIRouteForReversal: String = 'ExecSpForGetReversal';
  private APIRouteForPaid: String = 'ExecSpForGetPaid';
  private APIRouteForCancel: String = 'ExecSpForGetCancel';

  // form 2 way binding
  model: any = {};

  // spinner
  showSpinner: Boolean = true;
  // end

  // checklist
  public selectedAllTable: any;
  public selectedAllLookup: any;
  private checkedList: any = [];
  private checkedLookup: any = [];

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
      this.model.revenue_status = 'HOLD';
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
          'p_suspend_revenue_code': this.param
        });
        // end param tambahan untuk getrows dynamic
        this.dalservice.Getrows(dtParameters, this.APIControllerSuspendRevenueDetail, this.APIRouteForGetRows).subscribe(resp => {
          const parse = JSON.parse(resp)

          this.listrevenuedetail = parse.data;
          if (parse.data != null) {
            this.listrevenuedetail.numberIndex = dtParameters.start;
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
      language: {
        search: '_INPUT_',
        searchPlaceholder: 'Search records',
        infoEmpty: '<p style="color:red;" > No Data Available !</p> '
      },
      searchDelay: 800 // pake ini supaya gak bug search
    }
  }
  //#endregion load all data

  //#region  getrow data rate
  callGetrowTopRate(currency: any, date: any) {
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
          this.model.exch_rate = parsedata.exch_rate
        },
        error => {
          console.log('There was an error while Retrieving Data(API) !!!' + error);
        });
  }
  //#endregion  getrow data rate

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
          this.valDate = parsedata.revenue_date;
          const ngbGetrow = this.getrowNgb(parse.data[0]);

          if (parsedata.count > 0) {
            this.isCount = true;
          } else {
            this.isCount = false;
          }

          if (parsedata.revenue_status !== 'HOLD') {
            this.isButton = true;
          } else {
            this.isButton = false;
          }

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

  //#region form submit
  onFormSubmit(revenuedetailForm: NgForm, isValid: boolean) {
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

    this.revenuedetailData = this.JSToNumberFloats(revenuedetailForm);

    if (this.param == null) {
      this.revenuedetailData.p_revenue_amount = undefined;
    }

    const usersJson: any[] = Array.of(this.revenuedetailData);
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
              this.route.navigate(['/suspendmanagement/subrevenuelist/revenuedetail', parse.code]);
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

  //#region button save list
  btnSaveList() {

    this.listrevenuedetailData = [];

    var i = 0;

    var getID = $('[name="p_id"]')
      .map(function () { return $(this).val(); }).get();

    var getAmountR = $('[name="p_revenue_amountt"]')
      .map(function () { return $(this).val(); }).get();

    var getAmountS = $('[name="p_suspend_amount"]')
      .map(function () { return $(this).val(); }).get();

    while (i < getID.length) {

      while (i < getAmountR.length) {

        while (i < getAmountS.length) {
          this.listrevenuedetailData.push(
            this.JSToNumberFloats({
              p_id: getID[i],
              p_suspend_revenue_code: this.param,
              p_revenue_amount: getAmountR[i],
              p_suspend_amount: getAmountS[i],
            })
          );

          i++;
        }
        i++;
      }

      i++;
    }

    //#region web service
    this.dalservice.Update(this.listrevenuedetailData, this.APIControllerSuspendRevenueDetail, this.APIRouteForUpdate)
      .subscribe(
        res => {
          const parse = JSON.parse(res);

          if (parse.result === 1) {
            this.showNotification('bottom', 'right', 'success');
            $('#datatablesRevenueDetail').DataTable().ajax.reload();
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
    if (type === 'amount') {
      if (event.target.value.match('[0-9]+(,[0-9]+)')) {
        if (event.target.value.match('(\.\d+)')) {

          event = '' + event.target.value;
          event = event.trim();
          event = event.replace(/(\d)(?=(\d\d\d)+(?!\d))/g, '$1,');
        } else {
          event = '' + event.target.value;
          event = event.trim();
          event = parseFloat(event.replace(/,/g, '')).toFixed(2); // ganti jadi 6 kalo mau pct
          event = event.replace(/(\d)(?=(\d\d\d)+(?!\d))/g, '$1,');
        }
      } else {
        event = '' + event.target.value;
        event = event.trim();
        event = parseFloat(event).toFixed(2); // ganti jadi 6 kalo mau pct
        event = event.replace(/(\d)(?=(\d\d\d)+(?!\d))/g, '$1,');
      }
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
      $('#revenue_amountt' + i)
        .map(function () { return $(this).val(event); }).get();
    } else {
      $('#revenue_amountt' + i)
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
      $('#revenue_amountt' + i)
        .map(function () { return $(this).val(event); }).get();
    } else {
      $('#revenue_amountt' + i)
        .map(function () { return $(this).val(event); }).get();
    }
  }
  //#endregion onFocus
  //#endregion button save list

  //#region valueDate
  valueDate(event: any) {
    this.model.revenue_date = event;
    this.valDate = event;
    if (this.model.currency_code !== '') {
      this.callGetrowTopRate(this.model.currency_code, this.valDate)
    }
  }
  //#endregion valueDate

  //#region button back
  btnBack() {
    this.route.navigate(['/suspendmanagement/subrevenuelist']);
    $('#datatableRevenueList').DataTable().ajax.reload();
  }
  //#endregion  button back

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

  btnSelectRowSysBranch(branch_code: String, branch_name: String) {
    this.model.branch_code = branch_code;
    this.model.branch_name = branch_name;
    $('#lookupModalSysBranch').modal('hide');
  }
  //#endregion lookup branch


  //#region Lookup SysCurrency
  btnLookupSysCurrency() {
    $('#datatableLookupSysCurrency').DataTable().clear().destroy();
    $('#datatableLookupSysCurrency').DataTable({
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

  btnSelectRowSysCurrency(currency_code: String) {
    this.model.currency_code = currency_code;
    if (this.model.revenue_date != null) {
      this.callGetrowTopRate(this.model.currency_code, this.valDate)
    }
    $('#lookupModalSysCurrency').modal('hide');
  }
  //#endregion Lookup SysCurrency

  //#region suspend main Lookup
  btnLookupSuspendMain() {
    $('#datatableLookupSuspendMain').DataTable().clear().destroy();
    $('#datatableLookupSuspendMain').DataTable({
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
          'p_suspend_revenue_code': this.param,
          'p_currency_code': this.model.currency_code,
          'p_branch_code': this.model.branch_code,
        });
        // end param tambahan untuk getrows dynamic
        this.dalservice.Getrows(dtParameters, this.APIControllerSuspendMain, this.APIRouteForLookupSuspendMain).subscribe(resp => {
          const parse = JSON.parse(resp);
          this.lookupsuspendmain = parse.data;
          if (parse.data != null) {
            this.lookupsuspendmain.numberIndex = dtParameters.start;
          }

          // if use checkAll use this
          $('#checkallLookup').prop('checked', false);
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
      language: {
        search: '_INPUT_',
        searchPlaceholder: 'Search records',
        infoEmpty: '<p style="color:red;" > No Data Available !</p> '
      },
      searchDelay: 800 // pake ini supaya gak bug search
    });
  }
  //#endregion suspend main Lookup

  //#region checkbox all table
  btnSelectAllLookup() {
    this.checkedLookup = [];
    for (let i = 0; i < this.lookupsuspendmain.length; i++) {
      if (this.lookupsuspendmain[i].selectedLookup) {
        this.checkedLookup.push(this.lookupsuspendmain[i].code);
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
    }

    this.dataTamp = [];
    for (let J = 0; J < this.checkedLookup.length; J++) {
      const codeData = this.checkedLookup[J];
      // param tambahan untuk getrow dynamic
      this.dataTamp.push({
        'p_suspend_revenue_code': this.param,
        'p_suspend_code': codeData
      });
      // end param tambahan untuk getrow dynamic
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

        this.dalservice.Insert(this.dataTamp, this.APIControllerSuspendRevenueDetail, this.APIRouteForInsert)
          .subscribe(
            res => {
              this.showSpinner = false;
              const parse = JSON.parse(res);
              if (parse.result === 1) {
                this.showNotification('bottom', 'right', 'success');
                $('#datatablesRevenueDetail').DataTable().ajax.reload();
                $('#datatableLookupSuspendMain').DataTable().ajax.reload();
                this.callGetrow();
              } else {
                this.swalPopUpMsg(parse.data);
                $('#datatablesRevenueDetail').DataTable().ajax.reload();
                $('#datatableLookupSuspendMain').DataTable().ajax.reload();
                this.callGetrow();
              }
            },
            error => {
              const parse = JSON.parse(error);
              this.swalPopUpMsg(parse.data);
              $('#datatablesRevenueDetail').DataTable().ajax.reload();
              $('#datatableLookupSuspendMain').DataTable().ajax.reload();
              this.callGetrow();
            });
      } else {
        this.showSpinner = false;
      }
    });
  }

  selectAllLookup() {
    for (let i = 0; i < this.lookupsuspendmain.length; i++) {
      this.lookupsuspendmain[i].selectedLookup = this.selectedAllLookup;
    }
  }

  checkIfAllLookup() {
    this.selectedAllLookup = this.lookupsuspendmain.every(function (item: any) {
      return item.selectedLookup === true;
    })
  }
  //#endregion checkbox all table

  //#region checkbox all table
  btnDeleteAll() {
    this.checkedList = [];
    for (let i = 0; i < this.listrevenuedetail.length; i++) {
      if (this.listrevenuedetail[i].selectedTable) {
        this.checkedList.push(this.listrevenuedetail[i].id);
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

    this.dataTamp = [];
    for (let J = 0; J < this.checkedList.length; J++) {
      const codeData = this.checkedList[J];
      // param tambahan untuk getrow dynamic
      this.dataTamp.push({
        'p_id': codeData
      });
      // end param tambahan untuk getrow dynamic
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

        this.dalservice.Delete(this.dataTamp, this.APIControllerSuspendRevenueDetail, this.APIRouteForDelete)
          .subscribe(
            res => {
              this.showSpinner = false;
              const parse = JSON.parse(res);
              if (parse.result === 1) {
                this.showNotification('bottom', 'right', 'success');
                $('#datatablesRevenueDetail').DataTable().ajax.reload();
                this.callGetrow();
              } else {
                this.swalPopUpMsg(parse.data);
              }
            },
            error => {
              const parse = JSON.parse(error);
              this.swalPopUpMsg(parse.data);
            });
      } else {
        this.showSpinner = false;
      }
    });
  }

  selectAllTable() {
    for (let i = 0; i < this.listrevenuedetail.length; i++) {
      this.listrevenuedetail[i].selectedTable = this.selectedAllTable;
    }
  }

  checkIfAllTableSelected() {
    this.selectedAllTable = this.listrevenuedetail.every(function (item: any) {
      return item.selectedTable === true;
    })
  }
  //#endregion checkbox all table
}
