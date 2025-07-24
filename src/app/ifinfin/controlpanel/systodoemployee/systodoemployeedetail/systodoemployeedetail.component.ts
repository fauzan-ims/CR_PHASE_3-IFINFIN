import { Component, OnInit, ElementRef, ViewChild, AfterViewInit } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { NgForm } from '@angular/forms';
import { DataTableDirective } from 'angular-datatables';
import swal from 'sweetalert2';
import { NgbDateParserFormatter } from '@ng-bootstrap/ng-bootstrap';
import { BaseComponent } from '../../../../../base.component';
import { DALService } from '../../../../../DALservice.service';

@Component({
  selector: 'app-systodoemployeedetail',
  templateUrl: './systodoemployeedetail.component.html'
})
export class SystodoemployeedetailComponent extends BaseComponent implements OnInit {
  // get param from url
  param = this.getRouteparam.snapshot.paramMap.get('id');
  params = this.getRouteparam.snapshot.paramMap.get('id2');


  // variable
  public systodoemployeeData: any = [];
  public isReadOnly: Boolean = false;
  private dataTamp: any = [];
  public dataTampPush: any = [];
  public listsystodoemployeedetail: any = [];
  public lookuptodoem: any = [];

  // ini buat datatables
  @ViewChild(DataTableDirective)
  dtElement: DataTableDirective;
  dtOptions: DataTables.Settings = {};

  //btnLookup
  public lookuptodo: any = [];
  public lookupemployee: any = [];
  public lookuptodoemployee: any = [];
  public employeename: any = [];

  // checklist
  public selectedAllLookup: any;
  public selectedAll: any;
  private checkedList: any = [];
  private checkedLookup: any = [];

  private APIController: String = 'SysTodoEmployee';
  private APIControllerTodo: String = 'SysTodo';
  private APIControllerSysEmployeeMain: String = 'SysEmployeeMain';
  private APIRouteForLookup: String = 'GetRowsForLookup';
  private APIRouteForLookupEmployee: String = 'GetRowsForLookupEmployee';


  private APIRouteForGetRow: String = 'GETROW';
  private APIRouteForDelete: String = 'DELETE';
  private APIRouteForGetRowsSysTodoEmployee: String = 'GetRowsSysTodo';
  private APIRouteForUpdatePriority: String = 'ExecSpForUpdatePriority';
  private APIRouteForUpdate: String = 'UPDATE';
  private APIRouteForInsert: String = 'INSERT';

  private RoleAccessCode = 'R00019550000000A'; // role access 

  // form 2 way binding
  model: any = {};

  // spinner
  showSpinner: Boolean = true;
  // end


  constructor(private dalservice: DALService,
    public getRouteparam: ActivatedRoute,
    public route: Router,
    private _elementRef: ElementRef,
  ) { super(); }

  ngOnInit() {
    this.callGetRole(this.userId, this._elementRef, this.dalservice, this.RoleAccessCode, this.route);

    if (this.param != null) {
      this.isReadOnly = true;

      // call web   service
      this.callGetrow();
      this.loadData()
    } else {
      this.showSpinner = false;
    }


  }

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
          'p_employee_code': this.param,
        });

        // end param tambahan untuk getrows dynamic
        this.dalservice.Getrows(dtParameters, this.APIController, this.APIRouteForGetRowsSysTodoEmployee).subscribe(resp => {
          const parse = JSON.parse(resp);
          this.listsystodoemployeedetail = parse.data;
          if (parse.data != null) {
            this.listsystodoemployeedetail.numberIndex = dtParameters.start;
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
          this.showSpinner = false;
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

  //#region getrow data
  callGetrow() {
    // param tambahan untuk getrow dynamic 
    this.dataTamp = [{
      'p_employee_code': this.param,
    }];
    // end param tambahan untuk getrow dynamic
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

          this.employeename = parsedata.employee_name
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

  //#region form submit
  onFormSubmit(systodoemployeeForm: NgForm, isValid: boolean) {
    // category form submit
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

    this.systodoemployeeData = this.JSToNumberFloats(systodoemployeeForm);

    const usersJson: any[] = Array.of(this.systodoemployeeData);

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
              $('#datatablelisttodoemployeedetail').DataTable().ajax.reload();
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
              this.route.navigate(['/controlpanel/subsystodoemployeelist/systodoemployeedetail', this.systodoemployeeData.p_employee_code]);
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
    }
  }
  //#endregion form submit

  //#region button Update Priority
  changePriority(id: String, priority: any) {

    // param tambahan untuk getrow dynamic 
    this.dataTamp = [{
      'p_id': id,
      'p_priority': priority.target.value
    }];
    // end param tambahan untuk getrow dynamic
    // call web service
    
    this.dalservice.ExecSp(this.dataTamp, this.APIController, this.APIRouteForUpdatePriority)
      .subscribe(
        res => {
         
          const parse = JSON.parse(res);

          if (parse.result === 1) {

            this.showNotification('bottom', 'right', 'success');
            //  this.callGetrow();
            this.showSpinner = true;
            $('#datatablelisttodoemployeedetail').DataTable().ajax.reload();
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
  //#endregion button Update Priority

  //#region button back
  btnBack() {
    this.route.navigate(['/controlpanel/subsystodoemployeelist']);
    $('#datatable').DataTable().ajax.reload();
  }
  //#endregion button back

  //#region employee Lookup
  btnLookupemployee() {
    $('#datatableLookupemployee').DataTable().clear().destroy();
    $('#datatableLookupemployee').DataTable({
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
        this.dalservice.GetrowsSys(dtParameters, this.APIControllerSysEmployeeMain, this.APIRouteForLookup).subscribe(resp => {
          const parse = JSON.parse(resp);
          this.lookupemployee = parse.data;
          if (parse.data != null) {
            this.lookupemployee.numberIndex = dtParameters.start;
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

  btnSelectRowemployee(code: String, name: String) {
    this.model.employee_code = code;
    this.model.employee_name = name;
    $('#lookupModalemployee').modal('hide');

  }
  //#endregion employee lookup

  //#region todo Lookup
  btnLookuptodo() {
    $('#datatableLookuptodo').DataTable().clear().destroy();
    $('#datatableLookuptodo').DataTable({
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
        this.dalservice.ExecSp(dtParameters, this.APIControllerTodo, this.APIRouteForLookupEmployee).subscribe(resp => {
          const parse = JSON.parse(resp);
          this.lookuptodo = parse.data;
          if (parse.data != null) {
            this.lookuptodo.numberIndex = dtParameters.start;
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

  btnSelectRowtodo(code: String, name: String) {
    this.model.todo_code = code;
    this.model.todo_name = name;
    $('#lookupModaltodo').modal('hide');

  }
  //#endregion todo lookup

  //#region button edit
  btnEdit(codeEdit: string) {

    this.route.navigate(['/controlpanel/subsystodoemployeelist/systodoemployeedetaildetail', this.param, codeEdit]);

  }
  //#endregion button edit

  //region button add
  btnAdd() {
    this.route.navigate(['/controlpanel/subsystodoemployeelist/systodoemployeedetaildetail', this.param]);
  }
  //#endregion button add

  //#region delete table
  btnDelete() {
    this.checkedList = [];
    for (let i = 0; i < this.listsystodoemployeedetail.length; i++) {
      if (this.listsystodoemployeedetail[i].selected) {
        this.checkedList.push(this.listsystodoemployeedetail[i].id);
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
          // param tambahan untuk getrow dynamic
          this.dataTampPush.push({
            p_id: this.checkedList[J]
          });

          // end param tambahan untuk getrow dynamic
          this.dalservice.Delete(this.dataTampPush, this.APIController, this.APIRouteForDelete)
            .subscribe(
              res => {
                const parse = JSON.parse(res);
                if (parse.result === 1) {
                  if (this.checkedList.length == J + 1) {
                    this.showSpinner = false;
                    this.showNotification('bottom', 'right', 'success');
                    $('#datatablelisttodoemployeedetail').DataTable().ajax.reload();
                  }
                } else {
                  this.showSpinner = false;
                  this.swalPopUpMsg(parse.data);
                }
              },
              error => {
                this.showSpinner = false;
                const parse = JSON.parse(error);
                this.swalPopUpMsg(parse.data)
              });
        }
      } else {
        this.showSpinner = false;
      }

    });
  }

  selectAllTable() {
    for (let i = 0; i < this.listsystodoemployeedetail.length; i++) {
      this.listsystodoemployeedetail[i].selected = this.selectedAll;
    }
  }

  checkIfAllTableSelected() {
    this.selectedAll = this.listsystodoemployeedetail.every(function (item: any) {
      return item.selected === true;
    })
  }
  //#endregion checkbox all table

  //#region todo Lookup
  btnLookuptodoemployee() {
    $('#datatablelookuptodoem').DataTable().clear().destroy();
    $('#datatablelookuptodoem').DataTable({
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
          'p_employee_code': this.param,
        });
        // end param tambahan untuk getrows dynamic
        this.dalservice.ExecSp(dtParameters, this.APIControllerTodo, this.APIRouteForLookup).subscribe(resp => {
          const parse = JSON.parse(resp);
          this.lookuptodoem = parse.data;
          if (parse.data != null) {
            this.lookuptodoem.numberIndex = dtParameters.start;
          }
          // if use checkAll use this
          $('#checkallLookup').prop('checked', false);
          // end checkall

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
    });

  }
  //#endregion todo lookup

  //#region checkbox all lookup   
  btnSelectAllLookup() {
    this.checkedLookup = [];
    for (let i = 0; i < this.lookuptodoem.length; i++) {
      if (this.lookuptodoem[i].selectedLookup) {
        this.checkedLookup.push(this.lookuptodoem[i].code);
      }
    }

    // jika tidak di checklist
    if (this.checkedLookup.length === 0) {
      swal({
        title: this._listdialogconf,
        buttonsStyling: false,
        confirmButtonClass: 'btn btn-danger'
      }).catch(swal.noop)
      return
    }

    this.showSpinner = true;
    // if (result.value) {
    for (let J = 0; J < this.checkedLookup.length; J++) {
      const codeData = this.checkedLookup[J];
      this.dataTamp = [{
        'p_employee_code': this.param,
        'p_todo_code': codeData,
        'p_employee_name': this.employeename
      }];

      // end param tambahan untuk getrow dynamic
      this.dalservice.Insert(this.dataTamp, this.APIController, this.APIRouteForInsert)
        .subscribe(
          res => {
            this.showSpinner = false;
            const parse = JSON.parse(res);
            if (parse.result === 1) {
              this.showNotification('bottom', 'right', 'success');
              $('#datatablelisttodoemployeedetail').DataTable().ajax.reload();
              $('#datatablelookuptodoem').DataTable().ajax.reload();
            } else {
              this.swalPopUpMsg(parse.data);
            }
          },
          error => {
            const parse = JSON.parse(error);
            this.swalPopUpMsg(parse.data);
          })
    }
  }

  selectAllLookup() {
    for (let i = 0; i < this.lookuptodoem.length; i++) {
      this.lookuptodoem[i].selectedLookup = this.selectedAllLookup;
    }
  }

  checkIfAllLookupSelected() {
    this.selectedAllLookup = this.lookuptodoem.every(function (item: any) {
      return item.selectedLookup === true;
    })
  }
  //#endregion checkbox all table

}