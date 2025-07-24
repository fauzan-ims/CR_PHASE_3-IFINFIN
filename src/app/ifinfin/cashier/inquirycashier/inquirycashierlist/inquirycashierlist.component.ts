import { OnInit, ViewChild, Component, ElementRef } from '@angular/core';
import 'rxjs/add/operator/map'
import { ActivatedRoute, Router } from '@angular/router';
import { DataTableDirective } from 'angular-datatables';
import { BaseComponent } from '../../../../../base.component';
import { DALService } from '../../../../../DALservice.service';
import swal from 'sweetalert2';
import { Location } from '@angular/common';

@Component({
  moduleId: module.id,
  selector: 'app-root',
  templateUrl: './inquirycashierlist.component.html'
})

export class InquirycashierlistComponent extends BaseComponent implements OnInit {
  // variable
  // variable
  public from_date: any = [];
  public to_date: any = [];
  public branchCode: any = [];
  public branchName: any = [];
  public cashierCode: any = [];
  public cashierName: any = [];
  public listcashierreceiptrequest: any = [];
  public lookupSysBranch: any = [];
  public lookupCashierMain: any = [];
  public tampStatus: String;
  private currentDate = new Date();
  private RoleAccessCode = 'R00003230000000A';

  // API Controller
  private APIController: String = 'CashierTransaction';
  private APIControllerSysBranch: String = 'SysBranch';
  private APIControllerSysEmployeeMain: String = 'SysEmployeeMain';

  // API Function
  private APIRouteForLookup: String = 'GetRowsForLookup';
  private APIRouteForLookupCashier: String = 'GetRowsForLookupCashier';
  private APIRouteForGetRows: String = 'GetRowsForInquiryCashier';

  // form 2 way binding
  model: any = {};

  // checklist
  public selectedAll: any;
  public checkedList: any = [];

  // ini buat datatables
  @ViewChild(DataTableDirective)
  dtElement: DataTableDirective;
  dtOptions: DataTables.Settings = {};

  constructor(private dalservice: DALService,
    public getRouteparam: ActivatedRoute,
    public route: Router,
    private _location: Location,
    private _elementRef: ElementRef) { super(); }

  ngOnInit() {
    this.callGetRole(this.userId, this._elementRef, this.dalservice, this.RoleAccessCode, this.route);
    this.compoSide(this._location, this._elementRef, this.route);
    this.model.from_date = this.dateFormater('dateNow');
    this.model.to_date = this.dateFormater('dateNow');
    this.tampStatus = 'HOLD';
    this.loadData();
  }

  //#region ddl from date
  FromDate(event: any) {
    this.model.from_date = event;
    $('#datatableInquiryCashierList').DataTable().ajax.reload();
  }
  //#endregion ddl from date

  //#region ddl to date
  ToDate(event: any) {
    this.model.to_date = event;
    $('#datatableInquiryCashierList').DataTable().ajax.reload();
  }
  //#endregion ddl to date

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
        let paramTamps = {};
        paramTamps = {
          'p_branch_code': this.branchCode,
          'p_cashier_main_code': this.cashierCode,
          'p_from_date': this.model.from_date,
          'p_to_date': this.model.to_date,
        };
        dtParameters.paramTamp = [];
        dtParameters.paramTamp.push(this.JSToNumberFloats(paramTamps))
        // param tambahan untuk getrows dynamic

        this.dalservice.Getrows(dtParameters, this.APIController, this.APIRouteForGetRows).subscribe(resp => {
          const parse = JSON.parse(resp)
          this.listcashierreceiptrequest = parse.data;
          if (parse.data != null) {
            this.listcashierreceiptrequest.numberIndex = dtParameters.start;
          }


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

  //#region ddl PageStatus
  PageStatus(event: any) {
    this.tampStatus = event.target.value;
    $('#datatableInquiryCashierList').DataTable().ajax.reload();
  }
  //#endregion ddl PageStatus

  //#region button edit
  btnEdit(codeEdit: string) {
    this.route.navigate(['/cashier/subinquirycashierlist/inquirycashierdetail', codeEdit]);
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
    this.cashierCode = '';
    this.cashierName = '';
    $('#lookupModalSysBranch').modal('hide');
    $('#datatableInquiryCashierList').DataTable().ajax.reload();
  }

  btnClearBranch(){
    this.branchCode = '';
    this.branchName = '';
    this.cashierCode = '';
    this.cashierName = '';
    $('#lookupModalSysBranch').modal('hide');
    $('#datatableInquiryCashierList').DataTable().ajax.reload();
  }
  //#endregion branch

  //#region cashier
  btnLookupCashierMain() {
    $('#datatableLookupCashierMain').DataTable().clear().destroy();
    $('#datatableLookupCashierMain').DataTable({
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
        });
        // end param tambahan untuk getrows dynamic
        // this.dalservice.Getrows(dtParameters, this.APIController, this.APIRouteForLookupCashier).subscribe(resp => {
        this.dalservice.GetrowsSys(dtParameters, this.APIControllerSysEmployeeMain, this.APIRouteForLookupCashier).subscribe(resp => {
          const parse = JSON.parse(resp);

          this.lookupCashierMain = parse.data;
          if (parse.data != null) {
            this.lookupCashierMain.numberIndex = dtParameters.start;
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
        infoEmpty: '<p style="color:red;" > No Data Available !</p> '
      },
      searchDelay: 800 // pake ini supaya gak bug search
    });
  }

  btnSelectRowCashierMain(code: String, name: String) {
    this.cashierCode = code;
    this.cashierName = name;
    $('#lookupModalCashierMain').modal('hide');
    $('#datatableInquiryCashierList').DataTable().ajax.reload();
  }
  //#endregion cashier
}
