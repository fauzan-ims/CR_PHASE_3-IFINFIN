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
  public from_date: any = [];
  public to_date: any = [];
  public branchCode: any = [];
  public branchName: any = [];
  public cashierCode: any = [];
  public cashierName: any = [];
  public listcashierreceiptrequest: any = [];
  public lookupSysBranch: any = [];
  public lookupCashierMain: any = [];
  public tampStatus: String;
  public ValidationTemp = '';
  public isBreak: Boolean = false;
  private dataTamps: any = [];
  private exch_rate: any = [];
  private dataTamp: any = [];
  private dataTampAgreement: any = [];
  private dataTampsAgreement: any = [];
  private dataRoleTampAgreement: any = [];
  private dataTempCancelPayment: any = [];
  public lookupbank: any = [];
  public remark: any;
  public bank_gl_link_code: String;
  public branch_bank_code: String;
  public branch_bank_name: String;
  public bank_account_no: String;
  public bank_account_name: String;
  public description: String;
  public currency_code: String;
  public cashier_currency_code: String;
  public branch_code: String;
  public total_amount: any = 0;
  public total_invoice_amount: any = 0;
  public total_ppn_amount: any = 0;
  public total_pph_amount: any = 0;

  //role code
  private RoleAccessCode = 'R00003170000000A';

  // API    Controller
  private APIController: String = 'CashierReceivedRequest';
  private APIControllerMasterTransaction: String = 'MasterTransaction';
  private APIControllerSysBranch: String = 'SysBranch';
  private APIControllerSysCurrencyRate: String = 'SysCurrencyRate';
  private APIControllerSysBranchBank: String = 'SysBranchBank';
  private APIControllerCashierMain: String = 'CashierMain';

  // API Function
  private APIRouteLookup: String = 'GetRowsForLookup';
  private APIRouteForGetAgreement: String = 'ExecSpForGetStatus';
  private APIRouteForGetProceedForCashier: String = 'ExecSpForGetProceedForCashier';
  private APIRouteForGetProceedForDeposit: String = 'ExecSpForGetProceedForDeposit';
  private APIRouteForGetProceedForSuspend: String = 'ExecSpForGetProceedForSuspend';
  private APIRouteForGetRowForTopRate: String = 'ExecSpTopRate';
  private APIRouteForGetRows: String = 'GETROWS';
  private APIRouteForCancel: String = 'ExecSpForGetCancel';
  private APIRouteForGetRowByEmployee: String = 'GetRowByEmployeeCode';

  // form 2 way binding
  model: any = {};

  // spinner
  showSpinner: Boolean = false;
  // end

  // checklist
  public selectedAll: any;
  public checkedList: any = [];

  // ini buat datatables
  @ViewChild(DataTableDirective)
  dtElement: DataTableDirective;
  dtOptions: DataTables.Settings = {};

  constructor(private dalservice: DALService,
    public route: Router,
    private _location: Location,
    private _elementRef: ElementRef) { super(); }

  ngOnInit() {
    this.callGetRole(this.userId, this._elementRef, this.dalservice, this.RoleAccessCode, this.route);
    this.compoSide(this._location, this._elementRef, this.route);

    this.tampStatus = 'HOLD';
    this.loadData();
    this.callGetrow()
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
        //  param tambahan untuk getrows dynamic
        dtParameters.paramTamp = [];        
        dtParameters.paramTamp.push({
          'p_branch_code': this.branchCode,
          'p_request_status': this.tampStatus,
        });
        // param tambahan untuk getrows dynamic
        
        this.dalservice.Getrows(dtParameters, this.APIController, this.APIRouteForGetRows).subscribe(resp => {
          const parse = JSON.parse(resp)

          this.listcashierreceiptrequest = parse.data;
          if (parse.data != null) {
            this.exch_rate = [];
            for (let i = 0; i < parse.data.length; i++) {
              this.callGetrowTopRate(parse.data[i].request_currency_code, parse.data[i].date_rate, i)
            }
            this.listcashierreceiptrequest.numberIndex = dtParameters.start;
            this.total_amount = 0;
            this.total_invoice_amount = 0;
            this.total_ppn_amount = 0;
            this.total_pph_amount = 0;
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

  //#region  getrow data
  callGetrow() {
    // param tambahan untuk getrow dynamic
    this.dataTamp = [{
      'p_employee_code': this.userId,
    }];
    // end param tambahan untuk getrow dynamic
    this.dalservice.Getrow(this.dataTamp, this.APIControllerCashierMain, this.APIRouteForGetRowByEmployee)
      .subscribe(
        res => {
          const parse = JSON.parse(res);
          const parsedata = this.getrowNgb(parse.data[0]);

          this.branch_code = parsedata.branch_code;

        },
        error => {
          console.log('There was an error while Retrieving Data(API) !!!' + error);
        });
  }
  //#endregion  getrow data

  //#region  getrow data rate
  callGetrowTopRate(currency: any, date: Date, index: any) {
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
          this.exch_rate.splice(index, 0, {
            'rate': parsedata.exch_rate
          })
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
    this.dataTempCancelPayment = this.dataTamp.p_request_remarks
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
              'p_request_remarks': th.dataTempCancelPayment,
              'action': ''
            }];
            console.log(th.dataTamp);
            th.dalservice.ExecSp(th.dataTamp, th.APIController, th.APIRouteForCancel)
              .subscribe(
                res => {
                  const parse = JSON.parse(res);
                  if (parse.result === 1) {
                    if (th.checkedList.length == i + 1) {
                      th.showNotification('bottom', 'right', 'success');
                      $('#datatableReceiptRequestList').DataTable().ajax.reload();
                      $('#lookupCancelPayment').modal('hide');
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
    this.btnLookupClose()
    this.checkedList = [];
    for (let i = 0; i < this.listcashierreceiptrequest.length; i++) {
      if (this.listcashierreceiptrequest[i].selectedTable) {
        this.checkedList.push({
          code: this.listcashierreceiptrequest[i].code,
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

  //#region Branch Name
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
        this.dalservice.GetrowsSys(dtParameters, this.APIControllerSysBranch, this.APIRouteLookup).subscribe(resp => {
          const parse = JSON.parse(resp);
          this.lookupSysBranch = parse.data;
          if (parse.data != null) {
            this.lookupSysBranch.numberIndex = dtParameters.start;
          }

          callback({
            draw: parse.draw,
            recordsTotal: parse.recordsTotal,
            recordsFiltered: parse.recordsFiltered,
            data: []
          })
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

  btnSelectRowSysBranch(code: String, name: String) {
    this.branchCode = code;
    this.branchName = name;
    $('#lookupModalSysBranch').modal('hide');
    $('#datatableReceiptRequestList').DataTable().ajax.reload();
  }

  btnClearBranch() {
    this.branchCode = '';
    this.branchName = '';
    this.description = undefined;
    this.bank_account_no = undefined;
    $('#lookupModalSysBranch').modal('hide');
    $('#datatableReceiptRequestList').DataTable().ajax.reload();
  }
  //#endregion branch

  //#region button btnProceedToCashier
  btnProceedToCashier() {
    this.ValidationTemp = '';
    // this.isBreak = false;
    this.checkedList = [];
    var J = 0;

    for (let i = 0; i < this.listcashierreceiptrequest.length; i++) {
      if (this.listcashierreceiptrequest[i].selectedTable) {
        this.checkedList.push({
          'code': this.listcashierreceiptrequest[i].code,
          'rate': this.exch_rate[i].rate,
          'agreement_no': this.listcashierreceiptrequest[i].agreement_no,
          'transaction_no': this.listcashierreceiptrequest[i].doc_ref_code,
        });
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

        this.dataTamps = [];
        let vm = this;
        (function loopcheckedLookup() {
          if (J < vm.checkedList.length) {
            const codeData = vm.checkedList[J].code;
            const rate = vm.checkedList[J].rate;
            const agreement_no = vm.checkedList[J].agreement_no;
            const transaction_no = vm.checkedList[J].transaction_no;

            // param tambahan untuk getrow dynamic
            vm.dataTamps = [{
              'p_code': codeData,
              'p_rate': rate,
              'p_transaction_no': transaction_no,
              'p_employee_code': vm.userId,
              'p_branch_bank_code': vm.branch_bank_code,
              'p_branch_bank_name': vm.branch_bank_name,
              'p_branch_bank_gl_link_code': vm.bank_gl_link_code,
              'p_request_currency_code': vm.cashier_currency_code,
              'p_bank_account_name': vm.bank_account_name,
              'p_bank_account_no': vm.bank_account_no,
              'p_bank_name': vm.description,
            }];

            // end param tambahan untuk getrow dynamic
            console.log(vm.dataTamps);

            // param tambahan untuk getrow dynamic to agreement
            vm.dataTampsAgreement = [{
              'p_code': codeData,
              'p_rate': rate,
              'p_employee_code': vm.userId,
              'action': 'getResponse'
            }];

            // end param tambahan untuk getrow dynamic
            if (agreement_no == null || agreement_no === '') {

              vm.dalservice.ExecSp(vm.dataTamps, vm.APIController, vm.APIRouteForGetProceedForCashier)
                .subscribe(
                  res => {
                    const parse = JSON.parse(res);

                    if (parse.result === 1) {
                      if (J + 1 === vm.checkedList.length) {
                        vm.showSpinner = false;
                        vm.showNotification('bottom', 'right', 'success');
                        $('#datatableReceiptRequestList').DataTable().ajax.reload();
                        
                      } else {
                        J++;
                        loopcheckedLookup();
                      }
                    } else {
                      // vm.isBreak = true;
                      vm.showSpinner = false;
                      vm.swalPopUpMsg(parse.data);
                      
                    }
                  },
                  error => {
                    // vm.isBreak = true;
                    vm.showSpinner = false;
                    const parse = JSON.parse(error);
                    vm.swalPopUpMsg(parse.data);
                    
                  })
              // if (vm.isBreak) {
              //   break;
              // }
            }
            else {
              vm.dalservice.ExecSp(vm.dataTampsAgreement, vm.APIControllerMasterTransaction, vm.APIRouteForGetAgreement)
                .subscribe(
                  res => {
                    const parseagreement = JSON.parse(res);
                    if (parseagreement.result === 1) {
                      vm.dataTampAgreement = parseagreement.data;
                      if (vm.dataTampAgreement.length > 0) {
                        for (let K = 0; K < vm.dataTampAgreement.length; K++) {
                          const moduleData = vm.dataTampAgreement[K].module_name;

                          vm.dataRoleTampAgreement = [{
                            'p_agreement_no': agreement_no,
                            'p_transaction_no': transaction_no,
                            'action': 'getResponse'
                          }];

                          vm.dalservice.ExecSpAll(vm.dataRoleTampAgreement, moduleData)
                            .subscribe(
                              resss => {
                                const parsevalidasi = JSON.parse(resss);
                                if (parsevalidasi.data[0].status !== '' && parsevalidasi.data[0].status != null) {
                                  vm.ValidationTemp = parsevalidasi.data[0].status
                                }
                                if (K + 1 === vm.dataTampAgreement.length) {
                                  if (vm.ValidationTemp === '') {
                                    vm.dalservice.ExecSp(vm.dataTamps, vm.APIController, vm.APIRouteForGetProceedForCashier)
                                      .subscribe(
                                        res => {
                                          const parse = JSON.parse(res);
                                          if (parse.result === 1) {
                                            if (J + 1 === vm.checkedList.length) {
                                              vm.showSpinner = false;
                                              vm.showNotification('bottom', 'right', 'success');
                                              $('#datatableReceiptRequestList').DataTable().ajax.reload();
                                              
                                            } else {
                                              J++;
                                              loopcheckedLookup();
                                            }
                                          } else {
                                            // vm.isBreak = true;
                                            vm.showSpinner = false;
                                            $('#datatableReceiptRequestList').DataTable().ajax.reload();
                                            vm.swalPopUpMsg(parse.data);
                                            
                                            vm.ValidationTemp = '';
                                          }
                                        },
                                        error => {
                                          // vm.isBreak = true;
                                          vm.showSpinner = false;
                                          const parse = JSON.parse(error);
                                          vm.swalPopUpMsg(parse.data);
                                          vm.ValidationTemp = '';
                                          
                                        })
                                  }
                                  else {
                                    // vm.isBreak = true;
                                    vm.showSpinner = false;
                                    vm.swalPopUpMsg(vm.ValidationTemp);
                                    vm.ValidationTemp = '';
                                    
                                  }
                                }
                              },
                              error => {
                                vm.ValidationTemp = '';
                                // vm.isBreak = true;
                                vm.showSpinner = false;
                                const parse = JSON.parse(error);
                                vm.swalPopUpMsg(parse.data);
                                
                              });
                          // if (vm.isBreak) {
                          //   break;
                          // }
                        }
                      }
                      else {
                        vm.dalservice.ExecSp(vm.dataTamps, vm.APIController, vm.APIRouteForGetProceedForCashier)
                          .subscribe(
                            res => {
                              const parse = JSON.parse(res);
                              if (parse.result === 1) {
                                if (J + 1 === vm.checkedList.length) {
                                  vm.showSpinner = false;
                                  vm.showNotification('bottom', 'right', 'success');
                                  $('#datatableReceiptRequestList').DataTable().ajax.reload();
                                  
                                } else {
                                  J++;
                                  loopcheckedLookup();
                                }
                              } else {
                                // vm.isBreak = true;
                                vm.showSpinner = false;
                                $('#datatableReceiptRequestList').DataTable().ajax.reload();
                                vm.swalPopUpMsg(parse.data);
                                
                              }
                            },
                            error => {
                              // vm.isBreak = true;
                              vm.showSpinner = false;
                              const parse = JSON.parse(error);
                              vm.swalPopUpMsg(parse.data);
                              
                            })
                      }
                    }
                    else {
                      // vm.isBreak = true;
                      vm.showSpinner = false;
                      vm.swalPopUpMsg(parseagreement.data);
                      
                    }
                  },
                  error => {
                    // vm.isBreak = true;
                    vm.showSpinner = false;
                    const parseagreement = JSON.parse(error);
                    vm.swalPopUpMsg(parseagreement.data);
                    
                  });
              // if (vm.isBreak) {
              //   break;
              // }
            }
          }
        })();
      } else {
        this.showSpinner = false;
      }
      this.total_invoice_amount = 0;
      this.total_amount = 0;
      this.total_ppn_amount = 0;
      this.total_pph_amount = 0;
    });
  }
  selectAllTable() {
    this.total_amount = 0;
    this.total_invoice_amount = 0;
    this.total_ppn_amount = 0;
    this.total_pph_amount = 0;
    for (let i = 0; i < this.listcashierreceiptrequest.length; i++) {
      this.listcashierreceiptrequest[i].selectedTable = this.selectedAll;
      if(this.listcashierreceiptrequest[i].selectedTable === true){
        this.total_amount += this.listcashierreceiptrequest[i].request_amount;
        this.total_invoice_amount += this.listcashierreceiptrequest[i].invoice_billing_amount;
        this.total_ppn_amount += this.listcashierreceiptrequest[i].invoice_ppn_amount;
        this.total_pph_amount += this.listcashierreceiptrequest[i].invoice_pph_amount;
      }
    }
  }

  checkIfAllTableSelected() {
    this.total_amount = 0;
    this.total_invoice_amount = 0;
    this.total_ppn_amount = 0;
    this.total_pph_amount = 0;
    this.selectedAll = this.listcashierreceiptrequest.every(function (item: any) {
      return item.selectedTable === true;
    })
    for (let i = 0; i < this.listcashierreceiptrequest.length; i++) {
      if (this.listcashierreceiptrequest[i].selectedTable) {
        this.total_amount += this.listcashierreceiptrequest[i].request_amount;
        this.total_invoice_amount += this.listcashierreceiptrequest[i].invoice_billing_amount;
        this.total_ppn_amount += this.listcashierreceiptrequest[i].invoice_ppn_amount;
        this.total_pph_amount += this.listcashierreceiptrequest[i].invoice_pph_amount;
      }
    }
  }
  //#endregion button btnProceedToCashier

  //#region button btnProceedToSuspend

  btnProceedToSuspend() {
    this.isBreak = false;
    this.checkedList = [];
    for (let i = 0; i < this.listcashierreceiptrequest.length; i++) {
      if (this.listcashierreceiptrequest[i].selectedTable) {
        this.checkedList.push({
          'code': this.listcashierreceiptrequest[i].code,
          'rate': this.exch_rate[i].rate,
        });
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
        (function loopReceiptrequest() {
          if (i < th.checkedList.length) {
            th.dataTamp = [{
              'p_code': th.checkedList[i].code,
              'p_rate': th.checkedList[i].rate,
              'action': ''
            }];
            

            th.dalservice.ExecSp(th.dataTamp, th.APIController, th.APIRouteForGetProceedForSuspend)
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
                      loopReceiptrequest();
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
      this.total_invoice_amount = 0;
      this.total_amount = 0;
      this.total_ppn_amount = 0;
      this.total_pph_amount = 0;
    });
  }
  //#endregion button btnProceedToSuspend

  //#region button btnProceedToDeposit
  btnProceedToDeposit() {
    this.isBreak = false;
    this.checkedList = [];
    for (let i = 0; i < this.listcashierreceiptrequest.length; i++) {
      if (this.listcashierreceiptrequest[i].selectedTable) {
        this.checkedList.push({
          'code': this.listcashierreceiptrequest[i].code,
          'rate': this.exch_rate[i].rate,
        });
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
        (function loopReceiptrequest() {
          if (i < th.checkedList.length) {
            th.dataTamp = [{
              'p_code': th.checkedList[i].code,
              'p_rate': th.checkedList[i].rate,
              'action': ''
            }];
            th.dalservice.ExecSp(th.dataTamp, th.APIController, th.APIRouteForGetProceedForDeposit)
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
                      loopReceiptrequest();
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
      this.total_invoice_amount = 0;
      this.total_amount = 0;
      this.total_ppn_amount = 0;
      this.total_pph_amount = 0;
    });
  }
  //#endregion button btnProceedToDeposit

  //#region btn lookup close
  btnLookupClose() {
    this.remark = null
  }
  //#endregion btn lookup close

  //#region Lookup Bank
  btnLookupBank() {
    $('#datatableLookupBank').DataTable().clear().destroy();
    $('#datatableLookupBank').DataTable({
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
          'p_branch_code': this.branch_code,
          'p_type': '',
          'p_default_flag': '1'
        });
        // end param tambahan untuk getrows dynamic

        this.dalservice.GetrowsSys(dtParameters, this.APIControllerSysBranchBank, this.APIRouteLookup).subscribe(resp => {
          const parse = JSON.parse(resp);
          this.lookupbank = parse.data;

          if (parse.data != null) {
            this.lookupbank.numberIndex = dtParameters.start;
          }

          callback({
            draw: parse.draw,
            recordsTotal: parse.recordsTotal,
            recordsFiltered: parse.recordsFiltered,
            data: []
          });
        }, err => console.log('There was an error while retrieving Data(API) !!!' + err));
      },
      columnDefs: [{ orderable: false, width: '5%', targets: [0, 1, 6] }],
      language: {
        search: '_INPUT_',
        searchPlaceholder: 'Search records',
        infoEmpty: '<p style="color:red;" > No Data Available !</p> '
      },
      searchDelay: 800 // pake ini supaya gak bug search
    });
  }

  btnSelectRowBank(bank_code: String, description: string, bank_account_no: string, bank_account_name: string, cashier_currency_code: string, gl_link_code: string) {
    this.branch_bank_code = bank_code;
    this.branch_bank_name = description;
    this.bank_account_no = bank_account_no;
    this.bank_account_name = bank_account_name;
    this.cashier_currency_code = cashier_currency_code;
    this.bank_gl_link_code = gl_link_code;

    $('#lookupModalBank').modal('hide');
    $('#datatableCashierTransactionList').DataTable().ajax.reload();
  }

  btnClearBank() {
    this.branch_bank_code = undefined;
    this.branch_bank_name = undefined;
    this.description = undefined;
    this.bank_account_no = undefined;
    this.bank_account_name = undefined;
    this.cashier_currency_code = undefined;
    this.bank_gl_link_code = undefined;
    $('#lookupModalBank').modal('hide');
    $('#datatableCashierTransactionList').DataTable().ajax.reload();
  }
  //#endregion Lookup Bank

}
