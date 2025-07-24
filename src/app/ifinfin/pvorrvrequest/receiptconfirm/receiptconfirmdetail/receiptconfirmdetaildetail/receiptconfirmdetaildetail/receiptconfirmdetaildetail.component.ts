import { Component, OnInit, ElementRef, ViewChild, AfterViewInit } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { NgForm } from '@angular/forms';
import swal from 'sweetalert2';
import { BaseComponent } from '../../../../../../../base.component';
import { DALService } from '../../../../../../../DALservice.service';

@Component({
  moduleId: module.id,
  selector: 'app-root',
  templateUrl: './receiptconfirmdetaildetail.component.html',
})

export class ReceiptconfirmdetaildetailComponent extends BaseComponent implements OnInit {
  // get param from url
  param = this.getRouteparam.snapshot.paramMap.get('id');
  params = this.getRouteparam.snapshot.paramMap.get('id2');

  // variable
  public NumberOnlyPattern = this._numberonlyformat;
  public isReadOnly: Boolean = false;
  public isButton: Boolean = false;
  public exch_rate: any = [];
  public orig_amount: any = [];
  private dataTamp: any = [];
  private RoleAccessCode = 'R00003090000310A';
  private receiptconfirmdetaildetailData: any = [];


  private APIController: String = 'ReceivedTransactionDetail';
  private APIRouteForGetRow: String = 'Getrow';
  private APIRouteForUpdate: String = 'Update';

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
    this.callGetRole(this.userId, this._elementRef, this.dalservice, this.RoleAccessCode, this.route);

    this.Delimiter(this._elementRef);
    this.isReadOnly = true;

    // call web service
    this.callGetrow();
  }

  //#region getrow data
  callGetrow() {
    // param tambahan untuk getrow dynamic
    this.dataTamp = [{
      'p_id': this.params,
    }];
    // end param tambahan untuk getrow dynamic

    this.dalservice.Getrow(this.dataTamp, this.APIController, this.APIRouteForGetRow)
      .subscribe(
        res => {
          const parse = JSON.parse(res);
          const parsedata = this.getrowNgb(parse.data[0]);
          this.orig_amount = parsedata.orig_amount;

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

  //#region exchRate
  exchRate(event: any) {
    this.exch_rate = event.target.value;
    this.model.base_amount = this.exch_rate * this.orig_amount;
  }
  //#endregion exchRate

  //#region  form submit
  onFormSubmit(receiptconfirmdetaildetailForm: NgForm, isValid: boolean) {
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

    this.receiptconfirmdetaildetailData = this.JSToNumberFloats(receiptconfirmdetaildetailForm);
    const usersJson: any[] = Array.of(this.receiptconfirmdetaildetailData);

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
  }
  //#endregion form submit

  //#region button back
  btnBack() {
    this.route.navigate(['/pvorrvrequest/subreceiptconfirmlist/receiptconfirmdetail', this.param]);
    $('#datatablesReceiptConfirmDetail').DataTable().ajax.reload();
  }
  //#endregion button back
}
