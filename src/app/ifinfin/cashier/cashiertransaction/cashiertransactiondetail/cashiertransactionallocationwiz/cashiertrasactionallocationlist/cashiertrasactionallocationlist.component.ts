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
    templateUrl: './cashiertrasactionallocationlist.component.html'
})

export class CashiertransactionallocationlistComponent extends BaseComponent implements OnInit {
    // get param from url
    param = this.getRouteparam.snapshot.paramMap.get('id');

    // variable
    public NumberOnlyPattern = this._numberonlyformat;
    public listcashiertransactionallocation: any = [];
    public listcashiertransactionallocationData: any = [];
    public cashiertransactionallocationData: any = [];
    public isReadOnly: Boolean = false;
    public isButton: Boolean = false;
    public isCash: Boolean = false;
    public isCurrency: Boolean = false;
    public isrowCount: Boolean = false;
    public isSuspend: Boolean = false;
    public isAmount: Boolean = false;
    public isSave: Boolean = false;
    public isLabel: Boolean = true;
    public isAgreement: Boolean = false;
    public isBreak: Boolean = false;
    public is_received_request: Boolean;
    public lookupbranch: any = [];
    public lookupcollector: any = [];
    public lookupcashierreceivedrequest: any = [];
    public lookupagreement: any = [];
    public lookupcashier: any = [];
    public lookupJurnalGlLink: any = [];
    public lookupbank: any = [];
    public lookuppdccode: any = [];
    public lookupreceiptmain: any = [];
    private exch_rate: any = [];
    public cashier_orig_amount: any;
    public cashier_exch_rate: any;
    public agreement_exch_rate: any;
    public cashier_base_amount: any;
    public deposit_used_amount: any;
    public cashier_type: any;
    public agreementno: any;
    public valDate: any;
    private dataTamp: any = [];
    private dataTampDetail: any = [];
    private CashierTransactionID: any;
    private RoleAccessCode = 'R00003180000319A';

    // API Controller
    private APIController: String = 'CashierTransaction';
    private APIControllerDepositMain: String = 'AgreementDeposit';
    private APIControllerCashierReceivedRequest: String = 'CashierReceivedRequest';
    private APIControllerCashierTransactionDetail: String = 'CashierTransactionDetail';
    private APIControllerCashierMain: String = 'CashierMain';
    private APIControllerSysCurrencyRate: String = 'SysCurrencyRate';

    // API Function
    private APIRouteForGetRow: String = 'GetRow';
    private APIRouteForGetRows: String = 'GetRows';
    private APIRouteForCashierReceivedRequestLookup: String = 'GetRowsForCashierTransactionDetailLookup';
    private APIRouteForGetRowByAgreement: String = 'GetRowByAgreement';
    private APIRouteForGetRowForTopRate: String = 'ExecSpTopRate';
    private APIRouteForGetRowByEmployeeCode: String = 'GetRowByEmployeeCode';
    private APIRouteForGetRowsLookupForAgreement: String = 'GetRowsLookupForAgreement';
    private APIRouteForInsert: String = 'Insert';
    private APIRouteForUpdate: String = 'Update';
    private APIRouteForUpdateAgreementNo: String = 'UpdateAgreementNo';
    private APIRouteForDelete: String = 'Delete';

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
        this.compoSide('', this._elementRef, this.route);
        this.Delimiter(this._elementRef);
        this.loadData();
        this.callGetrow();
        this.model.is_received_request = '0';
        this.is_received_request = false;
        this.showSpinner = false;

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

                    this.valDate = parsedata.cashier_value_date;
                    const ngbGetrow = this.getrowNgb(parse.data[0]);

                    if (this.isSave) {
                        if (this.cashier_orig_amount === parsedata.cashier_orig_amount) {
                            this.isLabel = true;
                        } else {
                            this.isLabel = false;
                        }
                    }

                    this.agreementno = parsedata.agreement_no;
                    this.cashier_type = parsedata.cashier_type;

                    if (parsedata.rows_count !== 0 && parsedata.is_received_request === '1') {
                        this.isrowCount = true;
                    } else {
                        this.isrowCount = false;
                    }

                    if (parsedata.cashier_status !== 'HOLD') {
                        this.isButton = true;
                    } else {
                        this.isButton = false;
                    }

                    //-- Louis Kamis, 26 Juni 2025 11.49.15 -- 
                    // if (parsedata.agreement_no == null || parsedata.agreement_no === '') {
                    //     this.isSuspend = true;
                    // } else {
                    //     this.isSuspend = false;
                    // }

                    if (parsedata.client_no == null || parsedata.client_no === '') {
                        this.isSuspend = true;
                    } else {
                        this.isSuspend = false;
                    }
                    //-- Louis Kamis, 26 Juni 2025 11.49.15 -- 

                    // checkbox is_use_deposit
                    if (parsedata.is_use_deposit === '1') {
                        parsedata.is_use_deposit = true;
                    } else {
                        parsedata.is_use_deposit = false;
                    }
                    // end checkbox is_use_deposit

                    // checkbox
                    if (parsedata.is_received_request === '0') {
                        this.is_received_request = true;
                        //parsedata.is_received_request = true;
                    } else {
                        this.is_received_request = false;
                        // parsedata.is_received_request = false;
                    }
                    // end checkbox

                    this.cashier_orig_amount = parsedata.cashier_orig_amount;
                    this.cashier_exch_rate = parsedata.cashier_exch_rate;
                    this.cashier_base_amount = parsedata.cashier_base_amount;
                    this.deposit_used_amount = parsedata.deposit_used_amount;
                    this.isReadOnly = true;

                    // mapper dbtoui
                    Object.assign(this.model, ngbGetrow);
                    // end mapper dbtoui

                    // this.callGetrowTopRate(this.model.cashier_currency_code, this.valDate, false, false) //cashier rate
                    // this.callGetrowTopRate(this.model.currency_code, this.valDate, false, true) //set agreement rate

                    this.showSpinner = false;
                },
                error => {
                    console.log('There was an error while Retrieving Data(API) !!!' + error);
                });
    }
    //#endregion  getrow data

    //#region ddl receivedType
    receivedType(event: any) {
        this.model.is_received_request = event.target.value;

        if (this.model.is_received_request === '1') {
            this.is_received_request = true;
            this.isAgreement = false;

        } else {
            this.is_received_request = false;
        }
    }
    //#endregion ddl receivedType

    //#region OnPaid
    OnPaid(event, index: any) {

        var getAmount = $('[name="p_innitial_amount"]')
            .map(function () { return $(this).val(); }).get();

        var getRate = $('[name="p_exch_rate"]')
            .map(function () { return $(this).val(); }).get();

        var getIsPaid = $('[name="p_is_paid"]')
            .map(function () { return $(this).prop('checked'); }).get();

        if (getIsPaid[index]) {
            event = getAmount[index] * getRate[index];
        } else {
            event = 0;
        }
        event = parseFloat(event).toFixed(2);
        event = event.replace(/(\d)(?=(\d\d\d)+(?!\d))/g, '$1,');
        $('#base_amount' + index)
            .map(function () { return $(this).val(event); }).get();

    }
    //#endregion OnPaid

    //#region load all data
    loadData() {
        this.dtOptions = {
            pagingType: 'full_numbers',
            responsive: true,
            serverSide: true,
            processing: true,
            lengthChange: false, // hide lengthmenu
            paging: true,
            'lengthMenu': [
                [500],
                [500]
            ],
            ajax: (dtParameters: any, callback) => {
                // param tambahan untuk getrows dynamic
                dtParameters.paramTamp = [];
                dtParameters.paramTamp.push({
                    'p_cashier_transaction_code': this.param
                });
                // end param tambahan untuk getrows dynamic
                this.dalservice.Getrows(dtParameters, this.APIControllerCashierTransactionDetail, this.APIRouteForGetRows).subscribe(resp => {
                    const parse = JSON.parse(resp)
                    for (let i = 0; i < parse.data.length; i++) {
                        if (parse.data[i].is_paid === '1') {
                            parse.data[i].is_paid = true;
                        } else {
                            parse.data[i].is_paid = false;
                        }

                        if (parse.data[i].is_module === '1') {
                            parse.data[i].is_module = true;
                            if (parse.data[i].is_partial === '1') {
                                parse.data[i].is_partial = false;
                                parse.data[i].is_module = false;
                            } else {
                                parse.data[i].is_partial = true;
                            }
                        } else {
                            parse.data[i].is_module = false;
                            parse.data[i].is_partial = false;
                        }
                    }
                    this.listcashiertransactionallocation = parse.data;
                    if (parse.data != null) {
                        this.listcashiertransactionallocation.numberIndex = dtParameters.start;
                    }

                    // if use checkAll use this
                    $('#checkalltable').prop('checked', false);
                    // end checkall

                    callback({
                        draw: parse.draw,
                        recordsTotal: parse.recordsTotal,
                        recordsFiltered: parse.recordsFiltered,
                        data: []
                    });
                }, err => console.log('There was an error while retrieving Data(API) !!!' + err));
            },
            columnDefs: [{ orderable: false, width: '5%', targets: [0, 1, 8] }], // for disabled coloumn
            // order: [['1', 'asc']],
            language: {
                search: '_INPUT_',
                searchPlaceholder: 'Search records',
                infoEmpty: '<p style="color:red;" > No Data Available !</p> '
            },
            searchDelay: 800 // pake ini supaya gak bug search
        }
    }
    //#endregion load all data

    //#region  getrow data by user
    callGetrowByUser() {
        // param tambahan untuk getrow dynamic
        this.dataTamp = [{
            'p_employee_code': this.userId,
        }];
        // end param tambahan untuk getrow dynamic
        this.dalservice.Getrow(this.dataTamp, this.APIControllerCashierMain, this.APIRouteForGetRowByEmployeeCode)
            .subscribe(
                res => {
                    const parse = JSON.parse(res);
                    const parsedata = this.getrowNgb(parse.data[0]);

                    this.model.cashier_main_code = parsedata.code
                    this.model.cashier_name = parsedata.employee_name
                    this.model.branch_code = parsedata.branch_code
                    this.model.branch_name = parsedata.branch_name
                    this.model.cashier_trx_date = parsedata.cashier_open_date

                },
                error => {
                    console.log('There was an error while Retrieving Data(API) !!!' + error);
                });
    }
    //#endregion  getrow data by user

    //#region  getrow data deposit by agreement
    callGetrowDeposit(agreement: any, currency: any) {
        // param tambahan untuk getrow dynamic
        this.dataTamp = [{
            'p_agreement_no': agreement,
            'p_currency_code': currency,
        }];
        // end param tambahan untuk getrow dynamic
        this.dalservice.GetrowsOpl(this.dataTamp, this.APIControllerDepositMain, this.APIRouteForGetRowByAgreement)
            .subscribe(
                res => {
                    const parse = JSON.parse(res);
                    const parsedata = parse.data[0];

                    this.model.deposit_code = parsedata.code
                    this.model.deposit_amount = parsedata.deposit_amount

                },
                error => {
                    console.log('There was an error while Retrieving Data(API) !!!' + error);
                });
    }
    //#endregion  getrow data deposit by agreement

    //#region  getrow data rate
    callGetrowTopRate(currency: any, date: Date, index: any) {
        // param tambahan untuk getrow dynamic
        this.dataTamp = [{
            'p_currency_code': currency,
            'p_date': date,
            'action': 'getResponse'
        }];

        // end param tambahan untuk getrow dynamic
        this.dalservice.ExecSpSys(this.dataTamp, this.APIControllerSysCurrencyRate, this.APIRouteForGetRowForTopRate)
            .subscribe(
                res => {
                    const parse = JSON.parse(res);
                    const parsedata = parse.data[0];
                    this.exch_rate.splice(index, 0, {
                        'rate': parsedata.exch_rate
                    })
                },
                error => {
                    console.log('There was an error while Retrieving Data(API) !!!' + error);
                });
    }
    // callGetrowTopRate(currency: any, date: any, change: Boolean, agreement: Boolean) {
    //     // param tambahan untuk getrow dynamic
    //     this.dataTamp = [this.JSToNumberFloats({
    //         'p_currency_code': currency,
    //         'p_date': date,
    //         'action': 'getResponse'
    //     })];
    //     // end param tambahan untuk getrow dynamic

    //     this.dalservice.ExecSpSys(this.dataTamp, this.APIControllerSysCurrencyRate, this.APIRouteForGetRowForTopRate)
    //         .subscribe(
    //             res => {
    //                 const parse = JSON.parse(res);
    //                 const parsedata = parse.data[0];

    //                 if (agreement) {
    //                     this.agreement_exch_rate = parsedata.exch_rate
    //                 } else {
    //                     if (parsedata.code === currency) {
    //                         this.isCurrency = true;
    //                     } else {
    //                         this.isCurrency = false;
    //                     }

    //                     if (change) {
    //                         this.model.cashier_exch_rate = parsedata.exch_rate
    //                         this.cashier_exch_rate = parsedata.exch_rate
    //                         if (this.model.is_received_request === '1') {
    //                             this.model.cashier_orig_amount = (this.model.cashier_base_amount / parsedata.exch_rate);
    //                         } else {
    //                             this.model.cashier_base_amount = (parsedata.exch_rate * this.cashier_orig_amount);
    //                         }
    //                     }

    //                 }
    //             },
    //             error => {
    //                 console.log('There was an error while Retrieving Data(API) !!!' + error);
    //             });
    // }
    //#endregion  getrow data rate

    //#region exchRate
    exchRate(event: any) {
        if (this.model.is_received_request === '1') {
            this.model.received_amount = this.cashier_base_amount / event;
            this.model.cashier_orig_amount = (this.model.received_amount * 1) - (this.deposit_used_amount * 1);
        } else {
            this.model.cashier_base_amount = (event * this.model.received_amount);
        }
        // this.model.cashier_exch_rate = event;
        // console.log(this.model.cashier_exch_rate);

        this.cashier_exch_rate = event;
        // return event;
    }
    //#endregion exchRate

    //#region lookup cashier received request
    btnlookupCashiesrReceivedRequest() {
        $('#datatableLookupCashiesrReceivedRequest').DataTable().clear().destroy();
        $('#datatableLookupCashiesrReceivedRequest').DataTable({
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
                    'p_branch_code': 'ALL', // this.model.branch_code,
                    'p_agreement_no': this.model.agreement_no,
                    'p_client_no': this.model.client_no,
                    'p_request_currency_code': this.model.currency_code,
                    'p_cashier_transaction_code': this.param,
                });
                // end param tambahan untuk getrows dynamic

                this.dalservice.Getrows(dtParameters, this.APIControllerCashierReceivedRequest, this.APIRouteForCashierReceivedRequestLookup).subscribe(resp => {
                    const parse = JSON.parse(resp);
                    this.exch_rate = [];
                    for (let i = 0; i < parse.data.length; i++) {
                        this.callGetrowTopRate(parse.data[i].request_currency_code, this.valDate, i)
                    }

                    // if use checkAll use this
                    $('#checkallLookup').prop('checked', false);
                    // end checkall
                    this.lookupcashierreceivedrequest = parse.data;
                    this.callGetrow();
                    if (parse.data != null) {
                        this.lookupcashierreceivedrequest.numberIndex = dtParameters.start;
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
        });
    }
    //#endregion lookup cashier received request

    //#region btnSelectAllLookup
    btnSelectAllLookup() {
        this.isBreak = false;
        this.checkedLookup = [];
        for (let i = 0; i < this.lookupcashierreceivedrequest.length; i++) {
            if (this.lookupcashierreceivedrequest[i].selectedLookup) {
                this.checkedLookup.push({
                    'code': this.lookupcashierreceivedrequest[i].code,
                    'amount': this.lookupcashierreceivedrequest[i].request_amount,
                    'currency': this.lookupcashierreceivedrequest[i].request_currency_code,
                    'remarks': this.lookupcashierreceivedrequest[i].request_remarks,
                    'agreement_no': this.lookupcashierreceivedrequest[i].agreement_no,
                    'rate': this.exch_rate[i].rate,
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

        this.dataTampDetail = [];
        for (let J = 0; J < this.checkedLookup.length; J++) {
            // if (this.model.agreement_no == null) {
            //     this.callGetrowTopRate(this.checkedLookup[J].currency, this.valDate, false, true)
            // }
            const codeData = this.checkedLookup[J].code;
            const amountData = this.checkedLookup[J].amount;
            const remarksData = this.checkedLookup[J].remarks;
            const currencyData = this.checkedLookup[J].currency;
            const currencyrate = this.checkedLookup[J].rate;
            const agreement_no = this.checkedLookup[J].agreement_no;
            // param tambahan untuk getrow dynamic
            this.dataTampDetail = [{
                'p_cashier_transaction_code': this.param,
                'p_received_request_code': codeData,
                'p_is_paid': true,
                'p_innitial_amount': amountData,
                'p_orig_amount': amountData,
                'p_orig_currency_code': currencyData,
                'p_exch_rate': currencyrate,
                'p_base_amount': amountData * currencyrate,
                'p_remarks': remarksData,
                'p_agreement_no': agreement_no
            }];
            // end param tambahan untuk getrow dynamic
            this.dalservice.Insert(this.dataTampDetail, this.APIControllerCashierTransactionDetail, this.APIRouteForInsert)
                .subscribe(
                    res => {
                        const parse = JSON.parse(res);
                        if (parse.result === 1) {
                            if (J + 1 === this.checkedLookup.length) {
                                this.showSpinner = false;
                                this.showNotification('bottom', 'right', 'success');
                                $('#datatableCashierTransactionAllocationList').DataTable().ajax.reload();
                                $('#reloadcashierdetail').click();
                                $('#datatableLookupCashiesrReceivedRequest').DataTable().ajax.reload();
                                // this.callGetrow();
                            }
                        } else {
                            this.isBreak = true;
                            this.showSpinner = false;
                            $('#datatableCashierTransactionAllocationList').DataTable().ajax.reload();
                            $('#reloadcashierdetail').click();
                            $('#datatableLookupCashiesrReceivedRequest').DataTable().ajax.reload();
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
        for (let i = 0; i < this.lookupcashierreceivedrequest.length; i++) {
            this.lookupcashierreceivedrequest[i].selectedLookup = this.selectedAllLookup;
        }
    }

    checkIfAllLookupSelected() {
        this.selectedAllLookup = this.lookupcashierreceivedrequest.every(function (item: any) {
            return item.selectedLookup === true;
        })
    }
    //#endregion btnSelectAllLookup

    //#region btnDeleteAll
    btnDeleteAll() {
        this.isBreak = false;
        this.checkedList = [];
        for (let i = 0; i < this.listcashiertransactionallocation.length; i++) {
            if (this.listcashiertransactionallocation[i].selectedTable) {
                this.checkedList.push(this.listcashiertransactionallocation[i].id);
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
                let th = this;
                var i = 0;
                (function loopDeliveryRequestProceed() {
                    if (i < th.checkedList.length) {
                        th.dataTamp = [{
                            'p_id': th.checkedList[i]
                        }];
                        th.dalservice.Delete(th.dataTamp, th.APIControllerCashierTransactionDetail, th.APIRouteForDelete)
                            .subscribe(
                                res => {
                                    const parse = JSON.parse(res);
                                    if (parse.result === 1) {
                                        if (th.checkedList.length == i + 1) {
                                            $('#reloadcashierdetail').click();
                                            th.showNotification('bottom', 'right', 'success');
                                            $('#datatableCashierTransactionAllocationList').DataTable().ajax.reload();
                                            th.showSpinner = false;
                                        } else {
                                            i++;
                                            loopDeliveryRequestProceed();
                                        }
                                    } else {
                                        this.isBreak = true;
                                        th.swalPopUpMsg(parse.data);
                                        th.showSpinner = false;
                                    }
                                },
                                error => {
                                    this.isBreak = true;
                                    const parse = JSON.parse(error);
                                    th.swalPopUpMsg(parse.data);
                                    th.showSpinner = false;
                                });
                    }
                })();
            } else {
                this.showSpinner = false;
            }
        });
    }

    selectAllTable() {
        for (let i = 0; i < this.listcashiertransactionallocation.length; i++) {
            this.listcashiertransactionallocation[i].selectedTable = this.selectedAllTable;
        }
    }

    checkIfAllTableSelected() {
        this.selectedAllTable = this.listcashiertransactionallocation.every(function (item: any) {
            return item.selectedTable === true;
        })
    }
    //#endregion btnDeleteAll

    //#region button save list
    btnSaveList() {

        this.showSpinner = true;
        this.isSave = true;
        this.listcashiertransactionallocationData = [];

        var i = 0;

        var getID = $('[name="p_id"]')
            .map(function () { return $(this).val(); }).get();

        var getAmount = $('[name="p_base_amount"]')
            .map(function () { return $(this).val(); }).get();

        var getIsPaid = $('[name="p_is_paid"]')
            .map(function () { return $(this).prop('checked'); }).get();

        while (i < getID.length) {

            while (i < getAmount.length) {

                while (i < getIsPaid.length) {
                    this.listcashiertransactionallocationData.push(
                        this.JSToNumberFloats({
                            p_id: getID[i],
                            p_cashier_transaction_code: this.param,
                            p_base_amount: getAmount[i],
                            p_is_paid: getIsPaid[i]
                        })
                    );

                    i++;
                }
                i++;
            }

            i++;
        }

        //#region web service
        this.dalservice.Update(this.listcashiertransactionallocationData, this.APIControllerCashierTransactionDetail, this.APIRouteForUpdate)
            .subscribe(
                res => {
                    const parse = JSON.parse(res);

                    if (parse.result === 1) {
                        this.showNotification('bottom', 'right', 'success');
                        $('#datatableCashierTransactionAllocationList').DataTable().ajax.reload();
                        $('#reloadcashierdetail').click();
                        this.showSpinner = false;
                        // this.callGetrow();
                    } else {
                        this.swalPopUpMsg(parse.data);
                        this.showSpinner = false;
                    }
                },
                error => {
                    const parse = JSON.parse(error);
                    this.swalPopUpMsg(parse.data);
                    this.showSpinner = false;
                });
        //#endregion web service

    }

    //#region onBlur
    onBlur(event, i, type) {
        var getRate = $('[name="p_exch_rate"]')
            .map(function () { return $(this).val(); }).get();

        var getAmount = $('[name="p_innitial_amount"]')
            .map(function () { return $(this).val(); }).get();
        var innitial_amount = getAmount[i] * getRate[i];

        var eventTemp;

        if (type === 'amount') {
            if (event.target.value.match('[0-9]+(,[0-9]+)')) {
                if (event.target.value.match('(\.\d+)')) {

                    event = '' + event.target.value;
                    event = event.trim();
                    eventTemp = ~~event;
                    event = event.replace(/(\d)(?=(\d\d\d)+(?!\d))/g, '$1,');
                } else {
                    event = '' + event.target.value;
                    event = event.trim();
                    eventTemp = ~~event.replace(/[ ]*,[ ]*|[ ]+/g, '');
                    event = parseFloat(event.replace(/,/g, '')).toFixed(2); // ganti jadi 6 kalo mau pct
                    event = event.replace(/(\d)(?=(\d\d\d)+(?!\d))/g, '$1,');
                }
            } else {
                event = '' + event.target.value;
                event = event.trim();
                eventTemp = ~~event;
                event = parseFloat(event).toFixed(2); // ganti jadi 6 kalo mau pct
                event = event.replace(/(\d)(?=(\d\d\d)+(?!\d))/g, '$1,');
            }

            // event = '' + event.target.value;
            // event = event.trim();
            if (eventTemp > 0) {
                if (eventTemp <= innitial_amount) {
                    $('#is_paid' + i)
                        .map(function () { return $(this).prop('checked', true); }).get();
                } else if (innitial_amount == 0) {
                    $('#is_paid' + i)
                        .map(function () { return $(this).prop('checked', true); }).get();
                } else {
                    $('#is_paid' + i)
                        .map(function () { return $(this).prop('checked', false); }).get();
                }
            } else {
                $('#is_paid' + i)
                    .map(function () { return $(this).prop('checked', false); }).get();
            }

            // event = parseFloat(event).toFixed(2); // ganti jadi 6 kalo mau pct
            // event = event.replace(/(\d)(?=(\d\d\d)+(?!\d))/g, '$1,');
        } else {
            event = '' + event.target.value;
            event = event.trim();
            event = parseFloat(event).toFixed(6);
        }

        if (event === 'NaN') {
            event = 0;
            event = parseFloat(event).toFixed(2);
        }

        if (type === 'amount') {
            $('#base_amount' + i)
                .map(function () { return $(this).val(event); }).get();
        } else {
            $('#base_amount' + i)
                .map(function () { return $(this).val(event); }).get();
        }
    }
    //#endregion onBlur

    //#region onFocus
    onFocus(event, i, type) {
        event = '' + event.target.value;

        if (event != null) {
            event = event.replace(/[ ]*,[ ]*|[ ]+/g, '');
        }

        if (type === 'amount') {
            $('#base_amount' + i)
                .map(function () { return $(this).val(event); }).get();
        } else {
            $('#base_amount' + i)
                .map(function () { return $(this).val(event); }).get();
        }
    }
    //#endregion onFocus
    //#endregion button save list

    //#region Lookup Agreement
    // btnLookupAgreement() {
    //     $('#datatableLookupAgreement').DataTable().clear().destroy();
    //     $('#datatableLookupAgreement').DataTable({
    //         'pagingType': 'first_last_numbers',
    //         'pageLength': 5,
    //         'processing': true,
    //         'serverSide': true,
    //         responsive: true,
    //         lengthChange: false, // hide lengthmenu
    //         searching: true, // jika ingin hilangin search box nya maka false
    //         ajax: (dtParameters: any, callback) => {
    //             // param tambahan untuk getrows dynamic
    //             dtParameters.paramTamp = [];
    //             dtParameters.paramTamp.push({
    //                 'p_cashier_transaction_code': this.param
    //             });
    //             // end param tambahan untuk getrows dynamic
    //             this.dalservice.Getrows(dtParameters, this.APIControllerCashierTransactionDetail, this.APIRouteForGetRowsLookupForAgreement).subscribe(resp => {
    //                 const parse = JSON.parse(resp);
    //                 this.lookupagreement = parse.data;
    //                 if (parse.data != null) {
    //                     this.lookupagreement.numberIndex = dtParameters.start;
    //                 }

    //                 callback({
    //                     draw: parse.draw,
    //                     recordsTotal: parse.recordsTotal,
    //                     recordsFiltered: parse.recordsFiltered,
    //                     data: []
    //                 });
    //             }, err => console.log('There was an error while retrieving Data(API) !!!' + err));
    //         },
    //         columnDefs: [{ orderable: false, width: '5%', targets: [0, 1, 5] }],
    //         language: {
    //             search: '_INPUT_',
    //             searchPlaceholder: 'Search records',
    //             infoEmpty: '<p style="color:red;" > No Data Available !</p> '
    //         },
    //         searchDelay: 800 // pake ini supaya gak bug search
    //     });
    // }

    // btnSelectRowAgreement(agreement_no: String) {
    //     this.model.agreement_no = agreement_no;
    //     $('#datatableLookupAgreement').modal('hide');
    // }
    //#endregion Lookup Agreement


    //#region Agreement
    btnLookupAgreement(id: any) {
        this.CashierTransactionID = id;
        $('#datatableLookupAgreement').DataTable().clear().destroy();
        $('#datatableLookupAgreement').DataTable({
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
                    'p_cashier_transaction_code': this.param
                });

                this.dalservice.Getrows(dtParameters, this.APIControllerCashierTransactionDetail, this.APIRouteForGetRowsLookupForAgreement).subscribe(resp => {
                    const parse = JSON.parse(resp);
                    this.lookupagreement = parse.data;
                    if (parse.data != null) {
                        this.lookupagreement.numberIndex = dtParameters.start;

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
    }

    btnSelectRowAgreement(agreement_no: String) {
        this.model.agreement_no = agreement_no;
        var tempDataToUpdate = [];
        tempDataToUpdate.push(
            this.JSToNumberFloats({
                p_id: this.CashierTransactionID,
                p_agreement_no: agreement_no
            })
        );

        this.dalservice.Update(tempDataToUpdate, this.APIControllerCashierTransactionDetail, this.APIRouteForUpdateAgreementNo)
            .subscribe(
                res => {
                    const parse = JSON.parse(res);
                    if (parse.result === 1) {
                        this.showNotification('bottom', 'right', 'success');
                    } else {
                        this.swalPopUpMsg(parse.data);
                    }
                    $('#datatableCashierTransactionAllocationList').DataTable().ajax.reload();
                },
                error => {
                    const parse = JSON.parse(error);
                    this.swalPopUpMsg(parse.data);

                });
        this.CashierTransactionID = undefined;
        $('#lookupModalAgreement').modal('hide');
    }
    //#endregion Agreement
}


