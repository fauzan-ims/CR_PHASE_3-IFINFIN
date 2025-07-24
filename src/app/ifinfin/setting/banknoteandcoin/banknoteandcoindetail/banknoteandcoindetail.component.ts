import { Component, OnInit, ElementRef } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { NgForm } from '@angular/forms';
import swal from 'sweetalert2';
import { BaseComponent } from '../../../../../base.component';
import { DALService } from '../../../../../DALservice.service';

@Component({
  moduleId: module.id,
  selector: 'app-root',
  templateUrl: './banknoteandcoindetail.component.html'
})

export class BanknoteandcoindetailComponent extends BaseComponent implements OnInit {
  // get param from url
  param = this.getRouteparam.snapshot.paramMap.get('id');

  // variable
  public NumberOnlyPattern = this._numberonlyformat;
  public isReadOnly: Boolean = false;
  private banknoteandcoindetailData: any = [];
  private dataTamp: any = [];
  private APIController: String = 'MasterBanknoteAndCoin';
  private APIRouteForGetRow: String = 'Getrow';
  private APIRouteForInsert: String = 'Insert';
  private APIRouteForUpdate: String = 'Update';
  private RoleAccessCode = 'R00003000000301A';


  // form 2 way binding
  model: any = {};

  // spinner
  showSpinner: Boolean = true;
  // end

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
    } else {
      this.model.type = 'Bank Note';
      this.showSpinner = false;
    }
  }

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

          // checkbox
          if (parsedata.is_active === '1') {
            parsedata.is_active = true;
          } else {
            parsedata.is_active = false;
          }
          // end checkbox

          // mapper dbtoui
          Object.assign(this.model, parsedata);
          // end mapper dbtoui

          this.showSpinner = false;
        },
        error => {
          console.log('There was an error while Retrieving Data(API) !!!' + error);
        });
  }
  //#endregion getrow data

  //#region for decimal
  public change(event: any) {
    event = '' + event.target.value;
    event = event.trim();
    event = parseFloat(event).toFixed(2); // ganti jadi 6 kalo mau pct
    event = event.replace(/(\d)(?=(\d\d\d)+(?!\d))/g, '$1,');
    // event = parseFloat(event.replace(/[^\d\.]/g,''));

    if (event === 'NaN') {
      event = 0;
      event = parseFloat(event).toFixed(2);
    }

    this.model.value_amount = event;
  }

  public focusChange(aString: string) {
    if (aString != null) {
      aString = aString.replace(/[ ],[ ]|[ ]+/g, '');
    }

    this.model.value_amount = aString;
  }
  //#endregion for decimal

  //#region  form submit
  onFormSubmit(banknoteandcoindetailForm: NgForm, isValid: boolean) {
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
    this.banknoteandcoindetailData = this.JSToNumberFloats(banknoteandcoindetailForm);
    this.banknoteandcoindetailData = banknoteandcoindetailForm;
    const usersJson: any[] = Array.of(this.banknoteandcoindetailData);
    if (this.param != null) {
      // call web service
      this.dalservice.Update(usersJson, this.APIController, this.APIRouteForUpdate)
        .subscribe(
          res => {
            this.showSpinner = false;
            const parse = JSON.parse(res);
            if (parse.result === 1) {
              this.showNotification('bottom', 'right', 'success')
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
              this.showNotification('bottom', 'right', 'success')
              this.route.navigate(['/setting/subbanknoteandcoinlist/banknoteandcoindetail', this.banknoteandcoindetailData.p_code]);
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
    this.route.navigate(['/setting/subbanknoteandcoinlist']);
    $('#datatableBankNoteCoinList').DataTable().ajax.reload();
  }
  //#endregion button back
}
