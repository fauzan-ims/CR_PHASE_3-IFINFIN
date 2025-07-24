import { Component, OnInit, ElementRef, ViewChild } from '@angular/core';
import { Router } from '@angular/router';
import swal from 'sweetalert2';
import { DataTableDirective } from 'angular-datatables';
import { BaseComponent } from '../../../../../base.component';
import { DALService } from '../../../../../DALservice.service';
import { Location } from '@angular/common';

@Component({
  moduleId: module.id,
  selector: 'app-root',
  templateUrl: './agreementlist.component.html'
})

export class AgreementlistComponent extends BaseComponent implements OnInit {
  // variable
  public listagreement: any = [];
  public lookupBranch: any = [];
  public branchName: String;
  private branchCode: String;
  public tampStatus: String;
  public job_status: String;

  // API Controller
  private APIController: String = 'FinInterfaceAgreementMain';
  private APIControllerSysBranch: String = 'SysBranch';
  private APIRouteForLookupSysBranch: String = 'GetRowsForLookup';
  private APIRouteForGetRows: String = 'GetRows';
  private RoleAccessCode = 'R00011750000000A';

  // checklist
  public selectedAllTable: any;
  private checkedList: any = [];

  // spinner
  showSpinner: Boolean = false;
  // end

  // ini buat datatables
  @ViewChild(DataTableDirective)
  dtElement: DataTableDirective;
  dtOptions: DataTables.Settings = {};

  constructor(private dalservice: DALService,
    public route: Router,
    private _location: Location,
    private _elementRef: ElementRef) { super(); }

  ngOnInit() {
    this.job_status = 'HOLD';
    this.callGetRole(this.userId, this._elementRef, this.dalservice, this.RoleAccessCode, this.route);
    this.compoSide(this._location, this._elementRef, this.route);
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
          'p_job_status': this.job_status,
        });
        // end param tambahan untuk getrows dynamic
        this.dalservice.Getrows(dtParameters, this.APIController, this.APIRouteForGetRows).subscribe(resp => {
          const parse = JSON.parse(resp);
          this.listagreement = parse.data;
          if (parse.data != null) {
            this.listagreement.numberIndex = dtParameters.start;
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
      columnDefs: [{ orderable: false, targets: [0, 1, 10] }],
      language: {
        search: '_INPUT_',
        searchPlaceholder: 'Search records',
        infoEmpty: '<p style="color:red;" > No Data Available !</p> '
      },
      searchDelay: 800 // pake ini supaya gak bug search
    }
  }
  //#endregion load all data

  //#region ddl Status
  JobStatus(event: any) {
    this.job_status = event.target.value;
    $('#datatableAgreementList').DataTable().ajax.reload();
  }
  //#endregion ddl Status

  //#region button edit
  btnEdit(codeEdit: string) {
    this.route.navigate(['/interface/subagreementlist/agreementdetail', codeEdit]);
  }
  //#endregion button edit

  //#region Lookup Branch
  btnLookupbranch() {
    $('#datatableLookupBranch').DataTable().clear().destroy();
    $('#datatableLookupBranch').DataTable({
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
          'default': 'action',
        });
        // end param tambahan untuk getrows dynamic

        this.dalservice.GetrowsSys(dtParameters, this.APIControllerSysBranch, this.APIRouteForLookupSysBranch).subscribe(resp => {
          const parse = JSON.parse(resp);
          this.lookupBranch = parse.data;
          this.lookupBranch.numberIndex = dtParameters.start;
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

  btnSelectRowLookupBranch(branch_code: String, branch_name: String) {
    this.branchCode = branch_code;
    this.branchName = branch_name;
    $('#lookupModalbranch').modal('hide');
    $('#datatableAgreementList').DataTable().ajax.reload();
  }

  btnClearBranch() {
    this.branchCode = '';
    this.branchName = '';
    $('#datatableAgreementList').DataTable().ajax.reload();
  }
  //#endregion Lookup Branch


}
