import { Component, OnInit, ElementRef, ViewChild, AfterViewInit } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { NgForm } from '@angular/forms';
import swal from 'sweetalert2';
import { NgbDateParserFormatter } from '@ng-bootstrap/ng-bootstrap';
import { BaseComponent } from '../../../../../base.component';
import { DALService } from '../../../../../DALservice.service';
import { DataTableDirective } from 'angular-datatables';

@Component({
  selector: 'app-dimensiondetail',
  templateUrl: './masterapprovaldetail.component.html'
})
export class MasterapprovaldetailComponent extends BaseComponent implements OnInit {
  // get param from url
  param = this.getRouteparam.snapshot.paramMap.get('id');
  params = this.getRouteparam.snapshot.paramMap.get('id2');

  // variable
  public masterapprovalData: any = [];
  public listdimension: any = [];
  public isReadOnly: Boolean = false;
  public lookupapproval: any = [];
  public approval_category_name: String;
  public idIndex: any;
  public isStatus: Boolean;
  public lookupSysDimension: any = [];
  public code: String;
  private dataTamp: any = [];
  private dataTampPush: any = [];
  private dataTempApprovalDimension: any = [];
  private idDetailForColumn: any;

  private APIController: String = 'MasterApproval';
  private APIControllerDimension: String = 'MasterApprovalDimension';
  private APIControllerApproval: String = 'MasterApprovalCategory';
  private APIControllerSysDimension: String = 'SysDimension';

  private APIRouteLookupDimension: String = 'GetRowsForLookup';
  private APIRouteForLookup: String = 'GetRowsForLookup';
  private APIRouteForGetRows: String = 'GetRows';
  private APIRouteForGetRow: String = 'GETROW';
  private APIRouteForUpdate: String = 'UPDATE';
  private APIRouteForInsert: String = 'INSERT';
  private APIRouteForDelete: String = 'DELETE';
  private APIRouteForSync: String = 'ExecSpForSyncOpl';

  private RoleAccessCode = 'R00024210000001A'; // role access 

  // form 2 way binding
  model: any = {};

  // checklist
  public selectedAll: any;
  private checkedList: any = [];

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
    private _elementRef: ElementRef,
    private parserFormatter: NgbDateParserFormatter
  ) { super(); }

  ngOnInit() {
    this.callGetRole(this.userId, this._elementRef, this.dalservice, this.RoleAccessCode, this.route);
    if (this.param != null) {
      this.isReadOnly = true;

      // call web service
      this.callGetrow();
      this.loadData();
    } else {
      this.model.type = 'TABLE';
      this.showSpinner = false;
    }
  }

  //#region Type
  PageType(event: any) {
    this.model.type = event.target.value;
    if (this.model.type === 'PROCEDURE') {
      this.model.table_name = undefined;
      this.model.column_name = undefined;
      this.model.primary_column = undefined;
    } else {
      this.model.function_name = undefined;
    }
  }
  //#endregion Type

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
        
        dtParameters.paramTamp = [];
        dtParameters.paramTamp.push({
          'p_approval_code': this.param,
        });
        

        this.dalservice.Getrows(dtParameters, this.APIControllerDimension, this.APIRouteForGetRows).subscribe(resp => {
          const parse = JSON.parse(resp)
          this.listdimension = parse.data;

          if (parse.data != null) {
            this.listdimension.numberIndex = dtParameters.start;
          }

          // if use checkAll use this
          $('#checkall').prop('checked', false);
          // end checkall

          callback({
            draw: parse.draw,
            recordsTotal: parse.recordsTotal,
            recordsFiltered: parse.recordsFiltered,
            data: []
          });

        }, err => console.log('There was an error while retrieving Data(API) !!!' + err));
      },
      columnDefs: [{ orderable: false, width: '5%', targets: [0, 1, 3] }], // for disabled coloumn
      language: {
        search: '_INPUT_',
        searchPlaceholder: 'Search records',
        infoEmpty: '<p style="color:red;" > No Data Available !</p> '
      },
      searchDelay: 800 // pake ini supaya gak bug search
    }
  }
  //#endregion load all data

  //#region getrow data
  callGetrow() {
    
    this.dataTamp = [{
      'p_code': this.param,
    }];
    
    this.dalservice.Getrow(this.dataTamp, this.APIController, this.APIRouteForGetRow)
      .subscribe(
        res => {
          const parse = JSON.parse(res);
          const parsedata = parse.data[0];

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
          this.showSpinner = false;
          const parse = JSON.parse(error);
          this.swalPopUpMsg(parse.data);
        });
  }
  //#endregion getrow data

  //#region checkbox all table
  btnDeleteAll() {
    this.checkedList = [];
    for (let i = 0; i < this.listdimension.length; i++) {
      if (this.listdimension[i].selected) {
        this.checkedList.push(this.listdimension[i].code);
      }
    }

    // jika tidak di checklist
    if (this.checkedList.length === 0) {
      swal({
        title: this._listdialogconf,
        buttonsStyling: false,
        confirmButtonClass: 'btn btn-danger'
      }).catch(swal.noop)
      return
    }
    this.dataTampPush = [];

    swal({
      allowOutsideClick: false,
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
        for (let J = 0; J < this.checkedList.length; J++) {
          
          this.dataTampPush.push({
            p_code: this.checkedList[J]
          });
          
          this.dalservice.Delete(this.dataTampPush, this.APIControllerDimension, this.APIRouteForDelete)
            .subscribe(
              res => {
                const parse = JSON.parse(res);
                if (parse.result === 1) {
                  if (this.checkedList.length == J + 1) {
                    this.showSpinner = false;
                    this.showNotification('bottom', 'right', 'success');
                    $('#datatableMasterApprovalDetail').DataTable().ajax.reload();
                  }
                } else {
                  this.showSpinner = false;
                  this.swalPopUpMsg(parse.data);
                }
              },
              error => {
                const parse = JSON.parse(error);
                this.swalPopUpMsg(parse.data);
                this.showSpinner = false;
              });
        }
      } else {
        this.showSpinner = false;
      }
    });
  }

  selectAllTable() {
    for (let i = 0; i < this.listdimension.length; i++) {
      this.listdimension[i].selected = this.selectedAll;
    }
  }

  checkIfAllTableSelected() {
    this.selectedAll = this.listdimension.every(function (item: any) {
      return item.selected === true;
    })
  }
  //#endregion checkbox all table

  //#region form submit
  onFormSubmit(masterapprovalForm: NgForm, isValid: boolean) {
    // validation form submit
    if (!isValid) {
      swal({
        title: 'Warning',
        text: 'Please Fill a Mandatory Field OR Format Is Invalid',
        buttonsStyling: false,
        confirmButtonClass: 'btn btn-warning',
        type: 'warning'
      }).catch(swal.noop)
      return;
    } else {
      this.showSpinner = true;
    }

    this.masterapprovalData = masterapprovalForm;
    if (this.masterapprovalData.p_is_active == null) {
      this.masterapprovalData.p_is_active = false;
    }
    const usersJson: any[] = Array.of(this.masterapprovalData);

    if (this.param != null) {
      // call web service
      this.dalservice.Update(usersJson, this.APIController, this.APIRouteForUpdate)
        .subscribe(
          res => {
            const parse = JSON.parse(res);
            if (parse.result === 1) {
              this.showSpinner = false;
              this.showNotification('bottom', 'right', 'success');
              this.callGetrow();
            } else {
              this.showSpinner = false;
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
            const parse = JSON.parse(res);
            if (parse.result === 1) {
              this.showSpinner = false;
              this.showNotification('bottom', 'right', 'success');
              this.route.navigate(['/setting/submasterapprovallist/masterapprovaldetail', parse.code]);
            } else {
              this.showSpinner = false;
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
    this.route.navigate(['/setting/submasterapprovallist']);
    $('#datatable').DataTable().ajax.reload();
  }
  //#endregion button back

  //#region approval code
  btnLookupApproval() {
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
          'default': ''
        });
        
        this.dalservice.GetrowsApv(dtParameters, this.APIControllerApproval, this.APIRouteForLookup).subscribe(resp => {
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
      columnDefs: [{ orderable: false, width: '5%', targets: [0, 1, 4] }], // for disabled coloumn
      language: {
        search: '_INPUT_',
        searchPlaceholder: 'Search records',
        infoEmpty: '<p style="color:red;" > No Data Available !</p> '
      },
      searchDelay: 800 // pake ini supaya gak bug search
    });
  }
  btnSelectRowApproval(code: String, name: String) {
    this.model.reff_approval_category_code = code;
    this.model.reff_approval_category_name = name;
    $('#lookupModalApproval').modal('hide');
  }
  //#endregion approval code

  //#region Sys Dimension
  btnLookupRowDimension(id: any, index: any) {
    $('#datatableLookupSelectDimension').DataTable().clear().destroy();
    $('#datatableLookupSelectDimension').DataTable({
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
          'default': ''
        });
        this.dalservice.Getrows(dtParameters, this.APIControllerSysDimension, this.APIRouteLookupDimension).subscribe(resp => {
          const parse = JSON.parse(resp);
          this.lookupSysDimension = parse.data;

          if (parse.data != null) {
            this.lookupSysDimension.numberIndex = dtParameters.start;
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
        infoEmpty: '<p style="color:red;" > No Data Available !</p> '
      },
      searchDelay: 800 // pake ini supaya gak bug search
    });
    this.idDetailForColumn = id;
    this.idIndex = index;
  }

  btnSelectRowDimension(description: String) {
    this.showSpinner = true;

    this.listdimension = [];
    this.listdimension.push({
      p_id: this.idDetailForColumn,
      p_dimension_code: description
    });

    // call web service
    this.dalservice.Update(this.listdimension, this.APIControllerDimension, this.APIRouteForUpdate)
      .subscribe(
        res => {
          const parse = JSON.parse(res);
          if (parse.result === 1) {
            this.showSpinner = false;
            this.showNotification('bottom', 'right', 'success');
            $('#datatableMasterApprovalDetail').DataTable().ajax.reload();
          } else {
            this.showSpinner = false;
            this.swalPopUpMsg(parse.data);
          }
        },
        error => {
          this.showSpinner = false;
          const parse = JSON.parse(error);
          this.swalPopUpMsg(parse.data);
        });
    $('#lookupModalSelectDimension').modal('hide');
  }
  //#endregion Sys Dimension

  //#region button Sync
  btnSync(code: string, reff_approval_category_code: string) {
    this.dataTempApprovalDimension = [];
    // param tambahan untuk button Sync dynamic
    this.dataTampPush = [{
      'p_approval_code': code,
      'p_reff_approval_category_code': reff_approval_category_code,
      'action': 'getResponse'
    }];
    // param tambahan untuk button Sync dynamic

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
        this.dalservice.ExecSpApv(this.dataTampPush, this.APIControllerSysDimension, this.APIRouteForSync)
          .subscribe(
            resApprovalDimension => {
              const parsesApprovalDimension = JSON.parse(resApprovalDimension);
              this.dataTempApprovalDimension = parsesApprovalDimension.data;

              if (parsesApprovalDimension.result === 1) {
                if (this.dataTempApprovalDimension.length > 0) {
                  this.listdimension = [];
                  for (let i = 0; i < this.dataTempApprovalDimension.length; i++) {
                    this.listdimension.push({
                      'p_approval_code': this.param,
                      'p_reff_dimension_code': this.dataTempApprovalDimension[i].code,
                      'p_reff_dimension_name': this.dataTempApprovalDimension[i].dimension_name,
                      'p_dimension_code': ''
                    });

                    this.dalservice.Insert(this.listdimension, this.APIControllerDimension, this.APIRouteForInsert)
                      .subscribe(
                        resInsertApprovalDimension => {
                          const parseInsertApprovalDimensions = JSON.parse(resInsertApprovalDimension);
                          if (parseInsertApprovalDimensions.result === 1) {
                            if (i + 1 == this.dataTempApprovalDimension.length) {
                              this.showSpinner = false;
                              this.showNotification('bottom', 'right', 'success');
                              $('#datatableMasterApprovalDetail').DataTable().ajax.reload();
                            }
                          } else {
                            this.showSpinner = false;
                            this.swalPopUpMsg(parseInsertApprovalDimensions.data);
                          }
                        },
                        errorInsertApprovalDimensions => {
                          this.showSpinner = false;
                          const parseInsertApprovalDimensions = JSON.parse(errorInsertApprovalDimensions);
                          this.swalPopUpMsg(parseInsertApprovalDimensions.data);
                        });
                  }
                } else {
                  this.showSpinner = false;
                }
              } else {
                this.showSpinner = false;
                this.swalPopUpMsg(parsesApprovalDimension.data);
              }
            },
            errorApprovalDimension => {
              this.showSpinner = false;
              const parseApprovalDimension = JSON.parse(errorApprovalDimension);
              this.swalPopUpMsg(parseApprovalDimension.data);
            });
      } else {
        this.showSpinner = false;
      }
    });
  }
  //#endregion button Sync
}