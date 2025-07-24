import { Component, OnInit, ElementRef, ViewChild, AfterViewInit } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { NgForm } from '@angular/forms';
import swal from 'sweetalert2';
import { DataTableDirective } from 'angular-datatables';
import { BaseComponent } from '../../../../../base.component';
import { DALService } from '../../../../../DALservice.service';
import { from } from 'rxjs';


@Component({
  moduleId: module.id,
  selector: 'app-root',
  templateUrl: './reconciledetail.component.html'
})

export class ReconciledetailComponent extends BaseComponent implements OnInit {
  // get param from url
  param = this.getRouteparam.snapshot.paramMap.get('id');

  // variable
  public NumberOnlyPattern = this._numberonlyformat;
  private currentDate = new Date();
  public reconcilemaindetailData: any = [];
  public listreconciledetail: any = [];
  public listreconciledetailData: any = [];
  public listreconciledetails: any = [];
  public isReadOnly: Boolean = false;
  public isButton: Boolean = false;
  public lookupbranch: any = [];
  public lookupbank: any = [];
  public lookupsource: any = [];
  public fromdate: any = [];
  public todate: any = [];
  public date = new Date();
  public tempFile: any;
  public tampHidden: Boolean = true;
  private base64textString: string;
  private tamps = new Array();
  private TemplateFile: String = 'BANK_RECONCILE.xlsx';
  private dataRoleTamp: any = [];
  private setStyle: any = [];
  private dataTamp: any = [];
  public lookupapproval: any = [];

  // API Controller
  private APIController: String = 'ReconcileMain';
  private APIControllerSysBranchBank: String = 'SysBranchBank';
  private APIControllerForReconcileTransaction: String = 'ReconcileTransaction';
  private APIControllerSysBranch: String = 'SysBranch';
  private APIControllerApprovalSchedule: String = 'ApprovalSchedule';

  // API Function
  private APIRouteForLookup: String = 'GetRowsForLookup';
  private APIRouteForUploadFile: String = 'Upload';
  private APIRouteForDeleteFile: String = 'Deletefile';
  private APIRouteForPriviewFile: String = 'Priview';
  private APIRouteForGetRowsForSystem: String = 'GetRowsForSystem';
  private APIRouteForGetRowsForUpload: String = 'GetRowsForUpload';
  private APIRouteForGetRow: String = 'GetRow';
  private APIRouteForUpdate: String = 'Update';
  private APIRouteForInsert: String = 'Insert';
  private APIRouteForDelete: String = 'Delete';
  private APIRouteForGetUpload: String = 'ExecSpForReconcileGetUpload';
  private APIRouteForGetRefresh: String = 'ExecSpForGetRefresh';
  private APIRouteForGetRecount: String = 'ExecSpForGetRecount';
  private APIRouteForGetPost: String = 'ExecSpForGetPost';
  private ExecSpForGetProceed: String = 'ExecSpForGetProceed';
  private APIRouteForCancel: String = 'ExecSpForGetCancel';
  private APIRouteForDownload: String = 'DownloadFile';
  private RoleAccessCode = 'R00003400000341A';


  // form 2 way binding
  model: any = {};

  // spinner
  showSpinner: Boolean = true;
  // end

  // datatable
  @ViewChild(DataTableDirective)
  dtElement: DataTableDirective;
  dtOptions: DataTables.Settings = {};
  dtOptionss: DataTables.Settings = {};

  constructor(private dalservice: DALService,
    public getRouteparam: ActivatedRoute,
    public route: Router,
    private _elementRef: ElementRef
  ) { super(); }

  ngOnInit() {
    this.callGetRole(this.userId, this._elementRef, this.dalservice, this.RoleAccessCode, this.route);
    this.Delimiter(this._elementRef);
    // this.callGetRole('');
    if (this.param != null) {
      this.isReadOnly = true;

      // call web service
      this.loadData();
      this.loadDatas();
      this.callGetrow();
    } else {
      this.Date();
      this.model.reconcile_status = 'HOLD';
      this.model.system_amount = '0';
      this.model.upload_amount = '0';
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

  //#region currentDate
  Date() {
    let day: any = this.currentDate.getDate();
    let from_month: any = this.currentDate.getMonth() + 1;
    let to_month: any = this.currentDate.getMonth() + 2;
    let year: any = this.currentDate.getFullYear();

    if (day < 10) {
      day = '0' + day.toString();
    }
    if (from_month < 10) {
      from_month = '0' + from_month.toString();
    }
    if (to_month < 10) {
      to_month = '0' + to_month.toString();
    }

    let from_date = { 'year': ~~year, 'month': ~~from_month, 'day': ~~day.toString() };
    const obj = {
      dateRange: null,
      isRange: false,
      singleDate: {
        date: from_date,
        // epoc: 1600102800,
        formatted: day.toString() + '/' + from_month + '/' + year,
        // jsDate: new Date(dob[key])
      }
    }

    this.model.reconcile_from_value_date = obj
    this.model.reconcile_to_value_date = obj
    this.model.reconcile_date = obj
  }
  //#endregion currentDate

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
          'p_reconcile_code': this.param,
        });
        // end param tambahan untuk getrows dynamic
        this.dalservice.Getrows(dtParameters, this.APIControllerForReconcileTransaction, this.APIRouteForGetRowsForSystem).subscribe(resp => {
          const parse = JSON.parse(resp)
          for (let i = 0; i < parse.data.length; i++) {
            if (parse.data[i].is_reconcile === '1') {
              parse.data[i].is_reconcile = true;
            } else {
              parse.data[i].is_reconcile = false;
            }
          }
          this.listreconciledetail = parse.data;

          callback({
            draw: parse.draw,
            recordsTotal: parse.recordsTotal,
            recordsFiltered: parse.recordsFiltered,
            data: []
          });
        }, err => console.log('There was an error while retrieving Data(API) !!!' + err));
      },
      columnDefs: [{ orderable: false, width: '10%', targets: [1] }], // for disabled coloumn
      order: [['2', 'asc']],
      language: {
        search: '_INPUT_',
        searchPlaceholder: 'Search records',
        infoEmpty: '<p style="color:red;" > No Data Available !</p> '
      },
      searchDelay: 800 // pake ini supaya gak bug search
    }
  }
  //#endregion load all data

  //#region load all data
  loadDatas() {
    this.dtOptionss = {
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
          'p_reconcile_code': this.param,
        });
        // end param tambahan untuk getrows dynamic
        this.dalservice.Getrows(dtParameters, this.APIControllerForReconcileTransaction, this.APIRouteForGetRowsForUpload).subscribe(resp => {
          const parse = JSON.parse(resp)
          for (let i = 0; i < parse.data.length; i++) {
            if (parse.data[i].is_reconcile === '1') {
              parse.data[i].is_reconcile = true;
            } else {
              parse.data[i].is_reconcile = false;
            }
          }
          this.listreconciledetails = parse.data;
          callback({
            draw: parse.draw,
            recordsTotal: parse.recordsTotal,
            recordsFiltered: parse.recordsFiltered,
            data: []
          });
        }, err => console.log('There was an error while retrieving Data(API) !!!' + err));
      },
      columnDefs: [{ orderable: false, width: '10%', targets: [1] }], // for disabled coloumn
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
          this.fromdate = parsedata.reconcile_from_value_date;
          this.todate = parsedata.reconcile_to_value_date;
          this.fromdate = this.fromdate.substring(0, 10);
          this.todate = this.todate.substring(0, 10);
          const ngbGetrow = this.getrowNgb(parse.data[0]);

          if (parsedata.paths !== '') {
            this.tampHidden = true;
          } else {
            this.tampHidden = false;
          }

          if (parsedata.reconcile_status !== 'HOLD') {
            this.isButton = true;
          } else {
            this.isButton = false;
          }

          // mapper dbtoui
          Object.assign(this.model, ngbGetrow);
          // end mapper dbtoui

          this.showSpinner = false;
        },
        error => {
          console.log('There was an error while Retrieving Data(API) !!!' + error);
        });
  }
  //#endregion  getrow data

  //#region form submit
  onFormSubmit(reconcilemaindetailForm: NgForm, isValid: boolean) {
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

    this.reconcilemaindetailData = this.JSToNumberFloats(reconcilemaindetailForm);
    this.reconcilemaindetailData.p_file = [];
    const usersJson: any[] = Array.of(this.reconcilemaindetailData);
    for (let i = 0; i < this.tamps.length; i++) {
      usersJson[0].p_file.push({
        p_module: 'IFINFIN',
        p_code: this.reconcilemaindetailData.p_code,
        p_file_path: this.reconcilemaindetailData.p_code,
        p_file_name: this.tamps[i].filename,
        p_base64: this.tamps[i].base64
      });
    }

    if (this.param != null) {
      // call web service
      this.dalservice.Update(usersJson, this.APIController, this.APIRouteForUpdate)
        .subscribe(
          res => {
            const parse = JSON.parse(res);
            if (parse.result === 1) {
              $('#fileControl').val(undefined);
              this.dataRoleTamp = [];
              this.dataRoleTamp = [{
                'p_code': this.param,
                'action': ''
              }];
              if (this.fromdate != this.reconcilemaindetailData.p_reconcile_from_value_date || this.todate != this.reconcilemaindetailData.p_reconcile_to_value_date) {

                this.dalservice.ExecSp(this.dataRoleTamp, this.APIController, this.APIRouteForGetRefresh)
                  .subscribe(
                    ress => {
                      this.showSpinner = false;
                      const parses = JSON.parse(ress);
                      if (parses.result === 1) {
                        this.showSpinner = true;
                        $('#datatablesystem').DataTable().ajax.reload();
                      }
                    });
              }
              if (this.tamps.length > 0) {
                this.dataTamp = [];
                // param tambahan untuk delete dynamic
                this.dataTamp.push({
                  'p_reconcile_code': this.param,
                });
                // end param tambahan untuk delete dynamic
                this.dalservice.Delete(this.dataTamp, this.APIControllerForReconcileTransaction, this.APIRouteForDelete)
                  .subscribe(
                    resss => {
                      const parsesss = JSON.parse(resss);
                      if (parsesss.result === 1) {
                        if (this.tamps.length > 0) {
                          this.dalservice.UploadFile(this.tamps, this.APIControllerForReconcileTransaction, this.APIRouteForGetUpload)
                            .subscribe(
                              resssss => {
                                const parsessss = JSON.parse(resssss);
                                if (parsessss.result === 1) {
                                  this.dalservice.ExecSp(this.dataRoleTamp, this.APIController, this.APIRouteForGetRecount).subscribe(
                                    ressssss => {
                                      this.showNotification('buttom', 'right', 'success');
                                      $('#fileControl').val(undefined);
                                      // window.parent.location.reload();
                                      this.callGetrow();
                                      this.showSpinner = false
                                      $('#datatablesystem').DataTable().ajax.reload();
                                      $('#datatableupload').DataTable().ajax.reload();
                                      this.tempFile = '';
                                    }
                                  );
                                } else {
                                  // this.swalPopUpMsg(parsessss.data);
                                  $('#fileControl').val('');
                                  this.showSpinner = false
                                  this.callGetrow();
                                  this.tempFile = '';
                                }
                              }, error => {
                                const parsessss = JSON.parse(error);
                                this.swalPopUpMsg(parsessss.data);
                                $('#fileControl').val('');
                                this.showSpinner = false
                                this.callGetrow();
                                this.tempFile = '';
                              });
                        } else {
                          this.showNotification('buttom', 'right', 'success');
                          this.showSpinner = false
                          this.callGetrow();
                        }

                      } else {
                        this.showSpinner = false
                        this.swalPopUpMsg(parsesss.data);
                      }
                    },
                    error => {
                      this.showSpinner = false;
                      const parsesss = JSON.parse(error);
                      this.swalPopUpMsg(parsesss.data);
                    });

              } else {
                this.showNotification('bottom', 'right', 'success');
                this.callGetrow();
                this.showSpinner = false
              }
            } else {
              this.swalPopUpMsg(parse.data);
              this.showSpinner = false
            }
          },
          error => {
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
              this.dataRoleTamp = [];
              this.dataRoleTamp = [{
                'p_code': parse.code,
                'action': ''
              }];
              this.dalservice.ExecSp(this.dataRoleTamp, this.APIController, this.APIRouteForGetRefresh)
                .subscribe(
                  ress => {
                    const parses = JSON.parse(ress);
                    this.showNotification('bottom', 'right', 'success');
                    this.route.navigate(['/reconcile/subreconcilelist/reconciledetail', parse.code]);
                  });
            } else {
              this.swalPopUpMsg(parse.data);
            }
          },
          error => {
            const parse = JSON.parse(error);
            this.swalPopUpMsg(parse.data);
          });
    }
  }
  //#endregion  form submit

  //#region button back
  btnBack() {
    this.route.navigate(['/reconcile/subreconcilelist']);
    $('#datatableReconCileList').DataTable().ajax.reload();
  }
  //#endregion  button back

  //#region button Refresh
  btnRefresh() {
    this.dataRoleTamp = [];
    // param tambahan untuk button Refresh dynamic
    this.dataRoleTamp = [{
      'p_code': this.param,
      'action': ''
    }];
    // param tambahan untuk button Refresh dynamic

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
        this.dalservice.ExecSp(this.dataRoleTamp, this.APIController, this.APIRouteForGetRefresh)
          .subscribe(
            res => {
              this.showSpinner = false;
              const parse = JSON.parse(res);
              if (parse.result === 1) {
                this.showNotification('bottom', 'right', 'success');
                this.callGetrow();
                $('#datatablesystem').DataTable().ajax.reload();
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
  //#endregion button Refresh

  //#region button Post
  btnPost() {
    // param tambahan untuk button Post dynamic
    this.dataRoleTamp = [{
      'p_code': this.param,
      'action': ''
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
        this.dalservice.ExecSp(this.dataRoleTamp, this.APIController, this.APIRouteForGetPost)
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

  //#region button Proceed
  btnProceed() {
    this.dataRoleTamp = [{
      'p_code': this.param,
      'action': ''
    }];

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
        this.dalservice.ExecSp(this.dataRoleTamp, this.APIController, this.ExecSpForGetProceed)
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
      'action': ''
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

  //#region button Recount
  btnRecount() {
    // param tambahan untuk button Recount dynamic
    this.dataRoleTamp = [{
      'p_code': this.param,
      'action': ''
    }];
    // param tambahan untuk button Recount dynamic

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
        this.dalservice.ExecSp(this.dataRoleTamp, this.APIController, this.APIRouteForGetRecount)
          .subscribe(
            res => {
              this.showSpinner = false;
              const parse = JSON.parse(res);
              if (parse.result === 1) {
                this.showNotification('bottom', 'right', 'success');
                this.callGetrow();
                $('#datatablesystem').DataTable().ajax.reload();
                $('#datatableupload').DataTable().ajax.reload();
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
  //#endregion button Recount

  //#region button select image
  onUpload(event) {
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

    if (this.TemplateFile != this.tempFile) {
      this.tempFile = '';
      swal({
        title: 'Warning',
        text: 'Invalid Template Name',
        buttonsStyling: false,
        confirmButtonClass: 'btn btn-danger',
        type: 'warning'
      }).catch(swal.noop)
      return;
    }
  }
  //#endregion button select image

  //#region button priview image
  priviewFile(row1, row2) {
    const usersJson: any[] = Array.of();

    usersJson.push({
      p_file_name: row1,
      p_file_paths: row2
    });

    this.dalservice.PriviewFile(usersJson, this.APIController, this.APIRouteForPriviewFile)
      .subscribe(
        (res) => {
          const parse = JSON.parse(res);

          if (parse.value.filename !== '') {
            const fileType = parse.value.filename.split('.').pop();
            if (fileType === 'PNG') {
              const newTab = window.open();
              newTab.document.body.innerHTML = this.pngFile(parse.value.data);
            }
            if (fileType === 'JPEG' || fileType === 'JPG') {
              const newTab = window.open();
              newTab.document.body.innerHTML = this.jpgFile(parse.value.data);
            }
            if (fileType === 'PDF') {
              const newTab = window.open();
              newTab.document.body.innerHTML = this.pdfFile(parse.value.data);
            }
            if (fileType === 'DOC') {
              const newTab = window.open();
              newTab.document.body.innerHTML = this.docFile(parse.value.data);
            }
          }
        }
      );
  }
  //#endregion button priview image

  //#region button delete image
  deleteImage(row2) {
    const usersJson: any[] = Array.of();

    usersJson.push({
      p_code: this.param,
      p_file_paths: row2
    });

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
        this.dalservice.DeleteFile(usersJson, this.APIController, this.APIRouteForDeleteFile)
          .subscribe(
            res => {
              this.showSpinner = false;
              const parse = JSON.parse(res);
              if (parse.result === 1) {
                this.showNotification('bottom', 'right', 'success');
                this.callGetrow();
                this.tempFile = '';
              } else {
                this.swalPopUpMsg(parse.data);
              }
            },
            error => {
              const parse = JSON.parse(error);
              this.showSpinner = false;
              this.swalPopUpMsg(parse.data);
            });
      } else {
        this.showSpinner = false;
      }
    });
  }
  //#endregion button delete image

  //#region convert to base64
  // handleFile(event) {
  //   const binaryString = event.target.result;
  //   this.base64textString = btoa(binaryString);

  //   this.tamps.push({
  //     filename: this.tempFile,
  //     base64: this.base64textString
  //   });
  // }
  //#endregion convert to base64

  //#region btnDownload
  btnDownload() {
    this.showSpinner = true;
    this.dalservice.DownloadFile(this.APIController, this.APIRouteForDownload).subscribe(res => {

      this.showSpinner = false;
      var contentDisposition = res.headers.get('content-disposition');

      var filename = contentDisposition.split(';')[1].split('filename')[1].split('=')[1].trim();

      const blob = new Blob([res.body], { type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet' });
      const url = window.URL.createObjectURL(blob);
      var link = document.createElement('a');
      link.href = url;
      link.download = filename;
      link.click();
      // window.open(url);


    }, err => {
      this.showSpinner = false;
      const parse = JSON.parse(err);
      this.swalPopUpMsg(parse.data);
    });
  }
  // #endregion btnDownload

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
          'p_branch_code': this.model.branch_code,
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
      columnDefs: [{ orderable: false, width: '5%', targets: [0, 1, 7] }],
      language: {
        search: '_INPUT_',
        searchPlaceholder: 'Search records',
        infoEmpty: '<p style="color:red;" > No Data Available !</p> '
      },
      searchDelay: 800 // pake ini supaya gak bug search
    });
  }

  btnSelectRowBank(bank_code: String, bank_name: string, gl_link_code: string) {
    this.model.branch_bank_code = bank_code;
    this.model.branch_bank_name = bank_name;
    this.model.bank_gl_link_code = gl_link_code;
    $('#lookupModalBank').modal('hide');
  }
  //#endregion Lookup Bank

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
    $('#lookupModalSysBranch').modal('hide');
  }
  //#endregion lookup branch


  //#region upload excel reader
  handleFile(event) {
    const binaryString = event.target.result;
    this.base64textString = btoa(binaryString);
    this.tamps = [];
    this.tamps.push({
      p_reconcile_code: this.param,
      filename: this.tempFile,
      base64: this.base64textString
    });
  }

  onUploadReader(event) {
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

    // this.tampDocumentCode = code;
    // swal({
    //   title: 'Are you sure?',
    //   type: 'warning',
    //   showCancelButton: true,
    //   confirmButtonText: this._deleteconf,

    //   confirmButtonClass: 'btn btn-success',
    //   cancelButtonClass: 'btn btn-danger',
    //   buttonsStyling: false
    // }).then((result) => {
    //   if (result.value) {
    //     this.dalservice.UploadFile(this.tamps, this.APIControllerForReconcileTransaction, this.APIRouteForGetUpload)
    //       .subscribe(
    //         res => {
    //           const parse = JSON.parse(res);

    //           if (parse.result === 1) {
    //             this.showNotification('buttom', 'right', 'success');
    //             $('#fileControl').val('');
    //             window.location.reload();
    //             this.tempFile = '';
    //           } else {
    //             this.swalPopUpMsg(parse.data);
    //             $('#fileControl').val('');
    //             window.location.reload();
    //             this.tempFile = '';
    //           }
    //         }, error => {
    //           const parse = JSON.parse(error);
    //           this.swalPopUpMsg(parse.data);
    //           $('#fileControl').val('');
    //           window.location.reload();
    //           this.tempFile = '';
    //         });
    //   } else {
    //     swal({
    //       title: 'Cancelled',
    //       type: 'error',
    //       confirmButtonClass: 'btn btn-info',
    //       buttonsStyling: false
    //     }).then(() => {
    //       $('#fileControl').val('');
    //       window.location.reload();
    //       this.tempFile = '';
    //     })
    //   }
    // })

  }
  //#endregion button select image

  //#region button save list
  btnSaveList(click_by: string) {

    this.listreconciledetailData = [];

    var i = 0;

    if (click_by === '1') {
      var getID = $('[name="p_id1"]')
        .map(function () { return $(this).val(); }).get();

      var getIsReconcile = $('[name="p_is_reconcile1"]')
        .map(function () { return $(this).prop('checked'); }).get();
    } else {
      var getID = $('[name="p_id2"]')
        .map(function () { return $(this).val(); }).get();

      var getIsReconcile = $('[name="p_is_reconcile2"]')
        .map(function () { return $(this).prop('checked'); }).get();
    }

    while (i < getID.length) {

      while (i < getIsReconcile.length) {
        this.listreconciledetailData.push(
          this.JSToNumberFloats({
            p_id: getID[i],
            p_reconcile_code: this.param,
            p_is_reconcile: getIsReconcile[i]
          })
        );

        i++;
      }
      i++;
    }

    //#region web service
    this.dalservice.Update(this.listreconciledetailData, this.APIControllerForReconcileTransaction, this.APIRouteForUpdate)
      .subscribe(
        res => {
          const parse = JSON.parse(res);

          if (parse.result === 1) {
            this.showNotification('bottom', 'right', 'success');
            this.callGetrow();
            if (click_by === '1') {
              $('#datatablesystem').DataTable().ajax.reload();
            } else {
              $('#datatableupload').DataTable().ajax.reload();
            }

          } else {
            this.swalPopUpMsg(parse.data);
          }
        },
        error => {
          const parse = JSON.parse(error);
          this.swalPopUpMsg(parse.data);

        });
    //#endregion web service

  }
  //#endregion button save list

  //#region approval Lookup
  btnViewApproval() {
    $('#datatableLookupApproval').DataTable().clear().destroy();
    $('#datatableLookupApproval').DataTable({
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
          'p_reff_no': this.param
        });


        this.dalservice.GetrowsApv(dtParameters, this.APIControllerApprovalSchedule, this.APIRouteForLookup).subscribe(resp => {
          const parse = JSON.parse(resp);
          this.lookupapproval = parse.data;
          if (parse.data != null) {
            this.lookupapproval.numberIndex = dtParameters.start;
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
      order: [[5, 'ASC']],
      language: {
        search: '_INPUT_',
        searchPlaceholder: 'Search records',
        infoEmpty: '<p style="color:red;" > No Data Available !</p> '
      },
      searchDelay: 800 // pake ini supaya gak bug search
    });
  }
  //#endregion approval Lookup

}


