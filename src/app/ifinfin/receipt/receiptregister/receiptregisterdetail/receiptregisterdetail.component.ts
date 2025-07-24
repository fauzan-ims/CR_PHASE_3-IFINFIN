import { Component, OnInit, ElementRef, ViewChild, AfterViewInit } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { NgForm } from '@angular/forms';
import swal from 'sweetalert2';
import { DataTableDirective } from 'angular-datatables';
import { BaseComponent } from '../../../../../base.component';
import { DALService } from '../../../../../DALservice.service';
import { DatePipe } from '@angular/common';

@Component({
  moduleId: module.id,
  selector: 'app-root',
  templateUrl: './receiptregisterdetail.component.html'
})

export class ReceiptregisterdetailComponent extends BaseComponent implements OnInit {
  // get param from url
  param = this.getRouteparam.snapshot.paramMap.get('id');

  // variable
  public NumberOnlyPattern = this._numberonlyformat;
  public receiptregisterData: any = [];
  public listreceiptregisterdetail: any = [];
  public isReadOnly: Boolean = false;
  public isButton: Boolean = false;
  public lookupbranch: any = [];
  private setStyle: any = [];
  private dataRoleTamp: any = [];
  private dataTampDelete: any = [];
  private dataTamp: any = [];
  private RoleAccessCode = 'R00003040000305A';


  // API Controller
  private APIController: String = 'ReceiptRegister';
  private APIControllerReceiptRegisterDetail: String = 'ReceiptRegisterDetail';
  private APIControllerSysBranch: String = 'SysBranch';

  // API Function
  private APIRouteForLookup: String = 'GetRowsForLookup';
  private APIRouteForGetRows: String = 'GetRows';
  private APIRouteForGetRow: String = 'GetRow';
  private APIRouteForUpdate: String = 'Update';
  private APIRouteForInsert: String = 'Insert';
  private APIRouteForDelete: String = 'Delete';
  private APIRouteForDeleteByRegisterCode: String ='DeleteByRegisterCode';
  private APIRouteForGenerate: String = 'ExecSpForGetGenerate';
  private APIRouteForPost: String = 'ExecSpForGetPost';

  // form 2 way binding
  model: any = {};

  // spinner
  showSpinner: Boolean = true;
  // end

  // checklist
  public selectedAllTable: any;
  private checkedList: any = [];

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

    if (this.param != null) {
      this.isReadOnly = true;

      // call web service
      this.callGetrow();
      this.loadData();
    } else {
      this.model.register_status = 'HOLD';
      this.showSpinner = false;
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
      paging: true,
      'lengthMenu': [
        [10, 25, 50, 100],
        [10, 25, 50, 100]
      ],
      ajax: (dtParameters: any, callback) => {
        // param tambahan untuk getrows dynamic
        dtParameters.paramTamp = [];
        dtParameters.paramTamp.push({
          'p_register_code': this.param,
        });
        // end param tambahan untuk getrows dynamic
        this.dalservice.Getrows(dtParameters, this.APIControllerReceiptRegisterDetail, this.APIRouteForGetRows).subscribe(resp => {
          const parse = JSON.parse(resp)
          this.listreceiptregisterdetail = parse.data;
          if (parse.data != null) {
            this.listreceiptregisterdetail.numberIndex = dtParameters.start;
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

          if (parsedata.register_status !== 'HOLD') {
            this.isButton = true;
          } else {
            this.isButton = false;
          }

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

  //#region form submit
  onFormSubmit(receiptregisterForm: NgForm, isValid: boolean) {
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

    this.receiptregisterData = this.JSToNumberFloats(receiptregisterForm);
    if (this.receiptregisterData.p_receipt_prefix == null || this.receiptregisterData.p_receipt_prefix == "") {
      this.receiptregisterData.p_receipt_prefix = undefined;
    }

    if (this.receiptregisterData.p_receipt_postfix == null || this.receiptregisterData.p_receipt_postfix == "") {
      this.receiptregisterData.p_receipt_postfix = undefined;
    }


    const usersJson: any[] = Array.of(this.receiptregisterData);
    if (this.param != null) {
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
              this.route.navigate(['/receipt/subreceiptregisterlist/receiptregisterdetail', parse.code]);
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
    this.route.navigate(['/receipt/subreceiptregisterlist']);
    $('#datatableReceiptRegisterList').DataTable().ajax.reload();
  }
  //#endregion  button back

  //#region button Generate
  btnGenerate() {
    // param tambahan untuk button Generate dynamic
    this.dataRoleTamp = [{
      'p_code': this.param,
      'action': 'default'
    }];
    // param tambahan untuk button Generate dynamic

    // param tambahan untuk delete data
    this.dataTampDelete = [{
      'p_register_code': this.param,
      'action': 'default'
    }];
    // param tambahan untuk delete data

    swal({
      title: 'Are you sure?',
      type: 'warning',
      showCancelButton: true,
      confirmButtonClass: 'btn btn-success',
      cancelButtonClass: 'btn btn-danger',
      confirmButtonText: this._deleteconf,

      buttonsStyling: false
    }).then((result) => {
      if (result.value) {
        this.showSpinner = true;
        this.dalservice.Delete(this.dataTampDelete, this.APIController, this.APIRouteForDeleteByRegisterCode)
          .subscribe(
            res => {
              const parsee = JSON.parse(res);

              if (parsee.result === 1) {
                // call web service
                this.dalservice.ExecSp(this.dataRoleTamp, this.APIController, this.APIRouteForGenerate)
                  .subscribe(
                    res => {
                      this.showSpinner = false;
                      const parse = JSON.parse(res);
                      if (parse.result === 1) {
                        this.showNotification('bottom', 'right', 'success');
                        this.callGetrow();
                        $('#datatableReceiptRegisterDetail').DataTable().ajax.reload();
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
                this.showSpinner = false;
                this.swalPopUpMsg(parsee.data);
              }
            },
            error => {
              this.showSpinner = false;
              const parsee = JSON.parse(error);
              this.swalPopUpMsg(parsee.data);
            });

      } else {
        this.showSpinner = false;
      }
    });
  }
  //#endregion button Generate

  //#region button Post
  btnPost() {
    // param tambahan untuk button Post dynamic
    this.dataRoleTamp = [{
      'p_code': this.param,
      'action': 'default'
    }];
    // param tambahan untuk button Post dynamic

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
        // call web service
        this.dalservice.ExecSp(this.dataRoleTamp, this.APIController, this.APIRouteForPost)
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
        this.showSpinner = false;
      }
    });
  }
  //#endregion button Post

  //#region Branch Lookup
  btnLookupBranch() {
    $('#datatableLookupBranch').DataTable().clear().destroy();
    $('#datatableLookupBranch').DataTable({
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
      searchDelay: 800 // pake ini supaya gak bug searchAPIRouteForDelete
    });
  }

  btnSelectRowBranch(branch_code: String, branch_name: String) {
    this.model.branch_code = branch_code;
    this.model.branch_name = branch_name;
    $('#lookupModalBranch').modal('hide');
  }
  //#endregion lookup branch

  //#region checkbox all table
  btnDeleteAll() {
    this.checkedList = [];
    for (let i = 0; i < this.listreceiptregisterdetail.length; i++) {
      if (this.listreceiptregisterdetail[i].selectedTable) {
        this.checkedList.push(this.listreceiptregisterdetail[i].id);
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

    this.dataTamp = [];
    for (let J = 0; J < this.checkedList.length; J++) {
      const codeData = this.checkedList[J];
      // param tambahan untuk getrow dynamic
      this.dataTamp.push({
        'p_id': codeData
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

        this.dalservice.Delete(this.dataTamp, this.APIControllerReceiptRegisterDetail, this.APIRouteForDelete)
          .subscribe(
            res => {
              this.showSpinner = false;
              const parse = JSON.parse(res);
              if (parse.result === 1) {
                this.showNotification('bottom', 'right', 'success');
                $('#datatableReceiptRegisterDetail').DataTable().ajax.reload();
              } else {
                this.swalPopUpMsg(parse.data);
              }
            },
            error => {
              const parse = JSON.parse(error);
              this.swalPopUpMsg(parse.data);
            });
      } else {
        this.showSpinner = false;
      }
    });
  }

  selectAllTable() {
    for (let i = 0; i < this.listreceiptregisterdetail.length; i++) {
      this.listreceiptregisterdetail[i].selectedTable = this.selectedAllTable;
    }
  }

  checkIfAllTableSelected() {
    this.selectedAllTable = this.listreceiptregisterdetail.every(function (item: any) {
      return item.selectedTable === true;
    })
  }
  //#endregion checkbox all table
}


