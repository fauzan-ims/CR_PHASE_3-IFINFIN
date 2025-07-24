import { OnInit, ViewChild, Component, ElementRef } from '@angular/core';
import 'rxjs/add/operator/map'
import { Router, ActivatedRoute } from '@angular/router';
import { DataTableDirective } from 'angular-datatables';
import { BaseComponent } from '../../../../.././../../base.component';
import { DALService } from '../../../../../../../DALservice.service';
import swal from 'sweetalert2';
import { NgForm } from '@angular/forms';
import { CashierBankandCoinWiz } from '../cashierbanknoteandcoinwiz.routing';

@Component({
  moduleId: module.id,
  selector: 'app-root',
  templateUrl: './cashierbanknoteandcoinlist.component.html'
})

export class CashierbanknoteandcoinlistComponent extends BaseComponent implements OnInit {
  // get param from url
  param = this.getRouteparam.snapshot.paramMap.get('id');

  // variable
  public NumberOnlyPattern = this._numberonlyformat;
  public listbanknoteandcoin: any = [];
  public cashierbanknoteandcoinData: any = [];
  public tempFile: any;
  public tampHidden: Boolean;
  public status: String;
  private quantity: any;
  private code: any;
  private tampss = new Array();
  public dataTamp: any = [];
  private RoleAccessCode = 'R00003160000317A';

  private APIController: String = 'CashierBanknoteAndCoin';
  private APIControllerCashierMain: String = 'CashierMain';
  private APIRouteForGetRows: String = 'GetRows';
  private APIRouteForUpdate: String = 'Update';
  private APIRouteForGetRow: String = 'GetRow';

  // form 2 way binding
  model: any = {};

  // spinner
  showSpinner: Boolean = false;
  // end

  // ini buat datatables
  @ViewChild(DataTableDirective)
  dtElement: DataTableDirective;
  dtOptions: DataTables.Settings = {};

  constructor(private dalservice: DALService,
    public route: Router,
    public getRouteparam: ActivatedRoute,
    private _elementRef: ElementRef) { super(); }

  ngOnInit() {
    this.callGetRole(this.userId, this._elementRef, this.dalservice, this.RoleAccessCode, this.route);
    this.loadData();
    this.callGetrow();
  }

  //#region  getrow data
  callGetrow() {
    // param tambahan untuk getrow dynamic
    this.dataTamp = [{
      'p_code': this.param,
    }];
    // end param tambahan untuk getrow dynamic

    this.dalservice.Getrow(this.dataTamp, this.APIControllerCashierMain, this.APIRouteForGetRow)
      .subscribe(
        res => {
          const parse = JSON.parse(res);
          const parsedata = parse.data[0];

          this.status = parsedata.cashier_status
          // mapper dbtoui
          Object.assign(this.model, parsedata);
          // end mapper dbtoui
          this.showSpinner = false;
        });
  }
  //#endregion  getrow data

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
          'p_cashier_code': this.param
        });
        // end param tambahan untuk getrows dynamic
        this.dalservice.Getrows(dtParameters, this.APIController, this.APIRouteForGetRows).subscribe(resp => {
          const parse = JSON.parse(resp);
          this.listbanknoteandcoin = parse.data;
          if (parse.data != null) {
            this.listbanknoteandcoin.numberIndex = dtParameters.start;
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
    }
  }
  //#endregion load all data

  //#region form submit
  onFormSubmit(cashierbanknoteandcoinForm: NgForm) {
    this.cashierbanknoteandcoinData = cashierbanknoteandcoinForm;
    const usersJson: any[] = Array.of(this.cashierbanknoteandcoinData);
    for (let j = 0; j < this.tampss.length; j++) {
      usersJson.push({
        p_id: this.tampss[j].p_id,
        p_quantity: this.tampss[j].p_quantity
      });
    }
    // call web service
    this.dalservice.Update(usersJson, this.APIController, this.APIRouteForUpdate)
      .subscribe(
        res => {
          this.tampss = new Array();
          this.showSpinner = false;
          const parse = JSON.parse(res);
          if (parse.result === 1) {
            this.showNotification('bottom', 'right', 'success');
          } else {
            this.swalPopUpMsg(parse.data);
          }
        },
        error => {
          this.tampss = new Array();
          this.showSpinner = false;
          const parse = JSON.parse(error);
          this.swalPopUpMsg(parse.data);
        });
  }
  //#endregion form submit

  //#region quantity
  quantityChange(code: any, quantity: any) {
    this.code = code;
    this.quantity = quantity.target.value;
    this.tampss.push({
      p_id: this.code,
      p_quantity: this.quantity
    });
  }
  //#endregion quantity

  //#region button save list
  btnSaveList() {
    this.cashierbanknoteandcoinData = [];
    var i = 0;

    var getID = $('[name="p_id"]')
      .map(function () { return $(this).val(); }).get();

    var getQuantity = $('[name="p_quantity"]')
      .map(function () { return $(this).val(); }).get();

    var getAmount = $('[name="p_total_amount"]')
      .map(function () { return $(this).val(); }).get();

    while (i < getID.length) {

      while (i < getQuantity.length) {

        while (i < getAmount.length) {

          this.cashierbanknoteandcoinData.push(
            this.JSToNumberFloats({
              p_id: getID[i],
              p_cashier_code: this.param,
              p_quantity: getQuantity[i],
              p_total_amount: getAmount[i],
            })
          );

          i++;
        }

        i++;
      }

      i++;
    }

    //#region web service
    this.dalservice.Update(this.cashierbanknoteandcoinData, this.APIController, this.APIRouteForUpdate)
      .subscribe(
        res => {
          const parse = JSON.parse(res);
          if (parse.result === 1) {
            this.showNotification('bottom', 'right', 'success');
            $('#datatableCashierBankNoteAndCoinList').DataTable().ajax.reload();
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

  //#region changeQuantity
  changeQuantity(event, id: any, index: any) {

    var getQuantity = $('[name="p_quantity"]')
      .map(function () { return $(this).val(); }).get();

    var getAmount = $('[name="p_value_amount"]')
      .map(function () { return $(this).val(); }).get();

    if (getQuantity[index].match('[A-Za-z]')) {
      event.target.value = 0;
      getQuantity[index] = 0
    }
    if (getQuantity[index] === '') {
      getQuantity[index] = 0
      event.target.value = 0;
    }

    event = getQuantity[index] * getAmount[index];
    event = parseFloat(event).toFixed(2);
    event = event.replace(/(\d)(?=(\d\d\d)+(?!\d))/g, '$1,');
    $('#total_amount' + index)
      .map(function () { return $(this).val(event); }).get();

  }
  //#endregion changeQuantity
}
