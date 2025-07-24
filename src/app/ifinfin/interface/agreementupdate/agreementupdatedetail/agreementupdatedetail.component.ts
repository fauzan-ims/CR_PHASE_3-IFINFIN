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
  templateUrl: './agreementupdatedetail.component.html'
})

export class AgreementupdatedetailComponent extends BaseComponent implements OnInit {
  // get param from url
  param = this.getRouteparam.snapshot.paramMap.get('id');

  // variable
  public NumberOnlyPattern = this._numberonlyformat;
  public inquiryData: any = [];
  public listagreementupdatedetail: any = [];
  public isReadOnly: Boolean = false;
  public lookupbranch: any = [];
  public from_date: any;
  public to_date: any;
  public open_amount: any = [];
  public close_amount: any = [];
  private currentDate = new Date();
  private rolecode: any = [];
  private dataRoleTamp: any = [];
  private dataTamp: any = [];
  private RoleAccessCode = 'R00011780000000A';

  // API Controller
  private APIController: String = 'FinInterfaceAgreementUpdate';

  // API Function
  private APIRouteForGetRow: String = 'GetRow';
  private APIRouteForGetProceed: String = 'ExecSpForGetProceed';

  private APIControllerReport: String = 'Report';
  private APIRouteForDownload: String = 'getReport';

  // form 2 way binding
  model: any = {};

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
    if (this.param != null) {
      this.isReadOnly = true;

      // call web service
      this.callGetrow();
    } else {
      this.showSpinner = false;
    }
  }

  //#region btnPrint
  // btnPrint(agreement_no: string) {
  //   this.showSpinner = true;

  //   const rptParam = {
  //     p_user_id: this.userId,
  //     p_agreement_no: agreement_no,
  //     p_print_option: 'PDF'
  //   }

  //   const dataParam = {
  //     TableName: this.model.table_name,
  //     SpName: this.model.sp_name,
  //     reportparameters: rptParam
  //   };

  //   this.dalservice.ReportFile(dataParam, this.APIControllerReport, this.APIRouteForDownload).subscribe(res => {
  //     this.showSpinner = false;
  //     this.printRptNonCore(res);

  //   }, err => {
  //     this.showSpinner = false;
  //     const parse = JSON.parse(err);
  //     this.swalPopUpMsg(parse.data);
  //   });
  // }
  //#endregion btnPrint

  //#region  getrow data
  callGetrow() {
    // param tambahan untuk getrow dynamic
    this.dataTamp = [{
      'p_id': this.param,
    }];
    // end param tambahan untuk getrow dynamic

    this.dalservice.Getrow(this.dataTamp, this.APIController, this.APIRouteForGetRow)
      .subscribe(
        res => {
          const parse = JSON.parse(res);
          const parsedata = this.getrowNgb(parse.data[0]);

          // mapper data
          Object.assign(this.model, parsedata);
          // end mapper data

          this.showSpinner = false;
        },
        error => {
          console.log('There was an error while Retrieving Data(API) !!!' + error);
        });
  }
  //#endregion  getrow data

  //#region button back
  btnBack() {
    this.route.navigate(['/interface/subagreementupdatelist']);
    $('#datatableAgreementUpdateList').DataTable().ajax.reload();
  }
  //#endregion  button back

  //#region form submit
  onFormSubmit(agreementupdatedetailForm: NgForm, isValid: boolean) {

  }
  //#endregion form submit

  //#region button Proceed
  btnProceed(agreement_no: string) {
    // param tambahan untuk getrole dynamic
    this.dataRoleTamp = [{
      'p_agreement_no': agreement_no,
    }];
    // param tambahan untuk getrole dynamic

    // call web service
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
        this.dalservice.ExecSp(this.dataRoleTamp, this.APIController, this.APIRouteForGetProceed)
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
  //#endregion button Proceed
}


