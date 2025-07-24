import { OnInit, ViewChild, Component, ElementRef } from '@angular/core';
import 'rxjs/add/operator/map'
import { ActivatedRoute, Router } from '@angular/router';
import { BaseComponent } from '../../../../../base.component';
import { DALService } from '../../../../../DALservice.service';
import swal from 'sweetalert2';
import { DataTableDirective } from 'angular-datatables';
import { Location } from '@angular/common';

@Component({
  moduleId: module.id,
  selector: 'app-root',
  templateUrl: './accounttransferrequestlist.component.html'
})

export class AccounttransferrequestlistComponent extends BaseComponent implements OnInit {
  // variable
  public listaccounttransferrequest: any = [];
  public branchCode: any = [];
  public branchName: any = [];
  public lookupSysBranch: any = [];
  public tampStatus: String;
  public job_status: String;
  private RoleAccessCode = 'R00017770000000A';


  // API Controller
  private APIController: String = 'FinInterfaceAccountTransfer';
  private APIControllerSysBranch: String = 'SysBranch';

  // API Function
  private APIRouteForLookup: String = 'GetRowsForLookup';
  private APIRouteForGetRows: String = 'GETROWS';

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

    this.tampStatus = 'HOLD';
    this.job_status = 'HOLD';
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
        // param tambahan untuk getrole dynamic
        dtParameters.paramTamp = [];
        dtParameters.paramTamp = [{
          'p_branch_code': this.branchCode,
          'p_job_status': this.job_status,
          'p_transfer_status': this.tampStatus
        }];
        // param tambahan untuk getrole dynamic
        this.dalservice.Getrows(dtParameters, this.APIController, this.APIRouteForGetRows).subscribe(resp => {
          const parse = JSON.parse(resp)
          this.listaccounttransferrequest = parse.data;
          if (parse.data != null) {
            this.listaccounttransferrequest.numberIndex = dtParameters.start;
          }

          callback({
            draw: parse.draw,
            recordsTotal: parse.recordsTotal,
            recordsFiltered: parse.recordsFiltered,
            data: []
          });
        }, err => console.log('There was an error while retrieving Data(API) !!!' + err));
      },
      columnDefs: [{ orderable: false, width: '5%', targets: [0, 1, 9] }], // for disabled coloumn
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
    $('#datatableAccountTransferRequestList').DataTable().ajax.reload();
  }
  //#endregion ddl PageStatus

  //#region ddl Status
  JobStatus(event: any) {
    this.job_status = event.target.value;
    $('#datatableAccountTransferRequestList').DataTable().ajax.reload();
  }
  //#endregion ddl Status
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
    $('#datatableAccountTransferRequestList').DataTable().ajax.reload();
  }

  btnClearBranch() {
    this.branchCode = '';
    this.branchName = '';
    $('#lookupModalSysBranch').modal('hide');
    $('#datatableAccountTransferRequestList').DataTable().ajax.reload();
  }
  //#endregion branch

  //#region button edit
  btnEdit(codeEdit: string) {
    this.route.navigate(['/interface/subaccounttransferrequestlist/accounttransferrequestdetail', codeEdit]);
  }
  //#endregion button edit
}
