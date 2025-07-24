import { Component, OnInit, ElementRef, ViewChild, AfterViewInit } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { NgForm } from '@angular/forms';
import swal from 'sweetalert2';
import { DataTableDirective } from 'angular-datatables';
import { BaseComponent } from '../../../../../base.component';
import { DALService } from '../../../../../DALservice.service';
import { t } from '@angular/core/src/render3';

@Component({
  moduleId: module.id,
  selector: 'app-root',
  templateUrl: './objectinfodepositallocation.component.html'
})

export class ObjectinfodepositallocationComponent extends BaseComponent implements OnInit {
  // get param from url
  param = this.getRouteparam.snapshot.paramMap.get('id');

  // variable
  public NumberOnlyPattern = this._numberonlyformat;
  public listallocationdetail: any = [];
  public allocationdetailData: any = [];
  public listcashiertransactiondetailData: any = [];
  public listallocationdetailData: any = [];
  public isReadOnly: Boolean = false;
  public isReadOnlyList: Boolean = false;
  public isButton: Boolean = false;
  public isrowCount: Boolean = false;
  public isSave: Boolean = false;
  public isCurrency: Boolean = false;
  public isLabel: Boolean = true;
  public isBreak: Boolean = false;
  public is_received_request: Boolean;
  public lookupbranch: any = [];
  public lookupagreement: any = [];
  public lookupdeposit: any = [];
  public lookupcashierreceivedrequest: any = [];
  public allocation_orig_amount: any = [];
  public allocation_exch_rate: any = [];
  public allocation_base_amount: any = [];
  public total_allocated: any = [];
  public lookupgllink: any = [];
  public agreement_exch_rate: any;
  private valDate: any;
  private dataTamp: any = [];
  private setStyle: any = [];
  private RoleAccessCode = 'R00003260000327A';

  // API Controller
  private APIController: String = 'DepositAllocation';
  private APIControllerDepositAllocationDetail: String = 'DepositAllocationDetail';
  private APIControllerSysCurrencyRate: String = 'SysCurrencyRate';


  // API Function
  private APIRouteForGetRows: String = 'GetRows';
  private APIRouteForGetRow: String = 'GetRow';
  private APIRouteForGetRowForTopRate: String = 'ExecSpTopRate';

  // form 2 way binding
  model: any = {};

  // checklist
  public selectedAllTable: any;
  public selectedAllLookup: any;

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
    private _elementRef: ElementRef
  ) { super(); }

  ngOnInit() {
    this.Delimiter(this._elementRef);
    this.callGetRole(this.userId, this._elementRef, this.dalservice, this.RoleAccessCode, this.route);

    if (this.param != null) {
      // this.isReadOnly = true;

      // call web service
      this.callGetrow();
      this.loadData();
    } else {
      // this.callGetrowByUser();
      this.model.allocation_exch_rate = 1;
      this.model.allocation_orig_amount = 0;
      this.model.allocation_base_amount = 0
      this.allocation_orig_amount = 0;
      this.allocation_exch_rate = 1;
      this.allocation_base_amount = 0;
      this.model.allocation_status = 'HOLD';
      this.model.is_received_request = '0';
      this.showSpinner = false;
      this.is_received_request = false;
    }
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
      lengthChange: false, // hide lengthmenu
      paging: true,
      'lengthMenu': [
        [500],
        [500]
      ],
      ajax: (dtParameters: any, callback) => {
        // param tambahan untuk getrows dynamic
        dtParameters.paramTamp = [];
        dtParameters.paramTamp.push({
          'p_deposit_allocation_code': this.param
        });
        // end param tambahan untuk getrows dynamic
        this.dalservice.Getrows(dtParameters, this.APIControllerDepositAllocationDetail, this.APIRouteForGetRows).subscribe(resp => {
          const parse = JSON.parse(resp)

          for (let i = 0; i < parse.data.length; i++) {
            if (parse.data[i].is_paid === '1') {
              parse.data[i].is_paid = true;
            } else {
              parse.data[i].is_paid = false;
            }
            if (parse.data[i].is_module === '1') {
              parse.data[i].is_module = true;
              if (parse.data[i].is_partial === '1') {
                parse.data[i].is_partial = false;
                parse.data[i].is_module = false;
              } else {
                parse.data[i].is_partial = true;
              }
            } else {
              parse.data[i].is_module = false;
              parse.data[i].is_partial = false;
            }
          }

          this.listallocationdetail = parse.data;
          if (parse.data != null) {
            this.listallocationdetail.numberIndex = dtParameters.start;
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
          this.valDate = parsedata.allocation_value_date;
          const ngbGetrow = this.getrowNgb(parse.data[0]);

          this.isReadOnly = true;

          if (parsedata.allocation_status !== 'HOLD') {
            this.isButton = true;
          } else {
            this.isButton = false;
          }

          if (this.isSave) {
            if (this.allocation_orig_amount === parsedata.allocation_orig_amount) {
              this.isLabel = true;
            } else {
              this.isLabel = false;
            }
          }

          if (parsedata.rows_count !== 0) {
            this.isrowCount = true;
          } else {
            this.isrowCount = false;
          }

          // checkbox
          if (parsedata.is_received_request === '1') {
            this.is_received_request = true;
            // parsedata.is_received_request = true;
          } else {
            this.is_received_request = false;
            // parsedata.is_received_request = false;
          }
          // end checkbox

          this.allocation_orig_amount = parsedata.allocation_orig_amount;
          this.allocation_exch_rate = parsedata.allocation_exch_rate;
          this.allocation_base_amount = parsedata.allocation_base_amount;

          // mapper dbtoui
          Object.assign(this.model, ngbGetrow);
          // end mapper dbtoui

          this.callGetrowTopRate(this.model.allocation_currency_code, this.valDate, false, false)
          this.callGetrowTopRate(this.model.currency_code, this.valDate, false, true)
          this.showSpinner = false;
        },
        error => {
          console.log('There was an error while Retrieving Data(API) !!!' + error);
        });
  }
  //#endregion  getrow data

  //#region  getrow data rate
  callGetrowTopRate(currency: any, date: any, change: Boolean, agreement: Boolean) {
    // param tambahan untuk getrow dynamic
    this.dataTamp = [this.JSToNumberFloats({
      'p_currency_code': currency,
      'p_date': date,
      'action': 'getResponse'
    })];
    // end param tambahan untuk getrow dynamic
    this.dalservice.ExecSpSys(this.dataTamp, this.APIControllerSysCurrencyRate, this.APIRouteForGetRowForTopRate)
      .subscribe(
        res => {
          const parse = JSON.parse(res);
          const parsedata = parse.data[0];

          if (agreement) {
            this.agreement_exch_rate = parsedata.exch_rate
          } else {

            if (parsedata.code === currency) {
              this.isCurrency = true;
            } else {
              this.isCurrency = false;
            }

            if (change) {
              this.model.allocation_exch_rate = parsedata.exch_rate
              // this.exch_rate = parsedata.exch_rate
              // this.model.allocation_orig_amount = (this.model.allocation_base_amount / parsedata.exch_rate);
              if (this.param == null) {
                this.model.allocation_base_amount = (this.model.allocation_orig_amount * parsedata.exch_rate);
              } else {
                this.model.allocation_orig_amount = (this.model.allocation_base_amount / parsedata.exch_rate);
              }
            }
          }
        },
        error => {
          console.log('There was an error while Retrieving Data(API) !!!' + error);
        });
  }
  //#endregion  getrow data rate

}


