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
  templateUrl: './cashieropendetail.component.html'
})

export class CashieropendetailComponent extends BaseComponent implements OnInit {
  // get param from url
  param = this.getRouteparam.snapshot.paramMap.get('id');

  // variable
  public NumberOnlyPattern = this._numberonlyformat;
  public cashieropendetailData: any = [];
  public isReadOnly: Boolean = false;
  public isButton: Boolean = false;
  public lookupbranch: any = [];
  public lookupemployee: any = [];
  public bank_gl_link_code: any;
  public branch_bank_code: any;
  public branch_bank_name: any;
  public cashier_currency_code: any;
  private rolecode: any = [];
  private dataRoleTamp: any = [];
  private setStyle: any = [];
  private dataTamp: any = [];
  private RoleAccessCode = 'R00003160000317A';

  // API Controller
  private APIController: String = 'CashierMain';
  private APIControllerSysBranch: String = 'SysBranch';
  private APIControllerSysEmployeeMain: String = 'SysEmployeeMain';
  private APIControllerSysBranchBank: String = 'SysBranchBank';

  // API Function
  private APIRouteForLookup: String = 'GetRowsForLookup';
  private APIRouteForLookupCashier: String = 'GetRowsForLookupCashier';
  private APIRouteForGetRow: String = 'GetRow';
  private APIRouteForUpdate: String = 'Update';
  private APIRouteForInsert: String = 'Insert';
  private APIRouteForOpen: String = 'ExecSpForGetOpen';
  private APIRouteForClose: String = 'ExecSpForGetClose';
  private APIRouteForCancel: String = 'ExecSpForGetCancel';
  private APIRouteForProceed: String = 'ExecSpForGetProceed';
  private APIRouteForGetRole: String = 'ExecSpForGetRole';

  // report
  private APIControllerReport: String = 'Report';
  private APIRouteForDownload: String = 'getReport';

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
    this.wizard();

    if (this.param != null) {
      this.callGetrow();
      this.isReadOnly = true;
      // this.wizard();
      this.btnLookupBank();
      this.cashierreceiptallocatedwiz();
      // this.cashierreceiptallocatedwiz();

      // call web service
    } else {
      this.model.cashier_status = 'HOLD';
      this.model.cashier_innitial_amount = '0';
      this.showSpinner = false;
    }
  }

  onRouterOutletActivate(event: any) {
    // console.log(event);
    // event.callGetrowLogin();
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
          const parsedata = this.getrowNgb(parse.data[0]);
console.log(parsedata);

          if (parsedata.cashier_status !== 'HOLD') {
            this.isButton = true;
          } else {
            this.isButton = false;
          }
          // mapper dbtoui
          Object.assign(this.model, parsedata);
          // end mapper dbtoui

          // if (parsedata.cashier_status !== 'HOLD') {

          this.btnLookupBank();

          // }
          this.showSpinner = false;
        },
        error => {
          console.log('There was an error while Retrieving Data(API) !!!' + error);
        });
  }
  //#endregion  getrow data

  //#region form submit
  onFormSubmit(cashieropendetailForm: NgForm, isValid: boolean) {
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

    this.cashieropendetailData = this.JSToNumberFloats(cashieropendetailForm);
    if (this.cashieropendetailData.p_cashier_close_date === '') {
      this.cashieropendetailData.p_cashier_close_date = undefined;
    }
    if (this.param == null) {
      this.cashieropendetailData.p_cashier_cr_amount = undefined;
      this.cashieropendetailData.p_cashier_db_amount = undefined;
      this.cashieropendetailData.p_cashier_open_amount = undefined;
      this.cashieropendetailData.p_cashier_close_amount = undefined;
    }

    const usersJson: any[] = Array.of(this.cashieropendetailData);
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
              this.route.navigate(['/cashier/subcashieropenlist/cashieropendetail', parse.code]);
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
    this.route.navigate(['/cashier/subcashieropenlist']);
    $('#datatableCashierOpenList').DataTable().ajax.reload();
  }
  //#endregion  button back

  //#region Wizard Cashier Receipt List tabs
  cashierreceiptallocatedwiz() {
    // this.route.navigate(['/cashier/subcashieropenlist/cashieropendetail/' + this.param + '/cashierreceiptlist', this.param, this.model.cashier_status, this.model.branch_code], { skipLocationChange: true });
    this.route.navigate(['/cashier/subcashieropenlist/cashieropendetail/' + this.param + '/cashierreceiptlist', this.param], { skipLocationChange: true });

  }
  //#endregion Wizard Cashier Receipt List tabs

  //#region Wizard Cashier Bank Note and Coin List tabs
  cashierbanknoteandcoinwiz() {
    // this.route.navigate(['/cashier/subcashieropenlist/cashieropendetail/' + this.param + '/cashierbanknoteandcoinlist', this.param, this.model.cashier_status], { skipLocationChange: true });
    this.route.navigate(['/cashier/subcashieropenlist/cashieropendetail/' + this.param + '/cashierbanknoteandcoinlist', this.param], { skipLocationChange: true });
  }
  //#endregion Wizard Cashier Bank Note and Coin List tabs

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
    this.model.employee_code = '';
    this.model.employee_name = '';
    $('#lookupModalSysBranch').modal('hide');
  }
  //#endregion lookup branch

  //#region Lookup Bank
  btnLookupBank() {
    $('#datatableLookupSysBank').DataTable().clear().destroy();
    $('#datatableLookupSysBank').DataTable({
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
          'p_type': 'CASH',
          'p_default_flag': '1'
        });
        // end param tambahan untuk getrows dynamic

        this.dalservice.GetrowsSys(dtParameters, this.APIControllerSysBranchBank, this.APIRouteForLookup).subscribe(resp => {
          const parse = JSON.parse(resp);

          if (parse.data.length > 0) {
            this.bank_gl_link_code = parse.data[0].gl_link_code;
            this.branch_bank_code = parse.data[0].code;
            this.branch_bank_name = parse.data[0].bank_account_name;
            this.cashier_currency_code = parse.data[0].currency_code;

            // this.bank_account_no = parse.data[0].bank_account_no;
            // this.bank_account_name = parse.data[0].bank_account_name;
            // this.bank_name = parse.data[0].description;

          }
          // console.log(this.bank_account_no, this.bank_account_name, this.cashier_currency_code, this.bank_name);

        }, err => console.log('There was an error while retrieving Data(API) !!!' + err));
      },
      searchDelay: 800 // pake ini supaya gak bug search
    });
  }
  //#endregion Lookup Bank

  //#region Lookup Employee
  btnLookupSysEmployee() {
    $('#datatableLookupSysEmployee').DataTable().clear().destroy();
    $('#datatableLookupSysEmployee').DataTable({
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
          'p_type': 'CASHIER',
        });
        // end param tambahan untuk getrows dynamic
        this.dalservice.GetrowsSys(dtParameters, this.APIControllerSysEmployeeMain, this.APIRouteForLookupCashier).subscribe(resp => {
          const parse = JSON.parse(resp);
          this.lookupemployee = parse.data;
          if (parse.data != null) {
            this.lookupemployee.numberIndex = dtParameters.start;
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

  btnSelectRowSysEmployee(employee_code: String, employee_name: string) {
    this.model.employee_code = employee_code;
    this.model.employee_name = employee_name;
    $('#lookupModalSysEmployee').modal('hide');
  }
  //#endregion Lookup Employee

  //#region button Open
  btnOpen() {
    // param tambahan untuk button Open dynamic
    this.dataRoleTamp = [{
      'p_code': this.param,
      'action': 'default'
    }];
    // param tambahan untuk button Open dynamic

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
        this.dalservice.ExecSp(this.dataRoleTamp, this.APIController, this.APIRouteForOpen)
          .subscribe(
            res => {
              this.showSpinner = false;
              const parse = JSON.parse(res);
              if (parse.result === 1) {
                this.showNotification('bottom', 'right', 'success');
                this.callGetrow();
                $('#reloadWiz').click();

                // this.wizard();
                // this.cashierreceiptallocatedwiz();
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
  //#endregion button Open

  //#region button Proceed
  btnProceed() {
    // param tambahan untuk button Proceed dynamic
    this.dataRoleTamp = [{
      'p_cashier_code': this.param,
      'p_branch_bank_code': this.branch_bank_code,
      'p_bank_gl_link_code': this.bank_gl_link_code,
      'p_branch_bank_name': this.branch_bank_name,
      'p_currency_code': this.cashier_currency_code,
      'action': 'default'
    }];
    // param tambahan untuk button Proceed dynamic

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
                $('#reloadWiz').click();
                // this.route.navigate(['/cashier/accounttransferrequestdetail', parse.code]);
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

  //#region button Close
  btnClose() {
    // param tambahan untuk button Close dynamic
    this.dataRoleTamp = [{
      'p_code': this.param,
      'action': 'default'
    }];
    // param tambahan untuk button Close dynamic

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
        this.dalservice.ExecSp(this.dataRoleTamp, this.APIController, this.APIRouteForClose)
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
  //#endregion button Close

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

  //#region button Print
  btnPrint(p_code: string, rpt_code: string, report_name: string) {
    const rptParam = {
      p_user_id: this.userId,
      p_open_no: p_code,
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
  //#endregion button Print
}
