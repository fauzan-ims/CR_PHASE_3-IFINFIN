import { OnInit, ViewChild, Component, ElementRef } from '@angular/core';
import 'rxjs/add/operator/map'
import { Router } from '@angular/router';
import { DataTableDirective } from 'angular-datatables';
import { BaseComponent } from '../../base.component';
import { DALService } from '../../DALservice.service';
import swal from 'sweetalert2';
import { Location } from '@angular/common';
import PerfectScrollbar from 'perfect-scrollbar';

@Component({
  moduleId: module.id,
  selector: 'app-root',
  templateUrl: './todo.component.html',
})

export class TodoComponent extends BaseComponent implements OnInit {
  // variable
  public listgettodo: any = [];
  public listconsistencydetail: any = [];
  private dataTamp: any = [];
  public listmasterbenchmark: any = [];


  public codeTemp: any = [];

  public isCheck: any = [];
  public dateNow: String;
  public moduleName: String;
  public spName: String;
  private APIController: String = 'SysTodo';
  private APIControllerCalenderEmployee: String = 'SysCalenderEmployee';
  private APIRouteForGetRowsGetTodo: String = 'GetRowsGetTodo';
  private APIRouteForGetRows: String = 'GetRowsGetAllTodo';
  private APIRouteForEvent: String = 'ExecSpForEvent';
  private APIRouteForInsert: String = 'Insert';
  private APIRouteForUpdate: String = 'Update';
  private APIRouteForDelete: String = 'Delete';

  private RoleAccessCode = 'R00019410000000A'; // role access 

  // spinner
  showSpinner: Boolean = true;
  // end

  // ini buat datatables
  @ViewChild(DataTableDirective)
  dtElement: DataTableDirective;
  dtOptions: DataTables.Settings = {};

  constructor(private dalservice: DALService,
    private _location: Location,
    public route: Router,
    private _elementRef: ElementRef) { super(); }

  ngOnInit() {
    // this.compoSide(this._location, this._elementRef, this.route);
    this.callGetRole(this.userId, this._elementRef, this.dalservice, this.RoleAccessCode, this.route);
    this.isCheck = '1';
    this.loadData();
    this.callGetrow();
    this.callCalender();
    this.showSpinner = false;
  }

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
      ], // jika ingin hilangin search box nya maka false
      ajax: (dtParameters: any, callback) => {
        // param tambahan untuk getrows dynamic
        dtParameters.paramTamp = [];
        dtParameters.paramTamp.push({
          'p_user_id': this.userId,
        });

        // end param tambahan untuk getrows dynamic
        this.dalservice.Getrows(dtParameters, this.APIController, this.APIRouteForGetRowsGetTodo).subscribe(resp => {
          const parse = JSON.parse(resp);
          this.listgettodo = parse.data;

          if (parse.data != null) {
            this.listgettodo.numberIndex = dtParameters.start;
          }

          callback({
            draw: parse.draw,
            recordsTotal: parse.recordsTotal,
            recordsFiltered: parse.recordsFiltered,
            data: []
          });

        }, err => console.log('There was an error while retrieving Data(API) !!!' + err));
      },
      columnDefs: [{ orderable: false, width: '5%', targets: [0, 1, 5] }], // for disabled coloumn
      order: [[2, 'asc']],
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
      'p_user_id': this.userId,
      'action': "getResponse"
    }]
    // end param tambahan untuk getrow dynamic

    this.dalservice.ExecSp(this.dataTamp, this.APIController, this.APIRouteForGetRows)
      .subscribe(
        res => {
          const parse = JSON.parse(res)
          this.listmasterbenchmark = parse.data;
          this.codeTemp = parse.data[0].code
        },

        error => {
          console.log('There was an error while Retrieving Data(API) !!!' + error);
        });

  }
  //#endregion getrow data

  //#region Calender
  callCalender() {

    this.dataTamp = [{
      'p_employee_code': this.userId,
      'action': 'getResponse'
    }]
    // end param tambahan untuk getrow dynamic

    this.dalservice.ExecSp(this.dataTamp, this.APIControllerCalenderEmployee, this.APIRouteForEvent)
      .subscribe(
        res => {
          const parse = JSON.parse(res);
          const eventArrayTamp = [];
          const $calendar = $('#fullCalendar');

          const today = new Date();
          const y = today.getFullYear();
          const m = today.getMonth();
          const d = today.getDate();

          for (let i = 0; i < parse.data.length; i++) {

            eventArrayTamp.push({
              id: parse.data[i].id,
              title: parse.data[i].title,
              start: parse.data[i].start,
              endday: parse.data[i].endday,
              className: parse.data[i].classname,
              employeeCode: parse.data[i].employee_code
            })
          }

          var calender = this;
          var saveEventData = function (datasave) {
            calender.dalservice.Insert(datasave, calender.APIControllerCalenderEmployee, calender.APIRouteForInsert)
              .subscribe(
                res => {

                  calender.showSpinner = false;
                  const parse = JSON.parse(res);

                  if (parse.result === 1) {
                    calender.showNotification('bottom', 'right', 'success');
                    let currentUrl = calender.route.url;
                    calender.route.navigateByUrl('/', { skipLocationChange: true }).then(() => {
                      calender.route.navigate([currentUrl]);
                    });

                  } else {
                    calender.swalPopUpMsg(parse.data);
                  }
                },
                error => {
                  calender.showSpinner = false;
                  const parse = JSON.parse(error);
                  calender.swalPopUpMsg(parse.data);
                });
          }


          var deleteEventData = function (datasave) {
            // console.log(datasave._id);
            // console.log(datasave.id);

            swal({
              title: 'Delete an Event?',
              type: 'warning',
              width: 450,
              padding: 50,
              background: 'rgb(255, 255, 255)',
              showCancelButton: true,
              confirmButtonClass: 'btn btn-success',
              cancelButtonClass: 'btn btn-danger',
              confirmButtonText: 'Yes, delete it!',
              buttonsStyling: false
            }).then((result) => {
              if (result.value) {
                calender.showSpinner = true;
                if (result.value) {
                  calender.dataTamp = [{
                    'p_id': datasave._id
                  }]
                  calender.dalservice.Delete(calender.dataTamp, calender.APIControllerCalenderEmployee, calender.APIRouteForDelete)
                    .subscribe(
                      res => {
                        calender.showSpinner = false;
                        const parse = JSON.parse(res);
                        if (parse.result === 1) {

                          calender.showNotification('bottom', 'right', 'success');
                          let currentUrl = calender.route.url;
                          calender.route.navigateByUrl('/', { skipLocationChange: true }).then(() => {
                            calender.route.navigate([currentUrl]);
                          });

                        } else {
                          calender.swalPopUpMsg(parse.data)
                        }
                      },
                      error => {
                        calender.showSpinner = false;
                        const parse = JSON.parse(error);
                        calender.swalPopUpMsg(parse.data)
                      });

                }
                swal(
                  {
                    title: 'Deleted!',
                    text: 'Your Event has been deleted.',
                    type: 'success',
                    confirmButtonClass: "btn btn-success",
                    buttonsStyling: false
                  }
                )
              }
            });

          }

          $calendar.fullCalendar({
            viewRender: function (view: any, element: any) {
              // We make sure that we activate the perfect scrollbar when the view isn't on Month
              if (view.name != 'month') {
                var elem = $(element).find('.fc-scroller')[0];
                let ps = new PerfectScrollbar(elem);
              }
            },
            header: {
              left: 'prev, next, today',
              center: 'title',
              right: 'month, agendaWeek, agendaDay'

            },
            defaultDate: today,
            selectable: true,
            selectHelper: true,
            views: {
              month: { // name of view
                titleFormat: 'MMMM YYYY'
                // other view-specific options here
              },
              week: {
                titleFormat: 'MMMM D YYYY'
              },
              day: {
                titleFormat: 'D MMM, YYYY'
              }
            },

            // var calender = this;
            select: function (start: any, endday: any) {
              let eventData;
              let datasave = [];

              // on select we show the Sweet Alert modal with an input

              swal({
                title: 'Create an Event',
                type: 'question',
                html: '<div class="form-group">' +
                  '<input class="form-control" placeholder="Event Title" id="input-field">' + '<br>' +
                  '<select class="form-control" id="input-kategori">' +
                  '<option value="event-blue">Low</option>' +
                  '<option value="event-orange">Medium</option>' +
                  '<option value="event-red">High</option>' +
                  '</select>' +
                  '</div>',
                showCancelButton: true,
                confirmButtonClass: 'btn btn-success',
                cancelButtonClass: 'btn btn-danger',
                buttonsStyling: false
              }).then((result) => {
                if (result.value) {


                  const event_title = $('#input-field').val();
                  const event_kategori = $('#input-kategori').val();
                  const id = $('#input-field').val();
                  // 'p_employee_code' : '' 

                  // let data;
                  if (event_title) {
                    datasave.push({
                      'p_id': id,
                      'p_title': event_title,
                      'p_start': start,
                      'p_endday': endday,
                      'p_className': event_kategori,
                      'p_employee_code': calender.userId


                    });

                    eventData = {
                      title: event_title,
                      start: start,
                      endday: endday,

                    };

                    saveEventData(datasave);

                    $calendar.fullCalendar('renderEvent', eventData, true); // stick? = true
                  }

                  $calendar.fullCalendar('unselect');

                }

              })
              // this.savedata('123')

            },

            editable: true,
            eventLimit: true, // allow "more" link when too many events

            events: eventArrayTamp,

            eventClick(events) {
              deleteEventData(events);


            },

          });
          this.showSpinner = false;
        },
        error => {
          console.log('There was an error while Retrieving Data(API) !!!' + error);
        });
  }
  //#endregion Calender

  btnLow(Low: string) {

    this.showSpinner = true;
    // this.route.navigate([terima]);
    this.route.navigate([Low]);
    // this.showSpinner = false;
  }

  btnHigh(High: string) {
    this.showSpinner = true;
    this.route.navigate([High]);
  }

  btnMedium(Medium: string) {
    this.showSpinner = true;

    this.route.navigate([Medium]);
  }
}
