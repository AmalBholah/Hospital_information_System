app.controller('registerpatientcontroller', function($scope,$ionicLoading,$ionicActionSheet,$ionicModal,ionicDatePicker, $timeout, $state,$ionicPopup,smarthealth) {

$scope.registerpatient = {};
var GENDER = "";
var MALE = 'MALE';
var FEMALE = 'FEMALE';
var BANKACCOUNT;
var MRN_VALUE;

$scope.mrnvalues = [];


/*
User wants to view past clocked in patients
*/
$scope.pastclockedinpatients = function () {
$state.go('pastpatients');
}//END pastclockedinpatients()


/**
 * Handles gender radiobutton
 */

$scope.male_checked = function(){
  document.getElementById("radiomale").checked = true;
  document.getElementById("radiofemale").checked = false;
  GENDER = MALE;
}

$scope.female_checked = function(){
  document.getElementById("radiofemale").checked = true;
  document.getElementById("radiomale").checked = false;
  GENDER = FEMALE;
}

$scope.get_gender = function(){
  return GENDER;
}

$scope.set_gender = function(type){
if(type==MALE){$scope.male_checked();}
else if(type==FEMALE){$scope.female_checked();}
else $scope.male_checked();
}

/**
 * END gender radiobutton handlers
 */

/*
Preloads registerpatient table -- works in background silently
 */
$scope.load_activepatients = function () {
    var firebase_url = "https://medisave-a4903.firebaseio.com/registerpatient";
    var firebase_reference = new Firebase(firebase_url);

    firebase_reference.on("child_added", function(snapshot, prevChildKey) {
        var data = snapshot.val();

        if(data!=null){
         $scope.mrnvalues.push(data.mrn);
        }
    });
}//END load_activepatients()


/**
 * User wants to choose a doctor
 * @tbldoctors
 */
$scope.choosedoctor = function(){
//Store form contents into memory
smarthealth.set_formcontents({
  "lastname":$scope.registerpatient.lastname,
  "firstname":$scope.registerpatient.firstname,
  "gender":$scope.get_gender(),
  "dateofbirthday":$scope.registerpatient.day,
  "dateofbirthmonth":$scope.registerpatient.month,
  "dateofbirthyear":$scope.registerpatient.year,
  "address":$scope.registerpatient.address,
  "phonenumber":$scope.registerpatient.phonenumber,
  "email":$scope.registerpatient.email,
  "referringdoctor":$scope.registerpatient.referringdoctor,
  "paymentmethod":$scope.registerpatient.paymentmethod,
  "notes":$scope.registerpatient.notes,
  "uniqueid":DB_UNIQUE_ID,
  "nic":$scope.registerpatient.nic,
  "bankaccount":$scope.registerpatient.bankaccount,
   "mrn":MRN_VALUE
});

$state.go('searchdoctors');
};//END choosedoctor()

//Popup initialisation
$scope.mainpopup={};
$ionicModal.fromTemplateUrl('patientregistration/banklist.html', {
id : '120',
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

/*
*Payment method has changed
*/
$scope.paymentmethodchange = function(){
if($scope.registerpatient.paymentmethod==="CREDIT CARD"){

var firebase_url = "https://medisave-a4903.firebaseio.com/tblaccountentries"
var firebase_reference = new Firebase(firebase_url);

  $scope.objects = [];
  $scope.loading = $ionicLoading.show({
    content: '<i class="icon ion-loading-c"></i>',
    animation: 'fade-in',
    showBackdrop: true,
    maxWidth: 50,
    showDelay: 0
  });
firebase_reference.child(smarthealth.get_bankaccount()).on("child_added", function(snapshot, prevChildKey) {
var data = snapshot.val();

if(data==null){
$ionicLoading.hide();
}else{

$scope.objects.push(data);
$ionicLoading.hide();
}

$scope.showPopup();
$scope.$apply();

});
    firebase_reference.once("value", function(snap) {
        $ionicLoading.hide();
    });


}
else{
  //User chose something else
  $scope.registerpatient.bankaccount = "";
}
}//END paymentmethodchange()


/*
*User has selected a bank provider
*/
$scope.bankaccountclicked = function(bankaccount){
  BANKACCOUNT = bankaccount;
  $scope.registerpatient.bankaccount = BANKACCOUNT.bankname;
  $scope.closePopup();
};//END bankaccountclicked()

/**
 * User wants to view clocked in patients
 * @Allow user to delete clocked in patients
 */
$scope.viewclockedinpatients = function(){
  //Store form contents into memory
smarthealth.set_formcontents({
  "lastname":$scope.registerpatient.lastname,
  "firstname":$scope.registerpatient.firstname,
  "gender":$scope.get_gender(),
  "dateofbirthday":$scope.registerpatient.day,
  "dateofbirthmonth":$scope.registerpatient.month,
  "dateofbirthyear":$scope.registerpatient.year,
  "address":$scope.registerpatient.address,
  "phonenumber":$scope.registerpatient.phonenumber,
  "email":$scope.registerpatient.email,
  "referringdoctor":$scope.registerpatient.referringdoctor,
  "paymentmethod":$scope.registerpatient.paymentmethod,
  "notes":$scope.registerpatient.notes,
  "nic":$scope.registerpatient.nic,
  "bankaccount":$scope.registerpatient.bankaccount,
   "mrn":MRN_VALUE
});
$state.go('viewclockedinpatients');}//END viewclockedinpatients()

//Helps in decision making whether to update/create database entries
var FLAG_STATE;

//Database item key (if existing)
var DB_UNIQUE_ID;

//Default is NONE and set to other than none by card reader button
var CARD_KEY = "NONE";

/**
 * Date parameters
 */
var SELECTED_YEAR = $scope.registerpatient.year;
var SELECTED_MONTH = $scope.registerpatient.month;
var SELECTED_DAY = $scope.registerpatient.day;
/**
 * Selector Configuration
 * Dateinput custom
 */

$scope.daychange = function(){

$scope.registerpatient.calculateage = (smarthealth.get_age($scope.registerpatient.year,$scope.registerpatient.month,$scope.registerpatient.day));
SELECTED_DAY = $scope.registerpatient.day;}

$scope.monthchange = function(){

$scope.registerpatient.calculateage = (smarthealth.get_age($scope.registerpatient.year,$scope.registerpatient.month,$scope.registerpatient.day));
SELECTED_MONTH = $scope.registerpatient.month;}

$scope.yearchange = function(){

$scope.registerpatient.calculateage = (smarthealth.get_age($scope.registerpatient.year,$scope.registerpatient.month,$scope.registerpatient.day));
SELECTED_YEAR = $scope.registerpatient.year;}

var populateSelectBox = function (selectbox, dataArray) {
    dataArray.forEach(function (data) {
        //selectbox.append("<option>" + data + "</option>");
        selectbox.append("<option value=" + data + ">"+data+"</option>");
    });
};

$scope.years_count = function(startYear) {
            var currentYear = new Date().getFullYear(), years = [];
            startYear = startYear || 1980;

            while ( startYear <= currentYear) {
                    years.push(startYear++);
            }

            return years;
    }

$scope.model = {
        barcode: 'none',
    };

//Populate entry fields if data is in memory
$scope.initFields = function(){

//Default parameters
$scope.registerpatient.gender = "MALE";

//Experimental radiobuttons
$scope.male_checked();

//Dynamically populate years
$scope.yearbuffer = [];

    $scope.buff=[];
    $scope.buff=($scope.years_count(1900));
    $scope.years = $scope.buff;
    if(window.localStorage.getItem("year")==null){}else {
      $scope.buff.push(window.localStorage.getItem("year"));
      $scope.years = $scope.buff;
    }

//Preconfigure dropdowns
$scope.registerpatient.day = "01";
$scope.registerpatient.month = "JANUARY";
$scope.registerpatient.year =  $scope.buff[60];
$scope.registerpatient.paymentmethod = "CASH";
$scope.registerpatient.mrn = smarthealth.generate_mrn();
MRN_VALUE = $scope.registerpatient.mrn;

/**
 * Date parameters
 */
SELECTED_YEAR = $scope.registerpatient.year;
SELECTED_MONTH = $scope.registerpatient.month;
SELECTED_DAY = $scope.registerpatient.day;


if(smarthealth.get_doctor()!=null){$scope.registerpatient.referringdoctor = smarthealth.get_doctor();}else{$scope.registerpatient.referringdoctor = "Choose doctor";}



//Reload contents into patientregistration view
if(smarthealth.get_formcontents()!=null){
console.log(smarthealth.get_formcontents());
DB_UNIQUE_ID = smarthealth.get_formcontents().uniqueid;
MRN_VALUE = smarthealth.get_formcontents().mrn;
$scope.registerpatient.lastname = smarthealth.get_formcontents().lastname;
$scope.registerpatient.firstname = smarthealth.get_formcontents().firstname;
$scope.set_gender(smarthealth.get_formcontents().gender);
$scope.registerpatient.day = smarthealth.get_formcontents().dateofbirthday;
$scope.registerpatient.month = smarthealth.get_formcontents().dateofbirthmonth;
$scope.registerpatient.year = smarthealth.get_formcontents().dateofbirthyear;
$scope.registerpatient.calculateage = smarthealth.get_age($scope.registerpatient.year,$scope.registerpatient.month,$scope.registerpatient.day);
$scope.registerpatient.address = smarthealth.get_formcontents().address;
$scope.registerpatient.phonenumber = smarthealth.get_formcontents().phonenumber;
$scope.registerpatient.email = smarthealth.get_formcontents().email;
$scope.registerpatient.paymentmethod = smarthealth.get_formcontents().paymentmethod;
$scope.registerpatient.nic = smarthealth.get_formcontents().nic;
$scope.registerpatient.notes = smarthealth.get_formcontents().notes;
$scope.registerpatient.bankaccount = smarthealth.get_formcontents().bankaccount;
$scope.registerpatient.mrn = MRN_VALUE;
}

$scope.$apply();
window.localStorage.clear();
};

$scope.$on('$ionicView.enter', function() {

    var date = new Date();
    console.log(date.toUTCString());


FLAG_STATE = smarthealth.getFlagState();
CARD_KEY = "NONE";
$scope.initFields();
$scope.load_activepatients();
});

//Date time popup initialization
var ipObj1 = {
callback: function (val) {  //Mandatory
//Get date parameters
var month = new Array(12);
month[0] = "Jan";
month[1] = "Feb";
month[2] = "Mar";
month[3] = "Apr";
month[4] = "May";
month[5] = "June";
month[6] = "July";
month[7] = "Aug";
month[8] = "Sept";
month[9] = "Oct";
month[10] = "Nov";
month[11] = "Dec";
var dateObj = new Date(val);
var month = month[dateObj.getUTCMonth()]; //months from 1-12
var day = dateObj.getUTCDate()+1;
var year = dateObj.getUTCFullYear();

//Set retrieved date on Birthday button
$scope.registerpatient.birthday = day+" "+month+" "+year;
},

      inputDate: new Date(),      //Optional
      mondayFirst: true,          //Optional
      closeOnSelect: false,       //Optional
      templateType: 'popup'       //Optional
};

 //Open datepicker upon request
 $scope.openDatePicker = function(){
 ionicDatePicker.openDatePicker(ipObj1);
 };

/**
 * Button bar item selection
 */

//Register patient
$scope.registerpatient = function(){

if($scope.registerpatient.lastname==null||$scope.registerpatient.lastname==""
||$scope.registerpatient.firstname==null||$scope.registerpatient.firstname==""
||$scope.registerpatient.address==null||$scope.registerpatient.address==""
||$scope.registerpatient.phonenumber==null||$scope.registerpatient.phonenumber==""){

UIkit.notification("Please fill in form correctly", {pos: 'top-right'});
}else{

//Buffer item
var registration_object;

var firebase_url = "https://medisave-a4903.firebaseio.com/registerpatient";
var firebase_reference = new Firebase(firebase_url);

var date = new Date();

if(FLAG_STATE){
//Update database item -- required

var ITEM;

if(CARD_KEY==="NONE"){ITEM = DB_UNIQUE_ID;}else{ITEM = CARD_KEY;};

registration_object = firebase_reference.child(DB_UNIQUE_ID);
registration_object.set({
  nic: $scope.registerpatient.nic,
  lastname: smarthealth.NullFilter($scope.registerpatient.lastname),
  firstname:smarthealth.NullFilter($scope.registerpatient.firstname),
  gender:$scope.get_gender(),
  dateofbirthyear:smarthealth.NullFilter($scope.registerpatient.year),
  dateofbirthmonth:smarthealth.NullFilter($scope.registerpatient.month),
  dateofbirthday:smarthealth.NullFilter($scope.registerpatient.day),
  address:smarthealth.NullFilter($scope.registerpatient.address),
  phonenumber:smarthealth.NullFilter($scope.registerpatient.phonenumber),
  email:smarthealth.NullFilter($scope.registerpatient.email),
  referringdoctor:smarthealth.NullFilter($scope.registerpatient.referringdoctor),
  paymentmethod:smarthealth.NullFilter($scope.registerpatient.paymentmethod),
  notes:$scope.registerpatient.notes,
  bankaccount:smarthealth.NullFilter($scope.registerpatient.bankaccount),
  uniqueid:ITEM,
  datetime:date.toUTCString(),
  mrn:MRN_VALUE
});

UIkit.notification("Updated successfully", {pos: 'top-right'});

/*var alertPopup = $ionicPopup.alert({
     title: 'Patient Registration',
     template: 'Updated successfully'
   });*/
   $scope.resetAll();

}else{

if(CARD_KEY==="NONE"){registration_object = firebase_reference.push();}
else{registration_object = firebase_reference.child(CARD_KEY);}

registration_object.set({
  nic: smarthealth.NullFilter($scope.registerpatient.nic),
  lastname: smarthealth.NullFilter($scope.registerpatient.lastname),
  firstname:smarthealth.NullFilter($scope.registerpatient.firstname),
  gender:$scope.get_gender(),
  dateofbirthyear:smarthealth.NullFilter($scope.registerpatient.year),
  dateofbirthmonth:smarthealth.NullFilter($scope.registerpatient.month),
  dateofbirthday:smarthealth.NullFilter($scope.registerpatient.day),
  address:smarthealth.NullFilter($scope.registerpatient.address),
  phonenumber:smarthealth.NullFilter($scope.registerpatient.phonenumber),
  email:smarthealth.NullFilter($scope.registerpatient.email),
  referringdoctor:smarthealth.NullFilter($scope.registerpatient.referringdoctor),
  paymentmethod:smarthealth.NullFilter($scope.registerpatient.paymentmethod),
  notes:smarthealth.NullFilter($scope.registerpatient.notes),
  uniqueid:registration_object.key(),
  bankaccount:smarthealth.NullFilter($scope.registerpatient.bankaccount),
  datetime:date.toUTCString(),
  mrn:smarthealth.generate_mrn()
});
UIkit.notification("Registered Successfully", {pos: 'top-right'});
/*var alertPopup = $ionicPopup.alert({
     title: 'Patient Registration',
     template: 'Registered Successfully'
   });*/
    $scope.resetAll();
}
smarthealth.clearUpdateFlag();
}//END ELSE CHECK
};

var port_value;

$scope.barcodeScanned = function(barcode) {

  alertPopup_scan.close();
  port_value = barcode.toString();
  //alertPopup.close();
  CARD_KEY = port_value;
  if(CARD_FLAG_STATE==="READ"){
  $scope.performDBRead();}
  else {$scope.performDBWrite();}
};

$scope.performDBRead = function(){
//Fetch from database -- if available
var firebase_url = "https://medisave-a4903.firebaseio.com/registerpatient";
var firebase_reference = new Firebase(firebase_url);
var STATUS = false;

setTimeout(function(){ if(!STATUS) {
  $ionicLoading.hide();
     var alertPopup = $ionicPopup.alert({
     title: 'ERROR',
     template: 'Card not yet assigned/registered'
   });
}

}, 4000);
firebase_reference.on("child_added", function(snapshot, prevChildKey) {
var data = snapshot.val();
 $scope.loading = $ionicLoading.show({
    content: '<i class="icon ion-loading-c"></i>',
    animation: 'fade-in',
    showBackdrop: true,
    maxWidth: 50,
    showDelay: 0
  });
if(data==null){
  $scope.loading.hide();

}else{
  if(data.uniqueid===CARD_KEY){
  $scope.loading.hide();
  STATUS = true;
  $scope.registerpatient.nic = data.nic;
  $scope.registerpatient.lastname = data.lastname;
  $scope.registerpatient.firstname = data.firstname;
  $scope.set_gender(data.gender);
  $scope.registerpatient.year = data.dateofbirthyear;
  $scope.registerpatient.month = data.dateofbirthmonth;
  $scope.registerpatient.day = data.dateofbirthday;
  $scope.registerpatient.address = data.address;
  $scope.registerpatient.phonenumber = data.phonenumber;
  $scope.registerpatient.email = data.email;
  $scope.registerpatient.referringdoctor = data.referringdoctor;
  $scope.registerpatient.paymentmethod = data.paymentmethod;
  $scope.registerpatient.notes = data.notes;
  $scope.registerpatient.bankaccount = data.bankaccount;
  $scope.registerpatient.mrn = data.mrn;
window.localStorage.setItem("year",data.dateofbirthyear);
//Dynamically populate years
$scope.yearbuffer = [];

    $scope.buff=[];
    $scope.buff=($scope.years_count(1850));
    if(window.localStorage.getItem("year")==null){}else {
      $scope.buff.push(window.localStorage.getItem("year"));
      $scope.years = $scope.buff;
    }
  $scope.$apply();
  //$ionicLoading.hide();
  }
}


});
    firebase_reference.once("value", function(snap) {
        $ionicLoading.hide();
    });
};

$scope.performDBWrite = function(){
$scope.registerpatient();
};


/**
 * END Serial Port Configuration functions
 */

var CARD_FLAG_STATE = "NONE";
var alertPopup_scan;

//Patient has card -- search database and auto fill registration
$scope.usecard = function(){
  alertPopup_scan = $ionicPopup.alert({
  title: 'Medisave Patient Registration',
  template: 'Scan the item using your barcode scanner'
   });
CARD_FLAG_STATE = "READ";
//$scope.nfcinit();
CARD_KEY = port_value;
};

//Patient has card and wants to register using card
$scope.registerpatientnfc = function(){
    alertPopup_scan = $ionicPopup.alert({
  title: 'Medisave Patient Registration',
  template: 'Scan the item using your barcode scanner'
   });
CARD_FLAG_STATE = "WRITE";
//$scope.nfcinit();
CARD_KEY = port_value;
};

//Patient does not have card -- do manual search
$scope.manualsearch = function(){
FLAG_STATE = smarthealth.clearUpdateFlag();
$state.go('searchpatient');
};

//Emergency auto fill registration form -- update ID later on
$scope.emergency = function(){
FLAG_STATE = smarthealth.clearUpdateFlag();
var UNKNOWN = "Unknown";
$scope.registerpatient.lastname = $scope.createEmergencyID();
$scope.registerpatient.firstname = UNKNOWN;
$scope.male_checked();
$scope.registerpatient.year = "";
$scope.registerpatient.month = "";
$scope.registerpatient.day = "";
$scope.registerpatient.address = UNKNOWN;
$scope.registerpatient.phonenumber = UNKNOWN;
$scope.registerpatient.email = UNKNOWN;
$scope.registerpatient.referringdoctor = UNKNOWN;
$scope.registerpatient.paymentmethod = UNKNOWN;
$scope.registerpatient.notes = UNKNOWN;
$scope.registerpatient.nic = UNKNOWN;
$scope.registerpatient.bankaccount = "";
$scope.registerpatient.mrn = smarthealth.generate_mrn();
MRN_VALUE = $scope.registerpatient.mrn;
$scope.$apply();
};


/**
 * END Button bar item selection
 */

//Create an Emergency ID for manual admission
$scope.createEmergencyID = function(){
var month = new Array(12);
month[0] = "Jan";
month[1] = "Feb";
month[2] = "Mar";
month[3] = "Apr";
month[4] = "May";
month[5] = "June";
month[6] = "July";
month[7] = "Aug";
month[8] = "Sept";
month[9] = "Oct";
month[10] = "Nov";
month[11] = "Dec";
var dateObj = new Date();
var month = month[dateObj.getUTCMonth()]; //months from 1-12
var day = dateObj.getUTCDate();
var year = dateObj.getUTCFullYear();
var hour = dateObj.getHours();
var minutes = dateObj.getMinutes();

return "EMERG"+"-"+day+"-"+month+"-"+year+"-"+"AT"+"-"+hour+":"+minutes;
};

//Reset all parameters
$scope.resetAll = function(){
$scope.registerpatient.lastname = "";
$scope.registerpatient.firstname = "";
$scope.registerpatient.calculateage = "";
$scope.male_checked();
$scope.registerpatient.birthday = "Select Birthday";
$scope.registerpatient.year = "";
$scope.registerpatient.month = "";
$scope.registerpatient.day = "";
$scope.registerpatient.address = "";
$scope.registerpatient.phonenumber = "";
$scope.registerpatient.email = "";
$scope.registerpatient.referringdoctor = "Choose Doctor";
$scope.registerpatient.paymentmethod = "";
$scope.registerpatient.notes = "";
$scope.registerpatient.nic = "";
$scope.registerpatient.bankaccount = "";
$scope.registerpatient.mrn = smarthealth.generate_mrn();
FLAG_STATE = smarthealth.clearUpdateFlag();
CARD_KEY = "NONE";
CARD_FLAG_STATE = "NONE";
};


/**
 * Clock patient into tblactivepatients
 */

$scope.clockpatientin = function(){

if($scope.registerpatient.lastname==null||$scope.registerpatient.lastname==""
||$scope.registerpatient.firstname==null||$scope.registerpatient.firstname==""
||$scope.registerpatient.address==null||$scope.registerpatient.address==""
||$scope.registerpatient.phonenumber==null||$scope.registerpatient.phonenumber==""){

UIkit.notification("Please fill in form correctly", {pos: 'top-right'});
}else{

  var is_registered = false;
  for(var i = 0; i <$scope.mrnvalues.length;i++){
    if($scope.mrnvalues[i]===MRN_VALUE){
        //Patient is a registered one -- carry on with clocking in
        is_registered = true;
    }
  }

  if(is_registered){$scope.insert_db_clockedin();}
  else{
  //Inform user that he/she needs to register a patient before clocking that patient in
  UIkit.modal.dialog('<div class="uk-modal-header"><h2 class="uk-modal-title">Patient Registration</h2></div><div class="uk-modal-body" uk-overflow-auto><dd>Make sure you register this patient before clocking in. This is needed to make sure that the patient database in maintained properly.</dd></div>');
  }

}//END ELSE
}

$scope.insert_db_clockedin = function () {
    var operator = true;
    var firebase_url = "https://medisave-a4903.firebaseio.com/tblactivepatients";
    var firebase_reference = new Firebase(firebase_url);

    var registration_object = firebase_reference.push();
    var date = new Date();

    registration_object.set({
        nic: smarthealth.NullFilter($scope.registerpatient.nic),
        lastname: $scope.registerpatient.lastname,
        firstname:$scope.registerpatient.firstname,
        gender:$scope.get_gender(),
        dateofbirthyear:$scope.registerpatient.year,
        dateofbirthmonth:$scope.registerpatient.month,
        dateofbirthday:$scope.registerpatient.day,
        address:$scope.registerpatient.address,
        phonenumber:$scope.registerpatient.phonenumber,
        email:smarthealth.NullFilter($scope.registerpatient.email),
        referringdoctor:smarthealth.NullFilter($scope.registerpatient.referringdoctor),
        paymentmethod:smarthealth.NullFilter($scope.registerpatient.paymentmethod),
        uniqueid:registration_object.key(),
        datetime:date.toUTCString(),
        facilityoccupied:"NONE",
        notes:smarthealth.NullFilter($scope.registerpatient.notes),
        bankaccount:smarthealth.NullFilter($scope.registerpatient.bankaccount),
        mrn:MRN_VALUE
    });
    UIkit.notification("Clocked in successfully", {pos: 'top-right'});


}//END insert_db_clockedin()

})//END registerpatientcontroller

.controller('searchpatientcontroller', function($scope,$http,$state,$ionicPopup,$timeout,$ionicLoading,smarthealth) {

$scope.patients = [];
$scope.bufferitems = [];

var firebase_url = "https://medisave-a4903.firebaseio.com/registerpatient";
var firebase_reference = new Firebase(firebase_url);

 $scope.addLine = function (input) {
 input.calculateage = smarthealth.get_age(input.dateofbirthyear,input.dateofbirthmonth,input.dateofbirthday);
 var x =  input.datetime;
 input.datetime = smarthealth.get_localtime(x);
 $scope.patients.push(input);
 };

$scope.$on('$ionicView.enter', function() {
$scope.patients = [];
$scope.bufferitems = [];
  $scope.loading = $ionicLoading.show({
    content: '<i class="icon ion-loading-c"></i>',
    animation: 'fade-in',
    showBackdrop: true,
    maxWidth: 50,
    showDelay: 0
  });
firebase_reference.on("child_added", function(snapshot, prevChildKey) {
var object = snapshot.val();
$scope.item = [];
item = [{eventcontent:snapshot.val().content,keymap:snapshot.name()}];
$scope.bufferitems.push(item);
$scope.addLine(object);
 $scope.$apply();
 $ionicLoading.hide();
});

    firebase_reference.once("value", function(snap) {
        $ionicLoading.hide();
    });
});

$scope.refreshlist = function(){
$scope.patients = [];
firebase_reference.on("child_added", function(snapshot, prevChildKey) {
var object = snapshot.val();
$scope.item = [];
item = [{eventcontent:snapshot.val().content,keymap:snapshot.name()}];
$scope.bufferitems.push(item);
$scope.addLine(object);
 $scope.$apply();
});
    firebase_reference.once("value", function(snap) {
        $ionicLoading.hide();
    });
};

//Back key handling
$scope.handleBack = function(){
$state.go('app.registerpatient');
};

//A patient has been selected from the list
$scope.showDetails = function(list_item){
$scope.reopen_registerpatientcontroller(list_item);

};

//Shift to registerpatientcontroller window
$scope.reopen_registerpatientcontroller = function(list_item){
var selected_key;
for(var i = 0;i<$scope.bufferitems.length;i++){
if($scope.bufferitems[i][0].eventcontent===list_item.content){
var selected_key = $scope.bufferitems[i][0].keymap;
}
}

//Store patient details into memory stack
smarthealth.set_formcontents(list_item);
smarthealth.set_doctor(list_item.referringdoctor);

//Set FLAG to update enable
smarthealth.setUpdateFlag();
$state.go('app.registerpatient');
};

})//END searchpatientcontroller

app.controller('viewclockedinpatientscontroller', function($scope,$ionicLoading,$ionicActionSheet,$ionicModal,ionicDatePicker, $timeout, $state,$ionicPopup,smarthealth) {


/**
 * User wants to remove active patient
 * @tblactivepatients
 */
$scope.removeactivepatient = function(activepatient){

//Confirm before removing patient from activepatients list
UIkit.modal.confirm('Are you want to remove patient: '+activepatient.lastname +' '+activepatient.firstname+' from the clocked in patients list?',"center: true").then(function() {
var UNIQUE_ID = activepatient.uniqueid;
var firebase_url = "https://medisave-a4903.firebaseio.com/tblactivepatients";
var firebase_reference = new Firebase(firebase_url);

//REMOVE ITEM FROM tblactivepatients
firebase_reference.child(UNIQUE_ID).remove();

//RELOAD LIST CONTENTS TO REFLECT CHANGES

$scope.activepatients = [];
var firebase_url = "https://medisave-a4903.firebaseio.com/tblactivepatients";
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
$ionicLoading.hide();

data.calculateage = smarthealth.get_age(data.dateofbirthyear,data.dateofbirthmonth,data.dateofbirthday);
$scope.activepatients.push(data);

$scope.$apply();}
else{$ionicLoading.hide();}
});
    firebase_reference.once("value", function(snap) {
        $ionicLoading.hide();
    });

}, function () {

});




};//END removeactivepatient()


$scope.backtomenu = function(){$state.go('app.registerpatient');}

/**
 * Populate list with active patients
 * Use tblactivepatients as datasource
 */
$scope.$on('$ionicView.enter',function(){
$scope.activepatients = [];
var firebase_url = "https://medisave-a4903.firebaseio.com/tblactivepatients";
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
$ionicLoading.hide();
data.calculateage = smarthealth.get_age(data.dateofbirthyear,data.dateofbirthmonth,data.dateofbirthday);
data.datetime = smarthealth.get_localtime(data.datetime);
$scope.activepatients.push(data);


$scope.$apply();}
else{$ionicLoading.hide();}
});
    firebase_reference.once("value", function(snap) {
        $ionicLoading.hide();
    });
});//END $ionicView.enter

/**
 * Show selected clocked-in patient details
 */
$scope.patient = {};
$scope.showclockedinDetails = function(patient){
$scope.patient = patient;
}


})//END viewclockedinpatientscontroller()

app.controller('searchdoctorscontroller', function($scope,$ionicLoading,$ionicActionSheet,$ionicModal,ionicDatePicker, $timeout, $state,$ionicPopup,smarthealth) {
$scope.handleBack = function(){$state.go('app.registerpatient');}
/**
 * Populate list with known doctors
 * Use tbldoctors as datasource
 */
$scope.$on('$ionicView.enter',function(){
$scope.doctors = [];

var firebase_url = "https://medisave-a4903.firebaseio.com/tblservices";

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
$ionicLoading.hide();
if(data.servicecategory==="DOCTOR"){
$scope.doctors.push(data);}

$scope.$apply();}
else{$ionicLoading.hide();}
});
    firebase_reference.once("value", function(snap) {
        $ionicLoading.hide();
    });
});//END $ionicView.enter

/**
 * A doctor has been selected
 */
$scope.showDetails = function(doctor){
//smarthealth.set_doctor(doctor.surname+"  "+doctor.givenname);
smarthealth.set_doctor(doctor.servicetype);
$scope.handleBack();
};//END showDetails()

});//END searchdoctorscontroller()

app.controller('pastpatientscontroller', function($scope,$ionicLoading,$ionicActionSheet,$ionicModal,ionicDatePicker, $timeout, $state,$ionicPopup,smarthealth) {
    $scope.handleBack = function () {
        $state.go('app.registerpatient');
    }

    $scope.patients = [];
    $scope.patient = {};

    $scope.$on('$ionicView.enter',function(){
        $scope.patients = [];

        var firebase_url = "https://medisave-a4903.firebaseio.com/tblpastpatients";
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
                $ionicLoading.hide();
                data.calculateage = smarthealth.get_age(data.dateofbirthyear,data.dateofbirthmonth,data.dateofbirthday);
                data.datetime = smarthealth.get_localtime(data.datetime);
                data.dischargedate = smarthealth.get_localtime(data.dischargedate);
                if(data.facilityoccupied==null){data.facilityoccupied="OUTPATIENT";}
                $scope.patients.push(data);
            }
            else{$ionicLoading.hide();}
        });
        firebase_reference.once("value", function(snap) {
            $ionicLoading.hide();
        });
    });//END $ionicView.enter

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

    /*
    User wants to view patients details
     */
    $scope.patientdetails = function(patient){
    $scope.patient = patient;
    }//END patientdetails()



    /*
    User wants to print the past invoice of this patient
    */
    $scope.patientdata = {};
    //Reset buffers
    var SUM_TOTAL = 0;
    var TEMP = 0;
    var CURRENT_PATIENT;

    $scope.invoices = [];
    $scope.printpatient = function (patient) {
        $scope.patientdata = {};
        $scope.invoices = [];
        CURRENT_PATIENT = patient;

        $scope.patientdata.fullname = CURRENT_PATIENT.firstname + " " + CURRENT_PATIENT.lastname;
        $scope.patientdata.address = CURRENT_PATIENT.address;
        $scope.patientdata.mrn = CURRENT_PATIENT.mrn;
        //Determine if INPATIENT / OUTPATIENT
        if(CURRENT_PATIENT.facilityoccupied==null||CURRENT_PATIENT.facilityoccupied==""||CURRENT_PATIENT.facilityoccupied=="NONE"){
            $scope.patientdata.facilityoccupied = "Casualty";
        }else{
            $scope.patientdata.facilityoccupied = "Inpatient";
        }

        $scope.patientdata.paymentmethod = CURRENT_PATIENT.paymentmethod;
        $scope.patientdata.invoicenumber = smarthealth.generateInvoiceNumber();

        //Set Discount amount to 0 as default
        $scope.patientdata.discountamount = 0;

        /*
         Fill in patient data
         */
        var date = new Date();

        /**
         * TEMP BUFFER
         */
        var TEMP = 0;

        $scope.patientdata.fullname = CURRENT_PATIENT.firstname + " " + CURRENT_PATIENT.lastname;
        $scope.patientdata.address = CURRENT_PATIENT.address;
        $scope.patientdata.mrn = CURRENT_PATIENT.mrn;
        //Determine if INPATIENT / OUTPATIENT
        if(CURRENT_PATIENT.facilityoccupied==null||CURRENT_PATIENT.facilityoccupied==""||CURRENT_PATIENT.facilityoccupied=="NONE"){
            $scope.patientdata.facilityoccupied = "Casualty";
        }else{
            $scope.patientdata.facilityoccupied = "Inpatient";
        }
        $scope.patientdata.currentdate = smarthealth.get_date();
        $scope.patientdata.paymentmethod = CURRENT_PATIENT.paymentmethod;
        $scope.patientdata.discountamount = CURRENT_PATIENT.discountamount;

        if( $scope.patientdata.discountamount==null|| $scope.patientdata.discountamount==""){ $scope.patientdata.discountamount = 0;}


        $scope.patientdata.datetime = CURRENT_PATIENT.datetime;
        $scope.patientdata.dischargedate = CURRENT_PATIENT.dischargedate;
        $scope.patientdata.invoicenumber = smarthealth.generateInvoiceNumber();

        function convertDate(inputFormat) {
            function pad(s) { return (s < 10) ? '0' + s : s; }
            var d = new Date(inputFormat);
            return [pad(d.getDate()), pad(d.getMonth()+1), d.getFullYear()].join('/');
        }


        /*
         END Fill in patient data
         */

        var firebase_url = "https://medisave-a4903.firebaseio.com/tblitemsconsumed";
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
                $ionicLoading.hide();

                //Match uniqueid before pushing to $scope.invoices
                if(CURRENT_PATIENT.uniqueid===data.activepatientid){

                    //Special formatting
                    data.itemcost = format1(parseFloat(data.itemcost), "");

                    //Convert date to human readable format instead of ISOString()
                    var datum = new Date(data.dateofuse);
                    var minutes = "";
                    if(datum.getMinutes()==0){minutes = "00";}else{minutes = datum.getMinutes().toString();}
                    data.dateofuse = convertDate(data.dateofuse) + " at " +datum.getHours()+":"+minutes;

                    if(data.quantity==null){
                        data.quantity="1";
                        data.amount = format1(parseFloat(Number(1*data.itemcost.replace(/,/g, ''))), "");

                        TEMP = parseFloat(Number(1*data.itemcost.replace(/,/g, '')));
                    }
                    else{
                        data.amount = format1(parseFloat(Number(data.quantity*data.itemcost.replace(/,/g, ''))), "");


                        TEMP = parseFloat(Number(data.quantity*data.itemcost.replace(/,/g, '')));
                    }


                    SUM_TOTAL = SUM_TOTAL + TEMP;

                    $scope.patientdata.sumtotal = format1(parseFloat(SUM_TOTAL - Number($scope.patientdata.discountamount)),"");

                    //Compute amount to pay
                    AMOUNT_TO_PAY = SUM_TOTAL - Number($scope.patientdata.discountamount);
                    $scope.patientdata.amounttopay = format1(parseFloat(SUM_TOTAL - Number($scope.patientdata.discountamount)),"");
                    data.amounttopay = format1(parseFloat(SUM_TOTAL - Number($scope.patientdata.discountamount)),"");
                    $scope.invoices.push(data);
                    $scope.generate_printable_pdf();
                }


                $scope.$apply();}
            else{$ionicLoading.hide();}
        });
        firebase_reference.once("value", function(snap) {
            $ionicLoading.hide();
        });

    }//END printpatient()


    /*Generates printable PDF*/
    $scope.generate_printable_pdf = function () {


        var date = new Date();
        var doc = new jsPDF()

        var imgData = smarthealth.return_medisave_logo();

//BEGIN MEDISAVE HEADER
        doc.setFontSize(8);
        doc.setFontType('bold');
        doc.text(100, 10, 'INVOICE');
        doc.setFontType('normal');
        doc.text(100, 15, 'BRN C07007746');
        doc.text(100, 20, 'ST JEAN ROAD');
        doc.text(100, 25, 'QUATRE BORNES');
        doc.text(100, 30, 'Tel: 230 427 7000-4');
        doc.text(100, 35, 'Fax: 230 424 1538');
        doc.text(100, 40, 'Email: hcisgm@intnet.mu');
        doc.addImage(imgData, 'JPEG', 20, 8, 70, 35);
        doc.rect(10, 5, 190, 40);
//END MEDISAVE HEADER

//BEGIN MEDISAVE SUBHEADER & PATIENT DETAILS

//Construct minibox on the right handside of the page
        doc.rect(125, 50, 75, 15);
        doc.setFontType('bold');
        doc.text(128, 55,"Invoice Number: ");
        doc.text(128, 60,"Date: ");
        doc.setFontType('normal');
        doc.text(155, 55,$scope.patientdata.invoicenumber);
        doc.text(155, 60,smarthealth.get_localtime($scope.patientdata.currentdate));
//END minibox
//Construct patient details box on left hand side (borderless)
        doc.setFontType('bold');
        doc.text(10, 55,"Patient:");
        doc.text(10, 60,"Address:");
        doc.text(10, 65,"Type:");
        doc.text(10, 70,"Payment:");
        doc.text(10, 75,"DOA:");
        doc.text(10, 80,"DOD:");
        doc.text(10, 85,"MRN:");

//Verify if patient is admitted or not
        if($scope.patientdata.facilityissuedate==null){$scope.patientdata.facilityissuedate = "Outpatient";}
        doc.setFontType('normal');
        doc.text(25, 55,$scope.patientdata.fullname);
        doc.text(25, 60,$scope.patientdata.address);
        doc.text(25, 65,$scope.patientdata.facilityoccupied);
        doc.text(25, 70,$scope.patientdata.paymentmethod);
        doc.text(25, 75,$scope.patientdata.datetime);
        doc.text(25, 80,$scope.patientdata.dischargedate);
        doc.text(25, 85,$scope.patientdata.mrn);
//END Construct patient details box on left hand side (borderless)
//END MEDISAVE SUBHEADER & PATIENT DETAILS

//Draw a table//BEGIN TABLE
        doc.setFontType('bold');
        doc.text(10, 100,"DESCRIPTION");
        doc.text(55, 100,"PRICE (Rs)");
        doc.text(80, 100,"QUANTITY");
        doc.text(100, 100,"AMOUNT (Rs)");
        doc.text(130, 100,"ITEM CATEGORY");
        doc.text(170, 100,"DATE CONSUMED");
//END table draw
        doc.setFontType('normal');
        var reference_y = 100;
        for(var i = 0; i < $scope.invoices.length;i++){
            var data = $scope.invoices[i];
            reference_y = reference_y + 5;
            doc.text(10, reference_y,data.itemconsumed);
            doc.text(70, reference_y,data.itemcost,null,null,"right");
            doc.text(90, reference_y,data.quantity,null,null,"right");
            doc.text(120, reference_y,data.amount,null,null,"right");
            doc.text(130, reference_y,data.itemcategory);
            doc.text(170, reference_y,data.dateofuse);

        }

//Construct footer on the right handside of the page
        doc.rect(125, reference_y+10, 75, 20);
        doc.setFontType('bold');
        doc.text(128, reference_y+15,"Total (Rs):");
        doc.text(128, reference_y+20,"Discount (Rs):");
        doc.text(128, reference_y+25,"Net to Pay(Rs):");
        doc.setFontType('normal');
        doc.text(195, reference_y+15,$scope.patientdata.sumtotal,null,null,"right");
        doc.text(195, reference_y+20,$scope.patientdata.discountamount.toString(),null,null,"right");
        doc.text(195, reference_y+25,$scope.patientdata.amounttopay,null,null,"right");
//END footer


        doc.output('dataurlnewwindow');
    }//END generate_printable_pdf()



})//END pastpatientscontroller()

//END controller.js;
