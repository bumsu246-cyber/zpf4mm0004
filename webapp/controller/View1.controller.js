sap.ui.define([
    "sap/ui/core/mvc/Controller",
    "sap/ui/model/json/JSONModel",
    "sap/ui/model/Filter",
    "sap/ui/model/FilterOperator",
    "sap/m/MessageToast"
], (Controller, JSONModel, Filter, FilterOperator, MessageToast) => {
    "use strict";

    return Controller.extend("ncode.zpf4mm0004.controller.View1", {
        onInit() {
            this.getView().setModel(new JSONModel({
                selectedWerks: "1000",
                selectedLgort: "",
                plants: [
                    { key: "1000", text: "1000" },
                    { key: "2000", text: "2000" },
                    { key: "3000", text: "3000" },
                    { key: "4000", text: "4000" }
                ],
                storageLocations: []
            }), "search");

            this.getView().setModel(new JSONModel({
                items: []
            }), "request");
        },

        onMatnrChange: function () {
            this._updateStorageLocations();
        },

        onToWerksChange: function (oEvent) {
            this.getView().getModel("search").setProperty("/selectedWerks", oEvent.getSource().getSelectedKey());
            this._updateStorageLocations();
            this.onSearchStock();
        },

        _updateStorageLocations: function () {
            let sWerks = this.byId("selToWerks").getSelectedKey();
            let sMatnr = this.byId("inpMatnr").getValue().trim().toUpperCase();
            let oSearchModel = this.getView().getModel("search");

            if (sWerks === "4000") {
                oSearchModel.setProperty("/storageLocations", [
                    { key: "4100", text: "4100 - 매장(광진구)" },
                    { key: "4200", text: "4200 - 매장(용산구)" },
                    { key: "4300", text: "4300 - 매장(마포구)" },
                    { key: "4400", text: "4400 - 매장(부산광역시)" }
                ]);
                oSearchModel.setProperty("/selectedLgort", "4100");
                return;
            }

            oSearchModel.setProperty("/storageLocations", []);
            oSearchModel.setProperty("/selectedLgort", this._getFixedLgort(sWerks, sMatnr));
        },

        _getFixedLgort: function (sWerks, sMatnr) {
            let sPrefix = sMatnr.substring(0, 2);
            let sFirstPrefix = sMatnr.substring(0, 1);

            if (sWerks === "1000") {
                switch (sPrefix) {
                    case "RL":
                        return "1100";
                    case "RF":
                        return "1200";
                    case "RP":
                        return "1300";
                    case "RS":
                        return "1400";
                    case "PN":
                        return "1600";
                    default:
                        if (sFirstPrefix === "P") {
                            return "1500";
                        }
                        if (sFirstPrefix === "F") {
                            return "1700";
                        }
                }
            } else {
                if (sFirstPrefix === "F") {
                    if (sWerks === "2000") {
                        return "2300";
                    }
                    if (sWerks === "3000") {
                        return "3200";
                    }
                }

                if (sMatnr === "PN0018") {
                    return "3100";
                }
            }

            return "";
        },

        onSearchStock: function () {
            let oTableStock = this.byId("stockTable");
            let oBinding = oTableStock.getBinding("items");

            // 자재번호 검색
            let oInputMatnr = this.byId("inpMatnr");
            let InputMatnr = oInputMatnr.getValue().trim().toUpperCase();
            let aFilter = [];

            if (InputMatnr) {
                aFilter.push(new Filter("Matnr", FilterOperator.EQ, InputMatnr));
            }

            this._updateStorageLocations();

            let sWerks = this.byId("selToWerks").getSelectedKey();

            if (sWerks && sWerks !== "4000") {
                aFilter.push(new Filter("Werks", FilterOperator.NE, sWerks));
            }

            oBinding.filter(aFilter);
        },

        onAddItem: function () {
            let oStockTable = this.byId("stockTable");
            let aSelectedContexts = oStockTable.getSelectedContexts();

            if (!aSelectedContexts.length) {
                MessageToast.show("추가할 재고 항목을 선택하세요.");
                return;
            }

            this._updateStorageLocations();

            let oRequestModel = this.getView().getModel("request");
            let aItems = oRequestModel.getProperty("/items").slice();
            let sWerks = this.byId("selToWerks").getSelectedKey();
            let sLgort = this.byId("selToLgort").getSelectedKey() || this.getView().getModel("search").getProperty("/selectedLgort");

            aSelectedContexts.forEach((oContext) => {
                aItems.push(this._createRequestItem(oContext.getObject(), sWerks, sLgort));
            });

            this._setRequestItems(aItems);
            oStockTable.removeSelections(true);
        },

        _createRequestItem: function (oStock, sWerks, sLgort) {
            return {
                No: 0,
                Matnr: oStock.Matnr,
                Maktx: oStock.Maktx,
                Swerks: oStock.Werks,
                Slgort: oStock.Lgort,
                Werks: sWerks,
                Lgort: sLgort,
                Menge: "",
                Meins: oStock.Meins,
                Bktxt: ""
            };
        },

        onDeleteItem: function () {
            let oRequestTable = this.byId("requestItemTable");
            let oSelectedItem = oRequestTable.getSelectedItem();

            if (!oSelectedItem) {
                MessageToast.show("삭제할 이동요청 항목을 선택하세요.");
                return;
            }

            this._deleteRequestItem(oSelectedItem.getBindingContext("request").getPath());
        },

        onDeleteItemRow: function (oEvent) {
            this._deleteRequestItem(oEvent.getSource().getBindingContext("request").getPath());
        },

        _deleteRequestItem: function (sPath) {
            let iIndex = Number(sPath.split("/").pop());
            let aItems = this.getView().getModel("request").getProperty("/items").slice();

            aItems.splice(iIndex, 1);
            this._setRequestItems(aItems);
        },

        onDeleteAllItems: function () {
            this._setRequestItems([]);
        },

        _setRequestItems: function (aItems) {
            aItems.forEach((oItem, iIndex) => {
                oItem.No = iIndex + 1;
            });

            this.getView().getModel("request").setProperty("/items", aItems);
            this._updateRequestSummary(aItems);
        },

        _updateRequestSummary: function (aItems) {
            let iTotalQty = aItems.reduce((iSum, oItem) => iSum + (Number(oItem.Menge) || 0), 0);

            this.byId("txtItemCount").setText("총 " + aItems.length + " 건");
            this.byId("txtTotalQty").setNumber(iTotalQty);
        }
    });
});
