import { Component, OnInit, ElementRef, AfterViewInit } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { NgForm } from '@angular/forms';
import swal from 'sweetalert2';
import { NgbDateParserFormatter } from '@ng-bootstrap/ng-bootstrap';
import { BaseComponent } from '../../../../../base.component';
import { DALService } from '../../../../../DALservice.service';

@Component({
  moduleId: module.id,
  selector: 'app-root',
  templateUrl: './gllinkdetail.component.html'
})

export class GllinkdetailComponent extends BaseComponent implements OnInit {
  // get param from url
  param = this.getRouteparam.snapshot.paramMap.get('id');

  // variable
  public parameterData: any = [];
  public isReadOnly: Boolean = false;
  private dataTamp: any = [];

  private APIController: String = 'JournalGlLink';
  private APIRouteForGetRow: String = 'Getrow';
  private APIRouteForInsert: String = 'Insert';
  private APIRouteForUpdate: String = 'Update';
  private RoleAccessCode = 'R00002970000298A';


  // form 2 way binding
  model: any = {};

  // checklist
  public selectedAllTable: any;

  // spinner
  showSpinner: Boolean = true;
  // end

  // datatable
  dtOptions: DataTables.Settings = {};

  constructor(private dalservice: DALService,
    public getRouteparam: ActivatedRoute,
    public route: Router,
    private _elementRef: ElementRef,
    private parserFormatter: NgbDateParserFormatter
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

  //#region getrow data
  callGetrow() {
    // param tambahan untuk getrow dynamic
    this.dataTamp = [{
      'p_code': this.param
    }]
    // end param tambahan untuk getrow dynamic

    this.dalservice.Getrow(this.dataTamp, this.APIController, this.APIRouteForGetRow)
      .subscribe(
        res => {
          const parse = JSON.parse(res);
          const parsedata = this.getrowNgb(parse.data[0]);

          // checkbox is bank
          if (parsedata.is_bank === '1') {
            parsedata.is_bank = true;
          } else {
            parsedata.is_bank = false;
          }
          // end checkbox is bank

          // checkbox is active
          if (parsedata.is_active === '1') {
            parsedata.is_active = true;
          } else {
            parsedata.is_active = false;
          }
          // end checkbox is active

          // checkbox is active
          if (parsedata.is_provit_or_cost === '1') {
            parsedata.is_provit_or_cost = true;
          } else {
            parsedata.is_provit_or_cost = false;
          }
          // end checkbox is active

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

  //#region form submit
  onFormSubmit(gllinkForm: NgForm, isValid: boolean) {
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

    this.parameterData = gllinkForm;
    if (this.parameterData.p_is_active == null) {
      this.parameterData.p_is_active = false;
    }

    if (this.parameterData.p_is_bank == null) {
      this.parameterData.p_is_bank = false;
    }

    if (this.parameterData.p_is_provit_or_cost == null) {
      this.parameterData.p_is_provit_or_cost = false;
    }

    const usersJson: any[] = Array.of(this.parameterData);
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
              this.swalPopUpMsg(parse.data)
            }
          },
          error => {
            const parse = JSON.parse(error);
            this.swalPopUpMsg(parse.data)
            // console.log('There was an error while Updating Data(API) !!!' + error);
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
              this.route.navigate(['/setting/subgllinklist/gllinkdetail', this.parameterData.p_code]);
            } else {
              this.swalPopUpMsg(parse.data)
            }
          },
          error => {
            const parse = JSON.parse(error);
            this.swalPopUpMsg(parse.data)
            // console.log('There was an error while Updating Data(API) !!!' + error);
          });
    }
  }
  //#endregion form submit

  //#region button back
  btnBack() {
    this.route.navigate(['/setting/subgllinklist']);
    $('#datatableGlLinkList').DataTable().ajax.reload();
  }
  //#endregion button back

}
