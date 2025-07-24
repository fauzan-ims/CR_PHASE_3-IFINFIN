import { Component, OnInit, ElementRef, AfterViewInit } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { NgForm } from '@angular/forms';
import swal from 'sweetalert2';
import { NgbDateParserFormatter } from '@ng-bootstrap/ng-bootstrap';
import { BaseComponent } from '../../../../../../../base.component';
import { DALService } from '../../../../../../../DALservice.service';

@Component({
  moduleId: module.id,
  selector: 'app-root',
  templateUrl: './progressivetaxpolicydetaildetail.component.html'
})

export class ProgressivetaxpolicydetaildetailComponent extends BaseComponent implements OnInit {
  // get param from url
  param = this.getRouteparam.snapshot.paramMap.get('id');
  params = this.getRouteparam.snapshot.paramMap.get('id2');

  // variable
  public NumberOnlyPattern: string = this._numberonlyformat;
  public progressivetaxpolicydetailData: any = [];
  public isReadOnly: Boolean = false;
  private setStyle: any = [];
  private dataTamp: any = [];
  private APIController: String = 'MasterTaxDetail';
  private APIRouteForGetRow: String = 'GETROW';
  private APIRouteForInsert: String = 'INSERT';
  private APIRouteForUpdate: String = 'UPDATE';
  private RoleAccessCode = 'R00002990000300A';


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

    if (this.params != null) {
      this.isReadOnly = true;

      // call web service
      this.callGetrow();
    } else {
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
      'p_id': this.params
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

    this.model.from_value_amount = event;
    this.model.to_value_amount = event;
    this.model.with_tax_number_pct = event;
    this.model.without_tax_number_pct = event;
  }

  public focusChange(aString: string) {
    if (aString != null) {
      aString = aString.replace(/[ ],[ ]|[ ]+/g, '');
    }

    this.model.from_value_amount = aString;
    this.model.to_value_amount = aString;
    this.model.with_tax_number_pct = aString;
    this.model.without_tax_number_pct = aString;
  }
  //#endregion for decimal

  //#region  form submit
  onFormSubmit(progressivetaxpolicydetailForm: NgForm, isValid: boolean) {
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
    this.progressivetaxpolicydetailData = this.JSToNumberFloats(progressivetaxpolicydetailForm);
    //this.progressivetaxpolicydetailData = progressivetaxpolicydetailForm;
    const usersJson: any[] = Array.of(this.progressivetaxpolicydetailData);
    if (this.params != null) {
      // call web service
      this.dalservice.Update(usersJson, this.APIController, this.APIRouteForUpdate)
        .subscribe(
          res => {
            this.showSpinner = false;
            const parse = JSON.parse(res);
            if (parse.result === 1) {
              this.showNotification('bottomng', 'right', 'success')
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
              this.route.navigate(['/setting/subprogressivetaxpolicylist/progressivetaxpolicydetaildetail', this.param, parse.id]);
            } else {
              this.swalPopUpMsg(parse.data)
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
    this.route.navigate(['/setting/subprogressivetaxpolicylist/progressivetaxpolicydetail', this.param]);
    $('#datatableProgressiveTaxPolicyDetail').DataTable().ajax.reload();
  }
  //#endregion button back
}
