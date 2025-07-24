import { Component, ElementRef, OnInit } from '@angular/core';
import { BaseComponent } from '../../base.component';
import Chart from 'chart.js';
import * as HighCharts from 'highcharts';
declare var require: any
const HighchartsExporting = require('highcharts/modules/exporting');
const HighchartsExportData = require('highcharts/modules/export-data');
import { DALService } from '../../DALservice.service';
import { Router } from '@angular/router';

declare const $: any;

HighchartsExporting(HighCharts);
HighchartsExportData(HighCharts);

@Component({
  selector: 'app-dashboard',
  templateUrl: './dashboard.component.html'
})
export class DashboardComponent extends BaseComponent implements OnInit {
  private APIController: String = 'Dashboard';
  private APIControllerMasterDashboardUser: String = 'MasterDashboardUser';

  private APIRouteForGeneral: String = 'ExecSpGeneral';
  private APIRouteForDashboardAll: String = 'ExecSpDashboardAll';

  private dataTamp: any = [];
  private dataTampDasboard: any = [];
  public listDashboard: any = [];

  private RoleAccessCode = 'R00002930000000A'; // role access  
  charts: Chart;
  private colors: any = ['#058DC7', '#50B432', '#ED561B', '#DDDF00', '#24CBE5', '#64E572', '#FF9655', '#FFF263', '#6AF9C4']
  constructor(private _dalservice: DALService,
    public route: Router,
    private _elementRef: ElementRef
  ) { super(); }

  public ngOnInit() {
    this.callGetRole(this.userId, this._elementRef, this._dalservice, this.RoleAccessCode, this.route);

    HighCharts.setOptions({
      colors: ['#058DC7', '#50B432', '#ED561B', '#DDDF00', '#24CBE5', '#64E572', '#FF9655', '#FFF263', '#6AF9C4']
    });

    this.getDashboaard();
  }

  //#region get data dashboaard
  getDashboaard() {
    this.dataTamp = [{
      'p_user': this.userId,
      'action': 'getResponse'
    }]

    this._dalservice.ExecSp(this.dataTamp, this.APIControllerMasterDashboardUser, this.APIRouteForGeneral)
      .subscribe(
        res => {
          const parseDasboard = JSON.parse(res);
          if (parseDasboard.result === 1) {
            this.listDashboard = parseDasboard.data;

            for (let i = 0; i < this.listDashboard.length; i++) {
              let dashboard_name = this.listDashboard[i].dashboard_name;
              let dashboard_type = this.listDashboard[i].dashboard_type;
              let code = this.listDashboard[i].code;

              this.dataTampDasboard = [{
                'p_code': code,
                'p_user_id': this.userId,
                'action': 'getResponse'
              }]

              this._dalservice.ExecSp(this.dataTampDasboard, this.APIController, this.APIRouteForDashboardAll)
                .subscribe(
                  res => {
                    const parse = JSON.parse(res);
                    const parsedata = parse.data;

                    let labelhead = [];
                    let datadetailBar = [];

                    let dataSet = [];

                    let datadetailDrawdownData = [[]];

                    if (parsedata.length > 0) {

                      //#region create object chart
                      if (parsedata[0].percentage_total !== undefined) {

                        let charts2 = new HighCharts.Chart(code, {
                          chart: {
                            type: dashboard_type,
                          },
                          colors: [this.colors[Math.floor(Math.random() * this.colors.length)], '#c1c8bc'],
                          title: {
                            text: dashboard_name
                          },
                          subtitle: {
                            text: '',
                            verticalAlign: 'middle',
                            style: {
                              fontWeight: 'bold',
                              fontSize: '40px'
                            }
                          },

                          xAxis: {
                            categories: [],
                          },
                          tooltip: {
                            enabled: true
                          },
                          plotOptions: {
                            pie: {
                              dataLabels: {
                                enabled: false
                              },
                              borderWidth: 0,
                              showInLegend: true
                            }
                          },
                          series: []
                        });

                        this.charts = charts2;

                      }
                      else {
                        let charts = new HighCharts.Chart(code, {
                          chart: {
                            type: dashboard_type
                          },
                          title: {
                            text: dashboard_name
                          },
                          xAxis: {
                            categories: [],
                          },
                          yAxis: {
                            min: 0,
                            title: {
                              text: '<span style="color: black">Total Data</span>'
                            },
                          },
                          plotOptions: {
                            series: {
                              borderWidth: 0,
                              dataLabels: {
                                enabled: true,
                                format: '{point.y:.1f}'
                              },
                            },
                            pie: {
                              dataLabels: {
                                distance: 25,
                                color: 'black',
                                format: '<b>{point.name}</b>:<br>{point.percentage:.1f} %',
                              },
                              size: 250
                            }
                          },
                          tooltip: {
                            formatter: function () {
                              return this.points.reduce(function (s, point) {
                                var colorTool = point.color;
                                return s + '<br/>' + '<span style="color:' + colorTool + ';">' + point.series.name + '</span>' + ': ' +
                                  point.y.toFixed(2).replace(/\d(?=(\d{3})+\.)/g, '$&,');
                              }, '<b>' + this.x + '</b>');
                            },
                            shared: true,
                          },
                          credits: {
                            enabled: false
                          },
                          series: []

                        });

                        this.charts = charts;
                      }
                      //#endregion create object chart

                      //#region set data chart
                      if (parsedata[0].percentage_total !== undefined) {
                        let labelhead = [parsedata[0].used_name, parsedata[0].unused_name];
                        let datadetail = [{ name: parsedata[0].used_name, y: parsedata[0].allocated_data }, { name: parsedata[0].unused_name, y: parsedata[0].unallocated_data }];

                        dataSet = [
                          {
                            type: 'pie',
                            name: 'COUNT',
                            innerSize: '75%',
                            data: datadetail,
                          }
                        ];

                        this.charts.setTitle(null, { text: parsedata[0].percentage_total + ' %' });
                        for (var y = dataSet.length - 1; y >= 0; y--) {
                          this.charts.addSeries(dataSet[y]);
                        }
                        this.charts.xAxis[0].update({ categories: labelhead });

                      }
                      else if (parsedata[0].series_name !== undefined) {

                        let labeldata = []

                        for (let x = 0; x < parsedata.length; x++) {
                          labelhead.push(parsedata[x].reff_name);
                          if (x == 0) {
                            labeldata.push(parsedata[x].series_name)
                          }
                          else if (parsedata[x].series_name != parsedata[x - 1].series_name) {
                            labeldata.push(parsedata[x].series_name)
                          }
                        }

                        for (let a = 0; a < labeldata.length; a++) {
                          for (let j = 0; j < parsedata.length; j++) {
                            if (parsedata[j].series_name == labeldata[a]) {
                              datadetailDrawdownData[a] = datadetailDrawdownData[a] || [];
                              datadetailDrawdownData[a].push(parsedata[j].total_data);
                            }
                          }
                          dataSet[a] =
                          {
                            type: undefined,
                            name: labeldata[a],
                            data: datadetailDrawdownData[a],
                            color: this.colors[Math.floor(Math.random() * this.colors.length)] // get random color from this.colors
                          };
                        }

                        this.charts.xAxis[0].update({ categories: labelhead });
                        for (var y = dataSet.length - 1; y >= 0; y--) {
                          this.charts.addSeries(dataSet[y]);
                        }

                      }
                      else {
                        for (let j = 0; j < parsedata.length; j++) {

                          labelhead.push(parsedata[j].reff_name);
                          datadetailBar.push(
                            {
                              name: parsedata[j].reff_name,
                              y: parsedata[j].total_data
                            }
                          );

                          dataSet = [
                            {
                              name: dashboard_name,
                              data: datadetailBar,
                              color: this.colors[Math.floor(Math.random() * this.colors.length)] // get random color from this.colors
                            }
                          ];

                        }

                        this.charts.xAxis[0].update({ categories: labelhead });
                        for (var y = dataSet.length - 1; y >= 0; y--) {
                          this.charts.addSeries(dataSet[y]);
                        }

                      }
                      //#endregion set data chart
                    }
                    else {
                      let charts = new HighCharts.Chart(code, {
                        title: {
                          text: dashboard_name
                        },
                      });
                    }

                  },
                  error => {
                    console.log('There was an error while Retrieving Data(API)' + error);
                  });

            }
          }
        });
  }
  //#endregion get data dashboaard 

}
