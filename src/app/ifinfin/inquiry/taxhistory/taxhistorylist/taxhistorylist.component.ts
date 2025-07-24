import { OnInit, ViewChild, Component, ElementRef } from '@angular/core';
import 'rxjs/add/operator/map'
import { Router } from '@angular/router';
import { DataTableDirective } from 'angular-datatables';
import { BaseComponent } from '../../../../../base.component';
import { DALService } from '../../../../../DALservice.service';
import swal from 'sweetalert2';
import { Location } from '@angular/common';
import { Console } from '@angular/core/src/console';


@Component({
  moduleId: module.id,
  selector: 'app-root',
  templateUrl: './taxhistorylist.component.html'
})

export class TaxhistorylistComponent extends BaseComponent implements OnInit {
  // variable
  public branch_code: any = [];
  public branch_name: any = [];
  public npwp_name: any = [];
  public listtaxhistory: any = [];
  public lookupnpwpno: any = [];
  public lookupntaxname: any = [];
  public tampStatus: String;
  public NpwpPattern = this._npwpformat;
  public lookupbranchcode: any = [];
  //public RoleAccessDownload: string;
  private RoleAccessCode = 'R00016680000000A';

  // API Controller
  private APIController: String = 'WithholdingTaxHistory';
  private APIControllerSysBranch: String = 'SysBranch';

  // API Function
  private APIRouteForLookup: String = 'GetRowsForLookup';
  private APIRouteForTaxNameLookup: String = 'GetRowsForTaxNameLookup';
  private APIRouteForDownload: String = 'DownloadFileWithData';
  private APIRouteForGetRows: String = 'GetRows';


  // form 2 way binding
  model: any = {};

  // ini buat datatables
  @ViewChild(DataTableDirective)
  dtElement: DataTableDirective;
  dtOptions: DataTables.Settings = {};
  checkedList: any;
  selectedAll: any;
  selectedAllTable: any;

  constructor(private dalservice: DALService,
    public route: Router,
    private _location: Location,
    private _elementRef: ElementRef) { super(); }

  ngOnInit() {

    $("#npwp").attr('maxlength', '15');
    // this.RoleAccessDownload = "R00001870000188P";
    this.callGetRole(this.userId, this._elementRef, this.dalservice, this.RoleAccessCode, this.route);
    this.compoSide(this._location, this._elementRef, this.route);
    this.loadData();
    this.model.from_date = this.dateFormater('dateNow');
    this.model.to_date = this.dateFormater('dateNow');
    // document.getElementById('dwnButtonDrawdownAmortWiz').setAttribute('data-role', this.RoleAccessDownload);
  }

  //#region ddl from date
  FromDate(event: any) {
    this.model.from_date = event;
    $('#datatableTaxHistoryList').DataTable().ajax.reload();
   
  }
  //#endregion ddl from date

  //#region ddl to date
  ToDate(event: any) {
    this.model.to_date = event;
    $('#datatableTaxHistoryList').DataTable().ajax.reload();
    
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
        // tambahan param untuk getrows dynamic
        let paramTamps = {};
        paramTamps = {
          'p_tax_file_no': this.model.npwp_no,
          'p_from_date': this.model.from_date,
          'p_to_date': this.model.to_date,
          'p_branch_code': this.branch_code,
          'p_tax_file_name': this.model.npwp_name

        };

        dtParameters.paramTamp = [];
        dtParameters.paramTamp.push(this.JSToNumberFloats(paramTamps))

        // tambahan param untuk getrows dynamic
        this.dalservice.Getrows(dtParameters, this.APIController, this.APIRouteForGetRows).subscribe(resp => {
          const parse = JSON.parse(resp)

          this.listtaxhistory = parse.data;
          if (parse.data != null) {
            this.listtaxhistory.numberIndex = dtParameters.start;
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

  //#region button edit
  btnEdit(codeEdit: string) {
    this.route.navigate(['/inquiry/subwithholdingtaxhistorylist/taxhistorydetail', codeEdit]);
  }
  //#endregion button edit

  //#region npwp
  onKeydownNpwp(event: any) {

    let ctrlDown = false;

    if (event.keyCode == 17 || event.keyCode == 91) {
      ctrlDown = true;
    }

    if (!((event.keyCode >= 48 && event.keyCode <= 57) || (event.keyCode >= 96 && event.keyCode <= 105)
      || (ctrlDown && (event.keyCode == 86 || event.keyCode == 67 || event.keyCode == 65 || event.keyCode == 90))
      || event.keyCode == 8 || event.keyCode == 9
      || (event.keyCode == 37 || event.keyCode == 39 || event.keyCode == 38 || event.keyCode == 40)
    )) {

      return false;
    }
    $('#datatableTaxHistoryList').DataTable().ajax.reload();
  }

  onPasteNpwp(event: any) {

    if (!event.originalEvent.clipboardData.getData('Text').match(/^[0-9,.-]*$/)) {
      event.preventDefault();
    }
    $('#datatableTaxHistoryList').DataTable().ajax.reload();
  }

  onFokusNpwp(event: any) {
    let valEvent: any;
    valEvent = '' + event.target.value;

    if (valEvent != null) {
      this.model.npwp_no = valEvent.replace(/[^0-9]/g, '');
    }
    $('#datatableTaxHistoryList').DataTable().ajax.reload();
  }

  onChangeNpwp(event: any) {

    let valEvent: any;

    valEvent = '' + event.target.value;
    var x = valEvent.split('');

    if (x.length == 15) {
      var tt = x[0] + x[1] + '.';
      var dd = tt + x[2] + x[3] + x[4] + '.';
      var ee = dd + x[5] + x[6] + x[7] + '.';
      var ff = ee + x[8] + '-';
      var gg = ff + x[9] + x[10] + x[11] + '.';
      var hh = gg + x[12] + x[13] + x[14];

      this.model.npwp_no = hh;
    }
    $('#datatableTaxHistoryList').DataTable().ajax.reload();

  }
  //#endregion npwp

  //#region lookup npwp
  btnLookupNpwpNo() {
    $('#datatableLookupNpwpNo').DataTable().clear().destroy();
    $('#datatableLookupNpwpNo').DataTable({
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
        // param tambahan untuk getrows dynamic
        this.dalservice.Getrows(dtParameters, this.APIController, this.APIRouteForLookup).subscribe(resp => {
          const parse = JSON.parse(resp);
          this.lookupnpwpno = parse.data;
          if (parse.data != null) {
            this.lookupnpwpno.numberIndex = dtParameters.start;
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
    // } , 1000);
  }
  btnSelectRowNpwpNo(npwp_no: String, npwp_name: String) {
    this.model.npwp_no = npwp_no;
    this.model.npwp_name = npwp_name;
    $('#lookupModalNpwpNo').modal('hide');
    $('#datatableTaxHistoryList').DataTable().ajax.reload();
  }

  btnClearNpwp() {
    this.model.npwp_no = '';
    this.model.npwp_name = '';
    $('#lookupModalNpwpNo').modal('hide');
    $('#datatableTaxHistoryList').DataTable().ajax.reload();
  }
  //#endregion lookup npwp

  //#region lookup Cabang
  btnLookupBranchcode() {
    $('#datatableLookupBranchcode').DataTable().clear().destroy();
    $('#datatableLookupBranchcode').DataTable({
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
        // param tambahan untuk getrows dynamic
        this.dalservice.GetrowsSys(dtParameters, this.APIControllerSysBranch, this.APIRouteForLookup).subscribe(resp => {
          const parse = JSON.parse(resp);
          this.lookupbranchcode = parse.data;
          if (parse.data != null) {
            this.lookupbranchcode.numberIndex = dtParameters.start;
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
    // } , 1000);
  }
  btnSelectRowBranchcode(branch_code: String, branch_name: String) {
    this.branch_code = branch_code;
    this.branch_name = branch_name;
    $('#lookupModalBranchcode').modal('hide');
    $('#datatableTaxHistoryList').DataTable().ajax.reload();
  }

  btnClearBranch() {
    this.branch_code = '';
    this.branch_name = '';
    $('#lookupModalBranchcode').modal('hide');
    $('#datatableTaxHistoryList').DataTable().ajax.reload();
  }
  //#endregion lookup Cabang

  //#region lookup npwp
  btnLookupTaxName() {
    $('#datatableLookupTaxName').DataTable().clear().destroy();
    $('#datatableLookupTaxName').DataTable({
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
        // param tambahan untuk getrows dynamic
        this.dalservice.Getrows(dtParameters, this.APIController, this.APIRouteForTaxNameLookup).subscribe(resp => {
          const parse = JSON.parse(resp);
          this.lookupntaxname = parse.data;
          if (parse.data != null) {
            this.lookupntaxname.numberIndex = dtParameters.start;
          }

          callback({
            draw: parse.draw,
            recordsTotal: parse.recordsTotal,
            recordsFiltered: parse.recordsFiltered,
            data: []
          });
        }, err => console.log('There was an error while retrieving Data(API) !!!' + err));
      },
      columnDefs: [{ orderable: false, width: '5%', targets: [0, 1, 3] }],
      language: {
        search: '_INPUT_',
        searchPlaceholder: 'Search records',
        infoEmpty: '<p style="color:red;" > No Data Available !</p> '
      },
      searchDelay: 800 // pake ini supaya gak bug search
    });
    // } , 1000);
  }
  btnSelectRowTaxName(npwp_name: String) {
    //this.model.npwp_no = npwp_no;
    this.model.npwp_name = npwp_name;
    $('#lookupModalTaxName').modal('hide');
    $('#datatableTaxHistoryList').DataTable().ajax.reload();
  }

  btnClearTaxName() {
    //this.model.npwp_no = '';
    this.model.npwp_name = '';
    $('#lookupModalTaxName').modal('hide');
    $('#datatableTaxHistoryList').DataTable().ajax.reload();
  }
  //#endregion lookup npwp

  //#region btnDownload
  btnDownload() {
    const dataParam = [this.JSToNumberFloats(
      {
        'p_tax_file_no': this.model.npwp_no,
        'p_from_date': this.model.from_date,
        'p_to_date': this.model.to_date,
        'p_branch_code': this.branch_code,
        'p_tax_file_name': this.model.npwp_name
      })
    ];


    // param tambahan untuk button Reject dynamic

    //this.showSpinner = true;

    this.dalservice.DownloadFileWithData(dataParam, this.APIController, this.APIRouteForDownload).subscribe(res => {

     
      var contentDisposition = res.headers.get('content-disposition');


      var filename = contentDisposition.split(';')[1].split('filename')[1].split('=')[1].trim();

      const blob = new Blob([res.body], { type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet' });
      const url = window.URL.createObjectURL(blob);
      var link = document.createElement('a');
      link.href = url;
      link.download = filename;
      link.click();
      //  this.showSpinner = false;

    }, err => {
      //  this.showSpinner = false;
      const parse = JSON.parse(err);
      this.swalPopUpMsg(parse.data);
    });
  }
  //#endregion btnDownload

}
