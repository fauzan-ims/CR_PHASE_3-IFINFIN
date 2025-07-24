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
  templateUrl: './taxhistorydetail.component.html'
})

export class TaxhistorydetailComponent extends BaseComponent implements OnInit {
  // get param from url
  param = this.getRouteparam.snapshot.paramMap.get('id');

  // variable
  public NumberOnlyPattern = this._numberonlyformat;
  public taxhistoryData: any = [];
  public isReadOnly: Boolean = false;
  private dataTamp: any = [];
  private RoleAccessCode = 'R00016680000000A';

  private APIController: String = 'WithholdingTaxHistory';
  private APIRouteForGetRow: String = 'GetRow';

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

      // call web service
      this.callGetrow();
    } else {
      this.showSpinner = false;
    }
  }

  //#region Type
  PageTax(event: any) {
    this.model.tax_type = event.target.value;
    if (this.model.tax_type === 'N21' && this.model.tax_type === 'N23') {
      this.model.tax_file_no = '';
      this.model.tax_file_name = '';
      this.model.tax_file_address = '';
    }
  }
  //#endregion Type

  //#region form submit
  onFormSubmit(taxhistorydetailForm: NgForm, isValid: boolean) {

  }
  //#endregion form submit

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

  //#region button back
  btnBack() {
    this.route.navigate(['/inquiry/subwithholdingtaxhistorylist']);
    $('#datatableTaxHistoryList').DataTable().ajax.reload();
  }
  //#endregion  button back

}


