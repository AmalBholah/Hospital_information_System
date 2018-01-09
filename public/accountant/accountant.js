app.controller('accountcategorycontroller', function($http,$scope,$ionicActionSheet,$ionicModal,$ionicLoading, $timeout, $state,$ionicPopup) {

//List buffer
$scope.accounts = [];

//MODE
var MODE_OF_OPERATION="NEW";

//MODE STATES
var NEW = "NEW";
var EDIT = "EDIT";

var firebase_url = "https://medisave-a4903.firebaseio.com/tblaccountheaders";
var firebase_reference = new Firebase(firebase_url);

/**
 * Reloads entire list
 */
$scope.refresh_list = function(){
//Reset list buffer
$scope.accounts = [];
  $scope.loading = $ionicLoading.show({
    content: '<i class="icon ion-loading-c"></i>',
    animation: 'fade-in',
    showBackdrop: true,
    maxWidth: 50,
    showDelay: 0
  });
firebase_reference.on('child_added', function(snapshot, prevChildKey) {
if(snapshot.val()!=null){
$ionicLoading.hide();
var data = snapshot.val();
data.uniquekey = snapshot.key();
$scope.accounts.push(data);
$scope.$apply();}
else{$ionicLoading.hide();}
});
};//END refresh_list()

$scope.$on("$ionicView.enter",function(){
window.localStorage.clear();
$scope.refresh_list();

});//END $ionicView.enter


  //Popup initialisation
  $scope.mainpopup = {};

  $ionicModal.fromTemplateUrl('accountant/accountmainpopup.html', {
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


/**
 * User wants to go back to
 * @searchgl
 */
$scope.handleBack = function(){
$state.go('app.searchgl');
};//END handleBack()


/**
 * An Account has been selected from list
 * @EDIT enabled
 */
$scope.editaccount = function(account){
console.log(account);
MODE_OF_OPERATION = EDIT;
$scope.mainpopup.category = account.category;
$scope.mainpopup.glname = account.glname;
$scope.mainpopup.glcode = account.glcode;
$scope.mainpopup.accounttype = account.accounttype;
$scope.mainpopup.uniquekey = account.uniquekey;
$scope.showPopup();
}//END editaccount()

/**
 * User wants to DELETE this account
 * Confirm before taking action
 */
$scope.deleteaccount = function(account){
      var confirmPopup = $ionicPopup.confirm({
         title: 'DELETE ACCOUNT',
         template: 'Are you sure you want to delete this account?'
      });

      confirmPopup.then(function(res) {
         if(res) {
            firebase_reference.child(account.uniquekey).remove();
     var alertPopup = $ionicPopup.alert({
     title: 'Accounts Manager',
     template: 'DELETE successful'
   });

$scope.refresh_list();

         }//END res

         else {
            //Nothing to do deletion has been cancelled by user
         }//END !res
      });
};//END deleteaccount()


/**
 * User wants to create a new account
 * Show popup with parameters:
 * @Category
 * @GL NAME
 * @GL CODE
 */
$scope.createaccount = function(){
MODE_OF_OPERATION = NEW;
//Pre-set to display REVENUE as accounttype selection
$scope.mainpopup.accounttype = "REVENUE";
//Show mainpopup
$scope.showPopup();
};//END createaccount()

/**
 * Create Account mainpopup
 * @submit event triggered
 */
$scope.submititem = function(mainpopup){

if($scope.redundancy_check(mainpopup)){


if(MODE_OF_OPERATION == NEW){
//Filter out null entries
if(mainpopup.category==null||mainpopup.glname==null||mainpopup.glcode==null){
  var alertPopup = $ionicPopup.alert({
     title: 'Accounts Manager',
     template: 'ERROR: Please fill in all fields correctly'
   });
}else{
//No apparent null entries -- push to server
$scope.closePopup();
var pushed_reference = firebase_reference.push();
pushed_reference.set({
category:mainpopup.category,
glname:mainpopup.glname,
glcode:mainpopup.glcode,
accounttype:mainpopup.accounttype
});
  var alertPopup = $ionicPopup.alert({
     title: 'Accounts Manager',
     template: 'Account CREATED successfully'
   });


}

$scope.refresh_list();

}//END MODE_OF_OPERATION is NEW

if(MODE_OF_OPERATION == EDIT){
firebase_reference.child(mainpopup.uniquekey).set({
  category:$scope.mainpopup.category,
  accounttype:$scope.mainpopup.accounttype,
  glname:$scope.mainpopup.glname,
  glcode:$scope.mainpopup.glcode
});
$scope.closePopup();
  var alertPopup = $ionicPopup.alert({
     title: 'Accounts Manager',
     template: 'Account EDITED successfully'
   });

$scope.refresh_list();
}//END MODE_OF_OPERATION is EDIT

}//END redundancy_check()
}//END submititem()


/**
 * Prevent duplication of accounts
 */
$scope.redundancy_check = function(mainpopup){
var state = true;
for(var i = 0; i < $scope.accounts.length;i++){
  if($scope.accounts[i].glcode==mainpopup.glcode||$scope.accounts[i].glname==mainpopup.glname){
      var alertPopup = $ionicPopup.alert({
     title: 'ERROR',
     template: 'It looks like you are entering a GL NAME / GL CODE already existing in the list. Edit or Delete the matching ones in the list itself'
   });
   state = false;
   return;
  }

return state;
}
};//END redundancy_check()

})//END accountcategorycontroller



app.controller('searchglcontroller', function($http,$scope,$ionicActionSheet,$ionicModal,$ionicLoading, $timeout, $state,$ionicPopup,smarthealth) {

$scope.searchgl = {};
$scope.glcodes = [];
var ACCOUNT_STARTS;
var ACCOUNT_ENDS;

//Buffer to store DOCTOR_DATASET
var DOCTOR_DATASET;

//Buffer to store OTHER_DATASET
var OTHER_DATASET;

var STATE_DOCTORDATASET="doctordataset";
var STATE_OTHERDATASET="otherdataset";
var OPERATOR_STATE="none";

//Reset list buffer
$scope.accounts = [];

var SELECTED_ITEM = $scope.searchgl.item;
$scope.itemchange = function(){SELECTED_ITEM = $scope.searchgl.item;}


/**
 * Reloads entire list
 */
$scope.refresh_list = function(){
var firebase_url = "https://medisave-a4903.firebaseio.com/tblaccountheaders";
var firebase_reference = new Firebase(firebase_url);


//Reset list buffer
$scope.accounts = [];
$scope.glcodes = [];

  $scope.loading = $ionicLoading.show({
    content: '<i class="icon ion-loading-c"></i>',
    animation: 'fade-in',
    showBackdrop: true,
    maxWidth: 50,
    showDelay: 0
  });
firebase_reference.on('child_added', function(snapshot, prevChildKey) {
if(snapshot.val()!=null){
$ionicLoading.hide();
var data = snapshot.val();
data.uniquekey = snapshot.key();
$scope.accounts.push(data.glname+" - "+data.glcode);
$scope.glcodes.push(data);
$scope.$apply();}
else{$ionicLoading.hide();}

//Populate dropdown menu
$scope.items = $scope.accounts;
//$scope.searchgl.item = data.glname+" - "+data.glcode;
});

firebase_reference.on('value', function(snapshot){$ionicLoading.hide();});

};//END refresh_list()

$scope.$on("$ionicView.enter",function(){
window.localStorage.clear();
$scope.refresh_list();

/**
 * Preload accounts beginning and end dates
 * @Use current_date as default for both
 *
 */
var SELECTED_YEAR = $scope.searchgl.year;
var SELECTED_MONTH = $scope.searchgl.month;
var SELECTED_DAY = $scope.searchgl.day;

/**
 * Selector Configuration
 * Dateinput custom
 */

$scope.rebuild_month = function(i){
var obtained_month;
if(i=="JANUARY"){obtained_month=0;}
if(i=="FEBRUARY"){obtained_month=1;}
if(i=="MARCH"){obtained_month=2;}
if(i=="APRIL"){obtained_month=3;}
if(i=="MAY"){obtained_month=4;}
if(i=="JUNE"){obtained_month=5;}
if(i=="JULY"){obtained_month=6;}
if(i=="AUGUST"){obtained_month=7;}
if(i=="SEPTEMBER"){obtained_month=8;}
if(i=="OCTOBER"){obtained_month=9;}
if(i=="NOVEMBER"){obtained_month=10;}
if(i=="DECEMBER"){obtained_month=11;}
return obtained_month;
}

$scope.rebuild_dates = function(){

ACCOUNT_STARTS = new Date();
ACCOUNT_STARTS.setFullYear($scope.searchgl.year);
ACCOUNT_STARTS.setMonth($scope.rebuild_month($scope.searchgl.month));
ACCOUNT_STARTS.setDate($scope.searchgl.day);


ACCOUNT_ENDS = new Date();
ACCOUNT_ENDS.setFullYear($scope.searchgl.yeartransfer);
ACCOUNT_ENDS.setMonth($scope.rebuild_month($scope.searchgl.monthtransfer));
ACCOUNT_ENDS.setDate($scope.searchgl.daytransfer);

console.log('ACCOUNT_STARTS '+ACCOUNT_STARTS);
console.log('ACCOUNT_ENDS '+ACCOUNT_ENDS);
};

$scope.daychange = function(){
$scope.rebuild_dates();
}

$scope.monthchange = function(){
$scope.rebuild_dates();
}
$scope.yearchange = function(){
$scope.rebuild_dates();
}

$scope.daychangetransfer = function(){
$scope.rebuild_dates();
}

$scope.monthchangetransfer = function(){
$scope.rebuild_dates();
}
$scope.yearchangetransfer = function(){
$scope.rebuild_dates();
}

$scope.years_count = function(startYear) {
            var currentYear = new Date().getFullYear(), years = [];
            startYear = startYear || 1980;

            while ( startYear <= currentYear) {
                    years.push(startYear++);
            }

            return years;
}

$scope.returnMonth = function(i){
var obtained_month;
if(i==0){obtained_month="JANUARY";}
if(i==1){obtained_month="FEBRUARY";}
if(i==2){obtained_month="MARCH";}
if(i==3){obtained_month="APRIL";}
if(i==4){obtained_month="MAY";}
if(i==5){obtained_month="JUNE";}
if(i==6){obtained_month="JULY";}
if(i==7){obtained_month="AUGUST";}
if(i==8){obtained_month="SEPTEMBER";}
if(i==9){obtained_month="OCTOBER";}
if(i==10){obtained_month="NOVEMBER";}
if(i==11){obtained_month="DECEMBER";}
return obtained_month;
}

//Prepare days
$scope.daybuffer=[];
for(var i = 0;i<=31;i++){
  if(i>0)
  $scope.daybuffer.push(i.toString());
}

//Prepare months
$scope.monthbuffer=[];
for(var i = 0;i<=12;i++){
if(i>0)$scope.monthbuffer.push($scope.returnMonth(i-1));
}

//Prepare hours
$scope.hourbuffer=[];
for(var i = 0;i<=23;i++){
$scope.hourbuffer.push(i.toString());
}

//Prepare minutes
$scope.minutebuffer=[];
for(var i = 0;i<=59;i++){
$scope.minutebuffer.push(i.toString());
}

//DAYS
$scope.days = $scope.daybuffer;
$scope.daytransfers = $scope.daybuffer;

//MONTHS
$scope.months = $scope.monthbuffer;
$scope.monthtransfers = $scope.monthbuffer;

//YEARS
$scope.years = $scope.years_count(1920);
$scope.yeartransfers = $scope.years_count(1920);

//Fill in data

$scope.searchgl.day = $scope.daybuffer[0];
$scope.searchgl.daytransfer = $scope.daybuffer[0];

$scope.searchgl.month = $scope.monthbuffer[0];
$scope.searchgl.monthtransfer = $scope.monthbuffer[0];

var date = new Date();

$scope.searchgl.year = date.getFullYear()-1;
$scope.searchgl.yeartransfer = date.getFullYear();

});//END $ionicView.enter


/**
 * Populate tableview with list contents
 * Match dates
 */

$scope.addeditems = [];
$scope.glcodes=[];
$scope.glsum=[];

var DELETE_STATUS = false;

$scope.loadaccount = function(){

$scope.addeditems = [];
$scope.supplierbuffer = [];
var firebase_url = "https://medisave-a4903.firebaseio.com/tblaccountentries";
var firebase_reference = new Firebase(firebase_url);

$scope.loading = $ionicLoading.show({
    content: '<i class="icon ion-loading-c"></i>',
    animation: 'fade-in',
    showBackdrop: true,
    maxWidth: 50,
    showDelay: 0
  });

var GLCODE = $scope.searchgl.item.split("-")[1].trim();

firebase_reference.child(GLCODE).on('child_added', function(snapshot, prevChildKey) {
if(snapshot.val()!=null){

var data = snapshot.val();
data.uniquekey = snapshot.key();

//Check if date range is matching -- then only push to buffer
var date_db = new Date(data.date);

if(date_db>=ACCOUNT_STARTS && date_db<=ACCOUNT_ENDS && smarthealth.remove_separators(data.amountdue)>0){
$ionicLoading.hide();
if(data.category=="DOCTOR"
||data.category=="SUPPLIER"
||data.category=="BANK"){
DELETE_STATUS = false;
}else{DELETE_STATUS = true;}

data.totalamount = smarthealth.get_2DP(smarthealth.remove_separators(data.totalamount));
data.amountpaid = smarthealth.get_2DP(smarthealth.remove_separators(data.amountpaid));
data.amountdue = smarthealth.get_2DP(smarthealth.remove_separators(data.amountdue));
data.date = smarthealth.get_localtime(data.date);

//Pump data to view
$scope.addeditems.push(data);
$scope.doSumTotal();
}

//$scope.$apply();
}
else{}

});//END LOOPING

firebase_reference.on('value', function(snapshot){$ionicLoading.hide();});

};//END loadaccount()

$scope.filterentries = function (data) {
var todo = true;
for(var i = 0; i < $scope.glsum.length;i++){
  if($scope.glsum[i].code===data.glcode){
    $scope.glsum[i].totalamount = Number(smarthealth.remove_commas($scope.glsum[i].totalamount))+Number(smarthealth.remove_commas(data.totalamount));
    $scope.glsum[i].amountdue = Number(smarthealth.remove_commas($scope.glsum[i].amountdue))+Number(smarthealth.remove_commas(data.amountdue));
    todo = false;
  }
}

if(todo){$scope.glsum.push({
glname:data.glname,
code:data.glcode,
totalamount:data.totalamount,
amountpaid:data.amountpaid,
amountdue:data.amountdue,
status:data.status,
date:data.date
});}

return $scope.glsum;
}


//Popup initialisation
  $scope.mainpopup = {};

  $ionicModal.fromTemplateUrl('accountant/glpopup.html', {
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

var UNIQUE_KEY="";

/**
 * EDIT a listitem
 */
$scope.emitIndex_edit = function(item){
console.log('emitIndex_edit',item);

if(item.category==="DOCTOR"){
  DOCTOR_DATASET = item;
  OPERATOR_STATE = STATE_DOCTORDATASET;

}else{
  OTHER_DATASET = item;
  OPERATOR_STATE = STATE_OTHERDATASET;
}
$scope.mainpopup.itemdescription = item.itemdescription;
$scope.mainpopup.totalamount = item.totalamount;
$scope.mainpopup.amountpaid = item.amountpaid;
$scope.mainpopup.amountdue = item.amountdue;
$scope.mainpopup.status = item.status;
UNIQUE_KEY = item.uniquekey;
$scope.showPopup();
};//END emitIndex_edit()


/**
 * Formats and returns given number
 * with comma separation and 2 decimal places
 */
function format1(n, currency) {
    return currency + " " + n.toFixed(2).replace(/./g, function(c, i, a) {
        return i > 0 && c !== "." && (a.length - i) % 3 === 0 ? "," + c : c;
    });
}

//Adds up items in list
$scope.doSumTotal = function(){

var SUM_TOTAL = 0;
var SUM_AMOUNTPAID = 0;
var SUM_AMOUNTDUE = 0;
for(var i = 0; i < $scope.addeditems.length;i++){
SUM_TOTAL = SUM_TOTAL + Number($scope.addeditems[i].totalamount);
SUM_AMOUNTPAID = SUM_AMOUNTPAID + Number($scope.addeditems[i].amountpaid);
SUM_AMOUNTDUE = SUM_AMOUNTDUE +  Number($scope.addeditems[i].amountdue);
}

$scope.searchgl.sumtotalamount = format1(parseFloat(SUM_TOTAL),"");
$scope.searchgl.sumamountpaid = format1(parseFloat(SUM_AMOUNTPAID),"");
$scope.searchgl.sumamountdue = format1(parseFloat(SUM_AMOUNTDUE),"");

};//END doSumTotal()



/**
 * Done key pressed on mainpopup
 */
$scope.submititem = function(input){
console.log('submititem ',input);
var index = 0;
for(var i = 0; i < $scope.addeditems.length;i++){
if(input.itemdescription===$scope.addeditems[i].itemdescription&&input.totalamount===$scope.addeditems[i].totalamount){
index = i;
if (index > -1){$scope.addeditems.splice(index, 1);}
}
}
if(OPERATOR_STATE==STATE_DOCTORDATASET){

var date = new Date();
$scope.addeditems.push({
amountdue:input.amountdue,
amountpaid:input.amountpaid,
itemdescription:input.itemdescription,
totalamount:input.totalamount,
status:input.status,
category:DOCTOR_DATASET.category,
date:date.toUTCString(),
glcode:DOCTOR_DATASET.glcode,
glname:DOCTOR_DATASET.glname,
month:date.getMonth(),
uniquekey:DOCTOR_DATASET.uniquekey,
year:date.getFullYear()
});

//Update database
var firebase_url = "https://medisave-a4903.firebaseio.com/tblaccountentries";
var firebase_reference = new Firebase(firebase_url);
firebase_reference.child(smarthealth.get_doctoraccount()).child(UNIQUE_KEY).set({
  amountdue:input.amountdue,
  amountpaid:input.amountpaid,
  itemdescription:input.itemdescription,
  totalamount:input.totalamount,
  status:input.status,
  category:DOCTOR_DATASET.category,
  date:date.toUTCString(),
  glcode:DOCTOR_DATASET.glcode,
  glname:DOCTOR_DATASET.glname,
  month:date.getMonth(),
  uniquekey:DOCTOR_DATASET.uniquekey,
  year:date.getFullYear()
});
}//END STATE_DOCTORDATASET

if(OPERATOR_STATE==STATE_OTHERDATASET){

//Update database
var firebase_url = "https://medisave-a4903.firebaseio.com/tblaccountentries";
var firebase_reference = new Firebase(firebase_url);
var date = new Date();
firebase_reference.child(UNIQUE_KEY).set({
  amountdue:input.amountdue,
  amountpaid:input.amountpaid,
  itemdescription:input.itemdescription,
  totalamount:input.totalamount,
  status:input.status,
  category:OTHER_DATASET.category,
  date:date.toUTCString(),
  glcode:OTHER_DATASET.glcode,
  glname:OTHER_DATASET.glname,
  month:date.getMonth(),
  uniquekey:OTHER_DATASET.uniquekey,
  year:date.getFullYear()
});

$scope.addeditems.push(input);

}//END STATE_OTHERDATASET


$scope.closePopup();
$scope.loadaccount();
}//END submititem()

/**
 * Delete a listitem
 */
$scope.emitIndex_delete = function(input){
    UNIQUE_KEY = input.uniquekey;
if(DELETE_STATUS){
  var index = 0;
  for(var i = 0; i < $scope.addeditems.length;i++){
  if(input.itemdescription===$scope.addeditems[i].itemdescription&&input.totalamount===$scope.addeditems[i].totalamount){
    index = i;

    var confirmPopup = $ionicPopup.confirm({
       title: 'Delete this item?',
       template: input.itemname
     });

     confirmPopup.then(function(res) {
       if(res) {
         var firebase_url = "https://medisave-a4903.firebaseio.com/tblaccountentries";
          var firebase_reference = new Firebase(firebase_url);
          firebase_reference.child(input.glcode).child(UNIQUE_KEY).remove();
         if (index > -1){$scope.addeditems.splice(index, 1);}
       } else {

       }
     });

  }
  }//END LOOPING
}else{
UIkit.notification('You cannot delete this', {pos: 'top-right'});
}//END ELSE


};//END emitIndex_delete()

/**
 * Auto calculate amount due
 */
$scope.calculatedue = function(){
$scope.mainpopup.amountdue = $scope.mainpopup.totalamount - $scope.mainpopup.amountpaid;
};//END calculatedue()

/**
 * User wants to make a GL Entry
 * @Navigate to creategl
 */
$scope.makeglentry = function(){
$state.go('creategl');
};//END makeglentry()

/**
 * Manage Account Categories
 */
$scope.managecategory = function(){
$state.go('accountcategory');
};//END managecategory()


})//END searchglcontroller

app.controller('createglcontroller', function($http,$scope,$ionicActionSheet,$ionicModal,$ionicLoading, $timeout, $state,$ionicPopup) {

$scope.creategl = {};

var firebase_url = "https://medisave-a4903.firebaseio.com/";
var firebase_reference = new Firebase(firebase_url);

/**
 * Formats and returns given number
 * with comma separation and 2 decimal places
 * @param {*} n
 * @param {*} currency
 */
function format1(n, currency) {
    return currency + " " + n.toFixed(2).replace(/./g, function(c, i, a) {
        return i > 0 && c !== "." && (a.length - i) % 3 === 0 ? "," + c : c;
    });
}

/**
 * User wants to go back to mainmenu
 */
$scope.handleBack = function(){
$state.go('app.searchgl');
};//END handleBack()

$scope.$on("$ionicView.enter",function(){

//Amount due & Amount paid -- set to zero as default
$scope.creategl.amountdue = 0;
$scope.creategl.amountpaid = 0;

var SELECTED_ITEM = $scope.creategl.item;
$scope.itemchange = function(){SELECTED_ITEM = $scope.creategl.item;}

//Prepare buffer
$scope.buffer=[];
$scope.buffer.push("OPEN");
$scope.buffer.push("CLOSED");

$scope.creategl.item = "CLOSED";
$scope.items = $scope.buffer;

//Verify if an account is selected
var account = JSON.parse(window.localStorage.getItem('accountObject'));
if(account!=null){
$scope.creategl.category = account.category;
$scope.creategl.glname = account.glname;
$scope.creategl.glcode = account.glcode;
}

});//END $ionicView.enter

/**
 * User wants to load an account
 * @Redirect to viewaccounts
 */
$scope.searchaccounts = function(){$state.go('viewaccounts');};//END searchaccounts()

/**
 * User wants to save GL Entry
 */
$scope.saveglentry = function(creategl){

//Check for null entries
if(creategl.category==null||creategl.glname==null||creategl.glcode==null||creategl.itemdescription==null
||creategl.totalamount==null||creategl.amountpaid==null||creategl.amountdue==null){
  var alertPopup = $ionicPopup.alert({
     title: 'Accounts Manager',
     template: 'Please fill in all fields correctly'
   });
}
else{
//Send to server
var firebase_url = "https://medisave-a4903.firebaseio.com/tblaccountentries/"+creategl.glcode;
var firebase_reference = new Firebase(firebase_url);
var pushed_reference = firebase_reference.push();

var current_date = new Date();
pushed_reference.set({
  date:current_date.toUTCString(),
  category:creategl.category,
  glname:creategl.glname,
  glcode:creategl.glcode,
  itemdescription:creategl.itemdescription,
  totalamount:creategl.totalamount,
  amountpaid:creategl.amountpaid,
  amountdue:creategl.amountdue,
  month:current_date.getMonth(),
  year:current_date.getFullYear(),
  status:$scope.creategl.item

});

  var alertPopup = $ionicPopup.alert({
     title: 'Accounts Manager',
     template: 'GL Entry saved successfully'
   });


}

};//END saveglentry()

/**
 * Watch changes
 */


$scope.$watch('creategl.totalamount', function(newValue, oldValue) {
$scope.creategl.amountdue = Number($scope.creategl.totalamount)-Number($scope.creategl.amountpaid);
});

$scope.$watch('creategl.amountpaid', function(newValue, oldValue) {
$scope.creategl.amountdue = Number($scope.creategl.totalamount)-Number($scope.creategl.amountpaid);
});
//END WATCH

})//END createglcontroller

app.controller('viewaccountscontroller', function($http,$scope,$ionicActionSheet,$ionicModal,$ionicLoading, $timeout, $state,$ionicPopup) {

var firebase_url = "https://medisave-a4903.firebaseio.com/tblaccountheaders";
var firebase_reference = new Firebase(firebase_url);
$scope.accounts = [];
/**
 * User wants to go back to creategl
 */
$scope.handleBack = function(){
$state.go('creategl');
};//END handleBack()

$scope.$on("$ionicView.enter",function(){
$scope.refresh_list();

});//END $ionicView.enter
/**
 * Reloads entire list
 */
$scope.refresh_list = function(){
//Reset list buffer
$scope.accounts = [];
  $scope.loading = $ionicLoading.show({
    content: '<i class="icon ion-loading-c"></i>',
    animation: 'fade-in',
    showBackdrop: true,
    maxWidth: 50,
    showDelay: 0
  });
firebase_reference.on('child_added', function(snapshot, prevChildKey) {
if(snapshot.val()!=null){
$ionicLoading.hide();
var data = snapshot.val();
data.uniquekey = snapshot.key();
$scope.accounts.push(data);
$scope.$apply();}
else{$ionicLoading.hide();}
});
    $timeout(function() {
    $ionicLoading.hide();
    }, 3000);
};//END refresh_list()

/**
 * An account has been selected
 * @Go back to creategl after saving data to memory stack
 */
$scope.selectedaccount = function(account){
window.localStorage.setItem('accountObject', JSON.stringify(account));
$state.go('creategl');
}

})//END viewaccountscontroller


;//END controllers.js
