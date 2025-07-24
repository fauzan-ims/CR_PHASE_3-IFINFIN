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
  templateUrl: './bankmutationdetail.component.html'
})

export class BankmutationdetailComponent extends BaseComponent implements OnInit {
  // get param from url
  param = this.getRouteparam.snapshot.paramMap.get('id');

  // variable
  public NumberOnlyPattern = this._numberonlyformat;
  public inquiryData: any = [];
  public listbankmutationdetail: any = [];
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
  private RoleAccessCode = 'R00003420000000A';

  private APIController: String = 'BankMutation';
  private APIControllerBankMutationHistory: String = 'BankMutationHistory';
  private APIRouteForGetRows: String = 'GetRows';
  private APIRouteForGetRow: String = 'GetRow';
  private APIRouteForGetRowForCloseAmount: String = 'GetRowForCloseAmount';
  private APIRouteForGetRole: String = 'ExecSpForGetRole';

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

    this.Delimiter(this._elementRef);
    if (this.param != null) {
      this.isReadOnly = true;
      this.open_amount = 0;
      this.close_amount = 0;

      // call web service
      this.loadData();
      this.callGetrow();
      this.model.from_date = this.dateFormater('dateNow');
      this.model.to_date = this.dateFormater('dateNow');
      this.callGetrowForCloseAmount();
    } else {
      this.showSpinner = false;
    }
  }

  //#region from date
  FromDate(event: any) {
    this.model.from_date = event;
    $('#datatablesBankMutationDetail').DataTable().ajax.reload();
    this.callGetrowForCloseAmount();
  }
  //#endregion from date

  //#region to date
  ToDate(event: any) {
    this.model.to_date = event;
    $('#datatablesBankMutationDetail').DataTable().ajax.reload();
    this.callGetrowForCloseAmount();
  }
  //#endregion to date

  //#region onBlur
  onBlur(event, i, type) {
    if (type === 'amount') {
      if (event.target.value.match('[0-9]+(,[0-9]+)')) {
        if (event.target.value.match('(\.\d+)')) {

          event = '' + event.target.value;
          event = event.trim();
          event = event.replace(/(\d)(?=(\d\d\d)+(?!\d))/g, '$1,');
        } else {
          event = '' + event.target.value;
          event = event.trim();
          event = parseFloat(event.replace(/,/g, '')).toFixed(2); // ganti jadi 6 kalo mau pct
          event = event.replace(/(\d)(?=(\d\d\d)+(?!\d))/g, '$1,');
        }
      } else {
        event = '' + event.target.value;
        event = event.trim();
        event = parseFloat(event).toFixed(2); // ganti jadi 6 kalo mau pct
        event = event.replace(/(\d)(?=(\d\d\d)+(?!\d))/g, '$1,');
      }
    } else {
      event = '' + event.target.value;
      event = event.trim();
      event = parseFloat(event).toFixed(6);
    }

    if (event === 'NaN') {
      event = 0;
      event = parseFloat(event).toFixed(2);
    }

    if (type === 'amount') {
      $('#open_amount' + i)
        .map(function () { return $(this).val(event); }).get();
    } else {
      $('#open_amount' + i)
        .map(function () { return $(this).val(event); }).get();
    }
  }
  //#endregion onBlur

  //#region onFocus
  onFocus(event, i, type) {
    event = '' + event.target.value;

    if (event != null) {
      event = event.replace(/[ ]*,[ ]*|[ ]+/g, '');
    }

    if (type === 'amount') {
      $('#open_amount' + i)
        .map(function () { return $(this).val(event); }).get();
    } else {
      $('#open_amount' + i)
        .map(function () { return $(this).val(event); }).get();
    }
  }
  //#endregion onFocus

  //#region open amount
  OpeningAmount(event: any) {
    //this.open_amount = event.target.value;
    $('#datatablesBankMutationDetail').DataTable().ajax.reload();
  }
  //#endregion open amount

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
        let paramTamps = {};
        paramTamps = {
          'p_bank_mutation_code': this.param,
          'p_from_date': this.model.from_date,
          'p_to_date': this.model.to_date,
        };

        dtParameters.paramTamp = [];
        dtParameters.paramTamp.push(this.JSToNumberFloats(paramTamps))
        // end param tambahan untuk getrows dynamic
        this.dalservice.Getrows(dtParameters, this.APIControllerBankMutationHistory, this.APIRouteForGetRows).subscribe(resp => {
          const parse = JSON.parse(resp)
          this.listbankmutationdetail = parse.data;
          if (parse.data != null) {
            this.listbankmutationdetail.numberIndex = dtParameters.start;
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
      order: [['2', 'desc']],
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

  //#region  getrow data
  callGetrowForCloseAmount() {
    // param tambahan untuk getrow dynamic
    this.dataTamp = [this.JSToNumberFloats({
      'p_code': this.param,
      'p_from_date': this.model.from_date,
      'p_to_date': this.model.to_date,
      'p_amount': this.open_amount
    })];
    // end param tambahan untuk getrow dynamic

    this.dalservice.Getrow(this.dataTamp, this.APIController, this.APIRouteForGetRowForCloseAmount)
      .subscribe(
        res => {
          const parse = JSON.parse(res);
          const parsedata = this.getrowNgb(parse.data[0]);
          this.close_amount = parsedata.base_amount;
          this.open_amount = parsedata.open_amount;
        });
  }
  //#endregion  getrow data

  //#region button back
  btnBack() {
    this.route.navigate(['/inquiry/subbankmutationlist']);
    $('#datatablesBankMutationList').DataTable().ajax.reload();
  }
  //#endregion  button back

  //#region form submit
  onFormSubmit(bankmutationdetailForm: NgForm, isValid: boolean) {

  }
}


