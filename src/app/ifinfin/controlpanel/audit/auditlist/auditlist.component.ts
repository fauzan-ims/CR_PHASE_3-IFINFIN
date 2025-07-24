import { OnInit, ViewChild, Component, ElementRef } from '@angular/core';
import 'rxjs/add/operator/map'
import { Router } from '@angular/router';
import { DataTableDirective } from 'angular-datatables';
import { BaseComponent } from '../../../../../base.component';
import { DALService } from '../../../../../DALservice.service';
import swal from 'sweetalert2';
import { Location } from '@angular/common';

@Component({
  moduleId: module.id,
  selector: 'app-root',
  templateUrl: './auditlist.component.html'
})

export class AuditlistComponent extends BaseComponent implements OnInit {
  // variable
  public listaudittrail: any = [];

  private APIController: String = 'SysGlobalparam';

  private APIRouteForGetRows: String = 'GetRowsAuditTrail';

  private APIRouteForPrint: String = 'PrintFile';

  private RoleAccessCode = 'R00004750000000A'; // role access 

  // spinner
  showSpinner: Boolean = true;
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
    this.compoSide(this._location, this._elementRef, this.route);
    this.callGetRole(this.userId, this._elementRef, this.dalservice, this.RoleAccessCode, this.route);
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
          'default': '',
        });
        // end param tambahan untuk getrows dynamic
        this.dalservice.Getrows(dtParameters, this.APIController, this.APIRouteForGetRows).subscribe(resp => {
          const parse = JSON.parse(resp)

          this.listaudittrail = parse.data;
          if (parse.data != null) {
            this.listaudittrail.numberIndex = dtParameters.start;
          }

          callback({
            draw: parse.draw,
            recordsTotal: parse.recordsTotal,
            recordsFiltered: parse.recordsFiltered,
            data: []
          });

        }, err => console.log('There was an error while retrieving Data(API) !!!' + err));
      },
      columnDefs: [{ orderable: false, width: '5%', targets: [0, 1, 3] }], // for disabled coloumn
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
  btnPrint(name: string) {
    const dataParam = [
      {
        'p_table_name': name
      }
    ];
    // param tambahan untuk button Reject dynamic

    this.showSpinner = true;

    this.dalservice.DownloadFileWithData(dataParam, this.APIController, this.APIRouteForPrint).subscribe(res => {

      this.showSpinner = false;
      var contentDisposition = res.headers.get('content-disposition');


      var filename = contentDisposition.split(';')[1].split('filename')[1].split('=')[1].trim();

      const blob = new Blob([res.body], { type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet' });
      const url = window.URL.createObjectURL(blob);
      var link = document.createElement('a');
      link.href = url;
      link.download = filename;
      link.click();
      // window.open(url);

    }, err => {
      this.showSpinner = false;
      const parse = JSON.parse(err);
      this.swalPopUpMsg(parse.data);
    });
  }
  //#endregion button edit 

  //#region btnDownload
  // btnPrint(name: string) {
  //   const dataParam = [
  //     {
  //       'p_table_name': name
  //     }
  //   ];
  //   // param tambahan untuk button Reject dynamic

  //   this.showSpinner = true;

  //   this.dalservice.DownloadFileWithData(dataParam, this.APIController, this.APIRouteForPrint).subscribe(res => {

  //     this.showSpinner = false;
  //     var contentDisposition = res.headers.get('content-disposition');


  //     var filename = contentDisposition.split(';')[1].split('filename')[1].split('=')[1].trim();

  //     const blob = new Blob([res.body], { type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet' });
  //     const url = window.URL.createObjectURL(blob);
  //     var link = document.createElement('a');
  //     link.href = url;
  //     link.download = filename;
  //     link.click();
  //     // window.open(url);

  //   }, err => {
  //     this.showSpinner = false;
  //     const parse = JSON.parse(err);
  //     this.swalPopUpMsg(parse.data);
  //   });

  // }
  // #endregion btnDownload
}
