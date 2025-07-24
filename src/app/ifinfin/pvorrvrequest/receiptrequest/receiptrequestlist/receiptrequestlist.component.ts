import { OnInit, ViewChild, Component, ElementRef } from '@angular/core';
import 'rxjs/add/operator/map'
import { Router } from '@angular/router';
import { DataTableDirective } from 'angular-datatables';
import { BaseComponent } from '../../../../../base.component';
import { DALService } from '../../../../../DALservice.service';
import swal from 'sweetalert2';
import { Location } from '@angular/common';
import { NgForm } from '@angular/forms';

@Component({
  moduleId: module.id,
  selector: 'app-root',
  templateUrl: './receiptrequestlist.component.html'
})
export class ReceiptrequestlistComponent extends BaseComponent implements OnInit {
  // variable
  public branch_code: any = [];
  public branch_name: any = [];
  public listreceiptrequest: any = [];
  public lookupbranchcode: any = [];
  private exch_rate: any = [];
  public tampStatus: String;
  private dataTamp: any = [];
  public remark: any;
  private dataTempCancelPayment: any = [];

  //role code
  private RoleAccessCode = 'R00003080000309A';

  // API Controller
  private APIController: String = 'ReceivedRequest';
  private APIControllerSysBranch: String = 'SysBranch';
  private APIControllerSysCurrencyRate: String = 'SysCurrencyRate';

  // API Function
  private APIRouteForLookup: String = 'GetRowsForLookup';
  private APIRouteForCancel: String = 'ExecSpForGetCancel';
  private APIRouteForGetProceed: String = 'ExecSpForGetProceed';
  private APIRouteForGetRowForTopRate: String = 'ExecSpTopRate';
  private APIRouteForGetRows: String = 'GetRows';

  // form 2 way binding
  model: any = {};

  // ini buat datatables
  @ViewChild(DataTableDirective)
  dtElement: DataTableDirective;
  dtOptions: DataTables.Settings = {};

  // spinner
  showSpinner: Boolean = false;
  // end

  // checklist
  public selectedAll: any;
  public checkedList: any = [];
  public checkedListRate: any = [];

  constructor(private dalservice: DALService,
    public route: Router,
    private _location: Location,
    private _elementRef: ElementRef) { super(); }

  ngOnInit() {
    this.callGetRole(this.userId, this._elementRef, this.dalservice, this.RoleAccessCode, this.route);
    this.compoSide(this._location, this._elementRef, this.route);

    this.tampStatus = 'HOLD';
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
        // tambahan param untuk getrows dynamic
        dtParameters.paramTamp = [];
        dtParameters.paramTamp.push({
          'p_branch_code': this.branch_code,
          'p_received_status': this.tampStatus
        });
        this.dalservice.Getrows(dtParameters, this.APIController, this.APIRouteForGetRows).subscribe(resp => {
          const parse = JSON.parse(resp)

          this.listreceiptrequest = parse.data;
          if (parse.data != null) {
            this.exch_rate = [];
            for (let i = 0; i < parse.data.length; i++) {
              this.callGetrowTopRate(parse.data[i].payment_currency_code, parse.data[i].date_rate, parse.data[i].code)
            }
            this.listreceiptrequest.numberIndex = dtParameters.start;
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
      order: [[4, 'desc']],
      language: {
        search: '_INPUT_',
        searchPlaceholder: 'Search records',
        infoEmpty: '<p style="color:red;" > No Data Available !</p> '
      },
      searchDelay: 800 // pake ini supaya gak bug search
    }
  }
  //#endregion load all data

  //#region form submit
  // onFormSubmitPayment(CancelPaymentForm: NgForm, isValid: boolean) {
  //   if (!isValid) {
  //     swal({
  //       title: 'Warning',
  //       text: 'Please Fill a Mandatory Field OR Format Is Invalid',
  //       buttonsStyling: false,
  //       confirmButtonClass: 'btn btn-danger',
  //       type: 'warning'
  //     }).catch(swal.noop)
  //     return;
  //   } else {
  //     this.showSpinner = true;
  //   }
  //   this.listreceiptrequest = CancelPaymentForm;
  //   if (this.checkedList.length > 0) {
  //     for (let i = 0; i < this.checkedList.length; i++) {
  //       this.listreceiptrequest.p_code = this.checkedList[i].code;
  //       const usersJson: any[] = Array.of(this.listreceiptrequest);
  //       this.dalservice.ExecSp(usersJson, this.APIController, this.APIRouteForCancel)
  //         .subscribe(
  //           res => {
  //             this.showSpinner = false;
  //             const parse = JSON.parse(res);
  //             if (parse.result === 1) {
  //               this.showNotification('bottom', 'right', 'success');
  //               $('#lookupCancelPayment').modal('hide');
  //               $('#datatableReceiptRequestList').DataTable().ajax.reload();
  //               this.btnLookupClose();
  //             } else {
  //               this.swalPopUpMsg(parse.data);
  //             }
  //           },
  //           error => {
  //             const parse = JSON.parse(error);
  //             this.swalPopUpMsg(parse.data);
  //           });
  //     }
  //   }
  // }
  //#endregion form submit

    //#region form submit
    onFormSubmitPayment(CancelPaymentForm: NgForm, isValid: boolean) {
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
      this.dataTamp = CancelPaymentForm;
      this.dataTempCancelPayment = this.dataTamp.p_received_remarks
  
      swal({
        title: 'Are you sure?',
        type: 'warning',
        showCancelButton: true,
        confirmButtonClass: 'btn btn-success',
        cancelButtonClass: 'btn btn-danger',
        confirmButtonText: this._deleteconf,
        allowOutsideClick: false,
        buttonsStyling: false
      }).then((result) => {
        this.showSpinner = true;
        if (result.value) {
          let th = this;
          var i = 0;
          (function loopDeliveryRequestProceed() {
            if (i < th.checkedList.length) {
              th.dataTamp = [{
                'p_code': th.checkedList[i].code,
                'p_received_remarks': th.dataTempCancelPayment,
                'action': ''
              }];

              th.dalservice.ExecSp(th.dataTamp, th.APIController, th.APIRouteForCancel)
                .subscribe(
                  res => {
                       
                    const parse = JSON.parse(res);
                    
                    if (parse.result === 1) {
                      if (th.checkedList.length == i + 1) {
                        th.showNotification('bottom', 'right', 'success');
                              
                        $('#datatableReceiptRequestList').DataTable().ajax.reload();
                        $('#lookupCancelPayment').modal('hide');
                        th.btnLookupClose()
                        th.showSpinner = false;
                      } else {
                        i++;
                        loopDeliveryRequestProceed();
                      }
                    } else {
                      th.swalPopUpMsg(parse.data);
                      th.showSpinner = false;
                    }
                  },
                  error => {
                    const parse = JSON.parse(error);
                    th.swalPopUpMsg(parse.data);
                    th.showSpinner = false;
                  });
            }
          })();
        } else {
          this.showSpinner = false;
        }
      });
    }
    //#endregion form submit

  //#region btnCancelLookup
  btnCancelLookup() {
    this.checkedList = [];
    for (let i = 0; i < this.listreceiptrequest.length; i++) {
      if (this.listreceiptrequest[i].selectedTable) {
        this.checkedList.push({
          code: this.listreceiptrequest[i].code,
        });
      }
    }

    // jika tidak di checklist
    if (this.checkedList.length <= 0) {
      swal({
        title: this._listdialogconf,
        buttonsStyling: false,
        confirmButtonClass: 'btn btn-danger'
      }).catch(swal.noop)
      return
    } else {
      this.dataTamp = [];
    }
  }
  //#endregion btnCancelLookup

  //#region  getrow data rate
  callGetrowTopRate(currency: any, date: Date, code: any) {
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
          const parsedata = parse.data[0];
          this.exch_rate.push({
            'rate': parsedata.exch_rate,
            'code': code
          })

          // this.exch_rate.splice(index, 0, {
          //   'rate': parsedata.exch_rate
          // })
        },
        error => {
          console.log('There was an error while Retrieving Data(API) !!!' + error);
        });
  }
  //#endregion  getrow data rate

  //#region ddl PageStatus
  PageStatus(event: any) {
    this.tampStatus = event.target.value;
    $('#datatableReceiptRequestList').DataTable().ajax.reload();
  }
  //#endregion ddl PageStatus

  //#region btn process
  btnProceed() {
    this.checkedList = [];
      for (let i = 0; i < this.listreceiptrequest.length; i++) {
        if (this.listreceiptrequest[i].selectedTable) {
          for (let a = 0; a < this.exch_rate.length; a++) {
            if (this.exch_rate[a].code == this.listreceiptrequest[i].code) {
              this.checkedList.push({
                'code': this.listreceiptrequest[i].code,
                'rate': this.exch_rate[a].rate,
              });
            }
          }
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
        let th = this;
        var i = 0;
        (function loopDeliveryRequestProceed() {
          if (i < th.checkedList.length) {
            th.dataTamp = [{
              'p_code': th.checkedList[i].code,
              'p_rate': th.checkedList[i].rate,
              'action': ''
            }];

            th.dalservice.ExecSp(th.dataTamp, th.APIController, th.APIRouteForGetProceed)
              .subscribe(
                res => {
                  const parse = JSON.parse(res);
                  if (parse.result === 1) {
                    if (th.checkedList.length == i + 1) {
                      th.showNotification('bottom', 'right', 'success');
                      $('#datatableReceiptRequestList').DataTable().ajax.reload();
                      th.showSpinner = false;
                    } else {
                      i++;
                      loopDeliveryRequestProceed();
                    }
                  } else {
                    th.swalPopUpMsg(parse.data);
                    th.showSpinner = false;
                  }
                },
                error => {
                  const parse = JSON.parse(error);
                  th.swalPopUpMsg(parse.data);
                  th.showSpinner = false;
                });
          }
        })();
      } else {
        this.showSpinner = false;
      }
    });
  }

  selectAllTable() {
    for (let i = 0; i < this.listreceiptrequest.length; i++) {
      this.listreceiptrequest[i].selectedTable = this.selectedAll;
    }
  }

  checkIfAllTableSelected() {
    this.selectedAll = this.listreceiptrequest.every(function (item: any) {
      return item.selectedTable === true;
    })
  }
  //#endregion btn process

  //#region lookup branch
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
    $('#datatableReceiptRequestList').DataTable().ajax.reload();
  }

  btnClearBranch() {
    this.branch_code = '';
    this.branch_name = '';
    $('#lookupModalBranchcode').modal('hide');
    $('#datatableReceiptRequestList').DataTable().ajax.reload();
  }
  //#endregion lookup branch

  //#region btn lookup close
  btnLookupClose() {
    this.remark = null
  }
  //#endregion btn lookup close
}
