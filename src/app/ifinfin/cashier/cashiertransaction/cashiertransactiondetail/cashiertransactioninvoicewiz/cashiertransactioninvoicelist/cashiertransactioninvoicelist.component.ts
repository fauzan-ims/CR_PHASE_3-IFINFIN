import { Component, OnInit, ElementRef, ViewChild, AfterViewInit, ChangeDetectorRef } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { NgForm } from '@angular/forms';
import swal from 'sweetalert2';
import { DataTableDirective } from 'angular-datatables';
import { BaseComponent } from '../../../../../../../base.component';
import { DALService } from '../../../../../../../DALservice.service';
import { DatePipe } from '@angular/common';
import { ParseSourceFile } from '@angular/compiler';
import { generate } from 'rxjs';

@Component({
    moduleId: module.id,
    selector: 'app-root',
    templateUrl: './cashiertransactioninvoicelist.component.html'
})

export class CashiertransactioninvoicelistComponent extends BaseComponent implements OnInit {
    // get param from url
    param = this.getRouteparam.snapshot.paramMap.get('id');

    // variable
    public NumberOnlyPattern = this._numberonlyformat;
    public listinvoiceData: any = [];
    public listcashiertransactioninvoice: any = [];
    public listcashiertransactioninvoiceData: any = [];
    public isReadOnly: Boolean = false;
    public isButton: Boolean = false;
    public isBreak: Boolean = false;
    public lookupinvoice: any = [];
    private dataTamp: any = [];
    private dataRoleTamp: any = [];
    private RoleAccessCode = 'R00003180000319A';

    // API Controller
    private APIController: String = 'CashierTransaction';
    private APIControllerCashierTransactionInvoice: String = 'CashierTransactionInvoice';
    private APIControllerInvoice: String = 'AgreementInvoiceLedgerMain'

    // API Function
    private APIRouteForInvoice: String = 'GetRowsForLookupInvoice';
    private APIRouteForInsertInvoice: String = 'ExecSpForInsertInvoice';
    private APIRouteForDeleteInvoice: String = 'ExecSpDeleteInvoice';
    private APIRouteForInsertInvoiceDetail: String = 'InsertInvoice';
    private APIRouteForGetRow: String = 'GetRow';
    private APIRouteForInsert: String = 'Insert';
    private APIRouteForUpdate: String = 'Update';
    private APIRouteForDelete: String = 'Delete';
    private APIRouteForGetRows: String = 'GetRows';

    // report
    private APIControllerReport: String = 'Report';
    private APIRouteForDownloadReport: String = 'getReport';

    // form 2 way binding
    model: any = {};

    // checklist
    public selectedAllTable: any;
    private checkedList: any = [];
    public selectedAllLookup: any;
    private checkedLookup: any = [];

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
        private cdRef: ChangeDetectorRef,
        private _elementRef: ElementRef, private datePipe: DatePipe
    ) { super(); }

    ngOnInit() {
        this.callGetRole(this.userId, this._elementRef, this.dalservice, this.RoleAccessCode, this.route);
        this.Delimiter(this._elementRef);
        this.loadData();
        this.callGetrow()

    }

    //#region  getrow data
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
                    const parsedata = parse.data[0];

                    if (parsedata.cashier_status !== 'HOLD') {
                        this.isButton = true;
                    } else {
                        this.isButton = false;
                    }

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
                // param tambahan untuk getrows dynamic
                dtParameters.paramTamp = [];
                dtParameters.paramTamp.push({
                    'p_cashier_transaction_code': this.param
                });
                // end param tambahan untuk getrows dynamic
                this.dalservice.Getrows(dtParameters, this.APIControllerCashierTransactionInvoice, this.APIRouteForGetRows).subscribe(resp => {
                    const parse = JSON.parse(resp)
                    this.listcashiertransactioninvoice = parse.data;
                    if (parse.data != null) {
                        this.listcashiertransactioninvoice.numberIndex = dtParameters.start;
                    }

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
        }
    }
    //#endregion load all data

    //#region Invoice Lookup
    btnlookupInvoice() {
        this.loadData();
        $('#datatableLookupInvoice').DataTable().clear().destroy();
        $('#datatableLookupInvoice').DataTable({
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
                    'default': '',
                    'p_agreement_no': this.model.agreement_no,
                    'p_array_data': JSON.stringify(this.listcashiertransactioninvoice)
                });
                // end param tambahan untuk getrows dynamic
                this.dalservice.GetrowsOpl(dtParameters, this.APIControllerInvoice, this.APIRouteForInvoice).subscribe(resp => {
                    const parse = JSON.parse(resp);
                    this.lookupinvoice = parse.data;

                    this.lookupinvoice.numberIndex = dtParameters.start;
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
    //#endregion lookup SysBranch

    //#region 
    btnAllocate() {
        // param tambahan untuk button Generate dynamic
        //insert
        this.dataRoleTamp = [{
            'p_agreement_no': this.model.agreement_no,
            'action': 'getResponse'
        }];

        //delete
        this.dataTamp = [{
            'p_cashier_transaction_code': this.param,
            'action': ''
        }];
        // param tambahan untuk button Generate dynamic
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
                this.dalservice.Delete(this.dataTamp, this.APIControllerCashierTransactionInvoice, this.APIRouteForDeleteInvoice)
                    .subscribe(
                        res => {
                            const parse = JSON.parse(res);

                            if (parse.result === 1) {
                                this.dalservice.ExecSpCore(this.dataRoleTamp, this.APIControllerInvoice, this.APIRouteForInsertInvoice)
                                    .subscribe(
                                        res => {
                                            const parse = JSON.parse(res);
                                            this.dataTamp = [];
                                            this.dataTamp = parse.data;

                                            if (parse.result === 1) {
                                                if (this.dataTamp.length > 0) {
                                                    this.listinvoiceData = [];
                                                    for (let J = 0; J < this.dataTamp.length; J++) {
                                                        this.listinvoiceData.push({
                                                            'p_cashier_transaction_code': this.param,
                                                            'p_cashier_orig_amount': this.model.cashier_orig_amount,
                                                            'p_asset_no': this.dataTamp[J].asset_no,
                                                            'p_invoice_no': this.dataTamp[J].invoice_no,
                                                            'p_customer_name': this.dataTamp[J].customer_name,
                                                            'p_invoice_date': this.dateFormatList(this.dataTamp[J].invoice_date),
                                                            'p_invoice_due_date': this.dateFormatList(this.dataTamp[J].invoice_due_date),
                                                            'p_invoice_net_amount': this.dataTamp[J].invoice_net_amount,
                                                            'p_invoice_balance_amount': this.dataTamp[J].transaction_amount,
                                                            'p_allocation_amount': this.dataTamp[J].transaction_amount,
                                                        });
                                                    }
                                                    this.dalservice.Insert(this.listinvoiceData, this.APIControllerCashierTransactionInvoice, this.APIRouteForInsertInvoiceDetail)
                                                        .subscribe(
                                                            ress => {
                                                                const parses = JSON.parse(ress);

                                                                if (parses.result === 1) {
                                                                    this.showSpinner = false;
                                                                    $('#datatableCashierTransactionInvoiceList').DataTable().ajax.reload();
                                                                    this.showNotification('bottom', 'right', 'success');
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
                                                else {
                                                    this.showSpinner = false;
                                                    this.showNotification('bottom', 'right', 'success');
                                                }

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
                this.showSpinner = false;
            }
        })
    }
    //#endregion

    //#region checkbox all table
    btnSelectAllLookup() {
        this.isBreak = false;
        this.checkedLookup = [];
        for (let i = 0; i < this.lookupinvoice.length; i++) {
            if (this.lookupinvoice[i].selectedLookup) {
                this.checkedLookup.push({
                    'asset_no': this.lookupinvoice[i].asset_no,
                    'invoice_no': this.lookupinvoice[i].invoice_no,
                    'customer_name': this.lookupinvoice[i].customer_name,
                    'invoice_date': this.lookupinvoice[i].invoice_date,
                    'invoice_due_date': this.lookupinvoice[i].invoice_due_date,
                    'invoice_net_amount': this.lookupinvoice[i].invoice_net_amount,
                    'transaction_amount': this.lookupinvoice[i].transaction_amount,
                });
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
        } else {
            this.showSpinner = true;
        }

        this.dataTamp = [];
        for (let J = 0; J < this.checkedLookup.length; J++) {
            // param tambahan untuk getrow dynamic
            this.dataTamp = [{
                'p_cashier_transaction_code': this.param,
                'p_asset_no': this.checkedLookup[J].asset_no,
                'p_invoice_no': this.checkedLookup[J].invoice_no,
                'p_customer_name': this.checkedLookup[J].customer_name,
                'p_invoice_date': this.dateFormatList(this.checkedLookup[J].invoice_date),
                'p_invoice_due_date': this.dateFormatList(this.checkedLookup[J].invoice_due_date),
                'p_invoice_net_amount': this.checkedLookup[J].invoice_net_amount,
                'p_invoice_balance_amount': this.checkedLookup[J].transaction_amount,
            }];
            // end param tambahan untuk getrow dynamic

            this.dalservice.Insert(this.dataTamp, this.APIControllerCashierTransactionInvoice, this.APIRouteForInsert)
                .subscribe(
                    res => {
                        const parse = JSON.parse(res);
                        if (parse.result === 1) {
                            if (J + 1 === this.checkedLookup.length) {
                                this.showSpinner = false;
                                $('#datatableCashierTransactionInvoiceList').DataTable().ajax.reload();
                                this.showNotification('bottom', 'right', 'success');
                                $('#datatableLookupInvoice').DataTable().ajax.reload(null, false);
                            }
                        } else {
                            this.isBreak = true;
                            this.showSpinner = false;
                            $('#datatableCashierTransactionInvoiceList').DataTable().ajax.reload();
                            $('#datatableLookupInvoice').DataTable().ajax.reload(null, false);
                            this.swalPopUpMsg(parse.data);
                        }
                    },
                    error => {
                        this.isBreak = true;
                        this.showSpinner = false;
                        const parse = JSON.parse(error);
                        this.swalPopUpMsg(parse.data);
                    })
            if (this.isBreak) {
                break;
            }
        }
    }
    selectAllLookup() {
        for (let i = 0; i < this.lookupinvoice.length; i++) {
            this.lookupinvoice[i].selectedLookup = this.selectedAllLookup;
        }
    }

    checkIfAllLookupSelected() {
        this.selectedAllLookup = this.lookupinvoice.every(function (item: any) {
            return item.selectedLookup === true;
        })
    }
    //#endregion checkbox all table

    //#region checkbox all table
    btnDeleteAll() {
        this.isBreak = false;
        this.checkedList = [];
        for (let i = 0; i < this.listcashiertransactioninvoice.length; i++) {
            if (this.listcashiertransactioninvoice[i].selectedTable) {
                this.checkedList.push({
                    'id': this.listcashiertransactioninvoice[i].id,
                });
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
                this.dataTamp = [];
                for (let J = 0; J < this.checkedList.length; J++) {
                    const idData = this.checkedList[J].id;
                    // param tambahan untuk getrow dynamic
                    this.dataTamp = [{
                        'p_id': idData,
                    }];
                    // end param tambahan untuk getrow dynamic

                    this.dalservice.Delete(this.dataTamp, this.APIControllerCashierTransactionInvoice, this.APIRouteForDelete)
                        .subscribe(
                            res => {
                                const parse = JSON.parse(res);
                                if (parse.result === 1) {
                                    if (J + 1 === this.checkedList.length) {
                                        this.showSpinner = false;
                                        this.showNotification('bottom', 'right', 'success');
                                        $('#datatableCashierTransactionInvoiceList').DataTable().ajax.reload();
                                        // this.callGetrow();
                                    }
                                } else {
                                    this.isBreak = true;
                                    this.showSpinner = false;
                                    $('#datatableCashierTransactionInvoiceList').DataTable().ajax.reload();
                                    this.swalPopUpMsg(parse.data);
                                }
                            },
                            error => {
                                this.isBreak = true;
                                this.showSpinner = false;
                                const parse = JSON.parse(error);
                                this.swalPopUpMsg(parse.data);
                            });
                    if (this.isBreak) {
                        break;
                    }
                }
            } else {
                this.showSpinner = false;
            }
        });
    }

    selectAllTable() {
        for (let i = 0; i < this.listcashiertransactioninvoice.length; i++) {
            this.listcashiertransactioninvoice[i].selectedTable = this.selectedAllTable;
        }
    }

    checkIfAllTableSelected() {
        this.selectedAllTable = this.listcashiertransactioninvoice.every(function (item: any) {
            return item.selectedTable === true;
        })
    }
    //#endregion checkbox all table

    //#region button save list
    btnSaveList() {
        this.listcashiertransactioninvoiceData = [];

        var i = 0;

        var getID = $('[name="p_id"]')
            .map(function () { return $(this).val(); }).get();

        var getAmount = $('[name="p_allocation_amount"]')
            .map(function () { return $(this).val(); }).get();

        while (i < getID.length) {

            while (i < getAmount.length) {
                this.listcashiertransactioninvoiceData.push(
                    this.JSToNumberFloats({
                        p_id: getID[i],
                        p_cashier_transaction_code: this.param,
                        p_allocation_amount: getAmount[i],
                    })
                );

                i++;

            }

            i++;
        }
        //#region web service        
        this.dalservice.Update(this.listcashiertransactioninvoiceData, this.APIControllerCashierTransactionInvoice, this.APIRouteForUpdate)
            .subscribe(
                res => {
                    const parse = JSON.parse(res);

                    if (parse.result === 1) {
                        this.showNotification('bottom', 'right', 'success');
                        $('#datatableCashierTransactionInvoiceList').DataTable().ajax.reload();
                    } else {
                        this.swalPopUpMsg(parse.data);
                    }
                },
                error => {
                    const parse = JSON.parse(error);
                    this.swalPopUpMsg(parse.data);

                });
        //#endregion web service

    }

    //#region onBlur
    onBlur(event, i, type) {
        var controlName = '#' + event.target.id;
        var controlValue = '' + event.target.value;
        this.onBlurShared(controlName, controlValue, type);
    }
    //#endregion onBlur

    //#region onFocus
    onFocus(event, i, type) {
        var controlName = '#' + event.target.id;
        var controlValue = '' + event.target.value;
        this.onFocusShared(controlName, controlValue, type);
    }
    //#endregion onFocus
    //#endregion button save list

    btnPrint(p_agreement_no: string,  rpt_code: string, report_name: string) {
        this.showSpinner = true;

        const rptParam = {
            p_user_id: this.userId,
            p_agreement_no: p_agreement_no,
            p_code: rpt_code,
            p_report_name: report_name,
            p_print_option: 'PDF'
        }

        const dataParam = {
            TableName: this.model.table_name,
            SpName: this.model.sp_name,
            reportparameters: rptParam
        };

        this.dalservice.ReportFile(dataParam, this.APIControllerReport, this.APIRouteForDownloadReport).subscribe(res => {
            this.showSpinner = false;
            this.printRptNonCore(res);
        }, err => {
            this.showSpinner = false;
            const parse = JSON.parse(err);
            this.swalPopUpMsg(parse.data);
        });
    }
}


