import { OnInit, ViewChild, Component, ElementRef } from '@angular/core';
import 'rxjs/add/operator/map'
import { Router } from '@angular/router';
import { BaseComponent } from '../../../../../base.component';
import { DALService } from '../../../../../DALservice.service';
import swal from 'sweetalert2';
import { DataTableDirective } from 'angular-datatables';
import { Location } from '@angular/common';

@Component({
  moduleId: module.id,
  selector: 'app-root',
  templateUrl: './cashiertransactionlist.component.html'
})

export class CashiertransactionlistComponent extends BaseComponent implements OnInit {
  // variable
  public listcashiertransaction: any = [];
  public branchCode: any = [];
  public branchName: any = [];
  public cashiercode: any = [];
  public lookupSysBranch: any = [];
  public isrowCount: Boolean = true;
  public isrowCashout: Boolean = true;
  public tampStatus: String;
  public cashier_currency_code: String;
  public bank_gl_link_code: String;
  public branch_bank_code: String;
  public branch_bank_name: String;
  public description: String;
  public bank_account_no: String;
  public bank_account_name: String;
  public currency_code: String;
  public branch_code: String;
  private dataRoleTamp: any = [];
  private dataTamp: any = [];
  public lookupbank: any = [];

  private RoleAccessCode = 'R00003180000319A';

  // API Controller
  private APIController: String = 'CashierTransaction';
  private APIControllerCashierMain: String = 'CashierMain';
  private APIControllerSysBranch: String = 'SysBranch';
  private APIControllerSysBranchBank: String = 'SysBranchBank';

  // API Function
  private APIRouteForLookup: String = 'GetRowsForLookup';
  private APIRouteForGetRows: String = 'GETROWS';
  private APIRouteForGetCashout: String = 'ExecSpForGetCashout';
  private APIRouteForGetRow: String = 'GetRowByEmployeeCode';

  // spinner
  showSpinner: Boolean = false;
  // end

  // ini buat datatables
  @ViewChild(DataTableDirective)
  dtElement: DataTableDirective;
  dtOptions: DataTables.Settings = {};
  dtOptionss: DataTables.Settings = {};

  // checklist
  public selectedAll: any;
  public checkedList: any = [];

  constructor(private dalservice: DALService,
    public route: Router,
    private _location: Location,
    private _elementRef: ElementRef) { super(); }

  ngOnInit() {
    this.callGetRole(this.userId, this._elementRef, this.dalservice, this.RoleAccessCode, this.route);
    this.compoSide(this._location, this._elementRef, this.route);

    this.callGetrow();
    // this.btnLookupBank();
    this.tampStatus = 'HOLD';
    this.loadData();
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
        // param tambahan untuk getrows dynamic
        dtParameters.paramTamp = [];
        dtParameters.paramTamp.push({
          'p_branch_code': this.branchCode,
          'p_cashier_status': this.tampStatus,
          'p_employee_code': this.userId
        });
        // end param tambahan untuk getrows dynamic
        this.dalservice.Getrows(dtParameters, this.APIController, this.APIRouteForGetRows).subscribe(resp => {
          const parse = JSON.parse(resp)
          this.listcashiertransaction = parse.data;
          if (parse.data != null) {
            this.listcashiertransaction.numberIndex = dtParameters.start;
          }

          callback({
            draw: parse.draw,
            recordsTotal: parse.recordsTotal,
            recordsFiltered: parse.recordsFiltered,
            data: []
          });
        }, err => console.log('There was an error while retrieving Data(API) !!!' + err));
      },
      columnDefs: [{ orderable: false, width: '5%', targets: [0, 1, 10] }], // for disabled coloumn
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
    this.dalservice.Getrow(this.dataTamp, this.APIControllerCashierMain, this.APIRouteForGetRow)
      .subscribe(
        res => {
          const parse = JSON.parse(res);
          const parsedata = this.getrowNgb(parse.data[0]);

          this.branch_code = parsedata.branch_code;

          if (parse.data.length === 0) {
            this.isrowCount = true;
          } else {
            this.cashiercode = parsedata.code;
            this.isrowCount = false;
            if (parsedata.cashier_close_amount === 0) {
              this.isrowCashout = true;
            } else {
              this.isrowCashout = false;
            }
          }

        },
        error => {
          console.log('There was an error while Retrieving Data(API) !!!' + error);
        });
  }
  //#endregion  getrow data

  //#region ddl PageStatus
  PageStatus(event: any) {
    this.tampStatus = event.target.value;
    $('#datatableCashierTransactionList').DataTable().ajax.reload();
  }
  //#endregion ddl PageStatus

  //#region button add
  btnAdd() {    
    if (this.branch_bank_code == null) {
      this.swalPopUpMsg('Please Select Bank First');
    } else {
      this.route.navigate(['/cashier/subcashiertransactionlist/cashiertransactiondetail']);
    }
  }
  //#endregion button add

  //#region button edit
  btnEdit(codeEdit: string) {
    this.route.navigate(['/cashier/subcashiertransactionlist/cashiertransactiondetail', codeEdit]);
  }
  //#endregion button edit

  //#region Branch Name
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
          this.lookupSysBranch = parse.data;
          if (parse.data != null) {
            this.lookupSysBranch.numberIndex = dtParameters.start;
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

  btnSelectRowSysBranch(code: String, name: String) {
    this.branchCode = code;
    this.branchName = name;
    $('#lookupModalSysBranch').modal('hide');
    $('#datatableCashierTransactionList').DataTable().ajax.reload();
  }

  btnClearBranch() {
    this.branchCode = '';
    this.branchName = '';
    this.branch_bank_code = undefined;
    this.description = undefined;
    this.bank_account_no = undefined;
    // this.branch_bank_name = undefined;
    // this.cashier_currency_code = undefined;
    this.bank_gl_link_code = undefined;
    $('#lookupModalSysBranch').modal('hide');
    $('#datatableCashierTransactionList').DataTable().ajax.reload();
  }
  //#endregion branch

  //#region button Cashout
  btnCashout() {
    // param tambahan untuk button Cashout dynamic
    this.dataRoleTamp = [{
      'p_cashier_code': this.cashiercode,
      'p_bank_gl_link_code': this.bank_gl_link_code,
      'p_branch_bank_code': this.branch_bank_code,
      'p_branch_bank_name': this.branch_bank_name,
      'p_currency_code': this.currency_code,
      'action': 'default'
    }];
    // param tambahan untuk button Cashout dynamic

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
        this.dalservice.ExecSp(this.dataRoleTamp, this.APIController, this.APIRouteForGetCashout)
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
      } else {
        this.showSpinner = false;
      }
    });
  }
  //#endregion button Cashout

  //#region Lookup Bank
  // btnLookupBank() {
  //   $('#datatableLookupSysBranch').DataTable().clear().destroy();
  //   $('#datatableLookupSysBranch').DataTable({
  //     'pagingType': 'first_last_numbers',
  //     'pageLength': 5,
  //     'processing': true,
  //     'serverSide': true,
  //     responsive: true,
  //     lengthChange: false, // hide lengthmenu
  //     searching: true, // jika ingin hilangin search box nya maka false
  //     ajax: (dtParameters: any, callback) => {
  //       // param tambahan untuk getrows dynamic
  //       dtParameters.paramTamp = [];
  //       dtParameters.paramTamp.push({
  //         'p_branch_code': this.branch_code,
  //         'p_type': 'CASH',
  //         'p_default_flag': '1'
  //       });
  //       // end param tambahan untuk getrows dynamic
  //       this.dalservice.GetrowsSys(dtParameters, this.APIControllerSysBranchBank, this.APIRouteForLookup).subscribe(resp => {
  //         const parse = JSON.parse(resp);

  //         if (parse.data.length > 0) {
  //           this.bank_gl_link_code = parse.data[0].gl_link_code;
  //           this.branch_bank_code = parse.data[0].code;
  //           this.branch_bank_name = parse.data[0].bank_account_name;
  //           this.currency_code = parse.data[0].currency_code;
  //         }
  //         callback({
  //           draw: parse.draw,
  //           recordsTotal: parse.recordsTotal,
  //           recordsFiltered: parse.recordsFiltered,
  //           data: []
  //         });
  //       });
  //     }
  //   });
  // }
  //#endregion Lookup Bank

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
          'p_branch_code': this.branch_code,
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

  btnSelectRowBank(bank_code: String, description: string, bank_account_no: string, bank_account_name: string, cashier_currency_code: string, gl_link_code: string) {
    this.branch_bank_code = bank_code;
    this.branch_bank_name = description;
    this.bank_account_no = bank_account_no;
    this.bank_account_name = bank_account_name;
    this.cashier_currency_code = cashier_currency_code;
    this.bank_gl_link_code = gl_link_code;
    $('#lookupModalBank').modal('hide');
    $('#datatableCashierTransactionList').DataTable().ajax.reload();
  }

  btnClearBank() {
    this.branch_bank_code = undefined;
    this.branch_bank_name = undefined;
    this.bank_account_no = undefined;
    this.bank_account_name = undefined;
    this.cashier_currency_code = undefined;
    this.bank_gl_link_code = undefined;
    $('#lookupModalBank').modal('hide');
    $('#datatableCashierTransactionList').DataTable().ajax.reload();
  }
  //#endregion Lookup Bank
}
