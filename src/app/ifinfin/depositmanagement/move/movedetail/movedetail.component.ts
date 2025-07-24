import { Component, OnInit, ElementRef, ViewChild, AfterViewInit } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { NgForm } from '@angular/forms';
import swal from 'sweetalert2';
import { DataTableDirective } from 'angular-datatables';
import { BaseComponent } from '../../../../../base.component';
import { DALService } from '../../../../../DALservice.service';

@Component({
  moduleId: module.id,
  selector: 'app-root',
  templateUrl: './movedetail.component.html'
})

export class MovedetailComponent extends BaseComponent implements OnInit {
  // get param from url
  param = this.getRouteparam.snapshot.paramMap.get('id');

  // variable
  public NumberOnlyPattern = this._numberonlyformat;
  public movedetailData: any = [];
  public isReadOnly: Boolean = false;
  public isReadOnlyList: Boolean = false;
  public isButton: Boolean = false;
  public isAgreement: Boolean = false;
  public valDate: any;
  public lookupbranch: any = [];
  public lookupagreement: any = [];
  public lookupdeposit: any = [];
  private rolecode: any = [];
  private dataRoleTamp: any = [];
  private click_by: any = [];
  private setStyle: any = [];
  private dataTamp: any = [];
  private RoleAccessCode = 'R00003270000328A';
  public listmovedetail: any = [];
  public templistmovedetail: any = [];
  public lookupAgreementMultiple: any = [];
  private dataTampPush: any = [];

  // API Controller
  private APIControllerSysBranch: String = 'SysBranch';
  private APIController: String = 'DepositMove';
  private APIControllerDetail: String = 'DepositMoveDetail';
  private APIControllerForDepositMain: String = 'AgreementDeposit';
  private APIControllerForAgreement: String = 'AgreementMain';
  private APIControllerSysCurrencyRate: String = 'SysCurrencyRate';

  // API Function
  private APIRouteForLookup: String = 'GetRowsForLookup';
  private APIRouteForGetRow: String = 'GetRow';
  private APIRouteForGetRows: String = 'GetRows';
  private APIRouteForInsert: String = 'Insert';
  private APIRouteForUpdate: String = 'Update';
  private APIRouteForDelete: String = 'Delete';
  private APIRouteForProceed: String = 'ExecSpForGetProceed';
  private APIRouteForGetRowForTopRate: String = 'ExecSpTopRate';
  private APIRouteForPaid: String = 'ExecSpForGetPaid';
  private APIRouteForCancel: String = 'ExecSpForGetCancel';
  private APIRouteForGetRole: String = 'ExecSpForGetRole';
  private APIRouteForLookupDeposit: String = 'GetRowsForLookupDepositAllocation';
  private APIRouteForLookupDepositMoveTo: String = 'GetRowsForLookupDepositMoveTo';

  // form 2 way binding
  model: any = {};

  // checklist
  public selectedAllTable: any;
  private checkedList: any = [];
  public selectedAllLookup: any;
  private checkedLookup: any = [];

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
      this.isReadOnly = true;

      // call web service
      this.callGetrow();
      this.loadDataDetail();
    } else {
      this.model.move_status = 'HOLD';
      this.model.to_deposit_type_code = 'INSTALLMENT';
      this.showSpinner = false;
    }
  }

  //#region load all data
  loadDataDetail() {
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
          'p_deposit_move_code': this.param
        });
        // end param tambahan untuk getrows dynamic

        // tslint:disable-next-line:max-line-length
        this.dalservice.Getrows(dtParameters, this.APIControllerDetail, this.APIRouteForGetRows).subscribe(resp => {
          const parse = JSON.parse(resp);
          this.listmovedetail = parse.data;
          if (parse.data != null) {
            this.listmovedetail.numberIndex = dtParameters.start;
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
          this.valDate = parsedata.move_date;

          const ngbGetrow = this.getrowNgb(parse.data[0]);

          if (parsedata.move_status !== 'HOLD') {
            this.isButton = true;
          } else {
            this.isButton = false;
          }

          // checkbox
          if (parsedata.is_received_request === '1') {
            this.isReadOnlyList = false;
          } else {
            this.isReadOnlyList = true;
          }
          // end checkbox

          // mapper dbtoui
          Object.assign(this.model, ngbGetrow);
          // end mapper dbtoui

          this.callGetrowTopRate(this.model.from_currency_code, this.valDate);
          // $('#datatableCodeDetail').DataTable().ajax.reload();
          this.showSpinner = false;
        },
        error => {
          console.log('There was an error while Retrieving Data(API) !!!' + error);
        });
  }
  //#endregion  getrow data

  //#region  getrow data rate
  callGetrowTopRate(currency: any, date: any) {
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
          this.model.exch_rate = parsedata.exch_rate;
        },
        error => {
          console.log('There was an error while Retrieving Data(API) !!!' + error);
        });
  }
  //#endregion  getrow data rate

  //#region form submit
  onFormSubmit(movedetailDataForm: NgForm, isValid: boolean) {
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

    this.movedetailData = this.JSToNumberFloats(movedetailDataForm);
    const usersJson: any[] = Array.of(this.movedetailData);
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
              this.route.navigate(['/depositmanagement/submovelist/movedetail', parse.code]);
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
    this.route.navigate(['/depositmanagement/submovelist']);
    $('#datatableMoveList').DataTable().ajax.reload();
  }
  //#endregion  button back

  //#region button Proceed
  btnProceed() {
    // param tambahan untuk button Proceed dynamic
    this.dataRoleTamp = [{
      'p_code': this.param,
      'action': 'default'
    }];
    // param tambahan untuk button Proceed dynamic

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
        this.dalservice.ExecSp(this.dataRoleTamp, this.APIController, this.APIRouteForProceed)
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
  //#endregion button Proceed

  //#region button Cancel
  btnCancel() {
    // param tambahan untuk button Cancel dynamic
    this.dataRoleTamp = [{
      'p_code': this.param,
      'action': 'default'
    }];
    // param tambahan untuk button Cancel dynamic

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
        this.dalservice.ExecSp(this.dataRoleTamp, this.APIController, this.APIRouteForCancel)
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
  //#endregion button Cancel

  //#region button Paid
  btnPaid() {
    // param tambahan untuk button Paid dynamic
    this.dataRoleTamp = [{
      'p_code': this.param,
      'p_rate': this.model.exch_rate,
      'action': 'default'
    }];
    // param tambahan untuk button Paid dynamic

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
        this.dalservice.ExecSp(this.dataRoleTamp, this.APIController, this.APIRouteForPaid)
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
  //#endregion button Paid

  //#region btn depositType
  depositType(event: any) {

  }
  //#endregion

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

  btnSelectRowSysBranch(branch_code: String, branch_name: String) {
    this.model.branch_code = branch_code;
    this.model.branch_name = branch_name;
    this.model.from_agreement_no = '';
    this.model.from_agreement_external_no = '';
    this.model.from_client_name = '';
    this.model.to_agreement_no = '';
    this.model.to_agreement_external_no = '';
    this.model.to_client_name = '';
    this.model.from_deposit_code = '';
    this.model.from_amount = '';
    this.model.from_deposit_type_code = '';
    $('#lookupModalSysBranch').modal('hide');
  }
  //#endregion lookup branch

  //#region moveDate
  moveDate(event: any) {
    this.model.move_date = event;
    this.valDate = event;
    if (this.model.from_currency_code !== '') {
      this.callGetrowTopRate(this.model.from_currency_code, this.valDate)
    }
  }
  //#endregion moveDate

  //#region Lookup Agreement
  btnLookupAgreement(click: String) {
    this.click_by = [];
    this.click_by = click;
    $('#datatableLookupAgreement').DataTable().clear().destroy();
    $('#datatableLookupAgreement').DataTable({
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
        if (this.click_by === 'from') {
          // param tambahan untuk getrows dynamic
          dtParameters.paramTamp.push({
            'p_branch_code': this.model.branch_code,
          });
          // end param tambahan untuk getrows dynamic
        } else {
          // param tambahan untuk getrows dynamic
          dtParameters.paramTamp.push({
            // 'p_branch_code': this.model.branch_code,
            'p_client_code': this.model.from_client_code,
            'p_currency_code': this.model.from_currency_code,
          });
          // end param tambahan untuk getrows dynamic
        }
        this.dalservice.Getrows(dtParameters, this.APIControllerForAgreement, this.APIRouteForLookupDeposit).subscribe(resp => {
          const parse = JSON.parse(resp);
          this.lookupagreement = parse.data;
          if (parse.data != null) {
            this.lookupagreement.numberIndex = dtParameters.start;
          }

          callback({
            draw: parse.draw,
            recordsTotal: parse.recordsTotal,
            recordsFiltered: parse.recordsFiltered,
            data: []
          });
        }, err => console.log('There was an error while retrieving Data(API) !!!' + err));
      },
      columnDefs: [{ orderable: false, width: '5%', targets: [0, 1, 5] }],
      language: {
        search: '_INPUT_',
        searchPlaceholder: 'Search records',
        infoEmpty: '<p style="color:red;" > No Data Available !</p> '
      },
      searchDelay: 800 // pake ini supaya gak bug search
    });
  }

  btnSelectRowAgreement(agreement_no: String, agreement_external_no: string, client_name: string, currency: string, client_code: string) {
    if (this.click_by === 'from') {
      this.model.from_agreement_no = agreement_no;
      this.model.from_agreement_external_no = agreement_external_no;
      this.model.from_client_name = client_name;
      this.model.from_client_code = client_code;
      this.model.from_currency_code = currency;
      this.model.to_agreement_no = '';
      this.model.to_agreement_external_no = '';
      this.model.to_client_name = '';
      this.model.from_deposit_code = '';
      this.model.from_amount = '';
      this.model.from_deposit_type_code = '';
      this.model.total_to_amount = 0;
      if (this.model.move_date != null) {
        this.callGetrowTopRate(this.model.from_currency_code, this.valDate)
      }
    } else {
      this.model.to_agreement_no = agreement_no;
      this.model.to_agreement_external_no = agreement_external_no;
      this.model.to_client_name = client_name;
    }
    if (this.model.from_agreement_no == this.model.to_agreement_no) {
      this.isAgreement = true;
    } else {
      this.isAgreement = false;
    }
    $('#lookupModalAgreement').modal('hide');
  }
  //#endregion Lookup Agreement

  //#region Lookup Agreement
  btnLookupAgreementMoveTo(click: String) {
    this.click_by = [];
    this.click_by = click;
    $('#datatableLookupAgreementMoveTo').DataTable().clear().destroy();
    $('#datatableLookupAgreementMoveTo').DataTable({
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
        if (this.click_by === 'from') {
          // param tambahan untuk getrows dynamic
          dtParameters.paramTamp.push({
            'p_branch_code': this.model.branch_code,
          });
          // end param tambahan untuk getrows dynamic
        } else {
          // param tambahan untuk getrows dynamic
          dtParameters.paramTamp.push({
            // 'p_branch_code': this.model.branch_code,
            'p_agreement_no': this.model.from_agreement_no,
            'p_client_code': this.model.from_client_code,
            'p_currency_code': this.model.from_currency_code,
          });
          // end param tambahan untuk getrows dynamic
        }
        this.dalservice.Getrows(dtParameters, this.APIControllerForAgreement, this.APIRouteForLookupDepositMoveTo).subscribe(resp => {
          const parse = JSON.parse(resp);
          this.lookupagreement = parse.data;
          if (parse.data != null) {
            this.lookupagreement.numberIndex = dtParameters.start;
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

  btnSelectRowAgreementMoveTo(agreement_no: String, agreement_external_no: string, client_name: string, currency: string, client_code: string) {
    this.model.to_agreement_no = agreement_no;
    this.model.to_agreement_external_no = agreement_external_no;
    this.model.to_client_name = client_name;

    if (this.model.from_agreement_no == this.model.to_agreement_no) {
      this.isAgreement = true;
    } else {
      this.isAgreement = false;
    }
    $('#lookupModalAgreementMoveTo').modal('hide');
  }
  //#endregion Lookup Agreement

  //#region Lookup Deposit
  btnLookupDeposit() {
    $('#datatableLookupDeposit').DataTable().clear().destroy();
    $('#datatableLookupDeposit').DataTable({
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
          'p_agreement_no': this.model.from_agreement_no
        });
        // end param tambahan untuk getrows dynamic
        this.dalservice.GetrowsOpl(dtParameters, this.APIControllerForDepositMain, this.APIRouteForLookup).subscribe(resp => {
          const parse = JSON.parse(resp);
          this.lookupdeposit = parse.data;
          if (parse.data != null) {
            this.lookupdeposit.numberIndex = dtParameters.start;
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

  // tslint:disable-next-line:max-line-length
  btnSelectRowDeposit(deposit_code: String, deposit_amount: string, deposit_type: string) {
    this.model.from_deposit_code = deposit_code;
    this.model.from_amount = deposit_amount;
    this.model.from_deposit_type_code = deposit_type;
    $('#lookupModalDeposit').modal('hide');
  }
  //#endregion Lookup Deposit

  //#region btnlookupAgreementMultiple
  btnlookupAgreementMultiple() {
    $('#datatablelookupAgreementMultiple').DataTable().clear().destroy();
    $('#datatablelookupAgreementMultiple').DataTable({
      'pagingType': 'first_last_numbers',
      'pageLength': 5,
      'processing': true,
      'serverSide': true,
      responsive: true,
      lengthChange: false, // hide lengthmenu
      searching: true, // jika ingin hilangin search box nya maka false
      ajax: (dtParameters: any, callback) => {

        dtParameters.paramTamp = [];
        dtParameters.paramTamp.push({
          'p_agreement_no': this.model.from_agreement_no,
          'p_client_code': this.model.from_client_code,
          'p_currency_code': this.model.from_currency_code,
          'p_deposit_move_code': this.param
        });


        this.dalservice.Getrows(dtParameters, this.APIControllerForAgreement, this.APIRouteForLookupDepositMoveTo).subscribe(resp => {
          const parse = JSON.parse(resp);
          this.lookupAgreementMultiple = parse.data;
          if (parse.data != null) {
            this.lookupAgreementMultiple.numberIndex = dtParameters.start;
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
  //#endregion lookup AssetMultiple

  //#region checkbox all lookup
  btnSelectAllLookup() {
    this.checkedLookup = [];
    for (let i = 0; i < this.lookupAgreementMultiple.length; i++) {
      if (this.lookupAgreementMultiple[i].selectedLookup) {
        this.checkedLookup.push({
          'agreement_no': this.lookupAgreementMultiple[i].agreement_no,
          'asset_no': this.lookupAgreementMultiple[i].asset_no
        });
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

    this.dataTamp = [];
    for (let J = 0; J < this.checkedLookup.length; J++) {
      const AgreementNo = this.checkedLookup[J].agreement_no;

      this.dataTamp = [{
        'p_to_agreement_no': AgreementNo,
        'p_deposit_move_code': this.param
      }];

      this.dalservice.Insert(this.dataTamp, this.APIControllerDetail, this.APIRouteForInsert)
        .subscribe(
          res => {
            const parse = JSON.parse(res);
            if (parse.result === 1) {
              if (J + 1 === this.checkedLookup.length) {
                this.showSpinner = false;
                this.showNotification('bottom', 'right', 'success');
                $('#datatableMoveDetail').DataTable().ajax.reload();
                $('#datatablelookupAgreementMultiple').DataTable().ajax.reload(null, false);
                this.callGetrow();
              }
            } else {
              this.showSpinner = false;
              this.swalPopUpMsg(parse.data);
              $('#datatableMoveDetail').DataTable().ajax.reload();
              $('#datatablelookupAgreementMultiple').DataTable().ajax.reload();
              this.callGetrow();
            }
          },
          error => {
            this.showSpinner = false;
            const parse = JSON.parse(error);
            this.swalPopUpMsg(parse.data);
            $('#datatableMoveDetail').DataTable().ajax.reload();
            $('#datatableLookupAgreementMultiple').DataTable().ajax.reload();
            this.callGetrow();
          });
    }
  }

  selectAllLookup() {
    for (let i = 0; i < this.lookupAgreementMultiple.length; i++) {
      this.lookupAgreementMultiple[i].selectedLookup = this.selectedAllLookup;
    }
  }

  checkIfAllLookupSelected() {
    this.selectedAllLookup = this.lookupAgreementMultiple.every(function (item: any) {
      return item.selectedLookup === true;
    })
  }
  //#endregion checkbox all table

  //#region checkbox all table
  btnDeleteAll() {
    this.checkedList = [];
    for (let i = 0; i < this.listmovedetail.length; i++) {
      if (this.listmovedetail[i].selected) {
        this.checkedList.push(this.listmovedetail[i].id);
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
        for (let J = 0; J < this.checkedList.length; J++) {

          this.dataTampPush.push({
            'p_id': this.checkedList[J]
          });

          this.dalservice.Delete(this.dataTampPush, this.APIControllerDetail, this.APIRouteForDelete)
            .subscribe(
              res => {
                const parse = JSON.parse(res);
                if (parse.result === 1) {
                  if (this.checkedList.length == J + 1) {
                    this.showSpinner = false;
                    this.showNotification('bottom', 'right', 'success');
                    $('#datatableMoveDetail').DataTable().ajax.reload();
                    this.callGetrow();
                    this.showSpinner = false;
                  }
                } else {
                  this.swalPopUpMsg(parse.data);
                  this.showSpinner = false;
                }
              },
              error => {
                this.showSpinner = false;
                const parse = JSON.parse(error);
                this.swalPopUpMsg(parse.data)
              });
        }
      } else {
        this.showSpinner = false;
      }
    });
  }

  selectAllTable() {
    for (let i = 0; i < this.listmovedetail.length; i++) {
      this.listmovedetail[i].selected = this.selectedAllTable;
    }
  }

  checkIfAllTableSelected() {
    this.selectedAllTable = this.listmovedetail.every(function (item: any) {
      return item.selected === true;
    })
  }
  //#endregion checkbox all table

  //#region UpdateDepositDetail
  UpdateDepositDetail(event: any) {
    this.showSpinner = true;

    var i = 0;

    const getID = $('[name="p_id"]')
      .map(function () { return $(this).val(); }).get();

    const getToDepositTypeCode = $('[name="p_to_deposit_type_code"]')
      .map(function () { return $(this).val(); }).get();

    const getToAmount = $('[name="p_to_amount"]')
      .map(function () { return $(this).val(); }).get();

    while (i < getID.length) {

      while (i < getToDepositTypeCode.length) {

        while (i < getToAmount.length) {

          this.templistmovedetail = [{
            p_id: getID[i],
            p_to_deposit_type: getToDepositTypeCode[i],
            p_to_amount: getToAmount[i]
          }];

          //#region web service
          this.dalservice.Update(this.templistmovedetail, this.APIControllerDetail, this.APIRouteForUpdate)
            .subscribe(
              res => {
                const parse = JSON.parse(res);
                if (parse.result === 1) {
                  $('#datatableMoveDetail').DataTable().ajax.reload();
                  this.callGetrow();
                  this.showSpinner = false;
                } else {
                  this.showSpinner = false;
                }
              },
              error => {
                const parse = JSON.parse(error);
                this.showSpinner = false;
              });
          //#endregion web service
          i++;
        }
        i++;
      }
      i++;
    }
  }
  //#endregion ddl UpdateDepositDetail
}


