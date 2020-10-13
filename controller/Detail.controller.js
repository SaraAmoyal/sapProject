sap.ui.define([
	"sap/ui/model/json/JSONModel",
	"sap/ui/core/mvc/Controller",
	"sap/m/MessageToast"
], function (JSONModel, Controller, MessageToast) {
	"use strict";

	return Controller.extend("sap.ui.demo.fiori2.controller.Detail", {
		onInit: function () {
			var oOwnerComponent = this.getOwnerComponent();

			this.oRouter = oOwnerComponent.getRouter();
			this.oModel = oOwnerComponent.getModel();

			this.oRouter.getRoute("master").attachPatternMatched(this._onProductMatched, this);
			this.oRouter.getRoute("detail").attachPatternMatched(this._onProductMatched, this);
			
		},

		_onProductMatched: function (oEvent) {
			var that =this;
			var orderTitle=sap.ui.getCore().getModel("orderTitle");
			if(orderTitle)
			{
				var orderTitle=sap.ui.getCore().getModel("orderTitle").oData.orderTitle[0];
				var orderNumber=orderTitle.Ordernumber;
				var oJModel=new sap.ui.model.json.JSONModel();
				oJModel.setData({titleLine : orderNumber});
				var oTitle=that.getView().byId("ordNumber");
				oTitle.setModel(oJModel);
				var orderNumber=orderTitle.Orderdate.toDateString();
				var oJModel=new sap.ui.model.json.JSONModel();
				oJModel.setData({titleLine : orderNumber});
				var oTitle=that.getView().byId("custId");
				oTitle.setModel(oJModel);
				var orderNumber=parseInt(orderTitle.Cost, 10);
				var oJModel=new sap.ui.model.json.JSONModel();
				oJModel.setData({titleLine : orderNumber});
				var oTitle=that.getView().byId("cost");
				oTitle.setModel(oJModel);
			}
			
			this.productIndex=sap.ui.getCore().getModel("product");
			this._product = oEvent.getParameter("arguments").product || this._product || "0";
			 	
				var sServiceUrl= this.getServiceUrlC();
				var oModel=new sap.ui.model.odata.ODataModel(sServiceUrl, true);
				var oFilter=[];
				oFilter.push(new sap.ui.model.Filter('IvOrdernumber', sap.ui.model.FilterOperator.EQ, this._product));
				oModel.read("/getOrderDetails_ocaSet",{filters:oFilter,
					success:function(data){
						var oJModel=new sap.ui.model.json.JSONModel();
						oJModel.setData({orderLinesSet : data.results});
						var oTable=that.getView().byId("idOrderLinesTable");
						oTable.setModel(oJModel);
						var deLen=data.results.length.toString();
						var oViewModel = new JSONModel({deLen: deLen});
			            that.getView().setModel(oViewModel,"view1");
					} ,
					error:function(event){
						console.log('error')
					}
				})
		},
		getServiceUrlC:function (){
			return "/sap/opu/odata/sap/ZSERVICE32_OCA_SRV";
		},
		onApproveOrder:function(){
			 this._getAppFrafment().open();
	      },
	    _getAppFrafment: function () {
	    	  if (!this._oADialog)
	    		  {
		            this._oADialog = sap.ui.xmlfragment("sap.ui.demo.fiori2.fragments.approve", this);
		            this.getView().addDependent(this._oADialog);
	    		  }
		         return this._oADialog;
		},
		onRejectOrder:function(){
			 this._getRejFrafment().open();
	      },
	      _getRejFrafment: function () {
	    	  if (!this._oRDialog)
	    		  {
		            this._oRDialog = sap.ui.xmlfragment("sap.ui.demo.fiori2.fragments.reject", this);
		            this.getView().addDependent(this._oRDialog);
	    		  }
		         return this._oRDialog;
		},
		onOK:function(status){
			this._getAppFrafment().close();
			this._getRejFrafment().close();
			sap.ui.core.BusyIndicator.show(0);
			var that=this;
			var sServiceUrl= this.getServiceUrlA();
			var oModel=new sap.ui.model.odata.ODataModel(sServiceUrl, true);
			var oFilter=[];
			oFilter.push(new sap.ui.model.Filter('IvOrdernumber', sap.ui.model.FilterOperator.EQ, this._product));
			oFilter.push(new sap.ui.model.Filter('IvStatus', sap.ui.model.FilterOperator.EQ, status));
			oModel.read("/zchangestatus_ocaSet" ,{filters:oFilter,
				success:function(answer){
					sap.ui.core.BusyIndicator.hide();
					if(answer.results[0].Isok==1){
					if(status='2')
						MessageToast.show("Purchase order was approved.");
					else
						MessageToast.show("Purchase order was rejected.");  
					that.refreshList();
					}
				} ,
				error:function(event){
					sap.ui.core.BusyIndicator.hide();
					MessageToast.show("Error! Purchase order was not approved.");
				}
			})
		},
		refreshList:function(){
			var master=sap.ui.getCore().getModel("this");
			var oTable=master.getView().byId("ordersList");
		    var oTempData = oTable.getModel().getData();
		    oTempData.ordersSet.splice(parseInt(this.productIndex), 1);
		    oTable.getBinding("items").getModel().refresh(true);
	    },
		
		
		getServiceUrlA:function (){
			return "/sap/opu/odata/sap/ZSERVICE14_OCA_SRV";
			},
		onCancel:function(){
			this._getAppFrafment().close();
			this._getRejFrafment().close();
		},
		onEditToggleButtonPress: function() {
			var oObjectPage = this.getView().byId("ObjectPageLayout"),
				bCurrentShowFooterState = oObjectPage.getShowFooter();
			oObjectPage.setShowFooter(!bCurrentShowFooterState);
		},
		onExit: function () {
			this.oRouter.getRoute("master").detachPatternMatched(this._onProductMatched, this);
			this.oRouter.getRoute("detail").detachPatternMatched(this._onProductMatched, this);
		}
	});
});