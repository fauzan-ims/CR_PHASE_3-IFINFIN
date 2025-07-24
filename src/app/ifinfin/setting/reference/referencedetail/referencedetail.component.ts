import { Component, OnInit, ElementRef, ViewChild, AfterViewInit } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { NgForm } from '@angular/forms';
import swal from 'sweetalert2';
import { NgbDateParserFormatter } from '@ng-bootstrap/ng-bootstrap';
import { BaseComponent } from '../../../../../base.component';
import { DALService } from '../../../../../DALservice.service';

@Component({
  selector: 'app-referencedetail',
  templateUrl: './referencedetail.component.html'
})
export class ReferencedetailComponent extends BaseComponent implements OnInit {
  // get param from url
  param = this.getRouteparam.snapshot.paramMap.get('id');

  // variable
  public referenceData: any = [];
  public isReadOnly: Boolean = false;
  public lookupReference: any = [];
  private rolecode: any = [];
  private dataRoleTamp: any = [];
  public dataTamp: any = [];
  private APIController: String = 'MasterOjkReference';
  private APIControllerReference: String = 'SysGeneralSubcode';
  private APIRouteForGetRow: String = 'GETROW';
  private APIRouteForUpdate: String = 'UPDATE';
  private APIRouteForInsert: String = 'INSERT';
  private APIRouteForLookup: String = 'GetRowsForLookupForOjkReference';
  private APIRouteForGetRole: String = 'ExecSpForGetRole';

  // form 2 way binding
  model: any = {};

  // spinner
  showSpinner: Boolean = true;
  // end

  constructor(private dalservice: DALService,
    public getRouteparam: ActivatedRoute,
    public route: Router,
    private _elementRef: ElementRef,
    private parserFormatter: NgbDateParserFormatter
  ) { super(); }

  ngOnInit() {
    // this.callGetRole('');
    if (this.param != null) {
      this.isReadOnly = true;

      // call web service
      this.callGetrow();
    } else {
      this.showSpinner = false;
    }
  }

  //#region Reference
  btnLookupReference() {
    $('#datatableLookupReference').DataTable().clear().destroy();
    $('#datatableLookupReference').DataTable({
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
        this.dalservice.Getrows(dtParameters, this.APIControllerReference, this.APIRouteForLookup).subscribe(resp => {
          const parse = JSON.parse(resp);
          this.lookupReference = parse.data;
          if (parse.data != null) {
            this.lookupReference.numberIndex = dtParameters.start;
          }


          callback({
            draw: parse.draw,
            recordsTotal: parse.recordsTotal,
            recordsFiltered: parse.recordsFiltered,
            data: []
          })
        }, err => console.log('There was an error while retrieving Data(API) !!!' + err));
      },
      columnDefs: [{ orderable: false, width: '5%', targets: [0, 1, 4] }], // for disabled coloumn
      language: {
        search: '_INPUT_',
        searchPlaceholder: 'Search records',
        infoEmpty: '<p style="color:red;">No Data Available !</p>'
      },
      searchDelay: 800 // pake ini supaya gak bug search
    });
  }

  btnSelectRowReference(code: String, description: String) {
    this.model.reference_type_code = code;
    this.model.reference_type_name = description;
    $('#lookupModalReference').modal('hide');
  }
  //#endregion Reference

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
          // checkbox is active
          if (parsedata.is_active === '1') {
            parsedata.is_active = true;
          } else {
            parsedata.is_active = false;
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
  onFormSubmit(referenceForm: NgForm, isValid: boolean) {
    // reference form submit
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

    this.referenceData = referenceForm;
    if (this.referenceData.p_is_active == null) {
      this.referenceData.p_is_active = false;
    }
    const usersJson: any[] = Array.of(this.referenceData);
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
              this.swalPopUpMsg(parse.data);
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
              this.showNotification('bottom', 'right', 'success');
              this.route.navigate(['/setting/subreferencelist/referencedetail', this.referenceData.p_code]);
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
  //#endregion form submit

  //#region button back
  btnBack() {
    this.route.navigate(['/setting/subreferencelist']);
  }
  //#endregion button back

  //#region getrole
  callGetRole(uidParam) {
    // param tambahan untuk getrole dynamic
    this.dataRoleTamp = [{
      'p_uid': uidParam,
      'action': 'getResponse'
    }];
    // param tambahan untuk getrole dynamic

    this.dalservice.ExecSp(this.dataRoleTamp, this.APIController, this.APIRouteForGetRole)
      .subscribe(
        res => {
          const parse = JSON.parse(res);
          const rolecode = parse.data;

          // get role code from server and push into array
          for (let i = 0; i < rolecode.length; i++) {
            this.rolecode.push(rolecode[i].role_code);
          }

          // hide element when not a role code match with data-role in screen
          const domElement = this._elementRef.nativeElement.querySelectorAll('[data-role]');
          for (let j = 0; j < domElement.length; j++) {
            // tslint:disable-next-line:no-shadowed-variable
            const element = domElement[j].getAttribute('data-role');
            if (this.rolecode.indexOf(element) === -1) {
              this._elementRef.nativeElement.querySelector('[data-role = "' + element + '"]').style.display = 'none';
            }
          }
          // end hide element
        },
        error => {
          const parse = JSON.parse(error);
          this.swalPopUpMsg(parse.data);
        });
  }
  //#endregion getrole
}
