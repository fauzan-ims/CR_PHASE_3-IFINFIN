import { Component, OnInit, ElementRef, ViewChild, AfterViewInit } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { NgForm } from '@angular/forms';
import swal from 'sweetalert2';
import { DataTableDirective } from 'angular-datatables';
import { BaseComponent } from '../../../../../base.component';
import { DALService } from '../../../../../DALservice.service';
import { DatePipe } from '@angular/common';
import { ParseSourceFile } from '@angular/compiler';

@Component({
  moduleId: module.id,
  selector: 'app-root',
  templateUrl: './inquirycashierdetail.component.html'
})

export class InquirycashierdetailComponent extends BaseComponent implements OnInit {
  // get param from url
  param = this.getRouteparam.snapshot.paramMap.get('id');

  // variable
  public NumberOnlyPattern = this._numberonlyformat;
  public listinquirycashierdetail: any = [];
  public listinquirycashierdetailData: any = [];
  public inquirycashierdetailData: any = [];
  public isReadOnly: Boolean = false;
  public isButton: Boolean = false;
  public isrowCount: Boolean = false;
  public is_received_request: Boolean;
  public lookupbranch: any = [];
  public lookupcashierreceivedrequest: any = [];
  public lookupagreement: any = [];
  public lookupcashier: any = [];
  public lookupJurnalGlLink: any = [];
  public lookupbank: any = [];
  public lookuppdccode: any = [];
  public lookupreceiptmain: any = [];
  public cashier_orig_amount: any = [];
  public cashier_exch_rate: any = [];
  private rolecode: any = [];
  private dataRoleTamp: any = [];
  private dataTamp: any = [];
  private RoleAccessCode = 'R00003230000000A';

  // API Controller
  private APIController: String = 'CashierTransaction';
  private APIControllerCashierTransactionDetail: String = 'CashierTransactionDetail';

  // API Function
  private APIRouteForGetRows: String = 'GetRows';
  private APIRouteForGetRow: String = 'GetRow';
  private APIRouteForGetRole: String = 'ExecSpForGetRole';

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
    private _elementRef: ElementRef, private datePipe: DatePipe
  ) { super(); }

  ngOnInit() {
    this.callGetRole(this.userId, this._elementRef, this.dalservice, this.RoleAccessCode, this.route);

    this.Delimiter(this._elementRef);
    if (this.param != null) {
      this.isReadOnly = true;

      // call web service
      this.loadData();
      this.callGetrow();
    } else {
    }
  }

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
          'p_cashier_transaction_code': this.param,
          'p_is_paid': '1'
        });
        // end param tambahan untuk getrows dynamic
        this.dalservice.Getrows(dtParameters, this.APIControllerCashierTransactionDetail, this.APIRouteForGetRows).subscribe(resp => {
          const parse = JSON.parse(resp)

          for (let i = 0; i < parse.data.length; i++) {
            if (parse.data[i].is_paid === '1') {
              parse.data[i].is_paid = true;
            } else {
              parse.data[i].is_paid = false;
            }
            if (parse.data[i].is_module === '1') {
              parse.data[i].is_module = true;
            } else {
              parse.data[i].is_module = false;
            }
          }
          this.listinquirycashierdetail = parse.data;
          if (parse.data != null) {
            this.listinquirycashierdetail.numberIndex = dtParameters.start;
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
      columnDefs: [{ orderable: false, width: '5%', targets: [0, 1, 8] }], // for disabled coloumn
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
          const parsedata = this.getrowNgb(parse.data[0]);

          this.cashier_orig_amount = parsedata.cashier_orig_amount;
          this.cashier_exch_rate = parsedata.cashier_exch_rate;

          // mapper dbtoui
          Object.assign(this.model, parsedata);
          // end mapper dbtoui

          this.showSpinner = false;
        },
        error => {
          console.log('There was an error while Retrieving Data(API) !!!' + error);
        });
  }
  //#endregion  getrow data

  //#region button back
  btnBack() {
    this.route.navigate(['/cashier/subinquirycashierlist']);
    $('#datatableInquiryCashierList').DataTable().ajax.reload();
  }
  //#endregion  button back
}


