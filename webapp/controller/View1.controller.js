sap.ui.define([
    "sap/ui/core/mvc/Controller",
    "sap/ui/model/json/JSONModel",
    "sap/ui/model/Filter",
    "sap/ui/model/FilterOperator"
], (Controller, JSONModel, Filter, FilterOperator) => {
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

            let sLgort = this._getFixedLgort(sWerks, sMatnr);
            oSearchModel.setProperty("/storageLocations", sLgort ? [
                { key: sLgort, text: sLgort }
            ] : []);
            oSearchModel.setProperty("/selectedLgort", sLgort);
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
            let sLgort = this.byId("selToLgort").getSelectedKey();

            if (sWerks) {
                aFilter.push(new Filter("Werks", FilterOperator.EQ, sWerks));
            }

            if (sLgort) {
                aFilter.push(new Filter("Lgort", FilterOperator.EQ, sLgort));
            }

            oBinding.filter(aFilter);
        }
    });
});
