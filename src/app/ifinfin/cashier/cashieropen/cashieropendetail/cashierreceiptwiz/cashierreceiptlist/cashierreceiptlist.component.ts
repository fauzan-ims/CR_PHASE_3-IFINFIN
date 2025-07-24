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
  templateUrl: './cashierreceiptlist.component.html',
})

export class CashierreceiptlistComponent extends BaseComponent implements OnInit {
  // get param from url
  param = this.getRouteparam.snapshot.paramMap.get('id');

  // variable
  public NumberOnlyPattern = this._numberonlyformat;
  public listcashierreceipt: any = [];
  public isReadOnly: Boolean = false;
  public isBreak: Boolean = false;
  public lookupreceiptmain: any = [];
  public status: String;
  public branch: String;
  public dataTamp: any = [];
  private RoleAccessCode = 'R00003160000317A';


  private APIController: String = 'CashierReceiptAllocated';
  private APIControllerCashierMain: String = 'CashierMain';
  private APIControllerReceiptMain: String = 'ReceiptMain';
  private APIRouteForLookupReceiptMain: String = 'GetRowsLookupForCashierReceiptAllocated';
  private APIRouteForGetRow: String = 'GetRow';
  private APIRouteForGetRows: String = 'GetRows';
  private APIRouteForInsert: String = 'Insert';
  private APIRouteForDelete: String = 'Delete';

  // form 2 way binding
  model: any = {};

  // spinner
  showSpinner: Boolean = false;
  // end

  // checklist
  public selectedAllTable: any;
  public selectedAllLookup: any;
  private checkedList: any = [];
  private checkedLookup: any = [];

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
    this.callGetRole(this.userId, this._elementRef, this.dalservice, this.RoleAccessCode, this.route);

    // call web service
    this.loadData();
    this.callGetrow();
  }

  //#region  getrow data
  callGetrow() {
    // param tambahan untuk getrow dynamic
    this.dataTamp = [{
      'p_code': this.param,
    }];
    // end param tambahan untuk getrow dynamic

    this.dalservice.Getrow(this.dataTamp, this.APIControllerCashierMain, this.APIRouteForGetRow)
      .subscribe(
        res => {
          const parse = JSON.parse(res);
          const parsedata = parse.data[0];

          this.status = parsedata.cashier_status
          this.branch = parsedata.branch_code
          // mapper dbtoui
          Object.assign(this.model, parsedata);
          // end mapper dbtoui
          this.showSpinner = false;
        });
  }
  //#endregion  getrow data

  //#region load all data
  loadData() {
    this.dtOptions = {
      'pagingType': 'first_last_numbers',
      'pageLength': 10,
      'processing': true,
      'serverSide': true,
      responsive: true,
      lengthChange: false, // hide lengthmenu
      searching: true, // jika ingin hilangin search box nya maka false
      ajax: (dtParameters: any, callback) => {
        // param tambahan untuk getrows dynamic
        dtParameters.paramTamp = [];
        dtParameters.paramTamp.push({
          'p_cashier_code': this.param
        });
        // end param tambahan untuk getrows dynamic
        this.dalservice.Getrows(dtParameters, this.APIController, this.APIRouteForGetRows).subscribe(resp => {
          const parse = JSON.parse(resp)
          this.listcashierreceipt = parse.data;
          if (parse.data != null) {
            this.listcashierreceipt.numberIndex = dtParameters.start;
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
      columnDefs: [{ orderable: false, width: '5%', targets: [0, 1] }], // for disabled coloumn
      language: {
        search: '_INPUT_',
        searchPlaceholder: 'Search records',
        infoEmpty: '<p style="color:red;" > No Data Available !</p> '
      },
      searchDelay: 800 // pake ini supaya gak bug search
    }
  }
  //#endregion load all data

  //#region receipt main Lookup
  btnLookupReceiptMain() {
    $('#datatableLookupReceiptMain').DataTable().clear().destroy();
    $('#datatableLookupReceiptMain').DataTable({
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
          'p_cashier_code': this.param,
          'p_branch_code': this.branch
        });
        // end param tambahan untuk getrows dynamic
        this.dalservice.Getrows(dtParameters, this.APIControllerReceiptMain, this.APIRouteForLookupReceiptMain).subscribe(resp => {
          const parse = JSON.parse(resp);
          this.lookupreceiptmain = parse.data;
          if (parse.data != null) {
            this.lookupreceiptmain.numberIndex = dtParameters.start;
          }

          // if use checkAll use this
          $('#checkallLookup').prop('checked', false);
          // end checkall

          callback({
            draw: parse.draw,
            recordsTotal: parse.recordsTotal,
            recordsFiltered: parse.recordsFiltered,
            data: []
          });
        }, err => console.log('There was an error while retrieving Data(API) !!!' + err));
      },
      columnDefs: [{ orderable: false, width: '5%', targets: [0, 1] }], // for disabled coloumn
      language: {
        search: '_INPUT_',
        searchPlaceholder: 'Search records',
        infoEmpty: '<p style="color:red;" > No Data Available !</p> '
      },
      searchDelay: 800 // pake ini supaya gak bug search
    });
  }
  //#endregion lookup reason

  //#region checkbox all table
  btnSelectAllLookup() {
    this.isBreak = false;
    this.checkedLookup = [];
    for (let i = 0; i < this.lookupreceiptmain.length; i++) {
      if (this.lookupreceiptmain[i].selectedLookup) {
        this.checkedLookup.push(this.lookupreceiptmain[i].code);
      }
    }

    // jika tidak di checklist
    if (this.checkedLookup.length === 0) {
      swal({
        title: this._listdialogconf,
        buttonsStyling: false,
        confirmButtonClass: 'btn btn-danger'
      }).catch(swal.noop)
      return
    } else {
      this.showSpinner = true;
    }



    swal({
      title: 'Are you sure?',
      type: 'warning',
      showCancelButton: true,
      confirmButtonClass: 'btn btn-success',
      cancelButtonClass: 'btn btn-danger',
      confirmButtonText: this._deleteconf,
      buttonsStyling: false
    }).then((result) => {
      this.showSpinner = true;
      if (result.value) {
        this.dataTamp = [];
        for (let J = 0; J < this.checkedLookup.length; J++) {
          const codeData = this.checkedLookup[J];
          // param tambahan untuk getrow dynamic
          this.dataTamp = [{
            'p_cashier_code': this.param,
            'p_receipt_code': codeData
          }];
          // end param tambahan untuk getrow dynamic

          this.dalservice.Insert(this.dataTamp, this.APIController, this.APIRouteForInsert)
            .subscribe(
              res => {
                const parse = JSON.parse(res);
                if (parse.result === 1) {
                  if (J + 1 === this.checkedLookup.length) {
                    this.showSpinner = false;
                    this.showNotification('bottom', 'right', 'success');
                    $('#datatableCashierReceiptList').DataTable().ajax.reload();
                    $('#datatableLookupReceiptMain').DataTable().ajax.reload();
                  }
                } else {
                  this.isBreak = true;
                  this.showSpinner = false;
                  $('#datatableCashierReceiptList').DataTable().ajax.reload();
                  $('#datatableLookupReceiptMain').DataTable().ajax.reload();
                  this.swalPopUpMsg(parse.data);
                }
              },
              error => {
                this.showSpinner = false;
                this.isBreak = true;
                const parse = JSON.parse(error);
                this.swalPopUpMsg(parse.data);
              });
          if (this.isBreak) {
            break;
          }
        }

      } else {
        this.showSpinner = false;
      }
    });
  }

  selectAllLookup() {
    for (let i = 0; i < this.lookupreceiptmain.length; i++) {
      this.lookupreceiptmain[i].selectedLookup = this.selectedAllLookup;
    }
  }

  checkIfAllLookup() {
    this.selectedAllLookup = this.lookupreceiptmain.every(function (item: any) {
      return item.selectedLookup === true;
    })
  }
  //#endregion checkbox all table

  //#region checkbox all table
  btnDeleteAll() {
    this.isBreak = false;
    this.checkedList = [];
    for (let i = 0; i < this.listcashierreceipt.length; i++) {
      if (this.listcashierreceipt[i].selectedTable) {
        if (this.listcashierreceipt[i].receipt_status !== 'NEW') {
          swal({
            title: 'Warning',
            text: 'Receipt already Used. Please select Receipt that status is NEW',
            buttonsStyling: false,
            confirmButtonClass: 'btn btn-danger',
            type: 'warning'
          }).catch(swal.noop)
          return;
        }
        this.checkedList.push(this.listcashierreceipt[i].id);
      }
    }

    // jika tidak di checklist
    if (this.checkedList.length === 0) {
      swal({
        title: this._listdialogconf,
        buttonsStyling: false,
        confirmButtonClass: 'btn btn-danger'
      }).catch(swal.noop)
      return
    }

    swal({
      title: 'Are you sure?',
      type: 'warning',
      showCancelButton: true,
      confirmButtonClass: 'btn btn-success',
      cancelButtonClass: 'btn btn-danger',
      confirmButtonText: this._deleteconf,
      buttonsStyling: false
    }).then((result) => {
      this.showSpinner = true;
      if (result.value) {

        this.dataTamp = [];
        for (let J = 0; J < this.checkedList.length; J++) {
          const codeData = this.checkedList[J];
          // param tambahan untuk getrow dynamic
          this.dataTamp = [{
            'p_id': codeData
          }];
          // end param tambahan untuk getrow dynamic
          this.dalservice.Delete(this.dataTamp, this.APIController, this.APIRouteForDelete)
            .subscribe(
              res => {
                const parse = JSON.parse(res);
                if (parse.result === 1) {
                  if (J + 1 === this.checkedList.length) {
                    this.showSpinner = false;
                    this.showNotification('bottom', 'right', 'success');
                    $('#datatableCashierReceiptList').DataTable().ajax.reload();
                  }
                } else {
                  this.isBreak = true;
                  this.showSpinner = false;
                  $('#datatableCashierReceiptList').DataTable().ajax.reload();
                  this.swalPopUpMsg(parse.data);
                }
              },
              error => {
                this.isBreak = true;
                this.showSpinner = false;
                const parse = JSON.parse(error);
                this.swalPopUpMsg(parse.data);
              });
          if (this.isBreak) {
            break;
          }
        }
      } else {
        this.showSpinner = false;
      }
    });
  }

  selectAllTable() {
    for (let i = 0; i < this.listcashierreceipt.length; i++) {
      this.listcashierreceipt[i].selectedTable = this.selectedAllTable;
    }
  }

  checkIfAllTableSelected() {
    this.selectedAllTable = this.listcashierreceipt.every(function (item: any) {
      return item.selectedTable === true;
    })
  }
  //#endregion checkbox all table
}

