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
  templateUrl: './agreementupdatelist.component.html'
})

export class AgreementupdatelistComponent extends BaseComponent implements OnInit {
  // variable
  public listagreement: any = [];
  public lookupBranch: any = [];
  public tampStatus: String;
  public job_status: String;

  public branchName: String;
  private RoleAccessCode = 'R00011780000000A';

  // API Controller
  private APIController: String = 'FinInterfaceAgreementUpdate';

  // API Function
  private APIRouteForGetRows: String = 'GetRows';

  // checklist
  public selectedAllTable: any;

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
    this.callGetRole(this.userId, this._elementRef, this.dalservice, this.RoleAccessCode, this.route);
    this.compoSide(this._location, this._elementRef, this.route);
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
          'p_job_status': this.job_status
        }];

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
      columnDefs: [{ orderable: false, targets: [0, 1, 7] }],
      language: {
        search: '_INPUT_',
        searchPlaceholder: 'Search records',
        infoEmpty: '<p style="color:red;" > No Data Available !</p> '
      },
      searchDelay: 800 // pake ini supaya gak bug search
    }
  }
  //#endregion load all data

  //#region button edit
  btnEdit(codeEdit: string) {
    this.route.navigate(['/interface/subagreementupdatelist/agreementupdatedetail', codeEdit]);
  }
  //#endregion button edit

  //#region job Status
  PageStatus(event: any) {
    this.job_status = event.target.value;
    $('#datatableAgreementUpdateList').DataTable().ajax.reload();
  }
  //#endregion job Status
}
