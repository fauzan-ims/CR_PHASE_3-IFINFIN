import { Component, OnInit, ElementRef } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { NgForm } from '@angular/forms';
import swal from 'sweetalert2';
import { BaseComponent } from '../../../../../base.component';
import { DALService } from '../../../../../DALservice.service';

@Component({
  moduleId: module.id,
  selector: 'app-root',
  templateUrl: './cashierprioritydetail.component.html'
})

export class CashierprioritydetailComponent extends BaseComponent implements OnInit {
  // get param from url
  param = this.getRouteparam.snapshot.paramMap.get('id');

  // variable
  public isReadOnly: Boolean = false;
  public lookuptransaction: any = [];
  private parametermastercashierprioritydetail: any = [];
  private dataTamp: any = [];
  public dataTampPush: any = [];
  private listmastercashierprioritydetail: any = [];
  private APIController: String = 'MasterCashierPriority';
  private APIControllerMasterTransaction: String = 'MasterTransaction';
  private APIControllerMasterCashierPriorityDetail: String = 'MasterCashierPriorityDetail';
  private APIRouteForGetRow: String = 'Getrow';
  private APIRouteForGetRows: String = 'Getrows';
  private APIRouteForInsert: String = 'Insert';
  private APIRouteForUpdate: String = 'Update';
  private APIRouteForDelete: String = 'Delete';
  private APIRouteForLookupMasterTransaction: String = 'GetRowsLookupForMasterCashierPriorityDetail';
  private RoleAccessCode = 'R00003010000302A';


  // form 2 way binding
  model: any = {};

  // checklist
  public selectedAllTable: any;
  public selectedAllLookup: any;
  private checkedList: any = [];
  private checkedLookup: any = [];


  // spinner
  showSpinner: Boolean = true;
  // end

  // datatable
  dtOptions: DataTables.Settings = {};

  constructor(private dalservice: DALService,
    public getRouteparam: ActivatedRoute,
    public route: Router,
    private _elementRef: ElementRef
  ) { super(); }

  ngOnInit() {
    this.callGetRole(this.userId, this._elementRef, this.dalservice, this.RoleAccessCode, this.route);

    if (this.param != null) {
      this.isReadOnly = true;

      // call web service
      this.callGetrow();
      this.loadData();
    } else {
      this.showSpinner = false;
    }
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
          'p_cashier_priority_code': this.param
        });
        // end param tambahan untuk getrows dynamic
        // tslint:disable-next-line:max-line-length
        this.dalservice.Getrows(dtParameters, this.APIControllerMasterCashierPriorityDetail, this.APIRouteForGetRows).subscribe(resp => {
          const parse = JSON.parse(resp)
          for (let i = 0; i < parse.data.length; i++) {
            if (parse.data[i].is_partial === '1') {
              parse.data[i].is_partial = true;
            } else {
              parse.data[i].is_partial = false;
            }
          }
          this.listmastercashierprioritydetail = parse.data;
          if (parse.data != null) {
            this.listmastercashierprioritydetail.numberIndex = dtParameters.start;
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
      order: [[2, 'asc']],
      language: {
        search: '_INPUT_',
        searchPlaceholder: 'Search records',
        infoEmpty: '<p style="color:red;" > No Data Available !</p> '
      },
      searchDelay: 800 // pake ini supaya gak bug search
    }
  }
  //#endregion load all data

  //#region getrow data
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

          // checkbox is_default
          if (parsedata.is_default === '1') {
            parsedata.is_default = true;
          } else {
            parsedata.is_default = false;
          }
          // end checkbox is_default

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

  //#region  form submit
  onFormSubmit(parametermastercashierprioritydetailForm: NgForm, isValid: boolean) {

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

    this.parametermastercashierprioritydetail = parametermastercashierprioritydetailForm;
    if (this.parametermastercashierprioritydetail.p_is_default == null) {
      this.parametermastercashierprioritydetail.p_is_default = false;
    }
    const usersJson: any[] = Array.of(this.parametermastercashierprioritydetail);
    if (this.param != null) {
      // call web service
      this.dalservice.Update(usersJson, this.APIController, this.APIRouteForUpdate)
        .subscribe(
          res => {
            this.showSpinner = false;
            const parse = JSON.parse(res);
            if (parse.result === 1) {
              this.showNotification('bottom', 'right', 'success');
              this.callGetrow()
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
              this.route.navigate(['/setting/subcashierprioritylist/cashierprioritydetail', parse.code]);
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
  //#endregion form submit

  //#region orderKey
  orderNo(event, id, index) {

    var getIsParsial = $('[name="p_is_partial"]')
      .map(function () { return $(this).prop('checked'); }).get();
    // param tambahan untuk update dynamic
    this.dataTamp = [{
      'p_id': id,
      'p_cashier_priority_code': this.param,
      'p_order_no': event.target.value,
      'p_is_partial': getIsParsial[index]
    }];
    // end param tambahan untuk update dynamic

    // call web service
    this.dalservice.Update(this.dataTamp, this.APIControllerMasterCashierPriorityDetail, this.APIRouteForUpdate)
      .subscribe(
        res => {
          this.showSpinner = false;
          const parse = JSON.parse(res);
          if (parse.result === 1) {
            this.showNotification('bottom', 'right', 'success');
            $('#datatableCashierPriorityDetail').DataTable().ajax.reload();
          } else {
            this.swalPopUpMsg(parse.data);
          }
        },
        error => {
          this.showSpinner = false;
          const parse = JSON.parse(error);
          this.swalPopUpMsg(parse.data)
        });
  }
  //#endregion orderKey

  //#region orderKey
  OnParsial(id, index) {
    var getIsParsial = $('[name="p_is_partial"]')
      .map(function () { return $(this).prop('checked'); }).get();

    var getOrderNo = $('[name="p_order_no"]')
      .map(function () { return $(this).val(); }).get();

    // param tambahan untuk update dynamic
    this.dataTamp = [{
      'p_id': id,
      'p_cashier_priority_code': this.param,
      'p_order_no': getOrderNo[index],
      'p_is_partial': getIsParsial[index]
    }];
    // end param tambahan untuk update dynamic

    // call web service
    this.dalservice.Update(this.dataTamp, this.APIControllerMasterCashierPriorityDetail, this.APIRouteForUpdate)
      .subscribe(
        res => {
          this.showSpinner = false;
          const parse = JSON.parse(res);
          if (parse.result === 1) {
            this.showNotification('bottom', 'right', 'success');
            $('#datatableCashierPriorityDetail').DataTable().ajax.reload();
          } else {
            this.swalPopUpMsg(parse.data);
          }
        },
        error => {
          this.showSpinner = false;
          const parse = JSON.parse(error);
          this.swalPopUpMsg(parse.data)
        });
  }
  //#endregion orderKey

  //#region button back
  btnBack() {
    this.route.navigate(['/setting/subcashierprioritylist']);
    $('#datatableCashierPriorityList').DataTable().ajax.reload();
  }
  //#endregion button back

  //#region checkbox all table
  btnDeleteAll() {
    this.checkedList = [];
    for (let i = 0; i < this.listmastercashierprioritydetail.length; i++) {
      if (this.listmastercashierprioritydetail[i].selected) {
        this.checkedList.push(this.listmastercashierprioritydetail[i].id);
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
    this.dataTampPush = [];
    for (let J = 0; J < this.checkedList.length; J++) {
      // param tambahan untuk getrow dynamic
      this.dataTampPush.push({
        'p_id': this.checkedList[J]
      });
      // end param tambahan untuk getrow dynamic
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
        this.dalservice.Delete(this.dataTampPush, this.APIControllerMasterCashierPriorityDetail, this.APIRouteForDelete)
          .subscribe(
            res => {
              this.showSpinner = false;
              const parse = JSON.parse(res);
              if (parse.result === 1) {
                $('#datatableCashierPriorityDetail').DataTable().ajax.reload();
                this.showNotification('bottom', 'right', 'success');
              } else {
                this.swalPopUpMsg(parse.data)
              }
            },
            error => {
              this.showSpinner = false;
              const parse = JSON.parse(error);
              this.swalPopUpMsg(parse.data)
            });
      } else {
        this.showSpinner = false;
      }
    });
  }

  selectAllTable() {
    for (let i = 0; i < this.listmastercashierprioritydetail.length; i++) {
      this.listmastercashierprioritydetail[i].selected = this.selectedAllTable;
    }
  }

  checkIfAllTableSelected() {
    this.selectedAllTable = this.listmastercashierprioritydetail.every(function (item: any) {
      return item.selected === true;
    })
  }
  //#endregion checkbox all table


  //#region lookup Transaction
  btnLookupTransaction() {
    $('#datatableLookupTransaction').DataTable().clear().destroy();
    $('#datatableLookupTransaction').DataTable({
      'pagingType': 'full_numbers',
      'processing': true,
      'serverSide': true,
      responsive: true,
      lengthChange: false, // hide lengthmenu
      searching: true, // ini untuk hilangin search box nya
      ajax: (dtParameters: any, callback) => {

        // param tambahan untuk getrows dynamic
        dtParameters.paramTamp = [];
        dtParameters.paramTamp.push({
          'p_cashier_priority_code': this.param
        });
        // end param tambahan untuk getrows dynamic

        this.dalservice.Getrows(dtParameters, this.APIControllerMasterTransaction, this.APIRouteForLookupMasterTransaction).subscribe(resp => {
          const parse = JSON.parse(resp);

          // if use checkAll use this
          $('#checkallLookup').prop('checked', false);
          // end checkall

          this.lookuptransaction = parse.data;
          if (parse.data != null) {
            this.lookuptransaction.numberIndex = dtParameters.start;
          }

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
  //#endregion lookup Transaction

  //#region checkbox all lookup
  btnSelectAllLookup() {
    this.checkedLookup = [];
    for (let i = 0; i < this.lookuptransaction.length; i++) {
      if (this.lookuptransaction[i].selectedLookup) {
        this.checkedLookup.push(this.lookuptransaction[i].code);
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
    }
    this.dataTampPush = [];
    for (let J = 0; J < this.checkedLookup.length; J++) {
      // param tambahan untuk getrow dynamic
      this.dataTampPush.push({
        'p_cashier_priority_code': this.param,
        'p_transaction_code': this.checkedLookup[J],
        'p_order_no': 0
      });
      // end param tambahan untuk getrow dynamic
    }

    this.showSpinner = true;
    this.dalservice.Insert(this.dataTampPush, this.APIControllerMasterCashierPriorityDetail, this.APIRouteForInsert)
      .subscribe(
        res => {
          this.showSpinner = false;
          const parse = JSON.parse(res);
          if (parse.result === 1) {
            this.showNotification('bottom', 'right', 'success');
            $('#datatableLookupTransaction').DataTable().ajax.reload();
            $('#datatableCashierPriorityDetail').DataTable().ajax.reload();
          } else {
            this.swalPopUpMsg(parse.data);
          }
        },
        error => {
          this.showSpinner = false;
          const parse = JSON.parse(error);
          this.swalPopUpMsg(parse.data)
        })
  }

  selectAllLookup() {
    for (let i = 0; i < this.lookuptransaction.length; i++) {
      this.lookuptransaction[i].selectedLookup = this.selectedAllLookup;
    }
  }

  checkIfAllLookupSelected() {
    this.selectedAllLookup = this.lookuptransaction.every(function (item: any) {
      return item.selectedLookup === true;
    })
  }
  //#endregion checkbox all lookup
}
