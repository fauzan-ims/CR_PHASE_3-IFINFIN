import { Component, OnInit, ElementRef, ViewChild, AfterViewInit, ChangeDetectorRef } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { NgForm } from '@angular/forms';
import swal from 'sweetalert2';
import { DataTableDirective } from 'angular-datatables';
import { BaseComponent } from '../../../../../base.component';
import { DALService } from '../../../../../DALservice.service';

@Component({
  moduleId: module.id,
  selector: 'app-root',
  templateUrl: './cashieruploaddetail.component.html'
})

export class CashieruploaddetailComponent extends BaseComponent implements OnInit {
  // get param from url
  param = this.getRouteparam.snapshot.paramMap.get('id');

  // variable
  public isReadOnly: Boolean = false;
  public isButtonSysDate: Boolean = true;
  public isButton: Boolean = false;
  public dataTampPush: any = [];
  public tempFile: any;
  public tempFile2: any;
  private base64textString: string;
  private tamps = new Array();
  public lookupbank: any = [];
  public lookupfintech: any = [];
  public listcashieruploaddetail: any = [];

  private fintechdetailData: any = [];
  private dataTamp: any = [];
  private setStyle: any = [];

  // API Controller
  private APIController: String = 'CashierUploadMain';
  private APIControllerSysBranchBank: String = 'SysBranchBank';
  private APIControllerLosMasterFintech: String = 'MasterFintech';
  private APIControllerCashierUploadDetail: String = 'CashierUploadDetail';

  // API Function
  private APIRouteForGetRows: String = 'GetRows';
  private APIRouteForGetRow: String = 'GetRow';
  private APIRouteForInsert: String = 'Insert';
  private APIRouteForUpdate: String = 'Update';
  private APIRouteForLookup: String = 'GetRowsForLookup';
  private APIRouteForSetPost: String = 'ExecSpForSetPost';
  private APIRouteForSetCancel: String = 'ExecSpForSetCancel';
  private APIRouteForPrint: String = 'PrintFile';
  private APIRouteForUploadFile: String = 'ExecSpForCashierGetUpload';
  private APIRouteForDeleteUpload: String = 'ExecSpForGetDelete';
  private APIRouteForGetSysDate: String = 'ExecSpForGetSysdate';

  private RoleAccessCode = 'R00019720000000A'; // role access

  // form 2 way binding
  model: any = {};

  // checklist
  public selectedAll: any;
  public selectedAllTable: any;
  private checkedList: any = [];

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
    this.callGetRole(this.userId, this._elementRef, this.dalservice, this.RoleAccessCode, this.route);

    this.Delimiter(this._elementRef);
    if (this.param != null) {
      // call web service
      this.callGetrow();
      this.loadData();
    } else {
      this.callGetSysdate()
      this.model.status = 'HOLD'
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

          if (parsedata.status !== 'HOLD') {
            this.isButton = true;
            this.isReadOnly = true;
          } else {
            this.isButton = false;
            this.isReadOnly = false;
          }

          // mapper dbtoui
          Object.assign(this.model, parsedata);
          // end mapper dbtoui          

          this.showSpinner = false;
        },
        error => {
          console.log('There was an error while Retrieving Data(API)' + error);
        });
  }
  //#endregion getrow data

  //#region get sys date
  callGetSysdate() {
    this.dataTamp = [{
      'default': ''
    }];

    this.dalservice.Getrow(this.dataTamp, this.APIController, this.APIRouteForGetSysDate)
      .subscribe(
        res => {
          const parse = JSON.parse(res);
          const parsedata = this.getrowNgb(parse.data[0]);


          // mapper dbtoui
          Object.assign(this.model, parsedata);
          // end mapper dbtoui          

          this.showSpinner = false;
        },
        error => {
          console.log('There was an error while Retrieving Data(API)' + error);
        });
  }
  //#endregion get sys date

  //#region  form submit
  onFormSubmit(cashieruloaddetailForm: NgForm, isValid: boolean) {
    // validation form submit
    if (!isValid) {
      swal({
        title: 'Warning',
        text: 'Please Fill a Mandatory Field OR Format Is Invalid',
        buttonsStyling: false,
        confirmButtonClass: 'btn btn-warning',
        type: 'warning'
      }).catch(swal.noop)
      return;
    } else {
      this.showSpinner = true;
    }

    this.fintechdetailData = this.JSToNumberFloats(cashieruloaddetailForm);
    const usersJson: any[] = Array.of(this.fintechdetailData);
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
              this.route.navigate(['/cashier/subcashieruploadlist/cashieruploaddetail/', parse.code]);
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

  //#region button back
  btnBack() {
    this.route.navigate(['/cashier/subcashieruploadlist']);
    $('#datatableCashierUploadList').DataTable().ajax.reload();
  }
  //#endregion button back

  //#region Lookup Fintech
  btnLookupFintech() {
    $('#datatableLookupFintech').DataTable().clear().destroy();
    $('#datatableLookupFintech').DataTable({
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

        this.dalservice.GetrowsLos(dtParameters, this.APIControllerLosMasterFintech, this.APIRouteForLookup).subscribe(resp => {
          const parse = JSON.parse(resp);
          this.lookupfintech = parse.data;

          if (parse.data != null) {
            this.lookupfintech.numberIndex = dtParameters.start;
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

  btnSelectRowFintech(fintech_no: String, fintech_name: string) {
    this.model.fintech_code = fintech_no;
    this.model.fintech_name = fintech_name;
    $('#lookupModalFintech').modal('hide');
  }
  //#endregion Lookup Bank

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
          'default': ''
        });
        // end param tambahan untuk getrows dynamic

        this.dalservice.GetrowsSys(dtParameters, this.APIControllerSysBranchBank, this.APIRouteForLookup).subscribe(resp => {
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

  btnSelectRowBank(bank_code: String, bank_name: string, cashier_currency_code: string, gl_link_code: string) {
    this.model.branch_bank_code = bank_code;
    this.model.branch_bank_name = bank_name;
    this.model.cashier_currency_code = cashier_currency_code;
    this.model.bank_gl_link_code = gl_link_code;
    $('#lookupModalBank').modal('hide');
  }
  //#endregion Lookup Bank

  //#region button post
  btnPost() {
    // param tambahan untuk update dynamic
    this.dataTamp = [{
      'p_code': this.param
    }];
    // end param tambahan untuk update dynamic
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
      if (result.value) {
        // call web service
        this.dalservice.ExecSp(this.dataTamp, this.APIController, this.APIRouteForSetPost)
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
    })
  }
  //#endregion button post

  //#region button cancel
  btnCancel() {
    // param tambahan untuk update dynamic
    this.dataTamp = [{
      'p_code': this.param
    }];
    // end param tambahan untuk update dynamic
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
      if (result.value) {
        // call web service
        this.dalservice.ExecSp(this.dataTamp, this.APIController, this.APIRouteForSetCancel)
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
    })
  }
  //#endregion button cancel

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
          'p_cashier_upload_code': this.param
        });
        // end param tambahan untuk getrows dynamic
        this.dalservice.Getrows(dtParameters, this.APIControllerCashierUploadDetail, this.APIRouteForGetRows).subscribe(resp => {
          const parse = JSON.parse(resp);
          this.listcashieruploaddetail = parse.data;
          if (parse.data != null) {
            this.listcashieruploaddetail.numberIndex = dtParameters.start;
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

  //#region btnDownload
  btnPrintDetail(code: string) {
    const dataParam = [this.JSToNumberFloats(
      {
        'p_cashier_upload_code': code,
      })
    ];
    // param tambahan untuk button Reject dynamic

    this.showSpinner = true;
    this.dalservice.DownloadFileWithData(dataParam, this.APIControllerCashierUploadDetail, this.APIRouteForPrint).subscribe(res => {

      var contentDisposition = res.headers.get('content-disposition');

      var filename = contentDisposition.split(';')[1].split('filename')[1].split('=')[1].trim();

      const blob = new Blob([res.body], { type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet' });
      const url = window.URL.createObjectURL(blob);
      var link = document.createElement('a');
      link.href = url;
      link.download = filename;
      link.click();
      this.showSpinner = false;

    }, err => {
      this.showSpinner = false;
      const parse = JSON.parse(err);
      this.swalPopUpMsg(parse.data);
    });
  }
  // #endregion btnDownload

  //#region delete all upload
  deleteAll() {
    // param tambahan untuk getrole dynamic
    this.dataTamp = [{
      'p_cashier_upload_code': this.param,
    }];
 
    // param tambahan untuk getrole dynamic
    this.dalservice.ExecSp(this.dataTamp, this.APIControllerCashierUploadDetail, this.APIRouteForDeleteUpload)
      .subscribe(
        res => {
          this.showSpinner = false;
          const parse = JSON.parse(res);
          if (parse.result === 1) {
            $('#datatableCashierDetail').DataTable().ajax.reload();
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
  //#endregion delete all upload

  //#region upload excel reader
  handleFile(event) {
    // this.tempFile = [];
    const binaryString = event.target.result;
    this.base64textString = btoa(binaryString);
    this.tamps=[{
      p_module: 'IFINFIN',
      'p_cashier_upload_code': this.param,
      filename: this.tempFile,
      base64: this.base64textString
    }];
  }

  onUploadReader(event) {
    this.deleteAll();
    const files = event.target.files;
    const file = files[0];
    if (event.target.files && event.target.files[0]) {
      const reader = new FileReader();
      reader.readAsDataURL(event.target.files[0]); // read file as data url
      // tslint:disable-next-line:no-shadowed-variable
      reader.onload = (event) => {
        reader.onload = this.handleFile.bind(this);
        reader.readAsBinaryString(file);
      }
    }
    this.tempFile = files[0].name;
    swal({
      title: 'Are you sure?',
      type: 'warning',
      showCancelButton: true,
      confirmButtonText: this._deleteconf,
      cancelButtonText: 'No',
      confirmButtonClass: 'btn btn-success',
      cancelButtonClass: 'btn btn-danger',
      buttonsStyling: false
    }).then((result) => {
      this.showSpinner = true;
      if (result.value) {
        this.dalservice.UploadFile(this.tamps, this.APIControllerCashierUploadDetail, this.APIRouteForUploadFile)
          .subscribe(
            res => {
              this.showSpinner = false;
              const parse = JSON.parse(res);
              $('#datatableCashierDetail').DataTable().ajax.reload();
              this.showNotification('bottom', 'right', 'success');
              $('#fileControl').val(undefined);
              this.tempFile = '';

            }, error => {
              this.showSpinner = false;
              const parse = JSON.parse(error);
              this.swalPopUpMsg(parse.data);
              $('#fileControl').val(undefined);
              this.tempFile = '';
            });
      } else {

        this.showSpinner = false;
        $('#fileControl').val(undefined);
        this.tempFile = '';

      }
    })
  }
  //#endregion button select image
  
}