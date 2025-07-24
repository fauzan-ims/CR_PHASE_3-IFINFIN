import { Component, OnInit, ElementRef, ViewChild, AfterViewInit } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { NgForm } from '@angular/forms';
import swal from 'sweetalert2';
import { DataTableDirective } from 'angular-datatables';
import { BaseComponent } from '../../../../../base.component';
import { DALService } from '../../../../../DALservice.service';

@Component({
  selector: 'app-reportlog',
  templateUrl: './reportlog.component.html'
})
export class ReportLogComponent extends BaseComponent implements OnInit {
  // get param from url
  param = this.getRouteparam.snapshot.paramMap.get('id');
  pageType = this.getRouteparam.snapshot.paramMap.get('page');

  // variable
  public reportData: any = [];
  public lookupsysbranch: any = [];
  public dataTamp: any = [];
  public testTamp: any = [];
  public listreport: any = [];
  public branchlist: any = [];
  public lookupreportname: any = [];
  public lookupemployee: any = [];

  private APIController: String = 'SysReport';
  private APIRouteForGetRow: String = 'GetRow';
  private APIRouteForPrint: String = 'PrintFile';
  private RoleAccessCode = 'R00017680000000A';


  //lookup Report Name
  private APIRouteForLookupReportName = 'GetRowsForLookupReportName';

  //lookup Employee Name
  private APIControllerSysEmployeeMain: String = 'SysEmployeeMain';
  private APIRouteLookup: String = 'GetRowsForLookup';

  // form 2 way binding
  model: any = {};

  // spinner
  showSpinner: Boolean = true;
  // end

  // datatable
  @ViewChild(DataTableDirective)
  dtElement: DataTableDirective;
  dtOptions: DataTables.Settings = {};
  dtOptionsBranch: DataTables.Settings = {};
  // showNotification: any;

  constructor(private dalservice: DALService,
    public getRouteparam: ActivatedRoute,
    public route: Router,
    private _elementRef: ElementRef
  ) { super(); }

  ngOnInit() {
    this.callGetRole(this.userId, this._elementRef, this.dalservice, this.RoleAccessCode, this.route);
    this.model.print_option = 'ExcelRecord';
    this.callGetrow();
  }

  //#region getrow data
  callGetrow() {
    // param tambahan untuk getrow dynamic
    this.dataTamp = [{
      'p_code': this.param
    }];
    // end param tambahan untuk getrow dynamic
    this.dalservice.Getrow(this.dataTamp, this.APIController, this.APIRouteForGetRow)
      .subscribe(
        res => {
          const parse = JSON.parse(res);
          const parsedata = parse.data[0];

          // mapper dbtoui
          Object.assign(this.model, parsedata);
          // end mapper dbtoui

          this.showSpinner = false;
        },
        error => {
          console.log('There was an error while Retrieving Data(API) !!!' + error);
        });
  }
  //#endregion getrow data

  //#region onFormSubmit
  onFormSubmit(rptForm: NgForm, isValid: boolean) {
    if (!isValid) {
        swal({
            allowOutsideClick: false,
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

    this.reportData = this.JSToNumberFloats(rptForm);

    const dataParam = [
        {
          'p_report_code': this.model.code,
          'p_employee': this.model.employee_code,
          'p_from_date': this.reportData.p_from_date,
          'p_to_date': this.reportData.p_to_date
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
// #endregion onFormSubmit

  //#region Report Name Lookup
  btnLookupReportName() {
    $('#datatableLookupReportName').DataTable().clear().destroy();
    $('#datatableLookupReportName').DataTable({
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
        this.dalservice.Getrows(dtParameters, this.APIController, this.APIRouteForLookupReportName).subscribe(resp => {
          const parse = JSON.parse(resp);
          this.lookupreportname = parse.data;
          if (parse.data != null) {
            this.lookupreportname.numberIndex = dtParameters.start;
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
    });
  }

  btnSelectRowlookupReportName(code: String, name: String) {
    this.model.code = code;
    this.model.report_name = name;
    $('#lookupModalReportName').modal('hide');
  }
  //#endregion Report Name lookup

  //#region lookup Employee
  btnLookupEmployee() {
    $('#datatableLookupEmployee').DataTable().clear().destroy();
    $('#datatableLookupEmployee').DataTable({
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
        this.dalservice.GetrowsSys(dtParameters, this.APIControllerSysEmployeeMain, this.APIRouteLookup).subscribe(resp => {
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
      columnDefs: [{ orderable: false, width: '5%', targets: [1, 4] }], // for disabled coloumn
      language: {
        search: '_INPUT_',
        searchPlaceholder: 'Search records',
        infoEmpty: '<p style="color:red;" > No Data Available !</p> '
      },
      searchDelay: 800 // pake ini supaya gak bug search
    });
    // } , 1000);
  }
  btnSelectRowEmployee(code: String, name: String) {
    this.model.employee_code = code;
    this.model.employee_name = name;
    $('#lookupModalEmployee').modal('hide');
  }
  //#endregion lookup Employee
  
}