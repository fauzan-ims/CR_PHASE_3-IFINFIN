import { Component, OnInit, ViewChild, ElementRef } from '@angular/core';
import 'rxjs/add/operator/map'
import { Router, ActivatedRoute } from '@angular/router';
import { DataTableDirective } from 'angular-datatables';
import { BaseComponent } from '../../../../../base.component';
import { DALService } from '../../../../../DALservice.service';
import swal from 'sweetalert2';

@Component({
  moduleId: module.id,
  selector: 'app-root',
  templateUrl: './referencelist.component.html',
})

export class ReferencelistComponent extends BaseComponent implements OnInit {
  // get param from url
  param = this.getRouteparam.snapshot.paramMap.get('id');

  // variable
  public listreference: any = [];
  private rolecode: any = [];
  private dataRoleTamp: any = [];
  public lookupReference: any = [];
  private APIController: String = 'MasterOjkReference';
  private APIControllerReference: String = 'SysGeneralSubcode';
  private APIRouteForLookup: String = 'GetRowsForLookupForOjkReference';
  private APIRouteForGetRows: String = 'GetRows';
  private APIRouteForGetRole: String = 'ExecSpForGetRole';

  // form 2 way binding
  model: any = {};

  // ini buat datatables
  @ViewChild(DataTableDirective)
  dtElement: DataTableDirective;
  dtOptions: DataTables.Settings = {};

  constructor(private dalservice: DALService,
    public getRouteparam: ActivatedRoute,
    public route: Router,
    private _elementRef: ElementRef
  ) { super(); }

  ngOnInit() {
    // this.callGetRole('');
    this.loadData();
    this.model.reference_type_code = 'ALL';
  }

  //#region Reference
  btnLookupReference() {
    $('#datatableLookupReference').DataTable().clear().destroy();
    $('#datatableLookupReference').DataTable({
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
        this.dalservice.Getrows(dtParameters, this.APIControllerReference, this.APIRouteForLookup).subscribe(resp => {
          const parse = JSON.parse(resp);
          this.lookupReference = parse.data;

          callback({
            draw: parse.draw,
            recordsTotal: parse.recordsTotal,
            recordsFiltered: parse.recordsFiltered,
            data: []
          })
        }, err => console.log('There was an error while retrieving Data(API) !!!' + err));
      },
      'lengthMenu': [
        [5, 25, 50, 100],
        [5, 25, 50, 100]
      ],
      columnDefs: [{ orderable: false, width: '5%', targets: [3] }], // for disabled coloumn
      language: {
        search: '_INPUT_',
        searchPlaceholder: 'Search records',
        infoEmpty: '<p style="color:red;">No Data Available !</p>'
      },
      searchDelay: 800 // pake ini supaya gak bug search
    });
  }

  btnSelectRowReference(code: String, description: String) {
    this.model.reference_type_code = code;
    this.model.reference_type_name = description;
    $('#lookupModalReference').modal('hide');
    $('#datatable').DataTable().ajax.reload();
  }
  //#endregion Reference

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
          'p_reference_type_code': this.model.reference_type_code
        });
        // end param tambahan untuk getrows dynamic
        this.dalservice.Getrows(dtParameters, this.APIController, this.APIRouteForGetRows).subscribe(resp => {
          const parse = JSON.parse(resp)
          this.listreference = parse.data;

          callback({
            draw: parse.draw,
            recordsTotal: parse.recordsTotal,
            recordsFiltered: parse.recordsFiltered,
            data: []
          });
        }, err => console.log('There was an error while retrieving Data(API) !!!' + err));
      },
      columnDefs: [{ orderable: false, width: '5%', targets: [6] }], // for disabled coloumn
      language: {
        search: '_INPUT_',
        searchPlaceholder: 'Search records',
        infoEmpty: '<p style="color:red;" > No Data Available !</p> '
      },
      searchDelay: 800 // pake ini supaya gak bug search
    }

  }
  //#endregion load all data

  //#region button add
  btnAdd() {
    this.route.navigate(['/setting/subreferencelist/referencedetail']);
  }
  //#endregion button add

  //#region button edit
  btnEdit(codeEdit: string) {
    this.route.navigate(['/setting/subreferencelist/referencedetail', codeEdit]);
  }
  //#endregion button edit

  //#region getrole
  callGetRole(uidParam) {
    // param tambahan untuk getrole dynamic
    this.dataRoleTamp = [{
      'p_uid': uidParam,
      'action': 'getResponse'
    }];
    // param tambahan untuk getrole dynamic

    this.dalservice.ExecSp(this.dataRoleTamp, this.APIController, this.APIRouteForGetRole)
      .subscribe(
        res => {
          const parse = JSON.parse(res);
          const rolecode = parse.data;

          // get role code from server and push into array
          for (let i = 0; i < rolecode.length; i++) {
            this.rolecode.push(rolecode[i].role_code);
          }

          // hide element when not a role code match with data-role in screen
          const domElement = this._elementRef.nativeElement.querySelectorAll('[data-role]');
          for (let j = 0; j < domElement.length; j++) {
            // tslint:disable-next-line:no-shadowed-variable
            const element = domElement[j].getAttribute('data-role');
            if (this.rolecode.indexOf(element) === -1) {
              this._elementRef.nativeElement.querySelector('[data-role = "' + element + '"]').style.display = 'none';
            }
          }
          // end hide element
        },
        error => {
          const parse = JSON.parse(error);
          this.swalPopUpMsg(parse.data);
        });
  }
  //#endregion getrole
}
