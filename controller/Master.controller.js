sap.ui.define([
	"sap/ui/model/json/JSONModel",
	"sap/ui/core/mvc/Controller",
	"sap/ui/model/Filter",
	"sap/ui/model/FilterOperator",
	'sap/ui/model/Sorter',
	'sap/m/MessageBox',
	'sap/f/library'
], function (JSONModel, Controller, Filter, FilterOperator, Sorter, MessageBox, fioriLibrary) {
	"use strict";

	return Controller.extend("sap.ui.demo.fiori2.controller.Master", {
		onInit: function () {
			this.getView().setModel(new JSONModel({ CurrencyCode: "NIS"}), "curr");
			var that=this;
			
			this.ordersArr=null;
			this.oJModel=new sap.ui.model.json.JSONModel();
			var sServiceUrl= this.getServiceUrl();
			var oModel=new sap.ui.model.odata.ODataModel(sServiceUrl, true);
			var oFilter=[];
			oFilter.push(new sap.ui.model.Filter('IvStatus', sap.ui.model.FilterOperator.EQ, '1'));
			oModel.read("/zgetordersbystatus3_ocaSet",{filters:oFilter,
				success:function(data){
					
					that.oJModel.setData({ordersSet : data.results});
					that.ordersArr=data.results;
					var oTable = that.getView().byId("ordersList");
					oTable.setModel(that.oJModel);
					console.log(data);
					var masLen=data.results.length.toString();
					var oViewModel = new JSONModel({masLen: masLen});
		            that.getView().setModel(oViewModel,"view1");
				} ,
				error:function(event){
					console.log('error')
				}
			})
			this.oView = this.getView();
			this._bDescendingSort = false;
			this.oTable = this.oView.byId("ordersList");
			this.oRouter = this.getOwnerComponent().getRouter();
			this.product="0";
			sap.ui.getCore().setModel(that, "this");
		},
		getServiceUrl:function (){
			return "/sap/opu/odata/sap/ZSERVICE49_OCA_SRV";
		},
		onSearch: function (oEvent) {
			var oTableSearchState = [],
				sQuery = oEvent.mParameters.query;

			if (sQuery && sQuery.length > 0) {
				oTableSearchState = [new Filter("Ordername", FilterOperator.Contains, sQuery)];
			}

			this.oTable.getBinding("items").filter(oTableSearchState, "Application");
		},

		onListItemPress: function (oEvent) {

			var productPath = oEvent.getSource().oBindingContexts.undefined.sPath;
			this.product = productPath.split("/").slice(-1).pop();
			this.oRouter.navTo("detail", {layout: fioriLibrary.LayoutType.TwoColumnsMidExpanded, product: this.ordersArr[this.product].Ordernumber});
		
			var productDetails=[];
			productDetails.push(this.ordersArr[this.product]);
			var oJModel=new sap.ui.model.json.JSONModel();
			oJModel.setData({orderTitle : productDetails});
		
			sap.ui.getCore().setModel(oJModel, "orderTitle");
			sap.ui.getCore().setModel(this.product, "product");
			}
	});
});