import { OnInit, ViewChild, Component, ElementRef } from '@angular/core';
import 'rxjs/add/operator/map'
import { Router } from '@angular/router';
import { DataTableDirective } from 'angular-datatables';
import { BaseComponent } from '../../../../../base.component';
import { DALService } from '../../../../../DALservice.service';
import swal from 'sweetalert2';

@Component({
  moduleId: module.id,
  selector: 'app-root',
  templateUrl: './cashiertransactionlist.component.html'
})

export class CashiertransactionlistComponent extends BaseComponent implements OnInit {
  // variable
  public listcashiertransaction: any = [];
  public isReadOnly: Boolean = false;
  private dataRoleTamp: any = [];
  private rolecode: any = [];
  private APIController: String = 'MasterTransaction';
  private APIRouteForGetRows: String = 'GetRows';
  private APIRouteForGetRole: String = 'ExecSpForGetRole';

  // ini buat datatables
  @ViewChild(DataTableDirective)
  dtElement: DataTableDirective;
  dtOptions: DataTables.Settings = {};

  constructor(private dalservice: DALService,
    public route: Router,
    private _elementRef: ElementRef) { super(); }

  ngOnInit() {
    // this.callGetRole('');
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
      columnDefs: [{ orderable: false, width: '5%', targets: [0, 1, 5] }], // for disabled coloumn
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
    this.route.navigate(['/setting/subcashiertransactionlist/cashiertransactiondetail']);
  }
  //#endregion button add

  //#region button edit
  btnEdit(codeEdit: string) {
    this.route.navigate(['/setting/subcashiertransactionlist/cashiertransactiondetail', codeEdit]);
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
