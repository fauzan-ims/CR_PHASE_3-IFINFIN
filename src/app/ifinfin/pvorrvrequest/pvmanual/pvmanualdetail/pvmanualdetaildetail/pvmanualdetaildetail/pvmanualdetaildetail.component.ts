import { Component, OnInit, ElementRef, ViewChild, AfterViewInit } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { NgForm } from '@angular/forms';
import swal from 'sweetalert2';
import { DataTableDirective } from 'angular-datatables';
import { BaseComponent } from '../../../../../../../base.component';
import { DALService } from '../../../../../../../DALservice.service';
import { DatePipe } from '@angular/common';

@Component({
  moduleId: module.id,
  selector: 'app-root',
  templateUrl: './pvmanualdetaildetail.component.html'
})

export class PvmanualdetaildetailComponent extends BaseComponent implements OnInit {
  // get param from url
  param = this.getRouteparam.snapshot.paramMap.get('id');
  params = this.getRouteparam.snapshot.paramMap.get('id2');

  // variable
  public NumberOnlyPattern = this._numberonlyformat;
  public pvmanualdetaildetailData: any = [];
  public isReadOnly: Boolean = false;
  public isButton: Boolean = false;
  public isCurrency: Boolean = false;
  public lookupbranch: any = [];
  public lookupdepartment: any = [];
  public lookupdivision: any = [];
  public lookupcurrency: any = [];
  public lookupgllink: any = [];
  public orig_amount: any = [];
  public exch_rate: any = [];
  private valDate: any;
  private rolecode: any = [];
  private dataRoleTamp: any = [];
  private dataTamp: any = [];
  private RoleAccessCode = 'R00003140000315A';

  // API Controller
  private APIController: String = 'PaymentVoucherDetail';
  private APIControllerPaymentVoucher: String = 'PaymentVoucher';
  private APIControllerSysDivision: String = 'SysDivision';
  private APIControllerSysDepartment: String = 'SysDepartment';
  private APIControllerSysCurrency: String = 'SysCurrency';
  private APIControllerForJurnalGlLink: String = 'JournalGlLink';
  private APIControllerSysBranch: String = 'SysBranch';
  private APIControllerSysCurrencyRate: String = 'SysCurrencyRate';

  // API Function
  private APIRouteForLookupGlLink: String = 'GetRowsForLookupForVoucher';
  private APIRouteForLookup: String = 'GetRowsForLookup';
  private APIRouteForGetRow: String = 'GetRow';
 private APIRouteForGetRowForTopRate: String = 'ExecSpTopRate';
  private APIRouteForUpdate: String = 'Update';
  private APIRouteForInsert: String = 'Insert';
  private APIRouteForGetRole: String = 'ExecSpForGetRole';

  // form 2 way binding
  model: any = {};

  // spinner
  showSpinner: Boolean = true;
  // end

  // datatable
  @ViewChild(DataTableDirective)
  dtElement: DataTableDirective;
  dtOptions: DataTables.Settings = {};

  constructor(private dalservice: DALService,
    public getRouteparam: ActivatedRoute,
    public route: Router,
    private _elementRef: ElementRef, private datePipe: DatePipe
  ) { super(); }

  ngOnInit() {
    this.Delimiter(this._elementRef);

    this.callGetRole(this.userId, this._elementRef, this.dalservice, this.RoleAccessCode, this.route);

    if (this.params != null) {
      this.isReadOnly = true;

      // call web service
      this.callGetrow();
    } else {
      this.callGetrowHeader();
      // this.model.orig_currency_code = this.currency;
      this.showSpinner = false;
      this.model.orig_amount = 0
      this.exch_rate = 0;
    }
  }

  //#region  getrow data
  callGetrow() {
    // param tambahan untuk getrow dynamic
    this.dataTamp = [{
      'p_id': this.params,
    }];
    // end param tambahan untuk getrow dynamic

    this.dalservice.Getrow(this.dataTamp, this.APIController, this.APIRouteForGetRow)
      .subscribe(
        res => {
          const parse = JSON.parse(res);
          const parsedata = parse.data[0];
          this.valDate = parsedata.payment_value_date;
          const ngbGetrow = this.getrowNgb(parse.data[0]);

          this.orig_amount = parsedata.orig_amount;
          this.exch_rate = parsedata.exch_rate;

          if (parsedata.payment_status !== 'HOLD') {
            this.isButton = true;
          } else {
            this.isButton = false;
          }

          // mapper dbtoui
          Object.assign(this.model, ngbGetrow);
          // end mapper dbtoui

          this.callGetrowTopRate(this.model.orig_currency_code, this.valDate, false);
          this.showSpinner = false;
        },
        error => {
          console.log('There was an error while Retrieving Data(API) !!!' + error);
        });
  }
  //#endregion  getrow data

  //#region  getrow data
  callGetrowHeader() {
    // param tambahan untuk getrow dynamic
    this.dataTamp = [{
      'p_code': this.param,
    }];
    // end param tambahan untuk getrow dynamic

    this.dalservice.Getrow(this.dataTamp, this.APIControllerPaymentVoucher, this.APIRouteForGetRow)
      .subscribe(
        res => {
          const parse = JSON.parse(res);
          const parsedata = parse.data[0];
          this.valDate = parsedata.payment_value_date;
          const ngbGetrow = this.getrowNgb(parse.data[0]);

          this.model.branch_code = parsedata.branch_code;
          this.model.branch_name = parsedata.branch_name;
          this.model.orig_currency_code = parsedata.payment_orig_currency_code;
          this.model.remarks = parsedata.payment_remarks;

          // mapper dbtoui
          Object.assign(this.model, ngbGetrow);
          // end mapper dbtoui

          this.callGetrowTopRate(this.model.orig_currency_code, this.valDate, true);
          this.showSpinner = false;
        },
        error => {
          console.log('There was an error while Retrieving Data(API) !!!' + error);
        });
  }
  //#endregion  getrow data

  //#region  getrow data rate
  callGetrowTopRate(currency: any, date: any, change: boolean) {
    // param tambahan untuk getrow dynamic
    this.dataTamp = [{
      'p_currency_code': currency,
      'p_date': date,
      'action': 'getResponse'
    }];
    // end param tambahan untuk getrow dynamic
    this.dalservice.ExecSpSys(this.dataTamp, this.APIControllerSysCurrencyRate, this.APIRouteForGetRowForTopRate)
      .subscribe(
        res => {
          const parse = JSON.parse(res);
          const parsedata = this.getrowNgb(parse.data[0]);

          if (parsedata.code === currency) {
            this.isCurrency = true;
          } else {
            this.isCurrency = false;
          }

          if (change) {
            this.model.exch_rate = parsedata.exch_rate
            this.exch_rate = parsedata.exch_rate
            this.model.base_amount = (this.model.orig_amount * parsedata.exch_rate);
          }
        },
        error => {
          console.log('There was an error while Retrieving Data(API) !!!' + error);
        });
  }
  //#endregion  getrow data rate

  //#region form submit
  onFormSubmit(pvmanualdetaildetailForm: NgForm, isValid: boolean) {
    // validation form submit
    if (!isValid) {
      swal({
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

    this.pvmanualdetaildetailData = this.JSToNumberFloats(pvmanualdetaildetailForm);
    const usersJson: any[] = Array.of(this.pvmanualdetaildetailData);
    if (this.params != null) {
      // call web service
      this.dalservice.Update(usersJson, this.APIController, this.APIRouteForUpdate)
        .subscribe(
          res => {
            this.showSpinner = false;
            const parse = JSON.parse(res);
            if (parse.result === 1) {
              this.showNotification('bottom', 'right', 'success');
              this.callGetrow();
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
      // call web service
      this.dalservice.Insert(usersJson, this.APIController, this.APIRouteForInsert)
        .subscribe(
          res => {
            this.showSpinner = false;
            const parse = JSON.parse(res);
            if (parse.result === 1) {
              this.showNotification('bottom', 'right', 'success');
              this.route.navigate(['/pvorrvrequest/subpvmanuallist/pvmanualdetaildetail', this.param, parse.id]);
            } else {
              this.swalPopUpMsg(parse.data);
            }
          },
          error => {
            this.showSpinner = false;
            const parse = JSON.parse(error);
            this.swalPopUpMsg(parse.data);
          });
    }
  }
  //#endregion  form submit

  //#region button back
  btnBack() {
    this.route.navigate(['/pvorrvrequest/subpvmanuallist/pvmanualdetail', this.param]);
    $('#datatablesPvManualDetail').DataTable().ajax.reload();
  }
  //#endregion  button back

  //#region Lookup GlLink
  btnLookupGlLink() {
    $('#datatableLookupGlLink').DataTable().clear().destroy();
    $('#datatableLookupGlLink').DataTable({
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
        this.dalservice.Getrows(dtParameters, this.APIControllerForJurnalGlLink, this.APIRouteForLookupGlLink).subscribe(resp => {
          const parse = JSON.parse(resp);
          this.lookupgllink = parse.data;
          if (parse.data != null) {
            this.lookupgllink.numberIndex = dtParameters.start;
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

  btnSelectRowGlLink(gl_link_code: String, gl_link_name: string, is_provit_or_cost: string) {
    this.model.gl_link_code = gl_link_code;
    this.model.gl_link_name = gl_link_name;
    this.model.is_provit_or_cost = is_provit_or_cost;
    $('#lookupModalGlLink').modal('hide');
  }
  //#endregion Lookup GlLink

  //#region Lookup Currency
  btnLookupSysCurrency() {
    $('#datatableLookupSysCurrency').DataTable().clear().destroy();
    $('#datatableLookupSysCurrency').DataTable({
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
        this.dalservice.GetrowsSys(dtParameters, this.APIControllerSysCurrency, this.APIRouteForLookup).subscribe(resp => {
          const parse = JSON.parse(resp);
          this.lookupcurrency = parse.data;
          if (parse.data != null) {
            this.lookupcurrency.numberIndex = dtParameters.start;
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
  }

  btnSelectRowSysCurrency(currency_code: String) {
    this.model.orig_currency_code = currency_code;
    this.callGetrowTopRate(this.model.orig_currency_code, this.valDate, true);
    $('#lookupModalSysCurrency').modal('hide');
  }
  //#endregion Lookup Currency

  //#region Branch Lookup
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
          this.lookupbranch = parse.data;
          if (parse.data != null) {
            this.lookupbranch.numberIndex = dtParameters.start;
          }

          callback({
            draw: parse.draw,
            recordsTotal: parse.recordsTotal,
            recordsFiltered: parse.recordsFiltered,
            data: []
          });
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

  btnSelectRowBranch(branch_code: String, branch_name: String) {
    this.model.branch_code = branch_code;
    this.model.branch_name = branch_name;
    $('#lookupModalSysBranch').modal('hide');
  }
  //#endregion lookup branch

  //#region Lookup Division
  btnLookupSysDivision() {
    $('#datatableLookupSysDivision').DataTable().clear().destroy();
    $('#datatableLookupSysDivision').DataTable({
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
        this.dalservice.GetrowsSys(dtParameters, this.APIControllerSysDivision, this.APIRouteForLookup).subscribe(resp => {
          const parse = JSON.parse(resp);
          this.lookupdivision = parse.data;
          if (parse.data != null) {
            this.lookupdivision.numberIndex = dtParameters.start;
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
  }

  btnSelectRowSysDivision(division_code: String, division_name: string) {
    this.model.division_code = division_code;
    this.model.division_name = division_name;
    $('#lookupModalSysDivision').modal('hide');
  }
  btnClearDivision() {
    this.model.division_code = '';
    this.model.division_name = '';
  }
  //#endregion Lookup Division

  //#region Lookup Department
  btnLookupSysDepartment() {
    $('#datatableLookupSysDepartment').DataTable().clear().destroy();
    $('#datatableLookupSysDepartment').DataTable({
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
          'p_division_code': this.model.division_code
        });
        // end param tambahan untuk getrows dynamic
        this.dalservice.GetrowsSys(dtParameters, this.APIControllerSysDepartment, this.APIRouteForLookup).subscribe(resp => {
          const parse = JSON.parse(resp);
          this.lookupdepartment = parse.data;
          if (parse.data != null) {
            this.lookupdepartment.numberIndex = dtParameters.start;
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
  }

  btnSelectRowSysDepartment(department_code: String, department_name: string) {
    this.model.department_code = department_code;
    this.model.department_name = department_name;
    $('#lookupModalSysDepartment').modal('hide');
  }
  btnClearDepartment() {
    this.model.department_code = '';
    this.model.department_name = '';
  }
  //#endregion Lookup Department

  //#region origAmount
  origAmount(event: any) {
    this.orig_amount = event.target.value;
    this.model.base_amount = this.orig_amount * this.exch_rate;
  }
  //#endregion origAmount

  //#region exchRate
  exchRate(event: any) {
    this.exch_rate = event.target.value;
    this.model.base_amount = this.exch_rate * this.orig_amount;
  }
  //#endregion exchRate
}


