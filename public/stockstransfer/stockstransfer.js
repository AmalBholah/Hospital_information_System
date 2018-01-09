app.controller('stockstransfermaincontroller', function($scope,$ionicActionSheet,$ionicModal,$ionicLoading, $timeout, $state,$ionicPopup,smarthealth) {

//Initialisation buffers
$scope.addeditems = [];
$scope.peripheralsbuffer = [];
$scope.dbquantitybuffer=[];
$scope.mainmenu = {};
$scope.mainpopup = {};
var SEPARATOR = "     ";

//Buffers
var SELLING_PRICE;
var MARKUP;
var TIMESTAMP;

//RETRIEVE FIREBASE PUSHED ID
var FIREBASE_PUSHED_ID;

//SELECTOR FOR MANUAL/BARCODE SEARCH
var SELECTOR_SEARCH="";
var MANUAL_SEARCH="MANUAL_SEARCH";
var BARCODE_SEARCH = "BARCODE_SEARCH";

var COUNTER = 0;
var alertPopup_scan;
var STOCKPERSONID="STOCKPERSONID";
var ITEMID = "ITEMID";

//By default all scans direct to ITEMS
var SCAN_MODE = ITEMID;

//Current stored item barcode
var TEMP_BARCODE_ITEM="NO BARCODE";

//Autoincrement item count
var BARCODE_COUNTER = 0;

//Retrieved stock count from firebase
var DB_COUNTER_VAL = 0;

//LOGIC FOR SUBMITMODE
var SUBMIT_MODE = "submitmode";
var ENTER_ITEM = "enteritem";
var EDIT_ITEM = "edititem";
var SEARCH_ITEM = "searchitem";
var INLINE_EDIT = "inlineedit";

//SELECTOR DEFINITION FOR DROP-DOWN MENUS
var TRANSFER_FROM = "";
var TRANSFER_TO = " ";

$scope.selectedfrom = function(x){
//console.log("SELECTED FROM"+$scope.mainmenu.selectFROM);
TRANSFER_FROM = $scope.mainmenu.selectFROM.replace(/\s/g, "") ;
smarthealth.set_transferfrom(TRANSFER_FROM);
}

$scope.selectedto = function(x){
//console.log("SELECTED TO"+$scope.mainmenu.selectTO);
TRANSFER_TO = $scope.mainmenu.selectTO.replace(/\s/g, "");
smarthealth.set_transferto(TRANSFER_TO);
}

$scope.model = {
barcode: 'none',
};


/**
 * User wants to view stockstransfers
 * @tblstockstransfer
 */
$scope.viewstockstransfer = function(){
$state.go('viewstockstransfer');
};//END viewstockstransfer()


/**
 * View has been loaded
 * Load tblperipherals facilities
 */

$scope.$on('$ionicView.enter',function(){
$scope.peripheralsbuffer = [];
var firebase_url = "https://medisave-a4903.firebaseio.com/tblperipherals";
var firebase_reference = new Firebase(firebase_url);
  $scope.loading = $ionicLoading.show({
    content: '<i class="icon ion-loading-c"></i>',
    animation: 'fade-in',
    showBackdrop: true,
    maxWidth: 50,
    showDelay: 0
  });
firebase_reference.on("child_added", function(snapshot, prevChildKey) {
var data = snapshot.val();

if(data!=null){
  $scope.peripheralsbuffer.push(data.facility);
  $ionicLoading.hide();
}else{
  $ionicLoading.hide();
} 

});//END LOOPING
    $timeout(function() {
    $ionicLoading.hide();
   
    }, 3000);
$scope.peripherals = $scope.peripheralsbuffer;

if(smarthealth.get_object()!=null){
$scope.mainmenu.supplier = smarthealth.get_object().supplier;
$scope.mainmenu.itemname = smarthealth.get_object().itemname;
$scope.mainmenu.itemcost = smarthealth.get_object().itemcost;
$scope.mainmenu.batchno = smarthealth.get_object().batchno;
$scope.mainmenu.expdate=smarthealth.get_object().expdateday+'-'+smarthealth.get_object().expdatemonth+'-'+smarthealth.get_object().expdateyear;
$scope.mainmenu.barcodevalue = smarthealth.get_object().barcodeval;
$scope.mainmenu.itemsleft = smarthealth.get_object().quantity;
$scope.mainmenu.contentdetails = smarthealth.get_object().fixedcontentdetails;
$scope.mainmenu.itemcounter="1";
TEMP_BARCODE_ITEM = $scope.mainmenu.barcodevalue;
$scope.addeditems=[];
$scope.dbquantitybuffer.push({servercounter: smarthealth.get_object().quantity});
$scope.addeditems.push({
supplier:smarthealth.get_object().supplier,
itemname:$scope.mainmenu.itemname,
itemcost:$scope.mainmenu.itemcost,
batchno:$scope.mainmenu.batchno,
expdate:$scope.mainmenu.expdate,
barcodeval:smarthealth.get_object().barcodeval,
fixedcontentdetails:smarthealth.get_object().fixedcontentdetails,
sellingprice:smarthealth.get_object().sellingprice,
markup:smarthealth.get_object().markup,
timestamp:smarthealth.get_object().timestamp,
quantity:"1",
contentdetails:smarthealth.get_object().contentdetails,
uniqueid:smarthealth.get_object().uniqueid});
}
console.log('VIEWLOADED',smarthealth.get_object());
$scope.$apply;
});

$scope.disableinputitems = function(){
  document.getElementById('mainmenu.itemname').disabled = true;
  document.getElementById('mainmenu.itemcost').disabled = true;
  document.getElementById('mainmenu.expdate').disabled = true;
  document.getElementById('mainmenu.barcodevalue').disabled = true;
  document.getElementById('mainmenu.itemcounter').disabled = true;
  document.getElementById('mainmenu.contentdetails').disabled = true;        
}
    
    $scope.barcodeScanned = function(barcode) {        
        
        console.log('TEMP_BARCODE_ITEM '+TEMP_BARCODE_ITEM);
        console.log('CURRENT BARCODE '+barcode);
        
        if(SCAN_MODE === ITEMID){
          //First item scan -- store barcodevalue into memory
          if(BARCODE_COUNTER==0){TEMP_BARCODE_ITEM = barcode;}
          BARCODE_COUNTER++;
          $scope.mainmenu.barcodevalue = barcode;

          if(BARCODE_COUNTER>=1&&(TEMP_BARCODE_ITEM===barcode)){
            //Barcodes are matching carry forwards with incrementation

            //Verify if input fields are validated
            if($scope.mainmenu.itemname==null||$scope.mainmenu.itemcost==null||$scope.mainmenu.expdate==null){
          var alertPopup = $ionicPopup.alert({
          title: 'ERROR',
          template: 'Please fill in fields correctly before proceeding'
          });
            
            //Adjust barcode counter amount
            BARCODE_COUNTER = 1;
            $scope.mainmenu.barcodevalue = barcode;
            }//END NULL CHECK FOR FIELDS
            
          }

          //Mismatch -- autodump
          else if(BARCODE_COUNTER=>1&&(TEMP_BARCODE_ITEM!=barcode)){
console.log('Mismatch autodump');
$scope.addeditems.push({
markup:smarthealth.get_object().markup,
sellingprice:smarthealth.get_object().sellingprice,
timestamp:smarthealth.get_object().timestamp,
supplier:$scope.mainmenu.supplier,
itemname:$scope.mainmenu.itemname,
itemcost:$scope.mainmenu.itemcost,
batchno:$scope.mainmenu.batchno,
expdate:$scope.mainmenu.expdate,
barcodeval:TEMP_BARCODE_ITEM,
quantity:BARCODE_COUNTER-1,
contentdetails:$scope.mainmenu.contentdetails,
fixedcontentdetails:$scope.mainmenu.contentdetails,
uniqueid:FIREBASE_PUSHED_ID});


            //$scope.dbquantitybuffer.push({servercounter:DB_COUNTER_VAL});
            $scope.doSumTotal();
          
          /**
           * RESET ALL PARAMETERS
           */
            
            TEMP_BARCODE_ITEM = barcode;
            BARCODE_COUNTER = 1;
            
            //Search database for item and repopulate
            $scope.render_backend_search(barcode);
          }

          $scope.mainmenu.itemcounter = BARCODE_COUNTER;
        }               

        //Keep SCAN_MODE in this order to avoid double calls to functions     
        if(SCAN_MODE === STOCKPERSONID){
            smarthealth.get_useraccess(barcode).then(function(responsevalue){
                document.getElementById('mainmenu.identifystockpersontransfer').innerHTML = responsevalue;
            });
          //Shift back to ITEMID mode
          BARCODE_COUNTER = 1;
          SCAN_MODE = ITEMID;
          document.getElementById('mainmenu.itemname').disabled = false;
          document.getElementById('mainmenu.itemcost').disabled = false;
          document.getElementById('mainmenu.expdate').disabled = false;
          document.getElementById('mainmenu.barcodevalue').disabled = false;
          document.getElementById('mainmenu.itemcounter').disabled = false;
          document.getElementById('mainmenu.contentdetails').disabled = false;
        }  

        //Search for an item in firebase
        if(SCAN_MODE === SEARCH_ITEM){
          alertPopup_scan.close();
          BARCODE_COUNTER=1;
          $scope.render_backend_search(barcode);
        }//END SEARCH_ITEM
       
    }; 

//Identify stock person
$scope.identifystockpersontransfer = function(){
SCAN_MODE = STOCKPERSONID;
document.getElementById('mainmenu.identifystockpersontransfer').innerHTML = "Please scan your ID";
}

//Popup initialisation
  $ionicModal.fromTemplateUrl('stockstransfer/stockstransfermainpopup.html', {
  id : '1',
  scope: $scope
  }).then(function(modal) {
  $scope.oModal1 = modal;
  });

  // Triggered in the popup modal to close it
  $scope.closePopup = function() {
    $scope.oModal1.hide();
  };

  // Open the popup modal
  $scope.showPopup = function() {
    $scope.oModal1.show();
  };
//END Popup initialisation

/**
 * Method to return current date in human-readable format
 */
Date.prototype.yyyymmdd = function() {
  var mm = this.getMonth();
  var dd = this.getDate();
  var month;

  if(mm == 0){month="January";}
  if(mm == 1){month="February";}
  if(mm == 2){month="March";}
  if(mm == 3){month="April";}
  if(mm == 4){month="May";}
  if(mm == 5){month="June";}
  if(mm == 6){month="July";}
  if(mm == 7){month="August";}
  if(mm == 8){month="September";}
  if(mm == 9){month="October";}
  if(mm == 10){month="November";}
  if(mm == 11){month="December";}


  var output = this.getDate()+" "+month+" "+this.getFullYear();
  return output;
};
/**
 * END Method to return current date in human-readable format
 */

//Date parameter initialisation and autofills the date text to today
var date = new Date();
$scope.mainmenu.dateofissue = date.yyyymmdd();

$scope.feeds = [];

//Push to table
for(var i = 0; i < $scope.feeds.length ; i++){
$scope.addeditems.push($scope.feeds[i]);
}

//Edit has been clicked
$scope.emitIndex_edit=function(input){

console.log('emitIndex_edit',input);
SELLING_PRICE = input.sellingprice;
MARKUP = input.markup;
TIMESTAMP = input.timestamp;
SUBMIT_MODE = EDIT_ITEM;
var index = 0;

console.log(input);
$scope.showPopup();
$scope.mainpopup.itemname=input.itemname;
$scope.mainpopup.itemcost=input.itemcost;
$scope.mainpopup.expdate=input.expdate;
$scope.mainpopup.barcodeval=input.barcodeval;
$scope.mainpopup.quantity=input.quantity;
$scope.mainpopup.contentdetails=input.fixedcontentdetails;
$scope.mainpopup.markup=input.markup;
$scope.mainpopup.sellingprice=input.sellingprice;
FIREBASE_PUSHED_ID = input.uniqueid;
SCAN_QUANTITY = input.quantity;

};

/**
 * NULL filter function
 */
$scope.NullFilter = function(input) {
var out = "";
if(input==null){out = "";}else{out = input;}
return out;
};

/**
 * Manual Search stock item
 */

$scope.data = {};

$scope.manualsearch = function(){

if($scope.mainmenu.selectFROM!=null&&$scope.mainmenu.selectTO!=null){
SELECTOR_SEARCH = MANUAL_SEARCH;
$state.go('searchstockstransfer');
}
else{
     alertPopup_scan = $ionicPopup.alert({
     title: 'Medisave Pharmacist Dashboard',
     template: 'Make sure you select from dropdown where to TRANSFER FROM AND TO'
   });
}
}

/**
 *Edit listed mainmenu item details 
 */

$scope.editstockitem = function(){
SUBMIT_MODE = INLINE_EDIT;
$scope.showPopup();
$scope.mainpopup.itemname=$scope.mainmenu.itemname;
$scope.mainpopup.itemcost=$scope.mainmenu.itemcost;
$scope.mainpopup.expdate=$scope.mainmenu.expdate;
$scope.mainpopup.barcodeval=$scope.mainmenu.barcodevalue;
$scope.mainpopup.quantity=$scope.mainmenu.itemcounter;
$scope.mainpopup.contentdetails=$scope.mainmenu.fixedcontentdetails;
}

/**
 * Watch amount paid field
 * Autocalcuate balance due
 */
$scope.$watch('mainmenu.amountpaid', function(newVal, oldVal){
 $scope.doSumTotal();
 var TOTAL = Number($scope.mainmenu.sumtotal);
 var PAID = Number(newVal);
 //Set balance
 $scope.mainmenu.balance = SEPARATOR + (PAID-TOTAL);
})


/**
 * Search firebase database for given barcode
 * Inject results into mainmenu template
 */

$scope.searchstockitem = function(){

    if($scope.mainmenu.selectFROM!=null&&$scope.mainmenu.selectTO!=null){
        SCAN_MODE = SEARCH_ITEM;
        SELECTOR_SEARCH = BARCODE_SEARCH;
        alertPopup_scan = $ionicPopup.alert({
            title: 'Medisave Pharmacist Dashboard',
            template: 'Scan the item using your barcode scanner'
        });
    }
    else{
        alertPopup_scan = $ionicPopup.alert({
            title: 'Medisave Pharmacist Dashboard',
            template: 'Make sure you select from dropdown where to TRANSFER FROM AND TO'
        });
    }

}

$scope.render_backend_search = function(SEARCH_QUERY){

if($scope.mainmenu.selectFROM!=null&&$scope.mainmenu.selectTO!=null){

var firebase_url = "https://medisave-a4903.firebaseio.com";
var firebase_reference = new Firebase(firebase_url);
console.log('render_backend_search');
  $scope.loading = $ionicLoading.show({
    content: '<i class="icon ion-loading-c"></i>',
    animation: 'fade-in',
    showBackdrop: true,
    maxWidth: 50,
    showDelay: 0
  });
firebase_reference.child(smarthealth.get_transferfrom()).on("child_added", function(snapshot, prevChildKey) {
var data = snapshot.val();  

if(data==null){
$ionicLoading.hide();
   var alertPopup = $ionicPopup.alert({
     title: 'Medisave Pharmacist Dashboard',
     template: 'No Match found'
   });
}else{
$ionicLoading.hide();

if(SEARCH_QUERY === data.barcodeval){
smarthealth.set_object(data);

//STORE DB QUANTITY COUNT
$scope.dbquantitybuffer.push({servercounter:data.quantity});

$scope.mainmenu.supplier = smarthealth.get_object().supplier;
$scope.mainmenu.itemname = smarthealth.get_object().itemname;
$scope.mainmenu.itemcost = smarthealth.get_object().itemcost;
$scope.mainmenu.batchno = smarthealth.get_object().batchno;
$scope.mainmenu.expdate=smarthealth.get_object().expdateday+'-'+smarthealth.get_object().expdatemonth+'-'+smarthealth.get_object().expdateyear;
$scope.mainmenu.barcodevalue = smarthealth.get_object().barcodeval;
$scope.mainmenu.itemsleft = smarthealth.get_object().quantity;
$scope.mainmenu.contentdetails = smarthealth.get_object().fixedcontentdetails;
$scope.dbquantitybuffer.push({servercounter: smarthealth.get_object().quantity});
//BARCODE_COUNTER = 1;
DB_COUNTER_VAL = data.quantity;
FIREBASE_PUSHED_ID = snapshot.name();
$scope.mainmenu.itemcounter="1";
SCAN_MODE = ITEMID;
SUBMIT_MODE = ENTER_ITEM;
TEMP_BARCODE_ITEM = $scope.mainmenu.barcodevalue;
}

}
});
    $timeout(function() {
    $ionicLoading.hide();
   
    }, 3000);
}
else{
     alertPopup_scan = $ionicPopup.alert({
     title: 'Medisave Pharmacist Dashboard',
     template: 'Make sure you select from dropdown where to TRANSFER FROM AND TO'
   });
}


}//END render_backend_search()

//Delete has been clicked
$scope.emitIndex_delete=function(input){

var index = 0;
for(var i = 0; i < $scope.addeditems.length;i++){
if(input.itemcost===$scope.addeditems[i].itemcost&&input.itemcost===$scope.addeditems[i].itemcost){
  index = i;

  var confirmPopup = $ionicPopup.confirm({
     title: 'Delete this item?',
     template: input.itemname
   });

   confirmPopup.then(function(res) {
     if(res) {
       if (index > -1){$scope.addeditems.splice(index, 1);}
       if (index > -1){$scope.dbquantitybuffer.splice(index, 1);}
     } else {
       
     }
   });

}
}
};//END delete item

//Add item has been clicked
$scope.additem = function(){
$scope.doSumTotal();
$scope.showPopup();
};

//Done button has been clicked on popup
$scope.submititem = function(input){

if(SUBMIT_MODE===EDIT_ITEM){
//$scope.addeditems.push({itemname:$scope.mainpopup.itemname,itemcost:$scope.mainpopup.itemcost,expdate:$scope.mainpopup.expdate,barcodeval:$scope.mainpopup.barcodeval,quantity:$scope.mainpopup.quantity,uniqueid:FIREBASE_PUSHED_ID});
var index = 0;
for(var i = 0; i < $scope.addeditems.length;i++){
if(input.itemname===$scope.addeditems[i].itemname&&input.itemcost===$scope.addeditems[i].itemcost){
if (index > -1){$scope.addeditems.splice(index, 1);}}
}

$scope.addeditems.push({
supplier:$scope.mainmenu.supplier,
itemname:$scope.mainmenu.itemname,
itemcost:$scope.mainmenu.itemcost,
batchno:$scope.mainmenu.batchno,
expdate:$scope.mainmenu.expdate,
barcodeval:$scope.mainpopup.barcodeval,
quantity:$scope.mainpopup.quantity,
contentdetails:$scope.mainmenu.contentdetails,
fixedcontentdetails:$scope.mainmenu.contentdetails,
sellingprice:SELLING_PRICE,
markup:MARKUP,
timestamp:TIMESTAMP,
uniqueid:FIREBASE_PUSHED_ID});
$scope.doSumTotal();
$scope.closePopup();
TEMP_BARCODE_ITEM = $scope.mainpopup.barcodevalue;
}
console.log('SUBMITCLICKED',$scope.addeditems);
};

//Adds up items in list
$scope.doSumTotal = function(){
COUNTER = 0;
for(var i = 0; i < $scope.addeditems.length;i++){

var QUANTITY = Number($scope.addeditems[i].quantity);
var ITEM_COST = Number($scope.addeditems[i].itemcost);
var ITEM_TOTAL_PRICE = (QUANTITY*ITEM_COST);
//ADD ITEM_TOTAL_PRICE TO COUNTER
COUNTER = COUNTER + ITEM_TOTAL_PRICE;
}
$scope.mainmenu.sumtotal = SEPARATOR+COUNTER;
};
//ENDS doSumTotal()

$scope.submitclaim = function(){
  /*
     var alertPopup = $ionicPopup.alert({
     title: 'Medisave Pharmacist Dashboard',
     template: 'Congratulations! Items saved successfully'
   });*/
    UIkit.notification('Transfer successful', {pos: 'top-right'});

   alertPopup.then(function(res) {
   });
};

/**
 * Execute transfer
 * @tblstockstransfer
 */
$scope.execute_transfer = function(){

//Get firebase instance
var firebase_url = "https://medisave-a4903.firebaseio.com";
var firebase_reference = new Firebase(firebase_url);

  //Loop through buffer items
  for(var i = 0 ; i < $scope.addeditems.length ; i++){

/**
 * BEGIN TRANSFER_FROM
 */

var SCAN_QUANTITY = Number($scope.addeditems[i].quantity);
var DB_QUANTITY = Number($scope.dbquantitybuffer[i].servercounter);
var ITEM_UNIQUE_ID =$scope.addeditems[i].uniqueid;

$scope.buff = $scope.addeditems[i].expdate.split('-');

firebase_reference.child(smarthealth.get_transferfrom())
.child(ITEM_UNIQUE_ID).set({
"fixedcontentdetails":$scope.NullFilter($scope.addeditems[i].fixedcontentdetails),
"supplier":$scope.NullFilter($scope.mainmenu.supplier),
"itemname":$scope.NullFilter($scope.addeditems[i].itemname),
"itemcost":$scope.NullFilter($scope.addeditems[i].itemcost),
"batchno":$scope.NullFilter($scope.addeditems[i].batchno),
"expdateday":$scope.buff[0],
"expdatemonth":$scope.buff[1],
"expdateyear":$scope.buff[2],
"barcodeval":$scope.NullFilter($scope.addeditems[i].barcodeval),
"quantity":DB_QUANTITY-SCAN_QUANTITY,
"contentdetails":$scope.NullFilter($scope.addeditems[i].contentdetails),
"staffid":document.getElementById('mainmenu.identifystockpersontransfer').innerHTML,
"uniqueid":$scope.NullFilter($scope.addeditems[i].uniqueid),
"sellingprice":$scope.NullFilter($scope.addeditems[i].sellingprice),
"markup":$scope.NullFilter($scope.addeditems[i].markup),
"timestamp":$scope.NullFilter($scope.addeditems[i].timestamp)
});
//END TRANSFER_FROM

/**
 * BEGIN TRANSFER_TO
 */

//Assume none existing
var EXISTING_UNITS = 0;
//Verify if this item exists in listing 
firebase_reference.child(smarthealth.get_transferto()).child($scope.NullFilter($scope.addeditems[i].uniqueid)).on('value', function(snapshot) {
  var data = snapshot.val();
  
  if(data!=null){
    EXISTING_UNITS = Number(data.quantity);
    console.log(EXISTING_UNITS);
  }
});

//console.log(EXISTING_UNITS);

//We send the uniquekey of item source to item destination to avoid confusion

firebase_reference.child(smarthealth.get_transferto()).child($scope.NullFilter($scope.addeditems[i].uniqueid)).set({
"supplier":$scope.NullFilter($scope.mainmenu.supplier),
"fixedcontentdetails":$scope.NullFilter($scope.addeditems[i].fixedcontentdetails),
"itemname":$scope.NullFilter($scope.addeditems[i].itemname),
"itemcost":$scope.NullFilter($scope.addeditems[i].itemcost),
"batchno":$scope.NullFilter($scope.addeditems[i].batchno),
"expdateday":$scope.buff[0],
"expdatemonth":$scope.buff[1],
"expdateyear":$scope.buff[2],
"barcodeval":$scope.NullFilter($scope.addeditems[i].barcodeval),
"quantity":EXISTING_UNITS + SCAN_QUANTITY,
"contentdetails":$scope.NullFilter($scope.addeditems[i].contentdetails),
"staffid":document.getElementById('mainmenu.identifystockpersontransfer').innerHTML,
"uniqueid":$scope.NullFilter($scope.addeditems[i].uniqueid),
"sellingprice":$scope.NullFilter($scope.addeditems[i].sellingprice),
"markup":$scope.NullFilter($scope.addeditems[i].markup),
"timestamp":smarthealth.get_currentutc()
});
//END TRANSFER_TO

/**
 * Record stockstransfer in database
 * @tblstockstransfer
 */

var current_date = new Date();

var firebase_url = "https://medisave-a4903.firebaseio.com/tblstockstransfer";
var firebase_reference = new Firebase(firebase_url);
var pushed_reference = firebase_reference.push();
pushed_reference.set({
"timestamp":current_date.toUTCString(),
"transferfrom":smarthealth.get_transferfrom(),
"transferto":smarthealth.get_transferto(),
"quantity":SCAN_QUANTITY,
"contentdetails":$scope.NullFilter($scope.addeditems[i].contentdetails),
"supplier":$scope.NullFilter($scope.mainmenu.supplier),
"fixedcontentdetails":$scope.NullFilter($scope.addeditems[i].fixedcontentdetails),
"itemname":$scope.NullFilter($scope.addeditems[i].itemname),
"itemcost":$scope.NullFilter($scope.addeditems[i].itemcost),
"batchno":$scope.NullFilter($scope.addeditems[i].batchno),
"expdateday":$scope.buff[0],
"expdatemonth":$scope.buff[1],
"expdateyear":$scope.buff[2],
"sellingprice":$scope.NullFilter($scope.addeditems[i].sellingprice),
"markup":$scope.NullFilter($scope.addeditems[i].markup),
"barcodeval":$scope.NullFilter($scope.addeditems[i].barcodeval),
"quantity":SCAN_QUANTITY,
"contentdetails":$scope.NullFilter($scope.addeditems[i].contentdetails),
"staffid":document.getElementById('mainmenu.identifystockpersontransfer').innerHTML,
"uniqueid":$scope.NullFilter($scope.addeditems[i].uniqueid),
"timestamp":smarthealth.get_currentutc()
});

/**
 * END stockstransfer
 */

//Clear out all fields in view
$scope.mainmenu.supplier = "";
document.getElementById('mainmenu.identifystockpersontransfer').innerHTML = "Click here to identify yourself";
$scope.mainmenu.dateofissue ="";
$scope.mainmenu.itemname="";
$scope.mainmenu.itemcost="";
$scope.mainmenu.expdate="";
$scope.mainmenu.batchno="";
$scope.mainmenu.barcodevalue="";
$scope.mainmenu.contentdetails="";
$scope.mainmenu.itemcounter="";
$scope.mainmenu.itemsleft="";

}//END FOR LOOP $scope.addeditems
$scope.addeditems = [];

//INFORM THAT VALIDATION HAS BEEN SUCCESSFUL   
var alertPopup = $ionicPopup.alert({
title: 'Medisave Stocks Manager',
template: 'Stock transfer successful from'+TRANSFER_FROM+" to "+TRANSFER_TO
}); 
};//END execute_transfer()


/**
 * Validation submitted
 * Consider printing maybe
 */
$scope.submitvalidation = function(){

if(document.getElementById('mainmenu.identifystockpersontransfer').innerHTML=="Click here to identify yourself"||document.getElementById('mainmenu.identifystockpersontransfer').innerHTML == "Please scan your ID")
{
var alertPopup = $ionicPopup.alert({
title: 'Medisave Stocks Manager',
template: 'Please scan your ID'
});

}

else{
var ERR = false;
  //Loop through buffer items
  for(var i = 0 ; i < $scope.addeditems.length ; i++){

var SCAN_QUANTITY = Number($scope.addeditems[i].quantity);
var DB_QUANTITY = Number($scope.dbquantitybuffer[i].servercounter);

if((DB_QUANTITY-SCAN_QUANTITY)<0){
   UIkit.notification('Quantity scanned more than items left', {pos: 'top-right'});
   ERR = true;
}


}//END LOOPING

if(!ERR){$scope.execute_transfer();}


}//END ELSE STATEMENT

                                                 
}//END submitvalidation()





})//END stockstransfermaincontroller

.controller('searchstockstransfercontroller', function($scope,$ionicActionSheet,$ionicModal,$ionicLoading, $timeout, $state,$ionicPopup,smarthealth) {

$scope.stockitems = [];

$scope.backtomenu = function(){
  $state.go('app.stockstransfermain');
}

$scope.$on("$ionicView.enter",function(){
var firebase_url = "https://medisave-a4903.firebaseio.com/";
var firebase_reference = new Firebase(firebase_url);
  $scope.loading = $ionicLoading.show({
    content: '<i class="icon ion-loading-c"></i>',
    animation: 'fade-in',
    showBackdrop: true,
    maxWidth: 50,
    showDelay: 0
  });


firebase_reference.child(smarthealth.get_transferfrom()).on("child_added", function(snapshot, prevChildKey) {
var data = snapshot.val();

if(data!=null){
  $scope.stockitems.push(data);
  $ionicLoading.hide();
}else{
  $ionicLoading.hide();
} 

});//END LOOPING
    $timeout(function() {
    $ionicLoading.hide();
   
    }, 3000);
});

$scope.showDetails = function(input){
  smarthealth.set_object(input);
  $state.go('app.stockstransfermain');
}

})//END searchstockstransfercontroller

.controller('viewstockstransfercontroller', function($scope,$ionicActionSheet,$ionicModal,$ionicLoading, $timeout, $state,$ionicPopup,smarthealth) {

$scope.stockitems = [];
/**
 * User wants to go back 
 * @stockstransfermain
 */
$scope.backtomenu = function(){
$state.go('app.stockstransfermain');
}

$scope.$on("$ionicView.enter",function(){
$scope.stockitems = [];
var firebase_url = "https://medisave-a4903.firebaseio.com/tblstockstransfer";
var firebase_reference = new Firebase(firebase_url);
  $scope.loading = $ionicLoading.show({
    content: '<i class="icon ion-loading-c"></i>',
    animation: 'fade-in',
    showBackdrop: true,
    maxWidth: 50,
    showDelay: 0
  });


firebase_reference.on("child_added", function(snapshot, prevChildKey) {
var data = snapshot.val();

if(data!=null){
  $scope.stockitems.push(data);
  $ionicLoading.hide();
}else{
  $ionicLoading.hide();
} 

});//END LOOPING
    $timeout(function() {
    $ionicLoading.hide();
   
    }, 3000);
});


})//END viewstockstransfercontroller()

;//END controllers.js
