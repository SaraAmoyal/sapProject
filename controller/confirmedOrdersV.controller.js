sap.ui.define([
	"sap/ui/model/json/JSONModel",
	"sap/ui/core/mvc/Controller",
], function (JSONModel, Controller) {
	"use strict";

	return Controller.extend("sap.ui.demo.fiori2.controller.confirmedOrdersV", {
			onInit: function () {
				var that=this;
				var sServiceUrl= this.getServiceUrl();
				var oModel=new sap.ui.model.odata.ODataModel(sServiceUrl, true);
				var oFilter=[];
				oFilter.push(new sap.ui.model.Filter('IvStatus', sap.ui.model.FilterOperator.EQ, '2'));
				oModel.read("/zgetordersbystatus3_ocaSet",{filters:oFilter,
					success:function(data){
						var oJModel=new sap.ui.model.json.JSONModel();
						oJModel.setData({ordersSet : data.results});
						var oTable=that.getView().byId("idOrdersTable");
						oTable.setModel(oJModel);
						var conLen=data.results.length.toString();
						var oViewModel = new JSONModel({conLen: conLen});
			            that.getView().setModel(oViewModel,"view1");
					} ,
					error:function(event){
						console.log('error')
					}
				})
			},
			getServiceUrl:function (){
				return "/sap/opu/odata/sap/ZSERVICE49_OCA_SRV";
			},
			onAfterRendering: function () {
				console.log("onAfterRendering of fragment will not call.");
			},
			constructor: function(oArg){
				this.onInit();
			}
	});
});