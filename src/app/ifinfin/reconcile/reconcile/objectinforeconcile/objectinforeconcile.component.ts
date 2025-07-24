import { Component, OnInit, ElementRef, ViewChild, AfterViewInit } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { NgForm } from '@angular/forms';
import swal from 'sweetalert2';
import { DataTableDirective } from 'angular-datatables';
import { BaseComponent } from '../../../../../base.component';
import { DALService } from '../../../../../DALservice.service';
import { from } from 'rxjs';


@Component({
  moduleId: module.id,
  selector: 'app-root',
  templateUrl: './objectinforeconcile.component.html'
})

export class ObjectinforeconcileComponent extends BaseComponent implements OnInit {
  // get param from url
  param = this.getRouteparam.snapshot.paramMap.get('id');

  // variable
  public NumberOnlyPattern = this._numberonlyformat;
  public reconcilemaindetailData: any = [];
  public listreconciledetail: any = [];
  public listreconciledetailData: any = [];
  public listreconciledetails: any = [];
  public isReadOnly: Boolean = false;
  public isButton: Boolean = false;
  public lookupbranch: any = [];
  public lookupbank: any = [];
  public lookupsource: any = [];
  public fromdate: any = [];
  public todate: any = [];
  public date = new Date();
  public tempFile: any;
  public tampHidden: Boolean = true;
  private setStyle: any = [];
  private dataTamp: any = [];

  // API Controller
  private APIController: String = 'ReconcileMain';
  private APIControllerForReconcileTransaction: String = 'ReconcileTransaction';

  // API Function
  private APIRouteForGetRowsForSystem: String = 'GetRowsForSystem';
  private APIRouteForGetRowsForUpload: String = 'GetRowsForUpload';
  private APIRouteForGetRow: String = 'GetRow';
  private RoleAccessCode = 'R00003400000341A';


  // form 2 way binding
  model: any = {};

  // spinner
  showSpinner: Boolean = true;
  // end

  // datatable
  @ViewChild(DataTableDirective)
  dtElement: DataTableDirective;
  dtOptions: DataTables.Settings = {};
  dtOptionss: DataTables.Settings = {};

  constructor(private dalservice: DALService,
    public getRouteparam: ActivatedRoute,
    public route: Router,
    private _elementRef: ElementRef
  ) { super(); }

  ngOnInit() {
    this.callGetRole(this.userId, this._elementRef, this.dalservice, this.RoleAccessCode, this.route);
    this.Delimiter(this._elementRef);
      this.isReadOnly = true;
      // call web service
      this.loadData();
      this.loadDatas();
      this.callGetrow();
      this.showSpinner = false;
  }

  //#region  set datepicker
  getStyles(isTrue: Boolean) {
    if (isTrue) {
      this.setStyle = {
        'pointer-events': 'none',
      }
    } else {
      this.setStyle = {
        'pointer-events': 'pointer',
      }
    }

    return this.setStyle;
  }
  //#endregion  set datepicker

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
          'p_reconcile_code': this.param,
        });
        // end param tambahan untuk getrows dynamic
        this.dalservice.Getrows(dtParameters, this.APIControllerForReconcileTransaction, this.APIRouteForGetRowsForSystem).subscribe(resp => {
          const parse = JSON.parse(resp)
          for (let i = 0; i < parse.data.length; i++) {
            if (parse.data[i].is_reconcile === '1') {
              parse.data[i].is_reconcile = true;
            } else {
              parse.data[i].is_reconcile = false;
            }
          }
          this.listreconciledetail = parse.data;
          callback({
            draw: parse.draw,
            recordsTotal: parse.recordsTotal,
            recordsFiltered: parse.recordsFiltered,
            data: []
          });
        }, err => console.log('There was an error while retrieving Data(API) !!!' + err));
      },
      columnDefs: [{ orderable: false, width: '10%', targets: [1] }], // for disabled coloumn
      language: {
        search: '_INPUT_',
        searchPlaceholder: 'Search records',
        infoEmpty: '<p style="color:red;" > No Data Available !</p> '
      },
      searchDelay: 800 // pake ini supaya gak bug search
    }
  }
  //#endregion load all data

  //#region load all data
  loadDatas() {
    this.dtOptionss = {
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
          'p_reconcile_code': this.param,
        });
        // end param tambahan untuk getrows dynamic
        this.dalservice.Getrows(dtParameters, this.APIControllerForReconcileTransaction, this.APIRouteForGetRowsForUpload).subscribe(resp => {
          const parse = JSON.parse(resp)
          for (let i = 0; i < parse.data.length; i++) {
            if (parse.data[i].is_reconcile === '1') {
              parse.data[i].is_reconcile = true;
            } else {
              parse.data[i].is_reconcile = false;
            }
          }
          this.listreconciledetails = parse.data;
          callback({
            draw: parse.draw,
            recordsTotal: parse.recordsTotal,
            recordsFiltered: parse.recordsFiltered,
            data: []
          });
        }, err => console.log('There was an error while retrieving Data(API) !!!' + err));
      },
      columnDefs: [{ orderable: false, width: '10%', targets: [1] }], // for disabled coloumn
      language: {
        search: '_INPUT_',
        searchPlaceholder: 'Search records',
        infoEmpty: '<p style="color:red;" > No Data Available !</p> '
      },
      searchDelay: 800 // pake ini supaya gak bug search
    }
  }
  //#endregion load all data

  //#region  getrow data
  callGetrow() {
    // param tambahan untuk getrow dynamic
    this.dataTamp = [{
      'p_code': this.param,
    }];
    // end param tambahan untuk getrow dynamic

    this.dalservice.Getrow(this.dataTamp, this.APIController, this.APIRouteForGetRow)
      .subscribe(
        res => {
          const parse = JSON.parse(res);
          const parsedata = parse.data[0];
          this.fromdate = parsedata.reconcile_from_value_date;
          this.todate = parsedata.reconcile_to_value_date;
          this.fromdate = this.fromdate.substring(0, 10);
          this.todate = this.todate.substring(0, 10);
          const ngbGetrow = this.getrowNgb(parse.data[0]);

          if (parsedata.paths !== '') {
            this.tampHidden = true;
          } else {
            this.tampHidden = false;
          }

          if (parsedata.reconcile_status !== 'HOLD') {
            this.isButton = true;
          } else {
            this.isButton = false;
          }

          // mapper dbtoui
          Object.assign(this.model, ngbGetrow);
          // end mapper dbtoui

          this.showSpinner = false;
        },
        error => {
          console.log('There was an error while Retrieving Data(API) !!!' + error);
        });
  }
  //#endregion  getrow data

}