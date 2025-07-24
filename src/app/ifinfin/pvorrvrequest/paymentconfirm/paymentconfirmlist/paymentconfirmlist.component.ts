import { OnInit, ViewChild, Component, ElementRef } from '@angular/core';
import 'rxjs/add/operator/map'
import { Router } from '@angular/router';
import { DataTableDirective } from 'angular-datatables';
import { BaseComponent } from '../../../../../base.component';
import { DALService } from '../../../../../DALservice.service';
import swal from 'sweetalert2';
import { Location } from '@angular/common';

@Component({
  moduleId: module.id,
  selector: 'app-root',
  templateUrl: './paymentconfirmlist.component.html'
})

export class PaymentconfirmlistComponent extends BaseComponent implements OnInit {
  // variable
  public listpaymentconfirm: any = [];
  public branch_code: any = [];
  public branch_name: any = [];
  public listinquiry: any = [];
  public lookupbranchcode: any = [];
  public tampStatus: String;
  public branch_bank_code_param: String;
  private RoleAccessCode = 'R00003110000312A';
  private dataTempDefaultValue: any = [];
  private dataTampProceed: any = [];
  private dataTamp: any = [];
  public checkedList: any = [];
  public selectedAll: any;

  // API Controller
  private APIController: String = 'PaymentTransaction';
  private APIControllerSysBranch: String = 'SysBranch';
  private APIControllerSysGlobalParam: String = 'SysGlobalParam';

  // API Function
  private APIRouteForLookup: String = 'GetRowsForLookup';
  private APIRouteForGetRows: String = 'GETROWS';
  private APIRouteForGetForGeneral: String = 'GetRowForGeneral';
  private APIRouteForProceed: String = 'ExecSpForGetProceed';
  private APIRouteForGenerateTextFileMUFG: String = 'ExecSpForGenerateTextFile';
  private APIRouteForGenerateTextFile: String = 'ExecSpForGenerateTextFile'

  // spinner
  showSpinner: Boolean = false;
  // end

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
    this.callGetGlobalParam();
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
        // param tambahan untuk getrows dynamic
        dtParameters.paramTamp = [];
        dtParameters.paramTamp.push({
          'p_branch_code': this.branch_code,
          'p_payment_status': this.tampStatus
        });
        // end param tambahan untuk getrows dynamic
        this.dalservice.Getrows(dtParameters, this.APIController, this.APIRouteForGetRows).subscribe(resp => {
          const parse = JSON.parse(resp)
          this.listpaymentconfirm = parse.data;
          if (parse.data != null) {
            this.listpaymentconfirm.numberIndex = dtParameters.start;
            // if use checkAll use this
            $('#checkall').prop('checked', false);
            // end checkall
          }

          callback({
            draw: parse.draw,
            recordsTotal: parse.recordsTotal,
            recordsFiltered: parse.recordsFiltered,
            data: []
          });
        }, err => console.log('There was an error while retrieving Data(API) !!!' + err));
      },
      columnDefs: [{ orderable: false, width: '5%', targets: [0, 1, 8] }], // for disabled coloumn
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

  //#region ddl PageStatus
  PageStatus(event: any) {
    this.tampStatus = event.target.value;
    $('#datatablePaymentConfirmList').DataTable().ajax.reload();
  }
  //#endregion ddl PageStatus

  //#region button edit
  btnEdit(codeEdit: string) {
    this.route.navigate(['/pvorrvrequest/subpaymentconfirmlist/paymentconfirmdetail', codeEdit]);
  }
  //#endregion button edit

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
    $('#datatablePaymentConfirmList').DataTable().ajax.reload();
  }

  btnClearBranch() {
    this.branch_code = '';
    this.branch_name = '';
    $('#lookupModalBranchcode').modal('hide');
    $('#datatablePaymentConfirmList').DataTable().ajax.reload();
  }
  //#endregion lookup branch

  //#region getGlobalParam
  callGetGlobalParam() {

    this.dataTempDefaultValue = [{
      'p_type': "DEFAULT",
      'action': "getResponse"
    }];

    this.dalservice.ExecSp(this.dataTempDefaultValue, this.APIControllerSysGlobalParam, this.APIRouteForGetForGeneral)
      .subscribe(
        res => {
          const parse = JSON.parse(res);
          const parsedata = this.getrowNgb(parse.data);

          for (let i = 0; i < parsedata.length; i++) {
            if (parsedata[i].code === 'HO') {
              this.branch_code = parsedata[i].value,
                this.branch_name = parsedata[i].description
            } else if (parsedata[i].code === 'BANKCODE') {
              this.branch_bank_code_param = parsedata[i].value
            }
          } setTimeout(() => {
            $('#datatablePaymentConfirmList').DataTable().ajax.reload();
          }, 200);
          this.showSpinner = false;
        },
        error => {
          this.showSpinner = false;
          const parse = JSON.parse(error);
          this.swalPopUpMsg(parse.data);
        });
  }
  //#endregion getGlobalParam

  //#region btn proceed
  btnProceed() {
    this.dataTampProceed = [];
    this.checkedList = [];

    // var FlagDate = new Date();
    // let latest_date = this.datePipe.transform(FlagDate, 'yyyy-MM-dd HH:mm:ss');

    for (let i = 0; i < this.listpaymentconfirm.length; i++) {
      if (this.listpaymentconfirm[i].selected) {
        this.checkedList.push({
          'Code': this.listpaymentconfirm[i].code,
          'Bank_Code': this.listpaymentconfirm[i].branch_bank_code
        })
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
    swal({
      title: 'Are you sure?',
      type: 'warning',
      showCancelButton: true,
      confirmButtonClass: 'btn btn-success',
      cancelButtonClass: 'btn btn-danger',
      confirmButtonText: 'Yes',
      buttonsStyling: false
    }).then((result) => {
      this.showSpinner = true;
      setTimeout(() => {
        if (result.value) {

          let th = this;
          var i = 0;
          (function loopPaymentProceed() {
            if (i < th.checkedList.length) {
              const paramtxt = [
                {
                  'p_code': th.checkedList[i].Code,
                  'p_branch_bank_code': th.checkedList[i].Bank_Code,
                  'p_file_name': 'PAYMENT_TRANSACTION_MUFG'
                }
              ];
              //Proceed data dan insert into quotation / supplier selection
              // call web service
              th.dalservice.ExecSp(paramtxt, th.APIController, th.APIRouteForProceed)
                .subscribe(
                  res => {
                    const parse = JSON.parse(res);
                    if (parse.result === 1) {
                      if (th.checkedList[i].Bank_Code === th.branch_bank_code_param) {
                        //#region proceed file
                        th.dalservice.ExecSp(paramtxt, th.APIController, th.APIRouteForGenerateTextFileMUFG)
                          .subscribe(
                            res => {
                              const parse = JSON.parse(res);
                              if (parse.result === 1) {
                                if (th.checkedList.length == i + 1) {
                                  th.showNotification('bottom', 'right', 'success');
                                  $('#datatablePaymentConfirmList').DataTable().ajax.reload();
                                  th.showSpinner = false;
                                } else {
                                  i++;
                                  loopPaymentProceed();
                                }
                              } else {
                                th.swalPopUpMsg(parse.data);
                                th.showSpinner = false;
                              }
                            },
                            error => {
                              const parse = JSON.parse(error);
                              // th.swalPopUpMsg(parse.data);
                              th.showSpinner = false;
                            });
                        //#endregion
                      }
                      else {
                        if (th.checkedList.length == i + 1) {
                          th.showNotification('bottom', 'right', 'success');
                          $('#datatablePaymentConfirmList').DataTable().ajax.reload();
                          th.showSpinner = false;
                        } else {
                          i++;
                          loopPaymentProceed();
                        }
                      }
                    } else {
                      th.swalPopUpMsg(parse.data);
                      th.showSpinner = false;
                    }
                  });
            }
          })();
        } else {
          this.showSpinner = false;
        }
      }, 500);
    });
  }
  //#endregion btn proceed

  selectAllTable() {
    for (let i = 0; i < this.listpaymentconfirm.length; i++) {
      if (this.listpaymentconfirm[i].is_calculated !== '1') {
        this.listpaymentconfirm[i].selected = this.selectedAll;
      }
    }
  }

  checkIfAllTableSelected() {
    this.selectedAll = this.listpaymentconfirm.every(function (item: any) {
      return item.selected === true;
    })
  }
  //#endregion btn proceed

  //#region btn proceed
  // btnProceed() {
  //   this.dataTampProceed = [];
  //   this.checkedList = [];

  //   // var FlagDate = new Date();
  //   // let latest_date = this.datePipe.transform(FlagDate, 'yyyy-MM-dd HH:mm:ss');

  //   for (let i = 0; i < this.listpaymentconfirm.length; i++) {
  //     if (this.listpaymentconfirm[i].selected) {
  //       this.checkedList.push({
  //         'Code': this.listpaymentconfirm[i].code,
  //         'Bank_Code': this.listpaymentconfirm[i].branch_bank_code
  //       })
  //     }
  //   }

  //   // jika tidak di checklist
  //   if (this.checkedList.length === 0) {
  //     swal({
  //       title: this._listdialogconf,
  //       buttonsStyling: false,
  //       confirmButtonClass: 'btn btn-danger'
  //     }).catch(swal.noop)
  //     return
  //   }
  //   this.dataTamp = [];
  //   swal({
  //     title: 'Are you sure?',
  //     type: 'warning',
  //     showCancelButton: true,
  //     confirmButtonClass: 'btn btn-success',
  //     cancelButtonClass: 'btn btn-danger',
  //     confirmButtonText: 'Yes',
  //     buttonsStyling: false
  //   }).then((result) => {
  //     this.showSpinner = true;
  //     setTimeout(() => {
  //       if (result.value) {

  //         let th = this;
  //         var i = 0;
  //         (function loopPaymentProceed() {
  //           if (i < th.checkedList.length) {
  //             const paramtxt = [
  //               {
  //                 'p_code': th.checkedList[i].Code,
  //                 'p_branch_bank_code': th.checkedList[i].Bank_Code,
  //                 'p_file_name': 'PAYMENT_TRANSACTION_MUFG'
  //               }
  //             ];
  //             //Proceed data dan insert into quotation / supplier selection
  //             // call web service
  //             th.dalservice.ExecSp(paramtxt, th.APIController, th.APIRouteForProceed)
  //               .subscribe(
  //                 res => {
  //                   const parse = JSON.parse(res);
  //                   if (parse.result === 1) {
  //                     //#region proceed file
  //                     th.dalservice.ExecSp(paramtxt, th.APIController, th.APIRouteForGenerateTextFileMUFG)
  //                       .subscribe(
  //                         res => {
  //                           const parse = JSON.parse(res);
  //                           if (parse.result === 1) {
  //                             if (th.checkedList.length == i + 1) {
  //                               th.showNotification('bottom', 'right', 'success');
  //                               $('#datatablePaymentConfirmList').DataTable().ajax.reload();
  //                               th.showSpinner = false;
  //                             } else {
  //                               i++;
  //                               loopPaymentProceed();
  //                             }
  //                           } else {
  //                             // th.swalPopUpMsg(parse.data);
  //                             th.showSpinner = false;
  //                           }
  //                         },
  //                         error => {
  //                           const parse = JSON.parse(error);
  //                           // th.swalPopUpMsg(parse.data);
  //                           th.showSpinner = false;
  //                         });
  //                     //#endregion
  //                   } else {
  //                     this.showSpinner = false;
  //                   }
  //                 });
  //           }
  //         })();
  //       } else {
  //         this.showSpinner = false;
  //       }
  //     }, 500);
  //   });
  // }
  //#endregion btn proceed

}
