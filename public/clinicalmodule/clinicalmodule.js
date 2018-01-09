app.controller('clinicalmodulecontroller',function($http,$scope,$window,$state){

$scope.newsfeed = function () {
$state.go('app.newsfeed');
};//END newsfeed()

$scope.doctorbiodata = function () {
$state.go('app.doctordetails');
};//END doctorbiodata()

$scope.patientmanager = function () {
$state.go('app.tblactivepatients');
};//END patientmanager()

$scope.doctorappointments = function () {
window.localStorage.setItem('dashboardtype','doctor');
window.localStorage.setItem('saveapptmode','create');
$state.go('app.appointments');
};//END doctorappointments()

$scope.openbrowser = function () {
//$state.go('app.inbuiltbrowser');
    window.open("https://www.nice.org.uk/guidance/published?type=cg", '_blank');
    window.focus();
};//END openbrowser()

})//END clinicalmodulecontroller()


/***
 * Direct to the tblactivepatients
 */
app.controller('tblactivepatientscontroller',function($http,$scope,$window,$state,smarthealth,$ionicLoading){

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
            UIkit.notification('Select a patient', {pos: 'top-right'});
            $ionicLoading.hide();
        });
    });//END $ionicView.enter


$scope.showDetails = function (data) {
    window.localStorage.setItem('dashboardtype','patient');
    window.localStorage.setItem("memalloc","0:0:0:0:1:1:0:1:0:0:0:0:0:0:0:1:1:1:0:0:0:0:0:0:1:1");
    window.localStorage.setItem("patientid",data.mrn);
    window.localStorage.setItem("patientname",data.firstname+" "+data.lastname);
    window.localStorage.setItem("savemode","create");//Default consultation mode of operation
    window.localStorage.setItem("uuidlock","unlock");
    $state.go('app.newconsultation');
}



})//END tblactivepatientscontroller()


//-----------------------------------------------------------------------------------------------------------------------------//
//-----------------------------------------------DOCTOR LOGIN/REGISTER MANAGEMENT----------------------------------------------//
//-----------------------------------------------------------------------------------------------------------------------------//

//Doctor newsfeed controller
app.controller('newsfeedcontroller',function($http,$scope,$window){
  $scope.newsfeeds = [];

   //Enable CORS to run this code snippet properly
   RSSParser.parseURL('http://www.who.int/feeds/entity/mediacentre/news/en/rss.xml', function(err, parsed) {

      if(parsed!=null){

          parsed.feed.entries.forEach(function(entry) {
              $scope.newsfeeds.push(entry);
          })
          $scope.$apply();
      }


    });


//Received click event on WHO News Feed
$scope.showURLDetails = function(specified_url){$scope.redirect_to_url(specified_url.link);}

//Opens new browser window with requested URL
$scope.redirect_to_url = function(input){window.open(input, '_blank');win.focus();};

})

app.controller('AppCtrl', function($scope,$ionicPopup, $ionicModal, $timeout, $state, $ionicLoading, $http, $window, smarthealth,$ionicActionSheet) {
  //process.env.NODE_ENV= "development";
  $scope.items = [];
  $scope.itemsx = [];
  window.localStorage.setItem('dashboardtype','doctor');
  itemsx = [
  {title:'News Feed',subtitle:'Popular medications',sheet:'newsfeed',image:'img/newsfeed.png'},
  {title:'My details',subtitle:'Basic information',sheet:'doctordetails',image:'img/mydetails.png'},
  {title:'Patient Manager',subtitle:'Access patient data',sheet:'patientmanager',image:'img/search.png'},
  {title:'Appointments',subtitle:'Agenda manager',sheet:'appointments',image:'img/myappointments.png'},
  {title:'Browser',subtitle:'Stay medically upto date',sheet:'inbuiltbrowser',image:'img/google.png'},
  {title:'Logout',subtitle:'Exit main menu',sheet:'mainscreen',image:'img/ic_whats_hot.png'}
  ];
  // {title:'Downloads',subtitle:'See browser downloads',sheet:'downloads',image:'img/downloads.png'},
  angular.forEach(itemsx, function(item){
     $scope.items.push(item);
   });

  //Instantiate Windows Azure platform
  //var client = new WindowsAzure.MobileServiceClient('https://smarthealthsolutions.azure-mobile.net/', 'nrFwbzJBHoGRjhHkBQvRnOxEWwsdVu91'),
  //doctorloginTable = client.getTable('doctorlogin');

  // Form data for the doctorlogin modal
  $scope.loginData = {};

  //Form assign doctor NID modal
  $scope.registerdoctorData = {};

  var port_value;
  // Create the doctor login view modal that we will use later
  $ionicModal.fromTemplateUrl('clinicalmodule/login.html', {
  id : '1',
  scope: $scope
  }).then(function(modal) {
  $scope.oModal1 = modal;
  });

  // Triggered in the login modal to close it
  $scope.closeLogin = function() {
    $scope.oModal1.hide();
  };

  // Open the login modal
  $scope.login = function() {
    $scope.oModal1.show();
  };

var alertPopup;

  // On login success show a modal for confirmation
  $ionicModal.fromTemplateUrl('clinicalmodule/loginsuccess.html', {
  id : '2',
  scope: $scope
  }).then(function(modal) {
  $scope.oModal2 = modal;
  });

  // Triggered in the login modal to close it
  $scope.dismissSuccess = function() {
    $scope.oModal2.hide();
  };

  // Open the success modal
  $scope.showSuccess = function() {
    $scope.oModal2.show();
  };

  // On login failure show a modal for confirmation
  $ionicModal.fromTemplateUrl('clinicalmodule/loginfailed.html', {
  id : '3',
  scope: $scope
  }).then(function(modal) {
  $scope.oModal3 = modal;
  });

  // Triggered in the login modal to close it
  $scope.dismissFailed = function() {
    $scope.oModal3.hide();
  };

  // Open the login modal
  $scope.showFailed = function() {
    $scope.oModal3.show();
  };


  // Login was successful navigate to ionic sidemenu
  $scope.completeLogin = function() {
  $scope.dismissSuccess();
  $state.go('app.newsfeed');
  };


  //Switch to doctor registration form
  $scope.switchToRegister = function(){
  $state.go('registerdoctor');
  };

  //Switch to doctor login form
  $scope.switchToLogin = function(){
  $state.go('mainscreen');
  };

  //Doctor clicked on forgot password button
  $ionicModal.fromTemplateUrl('clinicalmodule/forgotpassword.html', {
  id : '90123',
  scope: $scope
  }).then(function(modal) {
  $scope.oModal1020 = modal;
  });

  // Triggered in the login modal to close it
  $scope.dismissforgot = function() {
    $scope.oModal1020.hide();
  };

  // Open the login modal
  $scope.showforgot = function() {
    $scope.oModal1020.show();
  };

  //Doctor forgot password
  $scope.doctorforgotpassword = function(){
    $scope.showforgot();
  };

   //Controller for assign id doctor dialog box
  $ionicModal.fromTemplateUrl('clinicalmodule/assignid.html', {
  id : '4',
  scope: $scope
  }).then(function(modal) {
  $scope.assigndoctor = modal;
  });

  //Display assign id doctor dialog box
  $scope.assigniddoctor = function(){
    $scope.assigndoctor.show();
  };

  //Dismiss assign id doctor dialog box
  $scope.dismissiddoctor = function(){
  $scope.assigndoctor.hide();
  };

  // On register failure show a modal for alerting doctor
  $ionicModal.fromTemplateUrl('clinicalmodule/failedregistration.html', {
  id : '5',
  scope: $scope
  }).then(function(modal) {
  $scope.failregister = modal;
  });

  //Display failed registration doctor dialog box
  $scope.showFailedRegistration = function(){
  $scope.failregister.show();
  };

  //Dismiss failed registration dialog box
  $scope.dismissFailedRegistration = function(){
      $ionicLoading.hide();
  //$scope.failregister.hide();
  };

  //Error message - required fields not filled properly
  $ionicModal.fromTemplateUrl('clinicalmodule/warnemptyfields.html', {
  id : '6',
  scope: $scope
  }).then(function(modal) {
  $scope.emptyfields = modal;
  });

  //Show dialog box warning
  $scope.showWarningEmpty = function(){
    $scope.emptyfields.show();
  };
  //Dismiss dialog box empty
  $scope.dismissWarningEmpty = function(){
    $scope.emptyfields.hide();
  };

  //Register doctor popup called
  $ionicModal.fromTemplateUrl('clinicalmodule/registerdoctorpopup.html', {
  id : '7',
  scope: $scope
  }).then(function(modal) {
  $scope.registerpopup = modal;
  });

  //Show register doctor popup PARAMETERS(name,email,NID)
  $scope.showregisterpopup = function(){
    $scope.registerpopup.show();
  };

  //Dismiss register doctor popup
  $scope.dismissregisterpopup = function(){
    $scope.registerpopup.hide();
  };

  //Show/dismiss loading spinner
  $ionicModal.fromTemplateUrl('clinicalmodule/loading.html', {
  id : '8',
  scope: $scope
  }).then(function(modal) {
  $scope.spinloading = modal;
  });

  // Triggered in the login modal to close it
  $scope.dismissLoader = function() {
    //$scope.spinloading.hide();
    $ionicLoading.hide();
  };

  // Open the login modal
  $scope.showLoader = function() {
    //$scope.spinloading.show();
    $scope.loading = $ionicLoading.show({
    content: '<i class="icon ion-loading-c"></i>',
    animation: 'fade-in',
    showBackdrop: true,
    maxWidth: 50,
    showDelay: 0
  });
  };

//ID of doctor assigned for registration
$scope.echoregisteredID = function(){

var firebase_reference = new Firebase(smarthealth.DATABASE_URL_DOCTORLOGIN());
var registration_object = firebase_reference.child($scope.registerdoctorData.doctorpassword);
var date = new Date();

registration_object.set({
  password: $scope.registerdoctorData.doctorpassword,
  email: $scope.registerdoctorData.doctoremail,
  name: $scope.registerdoctorData.doctorname,
  id: $scope.registerdoctorData.doctorpassword,
  startdate:date.getDate().toString(),
  subscription:'inactive',
  billingid:'none',
  paymentmode:'none',
  nfcbt: "not assigned",
  complete: false

});
$scope.dismissregisterpopup();
//Chain sequence to enter sidemenu from success dialog box
$scope.showSuccess();
};//END echoregisteredID()

// Perform the login action when the user submits the login form
$scope.doLogin = function() {
$scope.showLoader();

var firebase_reference = new Firebase(smarthealth.DATABASE_URL_DOCTORLOGIN());
var registration_object = firebase_reference;
var date = new Date();
registration_object.child($scope.loginData.text).on("value", function(snapshot) {
var data = snapshot.val();
var subscription_state = true;
if(data==null){
$scope.dismissLoader();
$scope.showFailed();
}else{

  subscription_state = true;
  if(data.id === $scope.loginData.text){
    
    window.localStorage.clear();
    //Save doctor NID and NAME to memory stack
    window.localStorage.setItem("commonid","");
    //Initialize key sequencing
    window.localStorage.setItem("memalloc","0:0:0:0:1:1:0:1:0:0:0:0:0:0:0:1:1:1:0:0:0:0:0:0:1:1");
    smarthealth.setID(data.id);

    //DOCTOR LOGIN MARKS DATA RESET
    window.localStorage.setItem("profilepicture","");
    window.localStorage.setItem("email",data.email);
    window.localStorage.setItem("uuidlock","unlock");
    window.localStorage.setItem("doctorid",data.id);
    window.localStorage.setItem("doctorname",data.name);

    //END RESET MEMORY STACK
    $scope.dismissLoader();

    //Store BILLING_ID in case doctor wants to suspend his/her account
    window.localStorage.setItem("billingid",data.billingid);

    //If not subscribed block access until PayPal billing is activated for the doctor
    if(subscription_state){$scope.showSuccess();}
  }


  }
});

$scope.closeLogin();

};

$scope.manual_doLogin = function(input){
  $scope.showLoader();

var firebase_reference = new Firebase(smarthealth.DATABASE_URL_DOCTORLOGIN());
var registration_object = firebase_reference;
var date = new Date();
registration_object.child(input.toString()).on("value", function(snapshot) {
var data = snapshot.val();
var subscription_state = true;
if(data==null){
$scope.dismissLoader();
$scope.showFailed();
}else{

  subscription_state = true;
  if(data.nfcbt === input){
    window.localStorage.clear();
    //Save doctor NID and NAME to memory stack
    window.localStorage.setItem("commonid","");
    //Initialize key sequencing
    window.localStorage.setItem("memalloc","0:0:0:0:1:1:0:1:0:0:0:0:0:0:0:1:1:1:0:0:0:0:0:0:1:1");
    smarthealth.setID(data.id);

    //DOCTOR LOGIN MARKS DATA RESET
    window.localStorage.setItem("profilepicture","");
    window.localStorage.setItem("email",data.email);
    window.localStorage.setItem("uuidlock","unlock");
    window.localStorage.setItem("doctorid",data.id);
    window.localStorage.setItem("doctorname",data.name);

    //END RESET MEMORY STACK
    $scope.dismissLoader();

    //Store BILLING_ID in case doctor wants to suspend his/her account
    window.localStorage.setItem("billingid",data.billingid);

    //If not subscribed block access until PayPal billing is activated for the doctor
    if(subscription_state){$scope.showSuccess();}
  }


  }
});
$scope.closeLogin();
};

$scope.switchToRegisterPatient = function(){
//Load biodata sheet for patient registration
  $state.go('app.registerpatient');
};

//END OF CONTROLLER AppCtrl
})

app.controller('biodatacontroller', function($scope, $ionicModal, $timeout, $state, ionicDatePicker, $ionicPopup, $ionicLoading,smarthealth) {

    $scope.showLoader = function() {
        //$scope.spinloading.show();
        $scope.loading = $ionicLoading.show({
            content: '<i class="icon ion-loading-c"></i>',
            animation: 'fade-in',
            showBackdrop: true,
            maxWidth: 50,
            showDelay: 0
        });
    };

  $scope.biodata = {};

 //Begin loading biodata contents
 $scope.showLoader();

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
$scope.biodata.birthday = day+" "+month+" "+year;
},

      from: new Date(1900, 1, 1), //Optional
      to: new Date(2030, 10, 30), //Optional
      inputDate: new Date(),      //Optional
      mondayFirst: true,          //Optional
      closeOnSelect: false,       //Optional
      templateType: 'popup'       //Optional
};

 //Open datepicker upon request
 $scope.openDatePicker = function(){
 ionicDatePicker.openDatePicker(ipObj1);
 };

$scope.$on('$ionicView.enter', function() {
  window.localStorage.setItem('doctorid',smarthealth.get_usercredentials_pwd());
    $scope.loading = $ionicLoading.show({
    content: '<i class="icon ion-loading-c"></i>',
    animation: 'fade-in',
    showBackdrop: true,
    maxWidth: 50,
    showDelay: 0
  });

var DATA;
    /**
     *
     * To prevent errors in caching assign all
     * parameters to default state
     */

    $scope.biodata.done = "Create biodata";
    $scope.biodata.fullname = '';
    $scope.biodata.occupation = '';
    $scope.biodata.address = '';
    $scope.biodata.city = '';
    $scope.biodata.homephone = '';
    $scope.biodata.mobilephone = '';
    $scope.biodata.emailaddress = '';
    $scope.biodata.birthday = 'Date of Birth';
    $scope.biodata.gender = 'Gender';
    document.getElementById('biodata.profilepic').src = "img/noimage.png";
    window.localStorage.setItem("MODE","NEW");
    PICTURE = "null";

var firebase_reference = new Firebase(smarthealth.DATABASE_URL_SMARTHEALTHBIODATA());
var registration_object = firebase_reference;

registration_object.on("child_added", function(snapshot, prevChildKey) {
var data = snapshot.val();

if(data==null){

}else{
  if(data.key_patientfile_unique_id === window.localStorage.getItem("doctorid")){
        DATA = data;
    }
  }
});

    registration_object.on("value", function(snapshot){
        var data = DATA;

        $ionicLoading.hide();

        //Biodata exists -- ready to load content
        $scope.biodata.done = "Update biodata";
        $scope.biodata.fullname = data.name;
        $scope.biodata.occupation = data.occupation;
        $scope.biodata.address = data.address;
        $scope.biodata.city = data.city;
        $scope.biodata.homephone = data.homephone;
        $scope.biodata.mobilephone = data.mobilephone;
        $scope.biodata.emailaddress = data.email;
        $scope.biodata.birthday = data.dateofbirth;
        $scope.biodata.gender = data.gender;

        //Verify if image received for profile picture canvas

        var PICTURE;
        if(data.key_patientfile_picture===""||data.key_patientfile_picture==="null"||data.key_patientfile_picture==="undefined"){
            document.getElementById('biodata.profilepic').src = "img/noimage.png";
            PICTURE = "null";

        }
        else{document.getElementById('biodata.profilepic').src = "data:image/png;base64,"+data.key_patientfile_picture;PICTURE=data.key_patientfile_picture;}
        $ionicLoading.hide()

        if($scope.biodata.birthday===""){$scope.biodata.birthday="Birthday";}
        if($scope.biodata.gender===""){$scope.biodata.gender="Gender";}

        //Store retrieved picture if any into memory stack
        window.localStorage.setItem("profilepicture",PICTURE);
        window.localStorage.setItem("MODE","UPDATE");
        //Save azure id into memory stack
        window.localStorage.setItem("doctorazureid",data.id);

    });

//Gender dialogbox
$scope.selectGender = function() {
   var gender = $ionicPopup.confirm({
     title: 'Biodata',
     template: 'Select gender',
     cancelText: 'Male',
     okText: 'Female'
   });

   gender.then(function(res) {
     if(res) {
       //document.getElementById('biodata.gender').innerHTML = "Female";
       $scope.biodata.gender = "Female";
     } else {
       //document.getElementById('biodata.gender').innerHTML = "Male";
       $scope.biodata.gender = "Male";
     }
   });
 };
});

 $scope.doneClicked = function(){
   //Done button has been clicked
   if(window.localStorage.getItem("MODE")==="NEW"){

 var firebase_reference = new Firebase(smarthealth.DATABASE_URL_SMARTHEALTHBIODATA());
 var registration_object = firebase_reference.child(window.localStorage.getItem("doctorid"));
 registration_object.set({
   key_patientfile_unique_id:window.localStorage.getItem("doctorid"),
   key_patientfile_picture:window.localStorage.getItem("profilepicture"),
   name:smarthealth.get_usercredentials_user(),
   dateofbirth:document.getElementById('biodata.birthday').innerHTML,
   gender:document.getElementById('biodata.gender').innerHTML,
   occupation:$scope.biodata.occupation,
   address:$scope.biodata.address,
   city:$scope.biodata.city,
   homephone:$scope.biodata.homephone,
   mobilephone:$scope.biodata.mobilephone,
   email:$scope.biodata.emailaddress

 });
 UIkit.notification('Biodata saved', {pos: 'top-right'});
return;
 } else

   if(window.localStorage.getItem("MODE")==="UPDATE"){

   var firebase_reference = new Firebase(smarthealth.DATABASE_URL_SMARTHEALTHBIODATA());
   var registration_object = firebase_reference.child(window.localStorage.getItem("doctorid"));
   registration_object.set({
     key_patientfile_unique_id:window.localStorage.getItem("doctorid"),
     key_patientfile_picture:window.localStorage.getItem("profilepicture"),
     name:$scope.biodata.fullname,
     dateofbirth:document.getElementById('biodata.birthday').innerHTML,
     gender:document.getElementById('biodata.gender').innerHTML,
     occupation:$scope.biodata.occupation,
     address:$scope.biodata.address,
     city:$scope.biodata.city,
     homephone:$scope.biodata.homephone,
     mobilephone:$scope.biodata.mobilephone,
     email:$scope.biodata.emailaddress

   });

   UIkit.notification('Biodata updated', {pos: 'top-right'});
   }
   };

})//End of biodatacontroller

app.controller('PlaylistsCtrl',function($scope){})

app.controller('registerclinicalpatientcontroller',function($scope,$state,$ionicModal,$timeout, $ionicActionSheet,$ionicPopup,smarthealth){
  //var client = new WindowsAzure.MobileServiceClient('https://smarthealthsolutions.azure-mobile.net/', 'nrFwbzJBHoGRjhHkBQvRnOxEWwsdVu91'),
  //patientloginTable = client.getTable('patientlogin');

  var alertPopup;

  //Doctor clicked on forgot password button
  $ionicModal.fromTemplateUrl('clinicalmodule/registermemo.html', {
  id : '9012',
  scope: $scope
  }).then(function(modal) {
  $scope.registermemo = modal;
  });

  // Triggered in the memo modal to close it
  $scope.dismissMemo = function() {
    $scope.registermemo.hide();
  };

  // Open the memo modal
  $scope.showMemo = function() {
    $scope.registermemo.show();
  };

  //National ID has been assigned
  $scope.assignid = function(){
    $scope.showregisterpatientpopup();
  };

  //Dismiss demo
  $scope.closememo =function(){$scope.dismissMemo();};

  $scope.$on('$ionicView.enter', function() {
    $scope.showMemo();
    $scope.registerpatient.nationalid = "Register National ID";
  });

  //Data holder for registerpatient
  $scope.registerpatient = {};

  $ionicModal.fromTemplateUrl('clinicalmodule/registerpatientpopup.html', {
  id : '81',
  scope: $scope
  }).then(function(modal) {
  $scope.oModal81 = modal;
  });

  // Triggered in the login modal to close it
  $scope.closeRegisterPatient = function() {
    $scope.oModal81.hide();
  };

  // Open the login modal
  $scope.showRegisterPatient = function() {
    $scope.oModal81.show();
  };

  $ionicModal.fromTemplateUrl('clinicalmodule/registerpatientsuccess.html', {
  id : '82',
  scope: $scope
  }).then(function(modal) {
  $scope.oModal82 = modal;
  });

  // Triggered in the login modal to close it
  $scope.closeRegisterPatientsuccess = function() {
    $scope.oModal82.hide();
    $scope.switchToPatientLogin();
  };

  // Open the login modal
  $scope.showRegisterPatientsuccess = function() {
    $scope.oModal82.show();
  };

  $ionicModal.fromTemplateUrl('clinicalmodule/registerpatientfailed.html', {
  id : '83',
  scope: $scope
  }).then(function(modal) {
  $scope.oModal83 = modal;
  });

  // Triggered in the login modal to close it
  $scope.closeRegisterPatientFailed = function() {
    $scope.oModal83.hide();
  };

  // Open the login modal
  $scope.showRegisterPatientFailed = function() {
    $scope.oModal83.show();
  };



//Navigate back to patient manager login portal
$scope.switchToPatientLogin = function(){
$state.go('app.patientmanager');
};

//Doctor has tapped on register patient button
$scope.showregisterpatientpopup = function(){
$scope.showRegisterPatient();
};

//Register patient to firebase using email/password combination
$scope.registertofirebase = function(){
  firebase.auth().createUserWithEmailAndPassword($scope.registerpatient.email, $scope.registerpatient.password).then(function (response) {

    //Registration successful
    $scope.showRegisterPatientsuccess();

  }, function (error) {
  // Handle Errors here.
  var errorCode = error.code;
  var errorMessage = error.message;
  alert(error.message);
});
};

//Doctor has submitted registration
$scope.submittedregistration = function(input){
$scope.closeRegisterPatient();
$scope.registerpatient.nationalid = input;

var data;
var firebase_reference = new Firebase(smarthealth.DATABASE_URL_PATIENTLOGIN());
var registration_object = firebase_reference.child(input);
registration_object.on("value", function(snapshot) {
data = snapshot.val();
if(data==null){
  registration_object.set({
    password: input,
    email: 'Not assigned',
    name: 'Not assigned',
    id: input,
    nfcbt: "not assigned",
    complete: false

  });
}
});

//Chain sequence to enter sidemenu from success dialog box
$scope.showRegisterPatientsuccess();


//}//End JSON stringify check

if(data.password ===input){
//Previous entry detected - failed registration
 $scope.dismissregisterpopup();
//Show failed registration dialogbox
$scope.showRegisterPatientFailed();
}

};

})


//-----------------------------------------------------------------------------------------------------------------------------//
//----------------------------------------------PATIENT LOGIN/REGISTER MANAGEMENT----------------------------------------------//
//-----------------------------------------------------------------------------------------------------------------------------//

app.controller('patientbiodata', function($scope, $ionicModal, $timeout, $state, ionicDatePicker, $ionicPopup,$ionicActionSheet,smarthealth) {
  patientloginTable = client.getTable('patientlogin');

  //Form data for patient login
  $scope.biodata = {};

  //Form data for patient email/password combination login
  $scope.combination = {};

  //Data for password recovery mechanism
  $scope.recovery= {};

  /**
   * Allow doctor to choose how to login a patient
   * Login with National ID
   * Login with Email /Password combination
   */

  $scope.chooseLogin = function(){

  $ionicActionSheet.show({
     buttons: [
       { text: 'Login using National ID number' },
       { text: 'Login with email/password combination' }
     ],
     titleText: 'Login options',
     cancelText: 'Cancel',
     cancel: function() {
          // add cancel code..
        },
     buttonClicked: function(index) {

       if(index==0){
         //Login using National ID number
         $scope.doPatientLogin();
       }

       if(index==1){
        //Login with email/password combination
        $scope.doPatientLoginCombination();
       }


return true;
}});

};

var alertPopup;

  //Show popup so that patient email is entered for recovery instructions
  $ionicModal.fromTemplateUrl('clinicalmodule/enteremail.html', {
  id : '119',
  scope: $scope
  }).then(function(modal) {
  $scope.passwordrecovery = modal;
  });

  // Triggered in the patient recovery modal to close it
  $scope.closeRecovery = function() {
    $scope.passwordrecovery.hide();
  };

  // Open the patient recovery modal
  $scope.showRecovery = function() {
    $scope.passwordrecovery.show();
  };

   //Patient logged in succesfully
  $ionicModal.fromTemplateUrl('clinicalmodule/patientloginsuccess.html', {
  id : '11',
  scope: $scope
  }).then(function(modal) {
  $scope.patientsuccessmodal = modal;
  });

  // Triggered in the patient login modal to close it
  $scope.closePatientSuccess = function() {
    $scope.patientsuccessmodal.hide();
  };

  // Open the patient success login modal
  $scope.showPatientSuccess = function() {
    $scope.patientsuccessmodal.show();
  };

 // Create the login form using email and password combination
  $ionicModal.fromTemplateUrl('clinicalmodule/patientloginemail.html', {
  id : '104',
  scope: $scope
  }).then(function(modal) {
  $scope.patientloginemailmodal = modal;
  });

  // Triggered in the patient login modal to close it (email/password combination)
  $scope.closePatientLoginCombination = function() {
    $scope.patientloginemailmodal.hide();
  };

  // Open the patient login modal (email/password combination)
  $scope.doPatientLoginCombination = function() {
    $scope.patientloginemailmodal.show();
  };

  //Patient email password combination login form has been submitted
  $scope.patientlogincombination = function(){
  //Do basic firebase sign in verification

  var email = $scope.combination.email;
  var password = $scope.combination.password;

firebase.auth().signInWithEmailAndPassword(email, password).then(function (response) {
  window.localStorage.setItem("memalloc","0:0:0:0:1:1:0:1:0:0:0:0:0:0:0:1:1:1:0:0:0:0:0:0:1:1");
  window.localStorage.setItem("patientid",email);
  window.localStorage.setItem("savemode","create");//Default consultation mode of operation
  window.localStorage.setItem("uuidlock","unlock");
  $scope.patientsuccessmodal.show();

}, function (error) {
  // Handle Errors here.
  var errorCode = error.code;
  var errorMessage = error.message;
  alert(error.message);
});
$scope.closePatientLoginCombination();
};

//Patient has forgotten password use firebase reset
$scope.forgotpasswordfirebase = function(){
$scope.showRecovery();
};

//Received recovery email address
$scope.doRecovery = function(){
$scope.closeRecovery();
var auth = firebase.auth();
var emailAddress = $scope.recovery.email;

auth.sendPasswordResetEmail(emailAddress).then(function() {
  // Email sent.
}, function(error) {
  // An error happened.
  alert(error.message);
});
};

// Create the patient login view modal that we will use later
  $ionicModal.fromTemplateUrl('clinicalmodule/patientlogin.html', {
  id : '10',
  scope: $scope
  }).then(function(modal) {
  $scope.patientloginmodal = modal;
  });

  // Triggered in the patient login modal to close it
  $scope.closePatientLogin = function() {
    $scope.patientloginmodal.hide();
  };

  // Open the patient login modal
  $scope.doPatientLogin = function() {
    $scope.patientloginmodal.show();
  };


  //Patient login form has been submitted
  $scope.patientlogin = function() {

var firebase_reference = new Firebase(smarthealth.DATABASE_URL_PATIENTLOGIN());
var registration_object = firebase_reference;
var date = new Date();
registration_object.child($scope.biodata.patientnid).on("value", function(snapshot) {
var data = snapshot.val();
$scope.closePatientLogin();
$scope.showLoader();
if(data==null){
  $scope.dismissLoader();
  $scope.showFailed();
}else{
  //Save patient NID and NAME to memory stack
  //Initialize key sequencing
  window.localStorage.setItem("memalloc","0:0:0:0:1:1:0:1:0:0:0:0:0:0:0:1:1:1:0:0:0:0:0:0:1:1");
  window.localStorage.setItem("patientid",data.password);
  window.localStorage.setItem("patientname",data.name);
  window.localStorage.setItem("savemode","create");//Default consultation mode of operation
  window.localStorage.setItem("uuidlock","unlock");
  $scope.dismissLoader();
  $scope.closePatientLogin();
  $scope.showPatientSuccess();
}
});
};
//End patient login routine

$scope.completePatientLogin = function(){
  //Access azure patient database
  $scope.closePatientSuccess();

  $scope.patients = [];
  window.localStorage.setItem('dashboardtype','patient');
  patients = [
  {title:'Patient Biodata',subtitle:'Basic information',sheet:'patientbiodata',image:'img/edit.png'},
  {title:'Patient Summary',subtitle:'Brief history',sheet:'patientsummary',image:'img/recordok.png'},
  {title:'New Consultation',subtitle:'Create patient database entry',sheet:'newconsultation',image:'img/icpages.png'},
  {title:'Past Consultations',subtitle:'Created by doctors',sheet:'pastconsultations',image:'img/icmenusave.png'},
  {title:'Create Appointment',subtitle:'Patient agenda manager',sheet:'appointments',image:'img/calendar.png'},
  {title:'Medical Tools',subtitle:'Useful calculators',sheet:'toolkit',image:'img/icphotos.png'},
  {title:'Close patient file',subtitle:'Returns back to dashboard',sheet:'closepatientfile',image:'img/sync.png'}
  ];

//Clear off sidemenu items
for(var i = 0; i < $scope.items.length ; i++){
$scope.items.splice(i,$scope.items.length);
}
  angular.forEach(patients, function(item){
     $scope.items.push(item);
   });

  $state.go('app.patientbiodata');
};

})//End patientbiodata controller

app.controller('patientbiodatacontroller', function($scope, $ionicLoading, $ionicModal, $timeout, $state,$ionicPopup,ionicDatePicker,smarthealth) {

    $scope.showLoader = function() {
        //$scope.spinloading.show();
        $scope.loading = $ionicLoading.show({
            content: '<i class="icon ion-loading-c"></i>',
            animation: 'fade-in',
            showBackdrop: true,
            maxWidth: 50,
            showDelay: 0
        });
    };
    $scope.patientbiodata = {};
  //Show/dismiss loading spinner
  $ionicModal.fromTemplateUrl('clinicalmodule/loading.html', {
  id : '8',
  scope: $scope
  }).then(function(modal) {
  $scope.spinloading = modal;
  });

  // Triggered in the login modal to close it
  $scope.dismissLoader = function() {
    //$scope.spinloading.hide();
    $ionicLoading.hide();
  };

  // Open the login modal
  $scope.showLoader = function() {
    //$scope.spinloading.show();
    $scope.loading = $ionicLoading.show({
    content: '<i class="icon ion-loading-c"></i>',
    animation: 'fade-in',
    showBackdrop: true,
    maxWidth: 50,
    showDelay: 0
  });
  };

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
document.getElementById('patientbiodata.birthday').innerHTML = day+" "+month+" "+year;

},

      from: new Date(1900, 1, 1), //Optional
      to: new Date(2030, 10, 30), //Optional
      inputDate: new Date(),      //Optional
      mondayFirst: true,          //Optional
      disableWeekdays: [0],       //Optional
      closeOnSelect: false,       //Optional
      templateType: 'popup'       //Optional
};

 //Open datepicker upon request
 $scope.openDatePicker = function(){
 ionicDatePicker.openDatePicker(ipObj1);
 };

//Popup initialisation
    $scope.mainpopup={};
    $ionicModal.fromTemplateUrl('clinicalmodule/optionslist.html', {
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

$scope.$on('$ionicView.enter', function() {

    $scope.items = [];
    $scope.items.push({title:'Patient Biodata',subtitle:'Basic information',sheet:'patientbiodata',image:'img/edit.png'});
    $scope.items.push({title:'Patient Summary',subtitle:'Brief history',sheet:'patientsummary',image:'img/recordok.png'});
    $scope.items.push({title:'New Consultation',subtitle:'Create patient database entry',sheet:'newconsultation',image:'img/icpages.png'});
    $scope.items.push({title:'Past Consultations',subtitle:'Created by doctors',sheet:'pastconsultations',image:'img/icmenusave.png'});
    $scope.items.push({title:'Create Appointment',subtitle:'Patient agenda manager',sheet:'appointments',image:'img/calendar.png'});
    $scope.items.push({title:'Medical Tools',subtitle:'Useful calculators',sheet:'toolkit',image:'img/icphotos.png'});
    $scope.items.push({title:'Close patient file',subtitle:'Returns back to dashboard',sheet:'closepatientfile',image:'img/sync.png'});



//Begin loading biodata contents
$scope.showLoader();

var firebase_reference = new Firebase(smarthealth.DATABASE_URL_SMARTHEALTHBIODATA());
var registration_object = firebase_reference.child(window.localStorage.getItem("patientid"));
registration_object.on("value", function(snapshot) {
var data = snapshot.val();
if(data==null){
  //No previously recorded doctor biodata
  $scope.patientbiodata.done = "Create biodata";
  $scope.patientbiodata.occupation = "";
  $scope.patientbiodata.address = "";
  $scope.patientbiodata.city = "";
  $scope.patientbiodata.homephone = "";
  $scope.patientbiodata.mobilephone = "";
  $scope.patientbiodata.emailaddress = "";
  $scope.patientbiodata.birthday = "";
  document.getElementById('patientbiodata.profilepic').src = "img/noimage.png";
  $scope.patientbiodata.fullname = "";
  $scope.patientbiodata.gender = "";
  $scope.dismissLoader();
  window.localStorage.setItem("MODE","NEW");
}else{
  if(data.key_patientfile_unique_id === window.localStorage.getItem("patientid")){
    //Biodata exists -- ready to load content


    $scope.patientbiodata.done = "Update biodata";
    $scope.patientbiodata.fullname = data.name;
    $scope.patientbiodata.occupation = data.occupation;
    $scope.patientbiodata.address = data.address;
    $scope.patientbiodata.city = data.city;
    $scope.patientbiodata.homephone = data.homephone;
    $scope.patientbiodata.mobilephone = data.mobilephone;
    $scope.patientbiodata.emailaddress = data.email;
    $scope.patientbiodata.birthday = data.dateofbirth;
    $scope.patientbiodata.gender = data.gender;

    //Verify if image received for profile picture canvas
    var PICTURE;
   if(data.key_patientfile_picture===""||data.key_patientfile_picture==="null"){
     document.getElementById('patientbiodata.profilepic').src = "img/noimage.png";
     PICTURE = "null";
   }
   else{document.getElementById('patientbiodata.profilepic').src = "data:image/png;base64,"+data.key_patientfile_picture;PICTURE=data.key_patientfile_picture;}


    $scope.dismissLoader();

    if($scope.patientbiodata.birthday===""){$scope.patientbiodata.birthday="Birthday";}
    if($scope.patientbiodata.gender===""){$scope.patientbiodata.gender="Gender";}

    //Store retrieved picture if any into memory stack
    window.localStorage.setItem("profilepicture",PICTURE);
    window.localStorage.setItem("MODE","UPDATE");
    //Save azure id into memory stack
    window.localStorage.setItem("patientazureid",data.id);
    }
}
});

});//End ionicView load


//Gender dialogbox
$scope.selectGender = function() {
   var gender = $ionicPopup.confirm({
     title: 'Biodata',
     template: 'Select gender',
     cancelText: 'Male',
     okText: 'Female'
   });

   gender.then(function(res) {
     if(res) {
       console.log("Female");
       //document.getElementById('patientbiodata.gender').innerHTML = "Female";
       $scope.patientbiodata.gender = "Female";
     } else {
       console.log("Male");
       //document.getElementById('patientbiodata.gender').innerHTML = "Male";
       $scope.patientbiodata.gender = "Male";
     }
   });
 };

 $scope.doneClicked = function(){
   //Done button has been clicked
   //var client = new WindowsAzure.MobileServiceClient('https://smarthealthsolutions.azure-mobile.net/', 'nrFwbzJBHoGRjhHkBQvRnOxEWwsdVu91'),
   //biodataTable = client.getTable('smarthealthbiodata');

   var firebase_reference = new Firebase(smarthealth.DATABASE_URL_SMARTHEALTHBIODATA());
   var registration_object = firebase_reference;
   if(window.localStorage.getItem("MODE")==="NEW"){

   registration_object.child(window.localStorage.getItem("patientid")).set({
     key_patientfile_unique_id:window.localStorage.getItem("patientid"),
     key_patientfile_picture:window.localStorage.getItem("profilepicture"),
     name:$scope.patientbiodata.fullname,
     dateofbirth:document.getElementById('patientbiodata.birthday').innerHTML,
     gender:document.getElementById('patientbiodata.gender').innerHTML,
     occupation:$scope.patientbiodata.occupation,
     address:$scope.patientbiodata.address,
     city:$scope.patientbiodata.city,
     homephone:$scope.patientbiodata.homephone,
     mobilephone:$scope.patientbiodata.mobilephone,
     email:$scope.patientbiodata.emailaddress
   });
   var alertPopup = $ionicPopup.alert({
     title: 'Patient Biodata',
     template: 'Biodata created succesfully'
   });
   }

   if(window.localStorage.getItem("MODE")==="UPDATE"){

   registration_object.child(window.localStorage.getItem("patientid")).set({
     id: window.localStorage.getItem("patientazureid"),
     key_patientfile_unique_id:window.localStorage.getItem("patientid"),
     key_patientfile_picture:window.localStorage.getItem("profilepicture"),
     name:$scope.patientbiodata.fullname,
     dateofbirth:document.getElementById('patientbiodata.birthday').innerHTML,
     gender:document.getElementById('patientbiodata.gender').innerHTML,
     occupation:$scope.patientbiodata.occupation,
     address:$scope.patientbiodata.address,
     city:$scope.patientbiodata.city,
     homephone:$scope.patientbiodata.homephone,
     mobilephone:$scope.patientbiodata.mobilephone,
     email:$scope.patientbiodata.emailaddress
   });
   var alertPopup = $ionicPopup.alert({
     title: 'Patient Biodata',
     template: 'Biodata updated succesfully'
   });
   }



   };
})

app.controller('consultationportalcontroller', function($scope, $ionicModal, $timeout, $state, $ionicPopup, ionicDatePicker){

  $scope.gotonewconsultation = function(){
  //Navigate to new consultation options
  $state.go('newconsultation');
  };

})

app.controller('newconsultationcontroller', function($scope, smarthealth,$ionicModal, $timeout, $state, $ionicPopup) {
  $scope.items = [];

    //Popup initialisation
    $scope.mainpopup={};
    $ionicModal.fromTemplateUrl('clinicalmodule/optionslist.html', {
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

    $scope.$on('$ionicView.enter', function() {

        $scope.items = [];
        $scope.items.push({
            title: 'Patient Biodata',
            subtitle: 'Basic information',
            sheet: 'patientbiodata',
            image: 'img/edit.png'
        });
        $scope.items.push({
            title: 'Patient Summary',
            subtitle: 'Brief history',
            sheet: 'patientsummary',
            image: 'img/recordok.png'
        });
        $scope.items.push({
            title: 'New Consultation',
            subtitle: 'Create patient database entry',
            sheet: 'newconsultation',
            image: 'img/icpages.png'
        });
        $scope.items.push({
            title: 'Past Consultations',
            subtitle: 'Created by doctors',
            sheet: 'pastconsultations',
            image: 'img/icmenusave.png'
        });
        $scope.items.push({
            title: 'Create Appointment',
            subtitle: 'Patient agenda manager',
            sheet: 'appointments',
            image: 'img/calendar.png'
        });
        $scope.items.push({
            title: 'Medical Tools',
            subtitle: 'Useful calculators',
            sheet: 'toolkit',
            image: 'img/icphotos.png'
        });
        $scope.items.push({
            title: 'Close patient file',
            subtitle: 'Returns back to dashboard',
            sheet: 'closepatientfile',
            image: 'img/sync.png'
        });

    });//END $ionicView.enter

  $scope.buildSheets = function(){
  $scope.consultationitems = [];
   var sequence = window.localStorage.getItem("memalloc");
   var splitItems = sequence.split(":");
   var SET = "1";
   var CLEAR = "0";
   $scope.consultations = [];

   //Set saveconsultationcontroller to "create" if applicable
   //Do not change 'savemode' parameters unless otherwise specified
   if((window.localStorage.getItem('savemode')==='readonly')){
   //Do nothing
   }
   else if(window.localStorage.getItem('savemode')==='update')
   {
   //Do nothing
   }
   else{window.localStorage.setItem('savemode','create');}

   consultations = [
     { title: 'Obstetrics',subtitle:'Obstetric sheet',sheet:'obsinfo',image:'img/mydetails.png' },
     { title: 'Gynaecology',subtitle:'Gynaecology sheet',sheet:'gynaeinfo' ,image:'img/mydetails.png'},
     { title: 'Paediatrics',subtitle:'Paediatric sheet',sheet:'paedsinfo',image:'img/mydetails.png' },
     { title: 'Psychiatry',subtitle:'Psychiatric sheet',sheet:'psyinfo',image:'img/mydetails.png' },
     { title: 'Complaints',subtitle:'Basic sheet',sheet:'complaints',image:'img/mydetails.png' },
     { title: 'Other complaints',subtitle:'Basic sheet',sheet:'othercomplaints',image:'img/mydetails.png' },
     { title: 'Paediatric Vitals',subtitle:'Paediatric sheet',sheet:'paedsgeneralexam' ,image:'img/mydetails.png'},
     { title: 'Vitals',subtitle:'Basic sheet',sheet:'vitals',image:'img/mydetails.png' },
     { title: 'Ear Nose Throat',subtitle:'ENT sheet',sheet:'entone' ,image:'img/mydetails.png'},
     { title: 'Larynx',subtitle:'ENT sheet',sheet:'enttwo' ,image:'img/mydetails.png'},
     { title: 'Gynaecology exam',subtitle:'Gynaecology sheet',sheet:'gynaeexam' ,image:'img/mydetails.png'},
     { title: 'Obstetrics exam',subtitle:'Obstetric sheet',sheet:'obsexam',image:'img/mydetails.png' },
     { title: 'Opthalmology exam',subtitle:'Opthalmology sheet',sheet:'opthalexam',image:'img/mydetails.png' },
     { title: 'Orthopaedics exam',subtitle:'Orthopaedics sheet',sheet:'orthoexam',image:'img/mydetails.png' },
     { title: 'Psychiatric exam',subtitle:'Psychiatric sheet',sheet:'psyexam',image:'img/mydetails.png' },
     { title: 'RS CVS GIT exam',subtitle:'Basic sheet',sheet:'mdpartone',image:'img/mydetails.png' },
     { title: 'CNS exam',subtitle:'Basic sheet',sheet:'mdparttwo' ,image:'img/mydetails.png'},
     { title: 'Investigations',subtitle:'Basic sheet',sheet:'investigations',image:'img/mydetails.png' },
     { title: 'Note',subtitle:'Details sheet',sheet:'note',image:'img/mydetails.png' }
   ];

   if(splitItems[0]===CLEAR){
     //Obstetric info
    for (var i = consultations.length - 1; i >= 0; i--) {
    if (consultations[i].title==='Obstetrics' || consultations[i].title==='Obstetrics exam') {
        consultations.splice(i, 1);
    }
   }//end for loop

   }//clear end

   if(splitItems[1]===CLEAR){
     //Gynaecology info
    for (var i = consultations.length - 1; i >= 0; i--) {
    if (consultations[i].title==='Gynaecology' || consultations[i].title==='Gynaecology exam') {
        consultations.splice(i, 1);
    }
   }//end for loop
   }
   if(splitItems[2]===CLEAR){
     //Paediatric info
    for (var i = consultations.length - 1; i >= 0; i--) {
    if (consultations[i].title==='Paediatrics' || consultations[i].title==='Paediatric Vitals') {
        consultations.splice(i, 1);
    }
   }//end for loop
   }

   if(splitItems[3]===CLEAR){
     //Psychiatry info
       for (var i = consultations.length - 1; i >= 0; i--) {
    if (consultations[i].title==='Psychiatry' || consultations[i].title==='Psychiatric exam') {
        consultations.splice(i, 1);
    }
   }//end for loop
   }

   if(splitItems[4]===CLEAR){
     //Complaints
     var complaints = [{ title: 'Complaints',sheet:'complaints',subtitle:'Basic sheet',image:'img/mydetails.png' }];
     $scope.consultationitems.push(complaints);
   }

   if(splitItems[5]===CLEAR){
     //Other complaints
     var othercomplaints = [{ title: 'Other complaints',subtitle:'Basic sheet',sheet:'othercomplaints',image:'img/mydetails.png' }];
     $scope.consultationitems.push(othercomplaints);
   }

   if(splitItems[6]===CLEAR){
     //Paediatric vitals
     //Do nothing handled elsewhere
   }

   if(splitItems[7]===CLEAR){
     //Vitals
    for (var i = consultations.length - 1; i >= 0; i--) {
    if (consultations[i].title==='Vitals') {
    consultations.splice(i, 1);
    }
   }//end for loop
   }

   if(splitItems[8]===CLEAR){
     //ENTONE
    for (var i = consultations.length - 1; i >= 0; i--) {
    if (consultations[i].title==='Ear Nose Throat' || consultations[i].title==='Larynx') {
        consultations.splice(i, 1);
    }
   }//end for loop
   }

   if(splitItems[9]===CLEAR){
     //ENTTWO
     //Do nothing handled elsewhere
   }

   if(splitItems[10]===CLEAR){
   //Gynaecology exam
   //Do nothing handled elsewhere
   }

   if(splitItems[11]===CLEAR){
   //Obstetric exam
   //Do nothing handled elsewhere

   }

   if(splitItems[12]===CLEAR){
   //Opthalmology exam
   for (var i = consultations.length - 1; i >= 0; i--) {
   if (consultations[i].title==='Opthalmology exam') {
   consultations.splice(i, 1);
   }
   }//end for loop
   }

   if(splitItems[13]===CLEAR){
   //Orthopaedics exam
   for (var i = consultations.length - 1; i >= 0; i--) {
   if (consultations[i].title==='Orthopaedics exam') {
   consultations.splice(i, 1);
   }
   }//end for loop
   }

   if(splitItems[14]===CLEAR){
   //Psychiatric exam
   //Do nothing handled elsewhere
   }

   if(splitItems[15]===CLEAR){
   //CVS RS GIT exam

   }

   if(splitItems[16]===CLEAR){
   //CNS exam

   }

   if(splitItems[17]===CLEAR){
   //Investigations exam

   }

   if(splitItems[18]===CLEAR){
   //Note
   for (var i = consultations.length - 1; i >= 0; i--) {
   if (consultations[i].title==='Note') {
   consultations.splice(i, 1);
   }
   }//end for loop
   }

   //Clear off sidemenu items
  for(var i = 0; i < $scope.items.length ; i++){
  $scope.items.splice(i,$scope.items.length);
  }
  angular.forEach(consultations, function(item){
  $scope.items.push(item);
  });

smarthealth.set_consultationnavigator($scope.items);
console.log('BUILD SHEETS ',$scope.items);
 };

 //Basic consultation
 $scope.standardconsultation = function(){
 //Nothing to do
 $scope.buildSheets();
 $state.go('complaints');
 };

 //Obstetrics consultation
 $scope.obstetrics = function(){
 var sequence = window.localStorage.getItem("memalloc");
 var splitItems = sequence.split(":");
 var SET = "1";
 var CLEAR = "0";
 splitItems[0] = SET;
 splitItems[11] = SET;
 var sequencevalue = splitItems[0]+":"+splitItems[1]+":"+splitItems[2]+":"+splitItems[3]+":"+splitItems[4]+":"+splitItems[5]+":"+splitItems[6]+":"+splitItems[7]+":"+splitItems[8]+":"+splitItems[9]+":"+splitItems[10]+":"+splitItems[11]+":"+splitItems[12]+":"+splitItems[13]+":"+splitItems[14]+":"+splitItems[15]+":"+splitItems[16]+":"+splitItems[17]+":"+splitItems[18]+":"+splitItems[19]+":"+splitItems[20]+":"+splitItems[21]+":"+splitItems[22]+":"+splitItems[23]+":"+splitItems[24]+":"+splitItems[25];
 window.localStorage.setItem("memalloc",sequencevalue);
 $scope.buildSheets();
 $state.go('obsinfo');
 };

 //Gynaecology consultation
 $scope.gynaecology = function(){
 var sequence = window.localStorage.getItem("memalloc");
 var splitItems = sequence.split(":");
 var SET = "1";
 var CLEAR = "0";
 splitItems[1] = SET;
 splitItems[10] = SET;
 var sequencevalue = splitItems[0]+":"+splitItems[1]+":"+splitItems[2]+":"+splitItems[3]+":"+splitItems[4]+":"+splitItems[5]+":"+splitItems[6]+":"+splitItems[7]+":"+splitItems[8]+":"+splitItems[9]+":"+splitItems[10]+":"+splitItems[11]+":"+splitItems[12]+":"+splitItems[13]+":"+splitItems[14]+":"+splitItems[15]+":"+splitItems[16]+":"+splitItems[17]+":"+splitItems[18]+":"+splitItems[19]+":"+splitItems[20]+":"+splitItems[21]+":"+splitItems[22]+":"+splitItems[23]+":"+splitItems[24]+":"+splitItems[25];
 window.localStorage.setItem("memalloc",sequencevalue);
 $scope.buildSheets();
 $state.go('gynaeinfo');
 };

 //Paediatrics consultation
 $scope.paediatrics = function(){
 var sequence = window.localStorage.getItem("memalloc");
 var splitItems = sequence.split(":");
 var SET = "1";
 var CLEAR = "0";
 splitItems[2] = SET;
 splitItems[6] = SET;
 splitItems[7] = CLEAR;
 var sequencevalue = splitItems[0]+":"+splitItems[1]+":"+splitItems[2]+":"+splitItems[3]+":"+splitItems[4]+":"+splitItems[5]+":"+splitItems[6]+":"+splitItems[7]+":"+splitItems[8]+":"+splitItems[9]+":"+splitItems[10]+":"+splitItems[11]+":"+splitItems[12]+":"+splitItems[13]+":"+splitItems[14]+":"+splitItems[15]+":"+splitItems[16]+":"+splitItems[17]+":"+splitItems[18]+":"+splitItems[19]+":"+splitItems[20]+":"+splitItems[21]+":"+splitItems[22]+":"+splitItems[23]+":"+splitItems[24]+":"+splitItems[25];
 window.localStorage.setItem("memalloc",sequencevalue);
 $scope.buildSheets();
 $state.go('paedsinfo');
 };

 //Psychiatry consultation
 $scope.psychiatry = function(){
 var sequence = window.localStorage.getItem("memalloc");
 var splitItems = sequence.split(":");
 var SET = "1";
 var CLEAR = "0";
 splitItems[3] = SET;
 splitItems[14] = SET;
 var sequencevalue = splitItems[0]+":"+splitItems[1]+":"+splitItems[2]+":"+splitItems[3]+":"+splitItems[4]+":"+splitItems[5]+":"+splitItems[6]+":"+splitItems[7]+":"+splitItems[8]+":"+splitItems[9]+":"+splitItems[10]+":"+splitItems[11]+":"+splitItems[12]+":"+splitItems[13]+":"+splitItems[14]+":"+splitItems[15]+":"+splitItems[16]+":"+splitItems[17]+":"+splitItems[18]+":"+splitItems[19]+":"+splitItems[20]+":"+splitItems[21]+":"+splitItems[22]+":"+splitItems[23]+":"+splitItems[24]+":"+splitItems[25];
 window.localStorage.setItem("memalloc",sequencevalue);
 $scope.buildSheets();
 $state.go('psyinfo');
 };

 //Ear Nose Throat consultation
 $scope.ENT = function(){
 var sequence = window.localStorage.getItem("memalloc");
 var splitItems = sequence.split(":");
 var SET = "1";
 var CLEAR = "0";
 splitItems[8] = SET;
 splitItems[9] = SET;
 var sequencevalue = splitItems[0]+":"+splitItems[1]+":"+splitItems[2]+":"+splitItems[3]+":"+splitItems[4]+":"+splitItems[5]+":"+splitItems[6]+":"+splitItems[7]+":"+splitItems[8]+":"+splitItems[9]+":"+splitItems[10]+":"+splitItems[11]+":"+splitItems[12]+":"+splitItems[13]+":"+splitItems[14]+":"+splitItems[15]+":"+splitItems[16]+":"+splitItems[17]+":"+splitItems[18]+":"+splitItems[19]+":"+splitItems[20]+":"+splitItems[21]+":"+splitItems[22]+":"+splitItems[23]+":"+splitItems[24]+":"+splitItems[25];
 window.localStorage.setItem("memalloc",sequencevalue);
 $scope.buildSheets();
 $state.go('entone');
 };

 //Opthalmology consultation
 $scope.opthalmology = function(){
 var sequence = window.localStorage.getItem("memalloc");
 var splitItems = sequence.split(":");
 var SET = "1";
 var CLEAR = "0";
 splitItems[12] = SET;
 var sequencevalue = splitItems[0]+":"+splitItems[1]+":"+splitItems[2]+":"+splitItems[3]+":"+splitItems[4]+":"+splitItems[5]+":"+splitItems[6]+":"+splitItems[7]+":"+splitItems[8]+":"+splitItems[9]+":"+splitItems[10]+":"+splitItems[11]+":"+splitItems[12]+":"+splitItems[13]+":"+splitItems[14]+":"+splitItems[15]+":"+splitItems[16]+":"+splitItems[17]+":"+splitItems[18]+":"+splitItems[19]+":"+splitItems[20]+":"+splitItems[21]+":"+splitItems[22]+":"+splitItems[23]+":"+splitItems[24]+":"+splitItems[25];
 window.localStorage.setItem("memalloc",sequencevalue);
 $scope.buildSheets();
 $state.go('opthalexam');
 };

 //Orthopaedics consultation
 $scope.orthopaedics = function(){
 var sequence = window.localStorage.getItem("memalloc");
 var splitItems = sequence.split(":");
 var SET = "1";
 var CLEAR = "0";
 splitItems[13] = SET;
 var sequencevalue = splitItems[0]+":"+splitItems[1]+":"+splitItems[2]+":"+splitItems[3]+":"+splitItems[4]+":"+splitItems[5]+":"+splitItems[6]+":"+splitItems[7]+":"+splitItems[8]+":"+splitItems[9]+":"+splitItems[10]+":"+splitItems[11]+":"+splitItems[12]+":"+splitItems[13]+":"+splitItems[14]+":"+splitItems[15]+":"+splitItems[16]+":"+splitItems[17]+":"+splitItems[18]+":"+splitItems[19]+":"+splitItems[20]+":"+splitItems[21]+":"+splitItems[22]+":"+splitItems[23]+":"+splitItems[24]+":"+splitItems[25];
 window.localStorage.setItem("memalloc",sequencevalue);
 $scope.buildSheets();
 $state.go('orthoexam');
 };

 //Add a note
 $scope.note = function(){
 var sequence = window.localStorage.getItem("memalloc");
 var splitItems = sequence.split(":");
 var SET = "1";
 var CLEAR = "0";
 splitItems[18] = SET;
 var sequencevalue = splitItems[0]+":"+splitItems[1]+":"+splitItems[2]+":"+splitItems[3]+":"+splitItems[4]+":"+splitItems[5]+":"+splitItems[6]+":"+splitItems[7]+":"+splitItems[8]+":"+splitItems[9]+":"+splitItems[10]+":"+splitItems[11]+":"+splitItems[12]+":"+splitItems[13]+":"+splitItems[14]+":"+splitItems[15]+":"+splitItems[16]+":"+splitItems[17]+":"+splitItems[18]+":"+splitItems[19]+":"+splitItems[20]+":"+splitItems[21]+":"+splitItems[22]+":"+splitItems[23]+":"+splitItems[24]+":"+splitItems[25];
 window.localStorage.setItem("memalloc",sequencevalue);
 $scope.buildSheets();
 $state.go('note');
 };

 //Doctor choose to close consultation -- return to menu
 $scope.closeconsultation = function(){
  $scope.patients = [];
  window.localStorage.setItem('dashboardtype','patient');
  window.localStorage.setItem('savemode','create');
  window.localStorage.setItem('commonid','0');
  window.localStorage.setItem('uuidlock','unlock');
  window.localStorage.setItem('consultationtitle','');
  window.localStorage.setItem('othertreatment','');
  patients = [
  {title:'Patient Biodata',subtitle:'Basic information',sheet:'patientbiodata',image:'img/edit.png'},
  {title:'Patient Summary',subtitle:'Brief history',sheet:'patientsummary',image:'img/recordok.png'},
  {title:'New Consultation',subtitle:'Create patient database entry',sheet:'newconsultation',image:'img/icpages.png'},
  {title:'Past Consultations',subtitle:'Created by doctors',sheet:'pastconsultations',image:'img/icmenusave.png'},
  {title:'Create Appointment',subtitle:'Patient agenda manager',sheet:'appointments',image:'img/calendar.png'},
  {title:'Medical Tools',subtitle:'Useful calculators',sheet:'toolkit',image:'img/icphotos.png'},
  {title:'Close patient file',subtitle:'Returns back to dashboard',sheet:'closepatientfile',image:'img/sync.png'}
  ];

//Clear off sidemenu items
for(var i = 0; i < $scope.items.length ; i++){
$scope.items.splice(i,$scope.items.length);
}
  angular.forEach(patients, function(item){
     $scope.items.push(item);
   });

  var RESET = "";
var FALSE = "false";

//COMPLAINTS
window.localStorage.setItem("dmtext",RESET);
window.localStorage.setItem("hbptext",RESET);
window.localStorage.setItem("asthmatext",RESET);
window.localStorage.setItem("otherstext",RESET);
window.localStorage.setItem("pastsurgical",RESET);
window.localStorage.setItem("presentingone",RESET);
window.localStorage.setItem("presentingtwo",RESET);
window.localStorage.setItem("presentingthree",RESET);
window.localStorage.setItem("historyone",RESET);
window.localStorage.setItem("historytwo",RESET);
window.localStorage.setItem("historythree",RESET);
window.localStorage.setItem("dmstate",FALSE);
window.localStorage.setItem("hbpstate",FALSE);
window.localStorage.setItem("asthmastate",FALSE);
window.localStorage.setItem("othersstate",FALSE);

//OTHER COMPLAINTS
window.localStorage.setItem("allergytext",RESET);
window.localStorage.setItem("drugone",RESET);
window.localStorage.setItem("drugtwo",RESET);
window.localStorage.setItem("drugthree",RESET);
window.localStorage.setItem("familyhistory",RESET);
window.localStorage.setItem("smokingtext",RESET);
window.localStorage.setItem("alcoholtext",RESET);
window.localStorage.setItem("drugabusetext",RESET);
window.localStorage.setItem("traveltext",RESET);
window.localStorage.setItem("sexualtext",RESET);
window.localStorage.setItem("allergystate",FALSE);
window.localStorage.setItem("smokingstate",FALSE);
window.localStorage.setItem("alcoholstate",FALSE);
window.localStorage.setItem("drugabusestate",FALSE);
window.localStorage.setItem("travelstate",FALSE);
window.localStorage.setItem("sexualstate",FALSE);

//VITALS
window.localStorage.setItem("bloodpressure",RESET);
window.localStorage.setItem("pulse",RESET);
window.localStorage.setItem("temperature",RESET);
window.localStorage.setItem("respiratoryrate",RESET);
window.localStorage.setItem("spotwo",RESET);
window.localStorage.setItem("pallortext",RESET);
window.localStorage.setItem("cyanosistext",RESET);
window.localStorage.setItem("jaundicetext",RESET);
window.localStorage.setItem("clubbingtext",RESET);
window.localStorage.setItem("othervitalfindings",RESET);
window.localStorage.setItem("pallorstate",RESET);
window.localStorage.setItem("cyanosisstate",RESET);
window.localStorage.setItem("jaundicestate",RESET);
window.localStorage.setItem("clubbingstate",RESET);

//MDPARTONE
window.localStorage.setItem("rsinspection",RESET);
window.localStorage.setItem("rspalpation",RESET);
window.localStorage.setItem("rspercussion",RESET);
window.localStorage.setItem("rsauscultation",RESET);
window.localStorage.setItem("cvsinspection",RESET);
window.localStorage.setItem("cvspalpation",RESET);
window.localStorage.setItem("cvspercussion",RESET);
window.localStorage.setItem("cvsauscultation",RESET);
window.localStorage.setItem("gitinspection",RESET);
window.localStorage.setItem("gitpalpation",RESET);
window.localStorage.setItem("gitpercussion",RESET);
window.localStorage.setItem("gitauscultation",RESET);

//MDPARTTWO
window.localStorage.setItem("cranialnerve",RESET);
window.localStorage.setItem("neurospeech",RESET);
window.localStorage.setItem("motorsystem",RESET);
window.localStorage.setItem("sensorysystem",RESET);
window.localStorage.setItem("meningealsigns",RESET);
window.localStorage.setItem("othermedicalfindings",RESET);

//INVESTIGATIONS
window.localStorage.setItem("fbctext",RESET);
window.localStorage.setItem("uetext",RESET);
window.localStorage.setItem("creatininetext",RESET);
window.localStorage.setItem("fbstext",RESET);
window.localStorage.setItem("fsltext",RESET);
window.localStorage.setItem("tgtext",RESET);
window.localStorage.setItem("urictext",RESET);
window.localStorage.setItem("otherinvestigationstext",RESET);
window.localStorage.setItem("treatment",RESET);
window.localStorage.setItem("imagingtext",RESET);
window.localStorage.setItem("patientreview",RESET);
window.localStorage.setItem("fbcstate",RESET);
window.localStorage.setItem("uestate",RESET);
window.localStorage.setItem("creatininestate",RESET);
window.localStorage.setItem("fbsstate",RESET);
window.localStorage.setItem("fslstate",RESET);
window.localStorage.setItem("tgstate",RESET);
window.localStorage.setItem("uricstate",RESET);
window.localStorage.setItem("otherinvestigationsstate",RESET);
window.localStorage.setItem("imagingstate",RESET);

//OBSINFO
window.localStorage.setItem("lmp",RESET);
window.localStorage.setItem("gravindex",RESET);
window.localStorage.setItem("pastobstetric",RESET);
window.localStorage.setItem("menstrual",RESET);
window.localStorage.setItem("marital",RESET);

//OBSEXAM
window.localStorage.setItem("obsinspection",RESET);
window.localStorage.setItem("fundalheight",RESET);
window.localStorage.setItem("fundalgrip",RESET);
window.localStorage.setItem("rightlateral",RESET);
window.localStorage.setItem("leftlateral",RESET);
window.localStorage.setItem("pawlik",RESET);
window.localStorage.setItem("deeppelvic",RESET);
window.localStorage.setItem("foetalheartsound",RESET);
window.localStorage.setItem("vaginalexam",RESET);

//GYNAEINFO
window.localStorage.setItem("menstrual",RESET);
window.localStorage.setItem("marital",RESET);
window.localStorage.setItem("gravindex",RESET);
window.localStorage.setItem("pastobstetric",RESET);

//GYNAEEXAM
window.localStorage.setItem("pelvicexamination",RESET);
window.localStorage.setItem("externalgenitalia",RESET);
window.localStorage.setItem("speculum",RESET);
window.localStorage.setItem("bimanual",RESET);

//PAEDSINFO
window.localStorage.setItem("informant",RESET);
window.localStorage.setItem("birthhistory",RESET);
window.localStorage.setItem("socioeconomic",RESET);
window.localStorage.setItem("developmental",RESET);
window.localStorage.setItem("immunization",RESET);

//PAEDS VITALS
window.localStorage.setItem("consciousness",RESET);
window.localStorage.setItem("pulse",RESET);
window.localStorage.setItem("bloodpressure",RESET);
window.localStorage.setItem("temperature",RESET);
window.localStorage.setItem("skincondition",RESET);
window.localStorage.setItem("arthropometry",RESET);
window.localStorage.setItem("jugularpressure",RESET);
window.localStorage.setItem("otherpaedsfindings",RESET);
window.localStorage.setItem("thyroidgland",RESET);
window.localStorage.setItem("paedscomments",RESET);

//PSY INFO
window.localStorage.setItem("childhood",RESET);
window.localStorage.setItem("adolescence",RESET);
window.localStorage.setItem("academics",RESET);
window.localStorage.setItem("otherpsyfindings",RESET);
window.localStorage.setItem("personalitybeforeillness",RESET);
window.localStorage.setItem("socialcircumstances",RESET);

//PSYEXAM
window.localStorage.setItem("appearance",RESET);
window.localStorage.setItem("behaviour",RESET);
window.localStorage.setItem("speech",RESET);
window.localStorage.setItem("thoughtcontent",RESET);
window.localStorage.setItem("mood",RESET);
window.localStorage.setItem("delusiontext",RESET);
window.localStorage.setItem("hallucinationtext",RESET);
window.localStorage.setItem("illusiontext",RESET);
window.localStorage.setItem("thoughtinterference",RESET);
window.localStorage.setItem("cognitive",RESET);
window.localStorage.setItem("insights",RESET);
window.localStorage.setItem("judgement",RESET);
window.localStorage.setItem("delusionstate",RESET);
window.localStorage.setItem("hallucinationstate",RESET);
window.localStorage.setItem("illusionstate",RESET);

//ENT ONE
window.localStorage.setItem("preauricular",RESET);
window.localStorage.setItem("pinna",RESET);
window.localStorage.setItem("postauricular",RESET);
window.localStorage.setItem("externalearcanal",RESET);
window.localStorage.setItem("tympanicmembrane",RESET);
window.localStorage.setItem("noseexternalexamination",RESET);
window.localStorage.setItem("nasalairway",RESET);
window.localStorage.setItem("anteriorrhinoscopy",RESET);
window.localStorage.setItem("posteriorrhinoscopy",RESET);
window.localStorage.setItem("orodental",RESET);;
window.localStorage.setItem("oralcavity",RESET);
window.localStorage.setItem("tonsilspillars",RESET);
window.localStorage.setItem("posteriorpharynx",RESET);

//ENT TWO
window.localStorage.setItem("directlaryngoscopy",RESET);
window.localStorage.setItem("indirectlaryngoscopy",RESET);
window.localStorage.setItem("otherentfindings",RESET);

//OPTHALEXAM
window.localStorage.setItem("visualacuity",RESET);
window.localStorage.setItem("headposture",RESET);
window.localStorage.setItem("eyebrowslids",RESET);
window.localStorage.setItem("lacrimal",RESET);
window.localStorage.setItem("conjunctiva",RESET);
window.localStorage.setItem("sclera",RESET);
window.localStorage.setItem("cornea",RESET);
window.localStorage.setItem("anteriorchamber",RESET);
window.localStorage.setItem("lens",RESET);
window.localStorage.setItem("fundus",RESET);
window.localStorage.setItem("otheropthalfindings",RESET);

//ORTHOEXAM
window.localStorage.setItem("orthoinspection",RESET);
window.localStorage.setItem("orthopalpation",RESET);
window.localStorage.setItem("orthomovements",RESET);
window.localStorage.setItem("orthomeasurements",RESET);
window.localStorage.setItem("otherorthofindings",RESET);

//NOTE
window.localStorage.setItem("notetitle",RESET);
window.localStorage.setItem("notecontent",RESET);



//Initialize key sequencing
window.localStorage.setItem("memalloc","0:0:0:0:1:1:0:1:0:0:0:0:0:0:0:1:1:1:0:0:0:0:0:0:1:1");

$state.go('app.patientbiodata');

};

})

app.controller('consultationsmenucontroller',function($scope, $ionicModal, $timeout, $state,$ionicPopup,ionicDatePicker){

})

app.controller('complaintscontroller',function($scope,$ionicActionSheet,$ionicModal, $timeout, $state,$ionicPopup,ionicDatePicker,smarthealth){
  var position = 0;
  var sheet_item;

  $scope.complaints = {};
  $scope.items = [];


$scope.$on('$ionicView.enter', function() {
//Identify position of sheet within items array

    $scope.items = smarthealth.get_consultationnavigator();
for(var i = 0;i<$scope.items.length;i++){if($scope.items[i].title==='Complaints'){position = i;}}
//LOAD COMPLAINTS
var DM_STATE =  window.localStorage.getItem("dmstate");
var HBP_STATE  =  window.localStorage.getItem("hbpstate");
var ASTHMA_STATE =  window.localStorage.getItem("asthmastate");
var OTHERS_STATE =  window.localStorage.getItem("othersstate");

if(DM_STATE==="true"){$scope.complaints.dmcheck="true";}
if(DM_STATE==="false"){$scope.complaints.dmcheck="false";}
if(HBP_STATE==="true"){$scope.complaints.hbpcheck="true";}
if(HBP_STATE==="false"){$scope.complaints.hbpcheck="false";}
if(ASTHMA_STATE==="true"){$scope.complaints.asthmacheck="true";}
if(ASTHMA_STATE==="false"){$scope.complaints.asthmacheck="false";}
if(OTHERS_STATE==="true"){$scope.complaints.otherscheck="true";}
if(OTHERS_STATE==="false"){$scope.complaints.otherscheck="false";}



$scope.complaints.dmtext = smarthealth.NullFilter(window.localStorage.getItem("dmtext"));
$scope.complaints.hbptext = smarthealth.NullFilter(window.localStorage.getItem("hbptext"));
$scope.complaints.asthmatext = smarthealth.NullFilter(window.localStorage.getItem("asthmatext"));
$scope.complaints.otherstext = smarthealth.NullFilter(window.localStorage.getItem("otherstext"));
$scope.complaints.pastsurgicaltext = smarthealth.NullFilter(window.localStorage.getItem("pastsurgical"));
$scope.complaints.presentingone = smarthealth.NullFilter(window.localStorage.getItem("presentingone"));
$scope.complaints.presentingtwo = smarthealth.NullFilter(window.localStorage.getItem("presentingtwo"));
$scope.complaints.presentingthree = smarthealth.NullFilter(window.localStorage.getItem("presentingthree"));
$scope.complaints.historyone = smarthealth.NullFilter(window.localStorage.getItem("historyone"));
$scope.complaints.historytwo = smarthealth.NullFilter(window.localStorage.getItem("historytwo"));
$scope.complaints.historythree = smarthealth.NullFilter(window.localStorage.getItem("historythree"));


});

  $scope.next = function(){
  //Next button clicked
  $scope.savecomplaints();
  smarthealth.handleNext($scope.items,position);
  };

  $scope.back = function(){
  //Back button clicked
  $scope.savecomplaints();
  smarthealth.handlePrevious($scope.items,position);
  };

  $scope.menu = function(){
  //Options button clicked
  $scope.savecomplaints();
  $ionicActionSheet.show({
     buttons: [
       { text: 'Add consultation sheets' },
       { text: 'Remove consultation sheets' },
       { text: 'Save and exit' },
       { text: 'Close consultation' },
       { text: 'Clear consultation fields' }
     ],
     titleText: 'Options',
     cancelText: 'Cancel',
     cancel: function() {
          // add cancel code..
        },
     buttonClicked: function(index) {

       if(index==0){
       //Add consultation sheets
       $state.go('app.newconsultation');
       }

       if(index==1){
       //Remove consultation sheets
       $state.go('app.removeconsultations');
       }

       if(index==2){
       //Save and exit
       $state.go('saveconsultation');
       }

if(index==3){
//Close consultation
$scope.patients = [];
patients = [
{title:'Patient Biodata',subtitle:'Basic information',sheet:'patientbiodata',image:'img/edit.png'},
{title:'Patient Summary',subtitle:'Brief history',sheet:'patientsummary',image:'img/recordok.png'},
{title:'New Consultation',subtitle:'Create patient database entry',sheet:'newconsultation',image:'img/icpages.png'},
{title:'Past Consultations',subtitle:'Created by doctors',sheet:'pastconsultations',image:'img/icmenusave.png'},
{title:'Create Appointment',subtitle:'Patient agenda manager',sheet:'appointments',image:'img/calendar.png'},
{title:'Medical Tools',subtitle:'Useful calculators',sheet:'toolkit',image:'img/icphotos.png'},
{title:'Close patient file',subtitle:'Returns back to dashboard',sheet:'closepatientfile',image:'img/sync.png'}];

//Clear off sidemenu items
for(var i = 0; i < $scope.items.length ; i++){
$scope.items.splice(i,$scope.items.length);
}
angular.forEach(patients, function(item){
$scope.items.push(item);
});
$state.go('app.newconsultation');
}

if(index==4){
$state.go('clearsuccessful');
}

return true;
}});

};

$scope.savecomplaints = function(){
window.localStorage.setItem("dmtext",smarthealth.NullFilter($scope.complaints.dmtext));
window.localStorage.setItem("hbptext",smarthealth.NullFilter($scope.complaints.hbptext));
window.localStorage.setItem("asthmatext",smarthealth.NullFilter($scope.complaints.asthmatext));
window.localStorage.setItem("otherstext",smarthealth.NullFilter($scope.complaints.otherstext));
window.localStorage.setItem("pastsurgical",smarthealth.NullFilter($scope.complaints.pastsurgicaltext));
window.localStorage.setItem("presentingone",smarthealth.NullFilter($scope.complaints.presentingone));
window.localStorage.setItem("presentingtwo",smarthealth.NullFilter($scope.complaints.presentingtwo));
window.localStorage.setItem("presentingthree",smarthealth.NullFilter($scope.complaints.presentingthree));
window.localStorage.setItem("historyone",smarthealth.NullFilter($scope.complaints.historyone));
window.localStorage.setItem("historytwo",smarthealth.NullFilter($scope.complaints.historytwo));
window.localStorage.setItem("historythree",smarthealth.NullFilter($scope.complaints.historythree));
window.localStorage.setItem("dmstate",smarthealth.NullFilter($scope.complaints.dmcheck));
window.localStorage.setItem("hbpstate",smarthealth.NullFilter($scope.complaints.hbpcheck));
window.localStorage.setItem("asthmastate",smarthealth.NullFilter($scope.complaints.asthmacheck));
window.localStorage.setItem("othersstate",smarthealth.NullFilter($scope.complaints.otherscheck));
};

})//END Complaints controller

app.controller('othercomplaintscontroller',function($scope, $ionicModal, $timeout, $state,$ionicPopup,ionicDatePicker,$ionicActionSheet,smarthealth){
  var position = 0;
  var sheet_item;

  $scope.othercomplaints={};
    $scope.items = [];

//LOAD OTHERCOMPLAINTS
$scope.$on('$ionicView.enter', function() {
    $scope.items = smarthealth.get_consultationnavigator();
//Identify position of sheet within items array
for(var i = 0;i<$scope.items.length;i++){if($scope.items[i].title==='Other complaints'){position = i;}}

$scope.othercomplaints.drughistory = smarthealth.NullFilter(window.localStorage.getItem("drughistory"));
$scope.othercomplaints.allergytext = smarthealth.NullFilter(window.localStorage.getItem("allergytext"));
$scope.othercomplaints.drugone = smarthealth.NullFilter(window.localStorage.getItem("drugone"));
$scope.othercomplaints.drugtwo = smarthealth.NullFilter(window.localStorage.getItem("drugtwo"));
$scope.othercomplaints.drugthree = smarthealth.NullFilter(window.localStorage.getItem("drugthree"));
$scope.othercomplaints.familyhistory = smarthealth.NullFilter(window.localStorage.getItem("familyhistory"));
$scope.othercomplaints.smokingtext = smarthealth.NullFilter(window.localStorage.getItem("smokingtext"));
$scope.othercomplaints.alcoholtext = smarthealth.NullFilter(window.localStorage.getItem("alcoholtext"));
$scope.othercomplaints.drugabusetext = smarthealth.NullFilter(window.localStorage.getItem("drugabusetext"));
$scope.othercomplaints.traveltext = smarthealth.NullFilter(window.localStorage.getItem("traveltext"));
$scope.othercomplaints.sexualtext = smarthealth.NullFilter(window.localStorage.getItem("sexualtext"));

var allergy = window.localStorage.getItem("allergystate");
var smoking = window.localStorage.getItem("smokingstate");
var alcohol = window.localStorage.getItem("alcoholstate");
var drugabuse = window.localStorage.getItem("drugabusestate");
var travel = window.localStorage.getItem("travelstate");
var sexual = window.localStorage.getItem("sexualstate");
if(allergy==="true"){$scope.othercomplaints.allergycheck="true";}
if(allergy==="false"){$scope.othercomplaints.allergycheck="false";}
if(smoking==="true"){$scope.othercomplaints.smokingcheck="true";}
if(smoking==="false"){$scope.othercomplaints.smokingcheck="false";}
if(alcohol==="true"){$scope.othercomplaints.alcoholcheck="true";}
if(alcohol==="false"){$scope.othercomplaints.alcoholcheck="false";}
if(drugabuse==="true"){$scope.othercomplaints.drugabusecheck="true";}
if(drugabuse==="false"){$scope.othercomplaints.drugabusecheck="false";}
if(travel==="true"){$scope.othercomplaints.travelcheck="true";}
if(travel==="false"){$scope.othercomplaints.travelcheck="false";}
if(sexual==="true"){$scope.othercomplaints.sexualcheck="true";}
if(sexual==="false"){$scope.othercomplaints.sexualcheck="false";}
});

  $scope.next = function(){
  //Next button clicked
  $scope.saveothercomplaints();
  smarthealth.handleNext($scope.items,position);
  };

  $scope.back = function(){
  //Back button clicked
  $scope.saveothercomplaints();
  smarthealth.handlePrevious($scope.items,position);
  };

  $scope.menu = function(){
  //Options button clicked

  $scope.saveothercomplaints();
  $ionicActionSheet.show({
     buttons: [
       { text: 'Add consultation sheets' },
       { text: 'Remove consultation sheets' },
       { text: 'Save and exit' },
       { text: 'Close consultation' },
       { text: 'Clear consultation fields' }
     ],
     titleText: 'Options',
     cancelText: 'Cancel',
     cancel: function() {
          // add cancel code..
        },
     buttonClicked: function(index) {

       if(index==0){
       //Add consultation sheets
       $state.go('app.newconsultation');
       }

       if(index==1){
       //Remove consultation sheets
       $state.go('app.removeconsultations');
       }

       if(index==2){
       //Save and exit
       $state.go('saveconsultation');
       }

if(index==3){
//Close consultation
$scope.patients = [];
patients = [
{title:'Patient Biodata',subtitle:'Basic information',sheet:'patientbiodata',image:'img/edit.png'},
{title:'Patient Summary',subtitle:'Brief history',sheet:'patientsummary',image:'img/recordok.png'},
{title:'New Consultation',subtitle:'Create patient database entry',sheet:'newconsultation',image:'img/icpages.png'},
{title:'Past Consultations',subtitle:'Created by doctors',sheet:'pastconsultations',image:'img/icmenusave.png'},
{title:'Create Appointment',subtitle:'Patient agenda manager',sheet:'appointments',image:'img/calendar.png'},
{title:'Medical Tools',subtitle:'Useful calculators',sheet:'toolkit',image:'img/icphotos.png'},
{title:'Close patient file',subtitle:'Returns back to dashboard',sheet:'closepatientfile',image:'img/sync.png'}];

//Clear off sidemenu items
for(var i = 0; i < $scope.items.length ; i++){
$scope.items.splice(i,$scope.items.length);
}
angular.forEach(patients, function(item){
$scope.items.push(item);
});
$state.go('app.newconsultation');
}

if(index==4){
$state.go('clearsuccessful');
}
       return true;
     }
   });
  };


$scope.saveothercomplaints = function(){
window.localStorage.setItem("drughistory",smarthealth.NullFilter($scope.othercomplaints.drughistory));
window.localStorage.setItem("allergytext",smarthealth.NullFilter($scope.othercomplaints.allergytext));
window.localStorage.setItem("drugone",smarthealth.NullFilter($scope.othercomplaints.drugone));
window.localStorage.setItem("drugtwo",smarthealth.NullFilter($scope.othercomplaints.drugtwo));
window.localStorage.setItem("drugthree",smarthealth.NullFilter($scope.othercomplaints.drugthree));
window.localStorage.setItem("familyhistory",smarthealth.NullFilter($scope.othercomplaints.familyhistory));
window.localStorage.setItem("smokingtext",smarthealth.NullFilter($scope.othercomplaints.smokingtext));
window.localStorage.setItem("alcoholtext",smarthealth.NullFilter($scope.othercomplaints.alcoholtext));
window.localStorage.setItem("drugabusetext",smarthealth.NullFilter($scope.othercomplaints.drugabusetext));
window.localStorage.setItem("traveltext",smarthealth.NullFilter($scope.othercomplaints.traveltext));
window.localStorage.setItem("sexualtext",smarthealth.NullFilter($scope.othercomplaints.sexualtext));
window.localStorage.setItem("allergystate",$scope.othercomplaints.allergycheck);
window.localStorage.setItem("smokingstate",$scope.othercomplaints.smokingcheck);
window.localStorage.setItem("alcoholstate",$scope.othercomplaints.alcoholcheck);
window.localStorage.setItem("drugabusestate",$scope.othercomplaints.drugabusecheck);
window.localStorage.setItem("travelstate",$scope.othercomplaints.travelcheck);
window.localStorage.setItem("sexualstate",$scope.othercomplaints.sexualcheck);
};


})//END othercomplaintscontroller

app.controller('vitalscontroller',function($scope, $ionicModal, $timeout, $state,$ionicPopup,ionicDatePicker,$ionicActionSheet,smarthealth){
  var position = 0;
  var sheet_item;

  $scope.vitals={};
    $scope.items = [];

$scope.$on('$ionicView.enter', function() {
    $scope.items = smarthealth.get_consultationnavigator();
//LOAD VITALS
//Identify position of sheet within items array
for(var i = 0;i<$scope.items.length;i++){if($scope.items[i].title==='Vitals'){position = i;}}
$scope.vitals.bloodpressure = smarthealth.NullFilter(window.localStorage.getItem("bloodpressure"));
$scope.vitals.pulse = smarthealth.NullFilter(window.localStorage.getItem("pulse"));
$scope.vitals.temperature = smarthealth.NullFilter(window.localStorage.getItem("temperature"));
$scope.vitals.respiratoryrate = smarthealth.NullFilter(window.localStorage.getItem("respiratoryrate"));
$scope.vitals.spotwo = smarthealth.NullFilter(window.localStorage.getItem("spotwo"));
$scope.vitals.pallortext = smarthealth.NullFilter(window.localStorage.getItem("pallortext"));
$scope.vitals.cyanosistext = smarthealth.NullFilter(window.localStorage.getItem("cyanosistext"));
$scope.vitals.jaundicetext = smarthealth.NullFilter(window.localStorage.getItem("jaundicetext"));
$scope.vitals.clubbingtext = smarthealth.NullFilter(window.localStorage.getItem("clubbingtext"));
$scope.vitals.othervitalfindings = smarthealth.NullFilter(window.localStorage.getItem("othervitalfindings"));
$scope.vitals.pallorcheck= smarthealth.NullFilter(window.localStorage.getItem("pallorstate"));
$scope.vitals.cyanosischeck= smarthealth.NullFilter(window.localStorage.getItem("cyanosisstate"));
$scope.vitals.jaundicecheck= smarthealth.NullFilter(window.localStorage.getItem("jaundicestate"));
$scope.vitals.clubbingcheck= smarthealth.NullFilter(window.localStorage.getItem("clubbingstate"));
});



  $scope.next = function(){
  //Next button clicked
  $scope.savevitals();
  smarthealth.handleNext($scope.items,position);
  };

  $scope.back = function(){
  //Back button clicked
  $scope.savevitals();
  smarthealth.handlePrevious($scope.items,position);
  };

  $scope.menu = function(){
  //Options button clicked
  $scope.savevitals();
  $ionicActionSheet.show({
     buttons: [
       { text: 'Add consultation sheets' },
       { text: 'Remove consultation sheets' },
       { text: 'Save and exit' },
       { text: 'Close consultation' }
     ],
     titleText: 'Options',
     cancelText: 'Cancel',
     cancel: function() {
          // add cancel code..
        },
     buttonClicked: function(index) {

       if(index==0){
       //Add consultation sheets
       $state.go('app.newconsultation');
       }

       if(index==1){
       //Remove consultation sheets
       $state.go('app.removeconsultations');
       }

       if(index==2){
       //Save and exit
       $state.go('saveconsultation');
       }

if(index==3){
//Close consultation
$scope.patients = [];
patients = [
{title:'Patient Biodata',subtitle:'Basic information',sheet:'patientbiodata',image:'img/edit.png'},
{title:'Patient Summary',subtitle:'Brief history',sheet:'patientsummary',image:'img/recordok.png'},
{title:'New Consultation',subtitle:'Create patient database entry',sheet:'newconsultation',image:'img/icpages.png'},
{title:'Past Consultations',subtitle:'Created by doctors',sheet:'pastconsultations',image:'img/icmenusave.png'},
{title:'Create Appointment',subtitle:'Patient agenda manager',sheet:'appointments',image:'img/calendar.png'},
{title:'Medical Tools',subtitle:'Useful calculators',sheet:'toolkit',image:'img/icphotos.png'},
{title:'Close patient file',subtitle:'Returns back to dashboard',sheet:'closepatientfile',image:'img/sync.png'}];

//Clear off sidemenu items
for(var i = 0; i < $scope.items.length ; i++){
$scope.items.splice(i,$scope.items.length);
}
angular.forEach(patients, function(item){
$scope.items.push(item);
});
$state.go('app.newconsultation');
}

if(index==4){
$state.go('clearsuccessful');
}

       return true;
     }
   });
  };

$scope.savevitals = function(){
window.localStorage.setItem("bloodpressure",smarthealth.NullFilter($scope.vitals.bloodpressure));
window.localStorage.setItem("pulse",smarthealth.NullFilter($scope.vitals.pulse));
window.localStorage.setItem("temperature",smarthealth.NullFilter($scope.vitals.temperature));
window.localStorage.setItem("respiratoryrate",smarthealth.NullFilter($scope.vitals.respiratoryrate));
window.localStorage.setItem("spotwo",smarthealth.NullFilter($scope.vitals.spotwo));
window.localStorage.setItem("pallortext",smarthealth.NullFilter($scope.vitals.pallortext));
window.localStorage.setItem("cyanosistext",smarthealth.NullFilter($scope.vitals.cyanosistext));
window.localStorage.setItem("jaundicetext",smarthealth.NullFilter($scope.vitals.jaundicetext));
window.localStorage.setItem("clubbingtext",smarthealth.NullFilter($scope.vitals.clubbingtext));
window.localStorage.setItem("othervitalfindings",smarthealth.NullFilter($scope.vitals.othervitalfindings));
window.localStorage.setItem("pallorstate",$scope.vitals.pallorcheck);
window.localStorage.setItem("cyanosisstate",$scope.vitals.cyanosischeck);
window.localStorage.setItem("jaundicestate",$scope.vitals.jaundicecheck);
window.localStorage.setItem("clubbingstate",$scope.vitals.clubbingcheck);
};


})//END vitalscontroller

app.controller('mdpartonecontroller',function($scope, $ionicModal, $timeout, $state,$ionicPopup,ionicDatePicker,$ionicActionSheet,smarthealth){
  var position = 0;
  var sheet_item;

  $scope.mdpartone = {};
    $scope.items = [];

$scope.$on('$ionicView.enter', function() {
    $scope.items = smarthealth.get_consultationnavigator();
//LOAD MDPARTONE
//Identify position of sheet within items array
for(var i = 0;i<$scope.items.length;i++){if($scope.items[i].title==='RS CVS GIT exam'){position = i;}}
$scope.mdpartone.inspectrs = smarthealth.NullFilter(window.localStorage.getItem("rsinspection"));
$scope.mdpartone.palpaters = smarthealth.NullFilter(window.localStorage.getItem("rspalpation"));
$scope.mdpartone.percussrs = smarthealth.NullFilter(window.localStorage.getItem("rspercussion"));
$scope.mdpartone.auscultaters = smarthealth.NullFilter(window.localStorage.getItem("rsauscultation"));
$scope.mdpartone.inspectcvs = smarthealth.NullFilter(window.localStorage.getItem("cvsinspection"));
$scope.mdpartone.palpatecvs = smarthealth.NullFilter(window.localStorage.getItem("cvspalpation"));
$scope.mdpartone.percusscvs = smarthealth.NullFilter(window.localStorage.getItem("cvspercussion"));
$scope.mdpartone.auscultatecvs = smarthealth.NullFilter(window.localStorage.getItem("cvsauscultation"));
$scope.mdpartone.inspectgit = smarthealth.NullFilter(window.localStorage.getItem("gitinspection"));
$scope.mdpartone.palpategit = smarthealth.NullFilter(window.localStorage.getItem("gitpalpation"));
$scope.mdpartone.percussgit = smarthealth.NullFilter(window.localStorage.getItem("gitpercussion"));
$scope.mdpartone.auscultategit = smarthealth.NullFilter(window.localStorage.getItem("gitauscultation"));
});


  $scope.next = function(){
  //Next button clicked
  $scope.savemdpartone();
  smarthealth.handleNext($scope.items,position);
  };

  $scope.back = function(){
  //Back button clicked
  $scope.savemdpartone();
  smarthealth.handlePrevious($scope.items,position);
  };

  $scope.menu = function(){
  //Options button clicked
  $scope.savemdpartone();
  $ionicActionSheet.show({
     buttons: [
       { text: 'Add consultation sheets' },
       { text: 'Remove consultation sheets' },
       { text: 'Save and exit' },
       { text: 'Close consultation' },
       { text: 'Clear consultation fields' }
     ],
     titleText: 'Options',
     cancelText: 'Cancel',
     cancel: function() {
          // add cancel code..
        },
     buttonClicked: function(index) {

       if(index==0){
       //Add consultation sheets
       $state.go('app.newconsultation');
       }

       if(index==1){
       //Remove consultation sheets
       $state.go('app.removeconsultations');
       }

       if(index==2){
       //Save and exit
       $state.go('saveconsultation');
       }

if(index==3){
//Close consultation
$scope.patients = [];
patients = [
{title:'Patient Biodata',subtitle:'Basic information',sheet:'patientbiodata',image:'img/edit.png'},
{title:'Patient Summary',subtitle:'Brief history',sheet:'patientsummary',image:'img/recordok.png'},
{title:'New Consultation',subtitle:'Create patient database entry',sheet:'newconsultation',image:'img/icpages.png'},
{title:'Past Consultations',subtitle:'Created by doctors',sheet:'pastconsultations',image:'img/icmenusave.png'},
{title:'Create Appointment',subtitle:'Patient agenda manager',sheet:'appointments',image:'img/calendar.png'},
{title:'Medical Tools',subtitle:'Useful calculators',sheet:'toolkit',image:'img/icphotos.png'},
{title:'Close patient file',subtitle:'Returns back to dashboard',sheet:'closepatientfile',image:'img/sync.png'}];

//Clear off sidemenu items
for(var i = 0; i < $scope.items.length ; i++){
$scope.items.splice(i,$scope.items.length);
}
angular.forEach(patients, function(item){
$scope.items.push(item);
});
$state.go('app.newconsultation');
}

if(index==4){
$state.go('clearsuccessful');
}
       return true;
     }
   });
  };

$scope.savemdpartone = function(){
window.localStorage.setItem("rsinspection",smarthealth.NullFilter($scope.mdpartone.inspectrs));
window.localStorage.setItem("rspalpation",smarthealth.NullFilter($scope.mdpartone.palpaters));
window.localStorage.setItem("rspercussion",smarthealth.NullFilter($scope.mdpartone.percussrs));
window.localStorage.setItem("rsauscultation",smarthealth.NullFilter($scope.mdpartone.auscultaters));
window.localStorage.setItem("cvsinspection",smarthealth.NullFilter($scope.mdpartone.inspectcvs));
window.localStorage.setItem("cvspalpation",smarthealth.NullFilter($scope.mdpartone.palpatecvs));
window.localStorage.setItem("cvspercussion",smarthealth.NullFilter($scope.mdpartone.percusscvs));
window.localStorage.setItem("cvsauscultation",smarthealth.NullFilter($scope.mdpartone.auscultatecvs));
window.localStorage.setItem("gitinspection",smarthealth.NullFilter($scope.mdpartone.inspectgit));
window.localStorage.setItem("gitpalpation",smarthealth.NullFilter($scope.mdpartone.palpategit));
window.localStorage.setItem("gitpercussion",smarthealth.NullFilter($scope.mdpartone.percussgit));
window.localStorage.setItem("gitauscultation",smarthealth.NullFilter($scope.mdpartone.auscultategit));
};

})//END mdpartonecontroller

app.controller('mdparttwocontroller',function($scope, $ionicModal, $timeout, $state,$ionicPopup,ionicDatePicker,$ionicActionSheet,smarthealth){
  var position = 0;
  var sheet_item;

  $scope.mdparttwo = {};
    $scope.items = [];

$scope.$on('$ionicView.enter', function() {

    $scope.items = smarthealth.get_consultationnavigator();
//LOAD MDPARTTWO
//Identify position of sheet within items array
for(var i = 0;i<$scope.items.length;i++){if($scope.items[i].title==='CNS exam'){position = i;}}
$scope.mdparttwo.cranialnerve = smarthealth.NullFilter(window.localStorage.getItem("cranialnerve"));
$scope.mdparttwo.speech = smarthealth.NullFilter(window.localStorage.getItem("neurospeech"));
$scope.mdparttwo.motorsystem = smarthealth.NullFilter(window.localStorage.getItem("motorsystem"));
$scope.mdparttwo.sensorysystem = smarthealth.NullFilter(window.localStorage.getItem("sensorysystem"));
$scope.mdparttwo.meningealsigns = smarthealth.NullFilter(window.localStorage.getItem("meningealsigns"));
$scope.mdparttwo.otherfindings = smarthealth.NullFilter(window.localStorage.getItem("othermedicalfindings"));
});

  $scope.next = function(){
  //Next button clicked
  $scope.savemdparttwo();
  smarthealth.handleNext($scope.items,position);
  };

  $scope.back = function(){
  //Back button clicked
  $scope.savemdparttwo();
  smarthealth.handlePrevious($scope.items,position);
  };

  $scope.menu = function(){
  //Options button clicked
  $scope.savemdparttwo();
  $ionicActionSheet.show({
     buttons: [
       { text: 'Add consultation sheets' },
       { text: 'Remove consultation sheets' },
       { text: 'Save and exit' },
       { text: 'Close consultation' },
       { text: 'Clear consultation fields' }
     ],
     titleText: 'Options',
     cancelText: 'Cancel',
     cancel: function() {
          // add cancel code..
        },
     buttonClicked: function(index) {

       if(index==0){
       //Add consultation sheets
       $state.go('app.newconsultation');
       }

       if(index==1){
       //Remove consultation sheets
       $state.go('app.removeconsultations');
       }

       if(index==2){
       //Save and exit
       $state.go('saveconsultation');
       }

if(index==3){
//Close consultation
$scope.patients = [];
patients = [
{title:'Patient Biodata',subtitle:'Basic information',sheet:'patientbiodata',image:'img/edit.png'},
{title:'Patient Summary',subtitle:'Brief history',sheet:'patientsummary',image:'img/recordok.png'},
{title:'New Consultation',subtitle:'Create patient database entry',sheet:'newconsultation',image:'img/icpages.png'},
{title:'Past Consultations',subtitle:'Created by doctors',sheet:'pastconsultations',image:'img/icmenusave.png'},
{title:'Create Appointment',subtitle:'Patient agenda manager',sheet:'appointments',image:'img/calendar.png'},
{title:'Medical Tools',subtitle:'Useful calculators',sheet:'toolkit',image:'img/icphotos.png'},
{title:'Close patient file',subtitle:'Returns back to dashboard',sheet:'closepatientfile',image:'img/sync.png'}];

//Clear off sidemenu items
for(var i = 0; i < $scope.items.length ; i++){
$scope.items.splice(i,$scope.items.length);
}
angular.forEach(patients, function(item){
$scope.items.push(item);
});
$state.go('app.newconsultation');
}

if(index==4){
$state.go('clearsuccessful');
}
       return true;
     }
   });
  };

$scope.savemdparttwo = function(){
window.localStorage.setItem("cranialnerve",smarthealth.NullFilter($scope.mdparttwo.cranialnerve));
window.localStorage.setItem("neurospeech",smarthealth.NullFilter($scope.mdparttwo.speech));
window.localStorage.setItem("motorsystem",smarthealth.NullFilter($scope.mdparttwo.motorsystem));
window.localStorage.setItem("sensorysystem",smarthealth.NullFilter($scope.mdparttwo.sensorysystem));
window.localStorage.setItem("meningealsigns",smarthealth.NullFilter($scope.mdparttwo.meningealsigns));
window.localStorage.setItem("othermedicalfindings",smarthealth.NullFilter($scope.mdparttwo.otherfindings));
};

})//END mdparttwocontroller

app.controller('investigationscontroller',function($scope, $ionicModal, $timeout, $state,$ionicPopup,ionicDatePicker,$ionicActionSheet,smarthealth){
  var position = 0;
  var sheet_item;
  $scope.investigations={};
    $scope.items = [];
$scope.$on('$ionicView.enter', function() {
    $scope.items = smarthealth.get_consultationnavigator();
//LOAD INVESTIGATIONS
//Identify position of sheet within items array
for(var i = 0;i<$scope.items.length;i++){if($scope.items[i].title==='Investigations'){position = i;}}
$scope.investigations.fbctext = smarthealth.NullFilter(window.localStorage.getItem("fbctext"));
$scope.investigations.uetext = smarthealth.NullFilter(window.localStorage.getItem("uetext"));
$scope.investigations.creatininetext = smarthealth.NullFilter(window.localStorage.getItem("creatininetext"));
$scope.investigations.fbstext = smarthealth.NullFilter(window.localStorage.getItem("fbstext"));
$scope.investigations.fsltext = smarthealth.NullFilter(window.localStorage.getItem("fsltext"));
$scope.investigations.tgtext = smarthealth.NullFilter(window.localStorage.getItem("tgtext"));
$scope.investigations.urictext = smarthealth.NullFilter(window.localStorage.getItem("urictext"));
$scope.investigations.otherinvtext = smarthealth.NullFilter(window.localStorage.getItem("otherinvestigationstext"));
$scope.investigations.treatment = smarthealth.NullFilter(window.localStorage.getItem("treatment"));
$scope.investigations.imagingtext = smarthealth.NullFilter(window.localStorage.getItem("imagingtext"));
$scope.investigations.patientreview = smarthealth.NullFilter(window.localStorage.getItem("patientreview"));
$scope.investigations.fbccheck = smarthealth.NullFilter(window.localStorage.getItem("fbcstate"));
$scope.investigations.uecheck = smarthealth.NullFilter(window.localStorage.getItem("uestate"));
$scope.investigations.creatininecheck = smarthealth.NullFilter(window.localStorage.getItem("creatininestate"));
$scope.investigations.fbscheck = smarthealth.NullFilter(window.localStorage.getItem("fbsstate"));
$scope.investigations.fslcheck = smarthealth.NullFilter(window.localStorage.getItem("fslstate"));
$scope.investigations.tgcheck = smarthealth.NullFilter(window.localStorage.getItem("tgstate"));
$scope.investigations.uriccheck = smarthealth.NullFilter(window.localStorage.getItem("uricstate"));
$scope.investigations.otherinvcheck = smarthealth.NullFilter(window.localStorage.getItem("otherinvestigationsstate"));
$scope.investigations.imagingcheck = smarthealth.NullFilter(window.localStorage.getItem("imagingstate"));
});


  $scope.next = function(){
  //Next button clicked
  $scope.saveinvestigations();
  smarthealth.handleNext($scope.items,position);
  };

  $scope.back = function(){
  //Back button clicked
  $scope.saveinvestigations();
  smarthealth.handlePrevious($scope.items,position);
  };
  $scope.menu = function(){
  //Options button clicked
  $scope.saveinvestigations();
  $ionicActionSheet.show({
     buttons: [
       { text: 'Add consultation sheets' },
       { text: 'Remove consultation sheets' },
       { text: 'Save and exit' },
       { text: 'Close consultation' },
       { text: 'Clear consultation fields' }
     ],
     titleText: 'Options',
     cancelText: 'Cancel',
     cancel: function() {
          // add cancel code..
        },
     buttonClicked: function(index) {

       if(index==0){
       //Add consultation sheets
       $state.go('app.newconsultation');
       }

       if(index==1){
       //Remove consultation sheets
       $state.go('app.removeconsultations');
       }

       if(index==2){
       //Save and exit
       $state.go('saveconsultation');
       }

if(index==3){
//Close consultation
$scope.patients = [];
patients = [
{title:'Patient Biodata',subtitle:'Basic information',sheet:'patientbiodata',image:'img/edit.png'},
{title:'Patient Summary',subtitle:'Brief history',sheet:'patientsummary',image:'img/recordok.png'},
{title:'New Consultation',subtitle:'Create patient database entry',sheet:'newconsultation',image:'img/icpages.png'},
{title:'Past Consultations',subtitle:'Created by doctors',sheet:'pastconsultations',image:'img/icmenusave.png'},
{title:'Create Appointment',subtitle:'Patient agenda manager',sheet:'appointments',image:'img/calendar.png'},
{title:'Medical Tools',subtitle:'Useful calculators',sheet:'toolkit',image:'img/icphotos.png'},
{title:'Close patient file',subtitle:'Returns back to dashboard',sheet:'closepatientfile',image:'img/sync.png'}];

//Clear off sidemenu items
for(var i = 0; i < $scope.items.length ; i++){
$scope.items.splice(i,$scope.items.length);
}
angular.forEach(patients, function(item){
$scope.items.push(item);
});
$state.go('app.newconsultation');
}

if(index==4){
$state.go('clearsuccessful');
}

       return true;
     }
   });
  };

$scope.saveinvestigations = function(){
window.localStorage.setItem("fbctext",smarthealth.NullFilter($scope.investigations.fbctext));
window.localStorage.setItem("uetext",smarthealth.NullFilter($scope.investigations.uetext));
window.localStorage.setItem("creatininetext",smarthealth.NullFilter($scope.investigations.creatininetext));
window.localStorage.setItem("fbstext",smarthealth.NullFilter($scope.investigations.fbstext));
window.localStorage.setItem("fsltext",smarthealth.NullFilter($scope.investigations.fsltext));
window.localStorage.setItem("tgtext",smarthealth.NullFilter($scope.investigations.tgtext));
window.localStorage.setItem("urictext",smarthealth.NullFilter($scope.investigations.urictext));
window.localStorage.setItem("otherinvestigationstext",smarthealth.NullFilter($scope.investigations.otherinvtext));
window.localStorage.setItem("treatment",smarthealth.NullFilter($scope.investigations.treatment));
window.localStorage.setItem("imagingtext",smarthealth.NullFilter($scope.investigations.imagingtext));
window.localStorage.setItem("patientreview",smarthealth.NullFilter($scope.investigations.patientreview));
window.localStorage.setItem("fbcstate",$scope.investigations.fbccheck);
window.localStorage.setItem("uestate",$scope.investigations.uecheck);
window.localStorage.setItem("creatininestate",$scope.investigations.creatininecheck);
window.localStorage.setItem("fbsstate",$scope.investigations.fbscheck);
window.localStorage.setItem("fslstate",$scope.investigations.fslcheck);
window.localStorage.setItem("tgstate",$scope.investigations.tgcheck);
window.localStorage.setItem("uricstate",$scope.investigations.uriccheck);
window.localStorage.setItem("otherinvestigationsstate",$scope.investigations.otherinvcheck);
window.localStorage.setItem("imagingstate",$scope.investigations.imagingcheck);
};

})//END investigationscontroller

app.controller('obsinfocontroller',function($scope, $ionicModal, $timeout, $state,$ionicPopup,ionicDatePicker,$ionicActionSheet,smarthealth){
  var position = 0;
  var sheet_item;
  $scope.obsinfo = {};
    $scope.items = [];
  $scope.$on('$ionicView.enter', function() {
      $scope.items = smarthealth.get_consultationnavigator();
  //LOAD OBSINFO
  //Identify position of sheet within items array
  for(var i = 0;i<$scope.items.length;i++){if($scope.items[i].title==='Obstetrics'){position = i;}}
  $scope.obsinfo.lmp = smarthealth.NullFilter(window.localStorage.getItem("lmp"));
  $scope.obsinfo.pog = smarthealth.NullFilter(window.localStorage.getItem("gravindex"));
  $scope.obsinfo.pastobs = smarthealth.NullFilter(window.localStorage.getItem("pastobstetric"));
  $scope.obsinfo.menstrual = smarthealth.NullFilter(window.localStorage.getItem("menstrual"));
  $scope.obsinfo.marital = smarthealth.NullFilter(window.localStorage.getItem("marital"));
  });

  $scope.next = function(){
  //Next button clicked
  $scope.saveobsinfo();
  smarthealth.handleNext($scope.items,position);
  };

  $scope.back = function(){
  //Back button clicked
  $scope.saveobsinfo();
  smarthealth.handlePrevious($scope.items,position);
  };
  $scope.menu = function(){
  //Options button clicked
  $scope.saveobsinfo();
  $ionicActionSheet.show({
     buttons: [
       { text: 'Add consultation sheets' },
       { text: 'Remove consultation sheets' },
       { text: 'Save and exit' },
       { text: 'Close consultation' },
       { text: 'Clear consultation fields' }
     ],
     titleText: 'Options',
     cancelText: 'Cancel',
     cancel: function() {
          // add cancel code..
        },
     buttonClicked: function(index) {

       if(index==0){
       //Add consultation sheets
       $state.go('app.newconsultation');
       }

       if(index==1){
       //Remove consultation sheets
       $state.go('app.removeconsultations');
       }

       if(index==2){
       //Save and exit
       $state.go('saveconsultation');
       }

if(index==3){
//Close consultation
$scope.patients = [];
patients = [
{title:'Patient Biodata',subtitle:'Basic information',sheet:'patientbiodata',image:'img/edit.png'},
{title:'Patient Summary',subtitle:'Brief history',sheet:'patientsummary',image:'img/recordok.png'},
{title:'New Consultation',subtitle:'Create patient database entry',sheet:'newconsultation',image:'img/icpages.png'},
{title:'Past Consultations',subtitle:'Created by doctors',sheet:'pastconsultations',image:'img/icmenusave.png'},
{title:'Create Appointment',subtitle:'Patient agenda manager',sheet:'appointments',image:'img/calendar.png'},
{title:'Medical Tools',subtitle:'Useful calculators',sheet:'toolkit',image:'img/icphotos.png'},
{title:'Close patient file',subtitle:'Returns back to dashboard',sheet:'closepatientfile',image:'img/sync.png'}];

//Clear off sidemenu items
for(var i = 0; i < $scope.items.length ; i++){
$scope.items.splice(i,$scope.items.length);
}
angular.forEach(patients, function(item){
$scope.items.push(item);
});
$state.go('app.newconsultation');
}

if(index==4){
$state.go('clearsuccessful');
}

       return true;
     }
   });
  };


$scope.saveobsinfo = function(){
  window.localStorage.setItem("lmp",smarthealth.NullFilter($scope.obsinfo.lmp));
  window.localStorage.setItem("gravindex",smarthealth.NullFilter($scope.obsinfo.pog));
  window.localStorage.setItem("pastobstetric",smarthealth.NullFilter($scope.obsinfo.pastobs));
  window.localStorage.setItem("menstrual",smarthealth.NullFilter($scope.obsinfo.menstrual));
  window.localStorage.setItem("marital",smarthealth.NullFilter($scope.obsinfo.marital));
};

})//END obsinfocontroller

app.controller('obsexamcontroller',function($scope, $ionicModal, $timeout, $state,$ionicPopup,ionicDatePicker,$ionicActionSheet,smarthealth){
  var position = 0;
  var sheet_item;
  $scope.obsexam = {};
    $scope.items = [];

$scope.$on('$ionicView.enter', function() {
    $scope.items = smarthealth.get_consultationnavigator();
//LOAD OBSEXAM
//Identify position of sheet within items array
for(var i = 0;i<$scope.items.length;i++){if($scope.items[i].title==='Obstetrics exam'){position = i;}}
$scope.obsexam.inspection = smarthealth.NullFilter(window.localStorage.getItem("obsinspection"));
$scope.obsexam.fundalheight = smarthealth.NullFilter(window.localStorage.getItem("fundalheight"));
$scope.obsexam.fundalgrip = smarthealth.NullFilter(window.localStorage.getItem("fundalgrip"));
$scope.obsexam.rightlateral = smarthealth.NullFilter(window.localStorage.getItem("rightlateral"));
$scope.obsexam.leftlateral = smarthealth.NullFilter(window.localStorage.getItem("leftlateral"));
$scope.obsexam.pawlik = smarthealth.NullFilter(window.localStorage.getItem("pawlik"));
$scope.obsexam.deeppelvic = smarthealth.NullFilter(window.localStorage.getItem("deeppelvic"));
$scope.obsexam.fhs = smarthealth.NullFilter(window.localStorage.getItem("foetalheartsound"));
$scope.obsexam.ve = smarthealth.NullFilter(window.localStorage.getItem("vaginalexam"));
});

  $scope.next = function(){
  //Next button clicked
  $scope.saveobsexam();
  smarthealth.handleNext($scope.items,position);
  };

  $scope.back = function(){
  //Back button clicked
  $scope.saveobsexam();
  smarthealth.handlePrevious($scope.items,position);
  };
  $scope.menu = function(){
  //Options button clicked
  $scope.saveobsexam();
  $ionicActionSheet.show({
     buttons: [
       { text: 'Add consultation sheets' },
       { text: 'Remove consultation sheets' },
       { text: 'Save and exit' },
       { text: 'Close consultation' },
       { text: 'Clear consultation fields' }
     ],
     titleText: 'Options',
     cancelText: 'Cancel',
     cancel: function() {
          // add cancel code..
        },
     buttonClicked: function(index) {

       if(index==0){
       //Add consultation sheets
       $state.go('app.newconsultation');
       }

       if(index==1){
       //Remove consultation sheets
       $state.go('app.removeconsultations');
       }

       if(index==2){
       //Save and exit
       $state.go('saveconsultation');
       }

if(index==3){
//Close consultation
$scope.patients = [];
patients = [
{title:'Patient Biodata',subtitle:'Basic information',sheet:'patientbiodata',image:'img/edit.png'},
{title:'Patient Summary',subtitle:'Brief history',sheet:'patientsummary',image:'img/recordok.png'},
{title:'New Consultation',subtitle:'Create patient database entry',sheet:'newconsultation',image:'img/icpages.png'},
{title:'Past Consultations',subtitle:'Created by doctors',sheet:'pastconsultations',image:'img/icmenusave.png'},
{title:'Create Appointment',subtitle:'Patient agenda manager',sheet:'appointments',image:'img/calendar.png'},
{title:'Medical Tools',subtitle:'Useful calculators',sheet:'toolkit',image:'img/icphotos.png'},
{title:'Close patient file',subtitle:'Returns back to dashboard',sheet:'closepatientfile',image:'img/sync.png'}];

//Clear off sidemenu items
for(var i = 0; i < $scope.items.length ; i++){
$scope.items.splice(i,$scope.items.length);
}
angular.forEach(patients, function(item){
$scope.items.push(item);
});
$state.go('app.newconsultation');
}

if(index==4){
$state.go('clearsuccessful');
}
       return true;
     }
   });
  };


$scope.saveobsexam = function(){
window.localStorage.setItem("obsinspection",document.getElementById('obsexam.inspection').value);
window.localStorage.setItem("fundalheight",document.getElementById('obsexam.fundalheight').value);
window.localStorage.setItem("fundalgrip",document.getElementById('obsexam.fundalgrip').value);
window.localStorage.setItem("rightlateral",document.getElementById('obsexam.rightlateral').value);
window.localStorage.setItem("leftlateral",document.getElementById('obsexam.leftlateral').value);
window.localStorage.setItem("pawlik",document.getElementById('obsexam.pawlik').value);
window.localStorage.setItem("deeppelvic",document.getElementById('obsexam.deeppelvic').value);
window.localStorage.setItem("foetalheartsound",document.getElementById('obsexam.fhs').value);
window.localStorage.setItem("vaginalexam",document.getElementById('obsexam.ve').value);
};

})//END obsexamcontroller

app.controller('gynaeinfocontroller',function($scope, $ionicModal, $timeout, $state,$ionicPopup,ionicDatePicker,$ionicActionSheet,smarthealth){
  var position = 0;
  var sheet_item;
  $scope.gynaeinfo = {};
    $scope.items = [];

  $scope.$on('$ionicView.enter', function() {
      $scope.items = smarthealth.get_consultationnavigator();
  //LOAD GYNAE INFO
  //Identify position of sheet within items array
  for(var i = 0;i<$scope.items.length;i++){if($scope.items[i].title==='Gynaecology'){position = i;}}
  $scope.gynaeinfo.menstrual = window.localStorage.getItem("menstrual");
  $scope.gynaeinfo.marital = window.localStorage.getItem("marital");
  $scope.gynaeinfo.pog = window.localStorage.getItem("gravindex");
  $scope.gynaeinfo.pastobs = window.localStorage.getItem("pastobstetric");
  });


  $scope.next = function(){
  //Next button clicked
  $scope.savegynaeinfo();
  smarthealth.handleNext($scope.items,position);
  };

  $scope.back = function(){
  //Back button clicked
  $scope.savegynaeinfo();
  smarthealth.handlePrevious($scope.items,position);
  };
  $scope.menu = function(){
  //Options button clicked
  $scope.savegynaeinfo();
  $ionicActionSheet.show({
     buttons: [
       { text: 'Add consultation sheets' },
       { text: 'Remove consultation sheets' },
       { text: 'Save and exit' },
       { text: 'Close consultation' },
       { text: 'Clear consultation fields' }
     ],
     titleText: 'Options',
     cancelText: 'Cancel',
     cancel: function() {
          // add cancel code..
        },
     buttonClicked: function(index) {

       if(index==0){
       //Add consultation sheets
       $state.go('app.newconsultation');
       }

       if(index==1){
       //Remove consultation sheets
       $state.go('app.removeconsultations');
       }

       if(index==2){
       //Save and exit
       $state.go('saveconsultation');
       }

if(index==3){
//Close consultation
$scope.patients = [];
patients = [
{title:'Patient Biodata',subtitle:'Basic information',sheet:'patientbiodata',image:'img/edit.png'},
{title:'Patient Summary',subtitle:'Brief history',sheet:'patientsummary',image:'img/recordok.png'},
{title:'New Consultation',subtitle:'Create patient database entry',sheet:'newconsultation',image:'img/icpages.png'},
{title:'Past Consultations',subtitle:'Created by doctors',sheet:'pastconsultations',image:'img/icmenusave.png'},
{title:'Create Appointment',subtitle:'Patient agenda manager',sheet:'appointments',image:'img/calendar.png'},
{title:'Medical Tools',subtitle:'Useful calculators',sheet:'toolkit',image:'img/icphotos.png'},
{title:'Close patient file',subtitle:'Returns back to dashboard',sheet:'closepatientfile',image:'img/sync.png'}];

//Clear off sidemenu items
for(var i = 0; i < $scope.items.length ; i++){
$scope.items.splice(i,$scope.items.length);
}
angular.forEach(patients, function(item){
$scope.items.push(item);
});
$state.go('app.newconsultation');
}

if(index==4){
$state.go('clearsuccessful');
}
       return true;
     }
   });
  };



$scope.savegynaeinfo = function(){
  window.localStorage.setItem("menstrual",smarthealth.NullFilter($scope.gynaeinfo.menstrual));
  window.localStorage.setItem("marital",smarthealth.NullFilter($scope.gynaeinfo.marital));
  window.localStorage.setItem("gravindex",smarthealth.NullFilter($scope.gynaeinfo.pog));
  window.localStorage.setItem("pastobstetric",smarthealth.NullFilter($scope.gynaeinfo.pastobs));
};

})//END gynaeinfocontroller

app.controller('gynaeexamcontroller',function($scope, $ionicModal, $timeout, $state,$ionicPopup,ionicDatePicker,$ionicActionSheet,smarthealth){
  var position = 0;
  var sheet_item;
  $scope.gynaeexam = {};
    $scope.items = [];

$scope.$on('$ionicView.enter', function() {
    $scope.items = smarthealth.get_consultationnavigator();
//LOAD GYNAEEXAM
//Identify position of sheet within items array
for(var i = 0;i<$scope.items.length;i++){if($scope.items[i].title==='Gynaecology exam'){position = i;}}
$scope.gynaeexam.pelvicexam = smarthealth.NullFilter(window.localStorage.getItem("pelvicexamination"));
$scope.gynaeexam.externalgenitalia = smarthealth.NullFilter(window.localStorage.getItem("externalgenitalia"));
$scope.gynaeexam.speculum = smarthealth.NullFilter(window.localStorage.getItem("speculum"));
$scope.gynaeexam.bimanual = smarthealth.NullFilter(window.localStorage.getItem("bimanual"));
});


  $scope.next = function(){
  //Next button clicked
  $scope.savegynaeexam();
  smarthealth.handleNext($scope.items,position);
  };

  $scope.back = function(){
  //Back button clicked
  $scope.savegynaeexam();
  smarthealth.handlePrevious($scope.items,position);
  };
  $scope.menu = function(){
  //Options button clicked
  $scope.savegynaeexam();
  $ionicActionSheet.show({
     buttons: [
       { text: 'Add consultation sheets' },
       { text: 'Remove consultation sheets' },
       { text: 'Save and exit' },
       { text: 'Close consultation' },
       { text: 'Clear consultation fields' }
     ],
     titleText: 'Options',
     cancelText: 'Cancel',
     cancel: function() {
          // add cancel code..
        },
     buttonClicked: function(index) {

       if(index==0){
       //Add consultation sheets
       $state.go('app.newconsultation');
       }

       if(index==1){
       //Remove consultation sheets
       $state.go('app.removeconsultations');
       }

       if(index==2){
       //Save and exit
       $state.go('saveconsultation');
       }

if(index==3){
//Close consultation
$scope.patients = [];
patients = [
{title:'Patient Biodata',subtitle:'Basic information',sheet:'patientbiodata',image:'img/edit.png'},
{title:'Patient Summary',subtitle:'Brief history',sheet:'patientsummary',image:'img/recordok.png'},
{title:'New Consultation',subtitle:'Create patient database entry',sheet:'newconsultation',image:'img/icpages.png'},
{title:'Past Consultations',subtitle:'Created by doctors',sheet:'pastconsultations',image:'img/icmenusave.png'},
{title:'Create Appointment',subtitle:'Patient agenda manager',sheet:'appointments',image:'img/calendar.png'},
{title:'Medical Tools',subtitle:'Useful calculators',sheet:'toolkit',image:'img/icphotos.png'},
{title:'Close patient file',subtitle:'Returns back to dashboard',sheet:'closepatientfile',image:'img/sync.png'}];
if(index==4){
$state.go('clearsuccessful');
}
//Clear off sidemenu items
for(var i = 0; i < $scope.items.length ; i++){
$scope.items.splice(i,$scope.items.length);
}
angular.forEach(patients, function(item){
$scope.items.push(item);
});
$state.go('app.newconsultation');
}
       return true;
     }
   });
  };



$scope.savegynaeexam = function(){
window.localStorage.setItem("pelvicexamination",smarthealth.NullFilter($scope.gynaeexam.pelvicexam));
window.localStorage.setItem("externalgenitalia",smarthealth.NullFilter($scope.gynaeexam.externalgenitalia));
window.localStorage.setItem("speculum",smarthealth.NullFilter($scope.gynaeexam.speculum));
window.localStorage.setItem("bimanual",smarthealth.NullFilter($scope.gynaeexam.bimanual));
};

})//END gynaeexamcontroller

app.controller('paedsinfocontroller',function($scope, $ionicModal, $timeout, $state,$ionicPopup,ionicDatePicker,$ionicActionSheet,smarthealth){
  var position = 0;
  var sheet_item;
  $scope.paedsinfo = {};
    $scope.items = [];

  $scope.$on('$ionicView.enter', function() {
      $scope.items = smarthealth.get_consultationnavigator();
  //LOAD PAEDSINFO
  //Identify position of sheet within items array
  for(var i = 0;i<$scope.items.length;i++){if($scope.items[i].title==='Paediatrics'){position = i;}}
  $scope.paedsinfo.informant = smarthealth.NullFilter(window.localStorage.getItem("informant"));
  $scope.paedsinfo.birthhistory = smarthealth.NullFilter(window.localStorage.getItem("birthhistory"));
  $scope.paedsinfo.socioeconomic = smarthealth.NullFilter(window.localStorage.getItem("socioeconomic"));
  $scope.paedsinfo.developmentalhistory = smarthealth.NullFilter(window.localStorage.getItem("developmental"));
  $scope.paedsinfo.immunizationhistory = smarthealth.NullFilter(window.localStorage.getItem("immunization"));
  });

  $scope.next = function(){
  //Next button clicked
  $scope.savepaedsinfo();
  smarthealth.handleNext($scope.items,position);
  };

  $scope.back = function(){
  //Back button clicked
  $scope.savepaedsinfo();
  smarthealth.handlePrevious($scope.items,position);
  };
  $scope.menu = function(){
  //Options button clicked
  $scope.savepaedsinfo();
  $ionicActionSheet.show({
     buttons: [
       { text: 'Add consultation sheets' },
       { text: 'Remove consultation sheets' },
       { text: 'Save and exit' },
       { text: 'Close consultation' },
       { text: 'Clear consultation fields' }
     ],
     titleText: 'Options',
     cancelText: 'Cancel',
     cancel: function() {
          // add cancel code..
        },
     buttonClicked: function(index) {

       if(index==0){
       //Add consultation sheets
       $state.go('app.newconsultation');
       }

       if(index==1){
       //Remove consultation sheets
       $state.go('app.removeconsultations');
       }

       if(index==2){
       //Save and exit
       $state.go('saveconsultation');
       }

if(index==3){
//Close consultation
$scope.patients = [];
patients = [
{title:'Patient Biodata',subtitle:'Basic information',sheet:'patientbiodata',image:'img/edit.png'},
{title:'Patient Summary',subtitle:'Brief history',sheet:'patientsummary',image:'img/recordok.png'},
{title:'New Consultation',subtitle:'Create patient database entry',sheet:'newconsultation',image:'img/icpages.png'},
{title:'Past Consultations',subtitle:'Created by doctors',sheet:'pastconsultations',image:'img/icmenusave.png'},
{title:'Create Appointment',subtitle:'Patient agenda manager',sheet:'appointments',image:'img/calendar.png'},
{title:'Medical Tools',subtitle:'Useful calculators',sheet:'toolkit',image:'img/icphotos.png'},
{title:'Close patient file',subtitle:'Returns back to dashboard',sheet:'closepatientfile',image:'img/sync.png'}];

//Clear off sidemenu items
for(var i = 0; i < $scope.items.length ; i++){
$scope.items.splice(i,$scope.items.length);
}
angular.forEach(patients, function(item){
$scope.items.push(item);
});
$state.go('app.newconsultation');
}
if(index==4){
$state.go('clearsuccessful');
}
       return true;
     }
   });
  };



$scope.savepaedsinfo = function(){
  window.localStorage.setItem("informant",smarthealth.NullFilter($scope.paedsinfo.informant));
  window.localStorage.setItem("birthhistory",smarthealth.NullFilter($scope.paedsinfo.birthhistory));
  window.localStorage.setItem("socioeconomic",smarthealth.NullFilter($scope.paedsinfo.socioeconomic));
  window.localStorage.setItem("developmental",smarthealth.NullFilter($scope.paedsinfo.developmentalhistory));
  window.localStorage.setItem("immunization",smarthealth.NullFilter($scope.paedsinfo.immunizationhistory));
};

})//END paedsinfocontroller

app.controller('paedsvitalscontroller',function($scope, $ionicModal, $timeout, $state,$ionicPopup,ionicDatePicker,$ionicActionSheet,smarthealth){
  var position = 0;
  var sheet_item;
  $scope.paedsgeneralexam = {};
    $scope.items = [];

  $scope.$on('$ionicView.enter', function() {
      $scope.items = smarthealth.get_consultationnavigator();
  //LOAD PAEDS GENERAL EXAM
  //Identify position of sheet within items array
  for(var i = 0;i<$scope.items.length;i++){if($scope.items[i].title==='Paediatric Vitals'){position = i;}}
  $scope.paedsgeneralexam.consciousness = smarthealth.NullFilter(window.localStorage.getItem("consciousness"));
  $scope.paedsgeneralexam.pulse = smarthealth.NullFilter(window.localStorage.getItem("pulse"));
  $scope.paedsgeneralexam.bloodpressure = smarthealth.NullFilter(window.localStorage.getItem("bloodpressure"));
  $scope.paedsgeneralexam.temperature = smarthealth.NullFilter(window.localStorage.getItem("temperature"));
  $scope.paedsgeneralexam.skincondition = smarthealth.NullFilter(window.localStorage.getItem("skincondition"));
  $scope.paedsgeneralexam.arthropometry = smarthealth.NullFilter(window.localStorage.getItem("arthropometry"));
  $scope.paedsgeneralexam.jugularpressure = smarthealth.NullFilter(window.localStorage.getItem("jugularpressure"));
  $scope.paedsgeneralexam.otherfindings = smarthealth.NullFilter(window.localStorage.getItem("otherpaedsfindings"));
  $scope.paedsgeneralexam.thyroidgland = smarthealth.NullFilter(window.localStorage.getItem("thyroidgland"));
  $scope.paedsgeneralexam.comments = smarthealth.NullFilter(window.localStorage.getItem("paedscomments"));
  });

  $scope.next = function(){
  //Next button clicked
  $scope.savepaedsvitals();
  smarthealth.handleNext($scope.items,position);
  };

  $scope.back = function(){
  //Back button clicked
  $scope.savepaedsvitals();
  smarthealth.handlePrevious($scope.items,position);
  };
  $scope.menu = function(){
  //Options button clicked
  $scope.savepaedsvitals();
  $ionicActionSheet.show({
     buttons: [
       { text: 'Add consultation sheets' },
       { text: 'Remove consultation sheets' },
       { text: 'Save and exit' },
       { text: 'Close consultation' },
       { text: 'Clear consultation fields' }
     ],
     titleText: 'Options',
     cancelText: 'Cancel',
     cancel: function() {
          // add cancel code..
        },
     buttonClicked: function(index) {

       if(index==0){
       //Add consultation sheets
       $state.go('app.newconsultation');
       }

       if(index==1){
       //Remove consultation sheets
       $state.go('app.removeconsultations');
       }

       if(index==2){
       //Save and exit
       $state.go('saveconsultation');
       }

if(index==3){
//Close consultation
$scope.patients = [];
patients = [
{title:'Patient Biodata',subtitle:'Basic information',sheet:'patientbiodata',image:'img/edit.png'},
{title:'Patient Summary',subtitle:'Brief history',sheet:'patientsummary',image:'img/recordok.png'},
{title:'New Consultation',subtitle:'Create patient database entry',sheet:'newconsultation',image:'img/icpages.png'},
{title:'Past Consultations',subtitle:'Created by doctors',sheet:'pastconsultations',image:'img/icmenusave.png'},
{title:'Create Appointment',subtitle:'Patient agenda manager',sheet:'appointments',image:'img/calendar.png'},
{title:'Medical Tools',subtitle:'Useful calculators',sheet:'toolkit',image:'img/icphotos.png'},
{title:'Close patient file',subtitle:'Returns back to dashboard',sheet:'closepatientfile',image:'img/sync.png'}];

//Clear off sidemenu items
for(var i = 0; i < $scope.items.length ; i++){
$scope.items.splice(i,$scope.items.length);
}
angular.forEach(patients, function(item){
$scope.items.push(item);
});
$state.go('app.newconsultation');
}
if(index==4){
$state.go('clearsuccessful');
}
       return true;
     }
   });
  };



$scope.savepaedsvitals = function(){
  window.localStorage.setItem("consciousness",smarthealth.NullFilter($scope.paedsgeneralexam.consciousness));
  window.localStorage.setItem("pulse",smarthealth.NullFilter($scope.paedsgeneralexam.pulse));
  window.localStorage.setItem("bloodpressure",smarthealth.NullFilter($scope.paedsgeneralexam.bloodpressure));
  window.localStorage.setItem("temperature",smarthealth.NullFilter($scope.paedsgeneralexam.temperature));
  window.localStorage.setItem("skincondition",smarthealth.NullFilter($scope.paedsgeneralexam.skincondition));
  window.localStorage.setItem("arthropometry",smarthealth.NullFilter($scope.paedsgeneralexam.arthropometry));
  window.localStorage.setItem("jugularpressure",smarthealth.NullFilter($scope.paedsgeneralexam.jugularpressure));
  window.localStorage.setItem("otherpaedsfindings",smarthealth.NullFilter($scope.paedsgeneralexam.otherfindings));
  window.localStorage.setItem("thyroidgland",smarthealth.NullFilter($scope.paedsgeneralexam.thyroidgland));
  window.localStorage.setItem("paedscomments",smarthealth.NullFilter($scope.paedsgeneralexam.comments));
};

})//END paedsvitalscontroller

app.controller('psyinfocontroller',function($scope, $ionicModal, $timeout, $state,$ionicPopup,ionicDatePicker,$ionicActionSheet,smarthealth){
  var position = 0;
  var sheet_item;
  $scope.psyinfo = {};
    $scope.items = [];

  $scope.$on('$ionicView.enter', function() {
      $scope.items = smarthealth.get_consultationnavigator();
  //LOAD PSYINFO
  //Identify position of sheet within items array
  for(var i = 0;i<$scope.items.length;i++){if($scope.items[i].title==='Psychiatry'){position = i;}}
  $scope.psyinfo.childhood = smarthealth.NullFilter(window.localStorage.getItem("childhood"));
  $scope.psyinfo.adolescence = smarthealth.NullFilter(window.localStorage.getItem("adolescence"));
  $scope.psyinfo.academics = smarthealth.NullFilter(window.localStorage.getItem("academics"));
  $scope.psyinfo.otherfindings = smarthealth.NullFilter(window.localStorage.getItem("otherpsyfindings"));
  $scope.psyinfo.personality = smarthealth.NullFilter(window.localStorage.getItem("personalitybeforeillness"));
  $scope.psyinfo.social = smarthealth.NullFilter(window.localStorage.getItem("socialcircumstances"));
  });

  $scope.next = function(){
  //Next button clicked
  $scope.savepsyinfo();
  smarthealth.handleNext($scope.items,position);
  };

  $scope.back = function(){
  //Back button clicked
  $scope.savepsyinfo();
  smarthealth.handlePrevious($scope.items,position);
  };
  $scope.menu = function(){
  $scope.savepsyinfo();
  //Options button clicked
  $ionicActionSheet.show({
     buttons: [
       { text: 'Add consultation sheets' },
       { text: 'Remove consultation sheets' },
       { text: 'Save and exit' },
       { text: 'Close consultation' },
       { text: 'Clear consultation fields' }
     ],
     titleText: 'Options',
     cancelText: 'Cancel',
     cancel: function() {
          // add cancel code..
        },
     buttonClicked: function(index) {

       if(index==0){
       //Add consultation sheets
       $state.go('app.newconsultation');
       }

       if(index==1){
       //Remove consultation sheets
       $state.go('app.removeconsultations');
       }

       if(index==2){
       //Save and exit
       $state.go('saveconsultation');
       }

if(index==3){
//Close consultation
$scope.patients = [];
patients = [
{title:'Patient Biodata',subtitle:'Basic information',sheet:'patientbiodata',image:'img/edit.png'},
{title:'Patient Summary',subtitle:'Brief history',sheet:'patientsummary',image:'img/recordok.png'},
{title:'New Consultation',subtitle:'Create patient database entry',sheet:'newconsultation',image:'img/icpages.png'},
{title:'Past Consultations',subtitle:'Created by doctors',sheet:'pastconsultations',image:'img/icmenusave.png'},
{title:'Create Appointment',subtitle:'Patient agenda manager',sheet:'appointments',image:'img/calendar.png'},
{title:'Medical Tools',subtitle:'Useful calculators',sheet:'toolkit',image:'img/icphotos.png'},
{title:'Close patient file',subtitle:'Returns back to dashboard',sheet:'closepatientfile',image:'img/sync.png'}];

//Clear off sidemenu items
for(var i = 0; i < $scope.items.length ; i++){
$scope.items.splice(i,$scope.items.length);
}
angular.forEach(patients, function(item){
$scope.items.push(item);
});
$state.go('app.newconsultation');
}
if(index==4){
$state.go('clearsuccessful');
}
       return true;
     }
   });
  };



$scope.savepsyinfo = function(){
  window.localStorage.setItem("childhood",smarthealth.NullFilter($scope.psyinfo.childhood));
  window.localStorage.setItem("adolescence",smarthealth.NullFilter($scope.psyinfo.adolescence));
  window.localStorage.setItem("academics",smarthealth.NullFilter($scope.psyinfo.academics));
  window.localStorage.setItem("otherpsyfindings",smarthealth.NullFilter($scope.psyinfo.otherfindings));
  window.localStorage.setItem("personalitybeforeillness",smarthealth.NullFilter($scope.psyinfo.personality));
  window.localStorage.setItem("socialcircumstances",smarthealth.NullFilter($scope.psyinfo.social));
};


})//END psyinfocontroller

app.controller('psyexamcontroller',function($scope, $ionicModal, $timeout, $state,$ionicPopup,ionicDatePicker,$ionicActionSheet,smarthealth){
  var position = 0;
  var sheet_item;
  $scope.psyexam={};
    $scope.items = [];

  $scope.$on('$ionicView.enter', function() {
      $scope.items = smarthealth.get_consultationnavigator();
  //LOAD PSYEXAM
  //Identify position of sheet within items array
  for(var i = 0;i<$scope.items.length;i++){if($scope.items[i].title==='Psychiatric exam'){position = i;}}
  $scope.psyexam.appearance = smarthealth.NullFilter(window.localStorage.getItem("appearance"));
  $scope.psyexam.behaviour = smarthealth.NullFilter(window.localStorage.getItem("behaviour"));
  $scope.psyexam.speech = smarthealth.NullFilter(window.localStorage.getItem("speech"));
  $scope.psyexam.thoughtcontent = smarthealth.NullFilter(window.localStorage.getItem("thoughtcontent"));
  $scope.psyexam.mood = smarthealth.NullFilter(window.localStorage.getItem("mood"));
  $scope.psyexam.delusiontext = smarthealth.NullFilter(window.localStorage.getItem("delusiontext"));
  $scope.psyexam.hallucinationtext = smarthealth.NullFilter(window.localStorage.getItem("hallucinationtext"));
  $scope.psyexam.illusiontext = smarthealth.NullFilter(window.localStorage.getItem("illusiontext"));
  $scope.psyexam.thoughtinterference = smarthealth.NullFilter(window.localStorage.getItem("thoughtinterference"));
  $scope.psyexam.cognitivefunctions = smarthealth.NullFilter(window.localStorage.getItem("cognitive"));
  $scope.psyexam.insights = smarthealth.NullFilter(window.localStorage.getItem("insights"));
  $scope.psyexam.judgements = smarthealth.NullFilter(window.localStorage.getItem("judgement"));
  $scope.psyexam.delusioncheck = smarthealth.NullFilter(window.localStorage.getItem("delusionstate"));
  $scope.psyexam.hallucinationcheck = smarthealth.NullFilter(window.localStorage.getItem("hallucinationstate"));
  $scope.psyexam.illusioncheck = smarthealth.NullFilter(window.localStorage.getItem("illusionstate"));
  });

  $scope.next = function(){
  //Next button clicked
  $scope.savepsyexam();
  smarthealth.handleNext($scope.items,position);
  };

  $scope.back = function(){
  //Back button clicked
  $scope.savepsyexam();
  smarthealth.handlePrevious($scope.items,position);
  };
  $scope.menu = function(){
  //Options button clicked
  $scope.savepsyexam();
  $ionicActionSheet.show({
     buttons: [
       { text: 'Add consultation sheets' },
       { text: 'Remove consultation sheets' },
       { text: 'Save and exit' },
       { text: 'Close consultation' },
       { text: 'Clear consultation fields' }
     ],
     titleText: 'Options',
     cancelText: 'Cancel',
     cancel: function() {
          // add cancel code..
        },
     buttonClicked: function(index) {

       if(index==0){
       //Add consultation sheets
       $state.go('app.newconsultation');
       }

       if(index==1){
       //Remove consultation sheets
       $state.go('app.removeconsultations');
       }

       if(index==2){
       //Save and exit
       $state.go('saveconsultation');
       }

if(index==3){
//Close consultation
$scope.patients = [];
patients = [
{title:'Patient Biodata',subtitle:'Basic information',sheet:'patientbiodata',image:'img/edit.png'},
{title:'Patient Summary',subtitle:'Brief history',sheet:'patientsummary',image:'img/recordok.png'},
{title:'New Consultation',subtitle:'Create patient database entry',sheet:'newconsultation',image:'img/icpages.png'},
{title:'Past Consultations',subtitle:'Created by doctors',sheet:'pastconsultations',image:'img/icmenusave.png'},
{title:'Create Appointment',subtitle:'Patient agenda manager',sheet:'appointments',image:'img/calendar.png'},
{title:'Medical Tools',subtitle:'Useful calculators',sheet:'toolkit',image:'img/icphotos.png'},
{title:'Close patient file',subtitle:'Returns back to dashboard',sheet:'closepatientfile',image:'img/sync.png'}];

//Clear off sidemenu items
for(var i = 0; i < $scope.items.length ; i++){
$scope.items.splice(i,$scope.items.length);
}
angular.forEach(patients, function(item){
$scope.items.push(item);
});
$state.go('app.newconsultation');
}

if(index==4){
$state.go('clearsuccessful');
}
       return true;
     }
   });
  };


$scope.savepsyexam = function(){
  window.localStorage.setItem("appearance",smarthealth.NullFilter($scope.psyexam.appearance));
  window.localStorage.setItem("behaviour",smarthealth.NullFilter($scope.psyexam.behaviour));
  window.localStorage.setItem("speech",smarthealth.NullFilter($scope.psyexam.speech));
  window.localStorage.setItem("thoughtcontent",smarthealth.NullFilter($scope.psyexam.thoughtcontent));
  window.localStorage.setItem("mood",smarthealth.NullFilter($scope.psyexam.mood));
  window.localStorage.setItem("delusiontext",smarthealth.NullFilter($scope.psyexam.delusiontext));
  window.localStorage.setItem("hallucinationtext",smarthealth.NullFilter($scope.psyexam.hallucinationtext));
  window.localStorage.setItem("illusiontext",smarthealth.NullFilter($scope.psyexam.illusiontext));
  window.localStorage.setItem("thoughtinterference",smarthealth.NullFilter($scope.psyexam.thoughtinterference));
  window.localStorage.setItem("cognitive",smarthealth.NullFilter($scope.psyexam.cognitivefunctions));
  window.localStorage.setItem("insights",smarthealth.NullFilter($scope.psyexam.insights));
  window.localStorage.setItem("judgement",smarthealth.NullFilter($scope.psyexam.judgements));
  window.localStorage.setItem("delusionstate",$scope.psyexam.delusioncheck);
  window.localStorage.setItem("hallucinationstate",$scope.psyexam.hallucinationcheck);
  window.localStorage.setItem("illusionstate",$scope.psyexam.illusioncheck);

};

})//END psyexamcontroller

app.controller('entonecontroller',function($scope, $ionicModal, $timeout, $state,$ionicPopup,ionicDatePicker,$ionicActionSheet,smarthealth){
  var position = 0;
  var sheet_item;
  $scope.entone = {};
    $scope.items = [];

  $scope.$on('$ionicView.enter', function() {
      $scope.items = smarthealth.get_consultationnavigator();
  //LOAD ENTONE
  //Identify position of sheet within items array
  for(var i = 0;i<$scope.items.length;i++){if($scope.items[i].title==='Ear Nose Throat'){position = i;}}
  $scope.entone.preauricular = smarthealth.NullFilter(window.localStorage.getItem("preauricular"));
  $scope.entone.pinna = smarthealth.NullFilter(window.localStorage.getItem("pinna"));
  $scope.entone.postauricular = smarthealth.NullFilter(window.localStorage.getItem("postauricular"));
  $scope.entone.externalear = smarthealth.NullFilter(window.localStorage.getItem("externalearcanal"));
  $scope.entone.tympanicmembrane = smarthealth.NullFilter(window.localStorage.getItem("tympanicmembrane"));
  $scope.entone.noseexternalexam = smarthealth.NullFilter(window.localStorage.getItem("noseexternalexamination"));
  $scope.entone.nasalairway = smarthealth.NullFilter(window.localStorage.getItem("nasalairway"));
  $scope.entone.antrhinoscopy = smarthealth.NullFilter(window.localStorage.getItem("anteriorrhinoscopy"));
  $scope.entone.postrhinoscopy = smarthealth.NullFilter(window.localStorage.getItem("posteriorrhinoscopy"));
  $scope.entone.orodental = smarthealth.NullFilter(window.localStorage.getItem("orodental"));
  $scope.entone.oralcavity = smarthealth.NullFilter(window.localStorage.getItem("oralcavity"));
  $scope.entone.tonsilspillars = smarthealth.NullFilter(window.localStorage.getItem("tonsilspillars"));
  $scope.entone.postpharyngealwall = smarthealth.NullFilter(window.localStorage.getItem("posteriorpharynx"));
  });


  $scope.next = function(){
  //Next button clicked
  $scope.saveentone();
  smarthealth.handleNext($scope.items,position);
  };

  $scope.back = function(){
  //Back button clicked
  $scope.saveentone();
  smarthealth.handlePrevious($scope.items,position);
  };
  $scope.menu = function(){
  //Options button clicked
  $scope.saveentone();
  $ionicActionSheet.show({
     buttons: [
       { text: 'Add consultation sheets' },
       { text: 'Remove consultation sheets' },
       { text: 'Save and exit' },
       { text: 'Close consultation' },
       { text: 'Clear consultation fields' }
     ],
     titleText: 'Options',
     cancelText: 'Cancel',
     cancel: function() {
          // add cancel code..
        },
     buttonClicked: function(index) {

       if(index==0){
       //Add consultation sheets
       $state.go('app.newconsultation');
       }

       if(index==1){
       //Remove consultation sheets
       $state.go('app.removeconsultations');
       }

       if(index==2){
       //Save and exit
       $state.go('saveconsultation');
       }

if(index==3){
//Close consultation
$scope.patients = [];
patients = [
{title:'Patient Biodata',subtitle:'Basic information',sheet:'patientbiodata',image:'img/edit.png'},
{title:'Patient Summary',subtitle:'Brief history',sheet:'patientsummary',image:'img/recordok.png'},
{title:'New Consultation',subtitle:'Create patient database entry',sheet:'newconsultation',image:'img/icpages.png'},
{title:'Past Consultations',subtitle:'Created by doctors',sheet:'pastconsultations',image:'img/icmenusave.png'},
{title:'Create Appointment',subtitle:'Patient agenda manager',sheet:'appointments',image:'img/calendar.png'},
{title:'Medical Tools',subtitle:'Useful calculators',sheet:'toolkit',image:'img/icphotos.png'},
{title:'Close patient file',subtitle:'Returns back to dashboard',sheet:'closepatientfile',image:'img/sync.png'}];

//Clear off sidemenu items
for(var i = 0; i < $scope.items.length ; i++){
$scope.items.splice(i,$scope.items.length);
}
angular.forEach(patients, function(item){
$scope.items.push(item);
});
$state.go('app.newconsultation');
}
if(index==4){
$state.go('clearsuccessful');
}
       return true;
     }
   });
  };



$scope.saveentone = function(){
  window.localStorage.setItem("preauricular",smarthealth.NullFilter($scope.entone.preauricular));
  window.localStorage.setItem("pinna",smarthealth.NullFilter($scope.entone.pinna));
  window.localStorage.setItem("postauricular",smarthealth.NullFilter($scope.entone.postauricular));
  window.localStorage.setItem("externalearcanal",smarthealth.NullFilter($scope.entone.externalear));
  window.localStorage.setItem("tympanicmembrane",smarthealth.NullFilter($scope.entone.tympanicmembrane));
  window.localStorage.setItem("noseexternalexamination",smarthealth.NullFilter($scope.entone.noseexternalexam));
  window.localStorage.setItem("nasalairway",smarthealth.NullFilter($scope.entone.nasalairway));
  window.localStorage.setItem("anteriorrhinoscopy",smarthealth.NullFilter($scope.entone.antrhinoscopy));
  window.localStorage.setItem("posteriorrhinoscopy",smarthealth.NullFilter($scope.entone.postrhinoscopy));
  window.localStorage.setItem("orodental",smarthealth.NullFilter($scope.entone.orodental));
  window.localStorage.setItem("oralcavity",smarthealth.NullFilter($scope.entone.oralcavity));
  window.localStorage.setItem("tonsilspillars",smarthealth.NullFilter($scope.entone.tonsilspillars));
  window.localStorage.setItem("posteriorpharynx",smarthealth.NullFilter($scope.entone.postpharyngealwall));
};

})//END entonecontroller

app.controller('enttwocontroller',function($scope, $ionicModal, $timeout, $state,$ionicPopup,ionicDatePicker,$ionicActionSheet,smarthealth){
  var position = 0;
  var sheet_item;
  $scope.enttwo = {};
    $scope.items = [];

  $scope.$on('$ionicView.enter', function() {
      $scope.items = smarthealth.get_consultationnavigator();
  //LOAD ENT TWO
  //Identify position of sheet within items array
  for(var i = 0;i<$scope.items.length;i++){if($scope.items[i].title==='Larynx'){position = i;}}
  $scope.enttwo.direct = smarthealth.NullFilter(window.localStorage.getItem("directlaryngoscopy"));
  $scope.enttwo.indirect = smarthealth.NullFilter(window.localStorage.getItem("indirectlaryngoscopy"));
  $scope.enttwo.otherfindings = smarthealth.NullFilter(window.localStorage.getItem("otherentfindings"));
  });


  $scope.next = function(){
  //Next button clicked
  $scope.saveenttwo();
  smarthealth.handleNext($scope.items,position);
  };

  $scope.back = function(){
  //Back button clicked
  $scope.saveenttwo();
  smarthealth.handlePrevious($scope.items,position);
  };
  $scope.menu = function(){
  //Options button clicked
  $scope.saveenttwo();
  $ionicActionSheet.show({
     buttons: [
       { text: 'Add consultation sheets' },
       { text: 'Remove consultation sheets' },
       { text: 'Save and exit' },
       { text: 'Close consultation' },
       { text: 'Clear consultation fields' }
     ],
     titleText: 'Options',
     cancelText: 'Cancel',
     cancel: function() {
          // add cancel code..
        },
     buttonClicked: function(index) {

       if(index==0){
       //Add consultation sheets
       $state.go('app.newconsultation');
       }

       if(index==1){
       //Remove consultation sheets
       $state.go('app.removeconsultations');
       }

       if(index==2){
       //Save and exit
       $state.go('saveconsultation');
       }

if(index==3){
//Close consultation
$scope.patients = [];
patients = [
{title:'Patient Biodata',subtitle:'Basic information',sheet:'patientbiodata',image:'img/edit.png'},
{title:'Patient Summary',subtitle:'Brief history',sheet:'patientsummary',image:'img/recordok.png'},
{title:'New Consultation',subtitle:'Create patient database entry',sheet:'newconsultation',image:'img/icpages.png'},
{title:'Past Consultations',subtitle:'Created by doctors',sheet:'pastconsultations',image:'img/icmenusave.png'},
{title:'Create Appointment',subtitle:'Patient agenda manager',sheet:'appointments',image:'img/calendar.png'},
{title:'Medical Tools',subtitle:'Useful calculators',sheet:'toolkit',image:'img/icphotos.png'},
{title:'Close patient file',subtitle:'Returns back to dashboard',sheet:'closepatientfile',image:'img/sync.png'}];

//Clear off sidemenu items
for(var i = 0; i < $scope.items.length ; i++){
$scope.items.splice(i,$scope.items.length);
}
angular.forEach(patients, function(item){
$scope.items.push(item);
});
$state.go('app.newconsultation');
}
if(index==4){
$state.go('clearsuccessful');
}
       return true;
     }
   });
  };



$scope.saveenttwo = function(){
  window.localStorage.setItem("directlaryngoscopy",smarthealth.NullFilter($scope.enttwo.direct));
  window.localStorage.setItem("indirectlaryngoscopy",smarthealth.NullFilter($scope.enttwo.indirect));
  window.localStorage.setItem("otherentfindings",smarthealth.NullFilter($scope.enttwo.otherfindings));
};

})//END enttwocontroller

app.controller('opthalexamcontroller',function($scope, $ionicModal, $timeout, $state,$ionicPopup,ionicDatePicker,$ionicActionSheet,smarthealth){
  var position = 0;
  var sheet_item;
  $scope.opthalexam = {};
    $scope.items = [];

  $scope.$on('$ionicView.enter', function() {
      $scope.items = smarthealth.get_consultationnavigator();
  //LOAD OPTHALEXAM
  //Identify position of sheet within items array
  for(var i = 0;i<$scope.items.length;i++){if($scope.items[i].title==='Opthalmology exam'){position = i;}}
  $scope.opthalexam.visualacuity = smarthealth.NullFilter(window.localStorage.getItem("visualacuity"));
  $scope.opthalexam.headposture = smarthealth.NullFilter(window.localStorage.getItem("headposture"));
  $scope.opthalexam.eyebrows = smarthealth.NullFilter(window.localStorage.getItem("eyebrowslids"));
  $scope.opthalexam.lacrimal = smarthealth.NullFilter(window.localStorage.getItem("lacrimal"));
  $scope.opthalexam.conjunctiva = smarthealth.NullFilter(window.localStorage.getItem("conjunctiva"));
  $scope.opthalexam.sclera = smarthealth.NullFilter(window.localStorage.getItem("sclera"));
  $scope.opthalexam.cornea = smarthealth.NullFilter(window.localStorage.getItem("cornea"));
  $scope.opthalexam.anteriorchamber = smarthealth.NullFilter(window.localStorage.getItem("anteriorchamber"));
  $scope.opthalexam.lens = smarthealth.NullFilter(window.localStorage.getItem("lens"));
  $scope.opthalexam.fundus = smarthealth.NullFilter(window.localStorage.getItem("fundus"));
  $scope.opthalexam.otherfindings = smarthealth.NullFilter(window.localStorage.getItem("otheropthalfindings"));
  });


  $scope.next = function(){
  //Next button clicked
  $scope.saveopthalexam();
  smarthealth.handleNext($scope.items,position);
  };

  $scope.back = function(){
  //Back button clicked
  $scope.saveopthalexam();
  smarthealth.handlePrevious($scope.items,position);
  };
  $scope.menu = function(){
  //Options button clicked
  $scope.saveopthalexam();
  $ionicActionSheet.show({
     buttons: [
       { text: 'Add consultation sheets' },
       { text: 'Remove consultation sheets' },
       { text: 'Save and exit' },
       { text: 'Close consultation' },
       { text: 'Clear consultation fields' }
     ],
     titleText: 'Options',
     cancelText: 'Cancel',
     cancel: function() {
          // add cancel code..
        },
     buttonClicked: function(index) {

       if(index==0){
       //Add consultation sheets
       $state.go('app.newconsultation');
       }

       if(index==1){
       //Remove consultation sheets
       $state.go('app.removeconsultations');
       }

       if(index==2){
       //Save and exit
       $state.go('saveconsultation');
       }

if(index==3){
//Close consultation
$scope.patients = [];
patients = [
{title:'Patient Biodata',subtitle:'Basic information',sheet:'patientbiodata',image:'img/edit.png'},
{title:'Patient Summary',subtitle:'Brief history',sheet:'patientsummary',image:'img/recordok.png'},
{title:'New Consultation',subtitle:'Create patient database entry',sheet:'newconsultation',image:'img/icpages.png'},
{title:'Past Consultations',subtitle:'Created by doctors',sheet:'pastconsultations',image:'img/icmenusave.png'},
{title:'Create Appointment',subtitle:'Patient agenda manager',sheet:'appointments',image:'img/calendar.png'},
{title:'Medical Tools',subtitle:'Useful calculators',sheet:'toolkit',image:'img/icphotos.png'},
{title:'Close patient file',subtitle:'Returns back to dashboard',sheet:'closepatientfile',image:'img/sync.png'}];

//Clear off sidemenu items
for(var i = 0; i < $scope.items.length ; i++){
$scope.items.splice(i,$scope.items.length);
}
angular.forEach(patients, function(item){
$scope.items.push(item);
});
$state.go('app.newconsultation');
}
if(index==4){
$state.go('clearsuccessful');
}
       return true;
     }
   });
  };



$scope.saveopthalexam = function(){
  window.localStorage.setItem("visualacuity",smarthealth.NullFilter($scope.opthalexam.visualacuity));
  window.localStorage.setItem("headposture",smarthealth.NullFilter($scope.opthalexam.headposture));
  window.localStorage.setItem("eyebrowslids",smarthealth.NullFilter($scope.opthalexam.eyebrows));
  window.localStorage.setItem("lacrimal",smarthealth.NullFilter($scope.opthalexam.lacrimal));
  window.localStorage.setItem("conjunctiva",smarthealth.NullFilter($scope.opthalexam.conjunctiva));
  window.localStorage.setItem("sclera",smarthealth.NullFilter($scope.opthalexam.sclera));
  window.localStorage.setItem("cornea",smarthealth.NullFilter($scope.opthalexam.cornea));
  window.localStorage.setItem("anteriorchamber",smarthealth.NullFilter($scope.opthalexam.anteriorchamber));
  window.localStorage.setItem("lens",smarthealth.NullFilter($scope.opthalexam.lens));
  window.localStorage.setItem("fundus",smarthealth.NullFilter($scope.opthalexam.fundus));
  window.localStorage.setItem("otheropthalfindings",smarthealth.NullFilter($scope.opthalexam.otherfindings));
};

})//END opthalexamcontroller

app.controller('orthoexamcontroller',function($scope, $ionicModal, $timeout, $state,$ionicPopup,ionicDatePicker,$ionicActionSheet,smarthealth){
  var position = 0;
  var sheet_item;
  $scope.orthoexam = {};
    $scope.items = [];

  $scope.$on('$ionicView.enter', function() {
      $scope.items = smarthealth.get_consultationnavigator();
  //LOAD ORTHOEXAM
  //Identify position of sheet within items array
  for(var i = 0;i<$scope.items.length;i++){if($scope.items[i].title==='Orthopaedics exam'){position = i;}}
  $scope.orthoexam.inspection = smarthealth.NullFilter(window.localStorage.getItem("orthoinspection"));
  $scope.orthoexam.palpation = smarthealth.NullFilter(window.localStorage.getItem("orthopalpation"));
  $scope.orthoexam.movements = smarthealth.NullFilter(window.localStorage.getItem("orthomovements"));
  $scope.orthoexam.measurement = smarthealth.NullFilter(window.localStorage.getItem("orthomeasurements"));
  $scope.orthoexam.otherfindings = smarthealth.NullFilter(window.localStorage.getItem("otherorthofindings"));
  });

  $scope.next = function(){
  //Next button clicked
  $scope.saveorthoexam();
  smarthealth.handleNext($scope.items,position);
  };

  $scope.back = function(){
  //Back button clicked
  $scope.saveorthoexam();
  smarthealth.handlePrevious($scope.items,position);
  };
  $scope.menu = function(){
  //Options button clicked
  $scope.saveorthoexam();
  $ionicActionSheet.show({
     buttons: [
       { text: 'Add consultation sheets' },
       { text: 'Remove consultation sheets' },
       { text: 'Save and exit' },
       { text: 'Close consultation' },
       { text: 'Clear consultation fields' }
     ],
     titleText: 'Options',
     cancelText: 'Cancel',
     cancel: function() {
          // add cancel code..
        },
     buttonClicked: function(index) {

       if(index==0){
       //Add consultation sheets
       $state.go('app.newconsultation');
       }

       if(index==1){
       //Remove consultation sheets
       $state.go('app.removeconsultations');
       }

       if(index==2){
       //Save and exit
       $state.go('saveconsultation');
       }

if(index==3){
//Close consultation
$scope.patients = [];
patients = [
{title:'Patient Biodata',subtitle:'Basic information',sheet:'patientbiodata',image:'img/edit.png'},
{title:'Patient Summary',subtitle:'Brief history',sheet:'patientsummary',image:'img/recordok.png'},
{title:'New Consultation',subtitle:'Create patient database entry',sheet:'newconsultation',image:'img/icpages.png'},
{title:'Past Consultations',subtitle:'Created by doctors',sheet:'pastconsultations',image:'img/icmenusave.png'},
{title:'Create Appointment',subtitle:'Patient agenda manager',sheet:'appointments',image:'img/calendar.png'},
{title:'Medical Tools',subtitle:'Useful calculators',sheet:'toolkit',image:'img/icphotos.png'},
{title:'Close patient file',subtitle:'Returns back to dashboard',sheet:'closepatientfile',image:'img/sync.png'}];

//Clear off sidemenu items
for(var i = 0; i < $scope.items.length ; i++){
$scope.items.splice(i,$scope.items.length);
}
angular.forEach(patients, function(item){
$scope.items.push(item);
});
$state.go('app.newconsultation');
}
if(index==4){
$state.go('clearsuccessful');
}
       return true;
     }
   });
  };


$scope.saveorthoexam = function(){
  window.localStorage.setItem("orthoinspection",smarthealth.NullFilter($scope.orthoexam.inspection));
  window.localStorage.setItem("orthopalpation",smarthealth.NullFilter($scope.orthoexam.palpation));
  window.localStorage.setItem("orthomovements",smarthealth.NullFilter($scope.orthoexam.movements));
  window.localStorage.setItem("orthomeasurements",smarthealth.NullFilter($scope.orthoexam.measurement));
  window.localStorage.setItem("otherorthofindings",smarthealth.NullFilter($scope.orthoexam.otherfindings));
};

})//END orthoexamcontroller

app.controller('notecontroller',function($scope, $ionicModal, $timeout, $state,$ionicPopup,ionicDatePicker,$ionicActionSheet,smarthealth){
  var position = 0;
  var sheet_item;
  $scope.note = {};
    $scope.items = [];

  $scope.$on('$ionicView.enter', function() {
      $scope.items = smarthealth.get_consultationnavigator();
  //LOAD NOTE
  //Identify position of sheet within items array
  for(var i = 0;i<$scope.items.length;i++){if($scope.items[i].title==='Note'){position = i;}}
  $scope.note.title = smarthealth.NullFilter(window.localStorage.getItem("notetitle"));
  $scope.note.content = smarthealth.NullFilter(window.localStorage.getItem("notecontent"));
  });


  //Last sheet is Note
  $scope.menu = function(){
  //Options button clicked
  $scope.savenote();
  $ionicActionSheet.show({
     buttons: [
       { text: 'Add consultation sheets' },
       { text: 'Remove consultation sheets' },
       { text: 'Save and exit' },
       { text: 'Close consultation' },
       { text: 'Clear consultation fields' }
     ],
     titleText: 'Options',
     cancelText: 'Cancel',
     cancel: function() {
          // add cancel code..
        },
     buttonClicked: function(index) {

       if(index==0){
       //Add consultation sheets
       $state.go('app.newconsultation');
       }

       if(index==1){
       //Remove consultation sheets
       $state.go('app.removeconsultations');
       }

       if(index==2){
       //Save and exit
       $state.go('saveconsultation');
       }

if(index==3){
//Close consultation
$scope.patients = [];
patients = [
{title:'Patient Biodata',subtitle:'Basic information',sheet:'patientbiodata',image:'img/edit.png'},
{title:'Patient Summary',subtitle:'Brief history',sheet:'patientsummary',image:'img/recordok.png'},
{title:'New Consultation',subtitle:'Create patient database entry',sheet:'newconsultation',image:'img/icpages.png'},
{title:'Past Consultations',subtitle:'Created by doctors',sheet:'pastconsultations',image:'img/icmenusave.png'},
{title:'Create Appointment',subtitle:'Patient agenda manager',sheet:'appointments',image:'img/calendar.png'},
{title:'Medical Tools',subtitle:'Useful calculators',sheet:'toolkit',image:'img/icphotos.png'},
{title:'Close patient file',subtitle:'Returns back to dashboard',sheet:'closepatientfile',image:'img/sync.png'}];

//Clear off sidemenu items
for(var i = 0; i < $scope.items.length ; i++){
$scope.items.splice(i,$scope.items.length);
}
angular.forEach(patients, function(item){
$scope.items.push(item);
});
$state.go('app.newconsultation');
}
if(index==4){
$state.go('clearsuccessful');
}
       return true;
     }
   });
  };
  $scope.back = function(){
  //Back button clicked
  $scope.savenote();
  smarthealth.handlePrevious($scope.items,position);
  };



$scope.savenote = function(){
  window.localStorage.setItem("notetitle",smarthealth.NullFilter($scope.note.title));
  window.localStorage.setItem("notecontent",smarthealth.NullFilter($scope.note.content));
};

})//END notecontroller

app.controller('removeconsultationscontroller',function($scope, $ionicModal, $timeout, $state,$ionicPopup,ionicDatePicker,smarthealth){
  var alertPopup = $ionicPopup.alert({
     title: 'Consultation Sheets',
     template: 'Click on a consultation to remove'
   });

   alertPopup.then(function(res) {
   });

  $scope.removeSheets = function(){
  $scope.consultationitems = [];

   var sequence = window.localStorage.getItem("memalloc");
   var splitItems = sequence.split(":");
   var SET = "1";
   var CLEAR = "0";
   $scope.consultations = [];
      $scope.items = [];
      $scope.items = smarthealth.get_consultationnavigator();
   consultations = [
     { title: 'Obstetrics',subtitle:'Obstetric sheet',sheet:'obsinfo',image:'img/mydetails.png' },
     { title: 'Gynaecology',subtitle:'Gynaecology sheet',sheet:'gynaeinfo' ,image:'img/mydetails.png'},
     { title: 'Paediatrics',subtitle:'Paediatric sheet',sheet:'paedsinfo',image:'img/mydetails.png' },
     { title: 'Psychiatry',subtitle:'Psychiatric sheet',sheet:'psyinfo',image:'img/mydetails.png' },
     { title: 'Complaints',subtitle:'Basic sheet',sheet:'complaints',image:'img/mydetails.png' },
     { title: 'Other complaints',subtitle:'Basic sheet',sheet:'othercomplaints',image:'img/mydetails.png' },
     { title: 'Paediatric Vitals',subtitle:'Paediatric sheet',sheet:'paedsgeneralexam' ,image:'img/mydetails.png'},
     { title: 'Vitals',subtitle:'Basic sheet',sheet:'vitals',image:'img/mydetails.png' },
     { title: 'Ear Nose Throat',subtitle:'ENT sheet',sheet:'entone' ,image:'img/mydetails.png'},
     { title: 'Larynx',subtitle:'ENT sheet',sheet:'enttwo' ,image:'img/mydetails.png'},
     { title: 'Gynaecology exam',subtitle:'Gynaecology sheet',sheet:'gynaeexam' ,image:'img/mydetails.png'},
     { title: 'Obstetrics exam',subtitle:'Obstetric sheet',sheet:'obsexam',image:'img/mydetails.png' },
     { title: 'Opthalmology exam',subtitle:'Opthalmology sheet',sheet:'opthalexam',image:'img/mydetails.png' },
     { title: 'Orthopaedics exam',subtitle:'Orthopaedics sheet',sheet:'orthoexam',image:'img/mydetails.png' },
     { title: 'Psychiatric exam',subtitle:'Psychiatric sheet',sheet:'psyexam',image:'img/mydetails.png' },
     { title: 'RS CVS GIT exam',subtitle:'Basic sheet',sheet:'mdpartone',image:'img/mydetails.png' },
     { title: 'CNS exam',subtitle:'Basic sheet',sheet:'mdparttwo' ,image:'img/mydetails.png'},
     { title: 'Investigations',subtitle:'Basic sheet',sheet:'investigations',image:'img/mydetails.png' },
     { title: 'Note',subtitle:'Details sheet',sheet:'note',image:'img/mydetails.png' }
   ];

   if(splitItems[0]===CLEAR){
     //Obstetric info
    for (var i = consultations.length - 1; i >= 0; i--) {
    if (consultations[i].title==='Obstetrics' || consultations[i].title==='Obstetrics exam') {
        consultations.splice(i, 1);
    }
   }//end for loop

   }//clear end

   if(splitItems[1]===CLEAR){
     //Gynaecology info
    for (var i = consultations.length - 1; i >= 0; i--) {
    if (consultations[i].title==='Gynaecology' || consultations[i].title==='Gynaecology exam') {
        consultations.splice(i, 1);
    }
   }//end for loop
   }
   if(splitItems[2]===CLEAR){
     //Paediatric info
    for (var i = consultations.length - 1; i >= 0; i--) {
    if (consultations[i].title==='Paediatrics' || consultations[i].title==='Paediatric Vitals') {
        consultations.splice(i, 1);
    }
   }//end for loop
   }

   if(splitItems[3]===CLEAR){
     //Psychiatry info
       for (var i = consultations.length - 1; i >= 0; i--) {
    if (consultations[i].title==='Psychiatry' || consultations[i].title==='Psychiatric exam') {
        consultations.splice(i, 1);
    }
   }//end for loop
   }

   if(splitItems[4]===CLEAR){
     //Complaints
     var complaints = [{ title: 'Complaints',sheet:'complaints',subtitle:'Basic sheet',image:'img/mydetails.png' }];
     $scope.consultationitems.push(complaints);
   }

   if(splitItems[5]===CLEAR){
     //Other complaints
     var othercomplaints = [{ title: 'Other complaints',subtitle:'Basic sheet',sheet:'othercomplaints',image:'img/mydetails.png' }];
     $scope.consultationitems.push(othercomplaints);
   }

   if(splitItems[6]===CLEAR){
     //Paediatric vitals
     //Do nothing handled elsewhere
   }

   if(splitItems[7]===CLEAR){
     //Vitals
    for (var i = consultations.length - 1; i >= 0; i--) {
    if (consultations[i].title==='Vitals') {
    consultations.splice(i, 1);
    }
   }//end for loop
   }

   if(splitItems[8]===CLEAR){
     //ENTONE
    for (var i = consultations.length - 1; i >= 0; i--) {
    if (consultations[i].title==='Ear Nose Throat' || consultations[i].title==='Larynx') {
        consultations.splice(i, 1);
    }
   }//end for loop
   }

   if(splitItems[9]===CLEAR){
     //ENTTWO
     //Do nothing handled elsewhere
   }

   if(splitItems[10]===CLEAR){
   //Gynaecology exam
   //Do nothing handled elsewhere
   }

   if(splitItems[11]===CLEAR){
   //Obstetric exam
   //Do nothing handled elsewhere

   }

   if(splitItems[12]===CLEAR){
   //Opthalmology exam
   for (var i = consultations.length - 1; i >= 0; i--) {
   if (consultations[i].title==='Opthalmology exam') {
   consultations.splice(i, 1);
   }
   }//end for loop
   }

   if(splitItems[13]===CLEAR){
   //Orthopaedics exam
   for (var i = consultations.length - 1; i >= 0; i--) {
   if (consultations[i].title==='Orthopaedics exam') {
   consultations.splice(i, 1);
   }
   }//end for loop
   }

   if(splitItems[14]===CLEAR){
   //Psychiatric exam
   //Do nothing handled elsewhere
   }

   if(splitItems[15]===CLEAR){
   //CVS RS GIT exam

   }

   if(splitItems[16]===CLEAR){
   //CNS exam

   }

   if(splitItems[17]===CLEAR){
   //Investigations exam

   }

   if(splitItems[18]===CLEAR){
   //Note
   for (var i = consultations.length - 1; i >= 0; i--) {
   if (consultations[i].title==='Note') {
   consultations.splice(i, 1);
   }
   }//end for loop
   }

   //Clear off sidemenu items
  for(var i = 0; i < $scope.items.length ; i++){
  $scope.items.splice(i,$scope.items.length);
  }
  angular.forEach(consultations, function(item){
  $scope.items.push(item);
  });

 };//End removeSheets
 //Basic consultation
 $scope.standardconsultation = function(){
 //Nothing to do
 $scope.removeSheets();
 $state.go('complaints');
 };

 //Obstetrics consultation
 $scope.obstetrics = function(){
 var sequence = window.localStorage.getItem("memalloc");
 var splitItems = sequence.split(":");
 var SET = "1";
 var CLEAR = "0";
 splitItems[0] = CLEAR;
 splitItems[11] = CLEAR;
 var sequencevalue = splitItems[0]+":"+splitItems[1]+":"+splitItems[2]+":"+splitItems[3]+":"+splitItems[4]+":"+splitItems[5]+":"+splitItems[6]+":"+splitItems[7]+":"+splitItems[8]+":"+splitItems[9]+":"+splitItems[10]+":"+splitItems[11]+":"+splitItems[12]+":"+splitItems[13]+":"+splitItems[14]+":"+splitItems[15]+":"+splitItems[16]+":"+splitItems[17]+":"+splitItems[18]+":"+splitItems[19]+":"+splitItems[20]+":"+splitItems[21]+":"+splitItems[22]+":"+splitItems[23]+":"+splitItems[24]+":"+splitItems[25];
 window.localStorage.setItem("memalloc",sequencevalue);
 $scope.removeSheets();
 $state.go('complaints');
 };

 //Gynaecology consultation
 $scope.gynaecology = function(){
 var sequence = window.localStorage.getItem("memalloc");
 var splitItems = sequence.split(":");
 var SET = "1";
 var CLEAR = "0";
 splitItems[1] = CLEAR;
 splitItems[10] = CLEAR;
 var sequencevalue = splitItems[0]+":"+splitItems[1]+":"+splitItems[2]+":"+splitItems[3]+":"+splitItems[4]+":"+splitItems[5]+":"+splitItems[6]+":"+splitItems[7]+":"+splitItems[8]+":"+splitItems[9]+":"+splitItems[10]+":"+splitItems[11]+":"+splitItems[12]+":"+splitItems[13]+":"+splitItems[14]+":"+splitItems[15]+":"+splitItems[16]+":"+splitItems[17]+":"+splitItems[18]+":"+splitItems[19]+":"+splitItems[20]+":"+splitItems[21]+":"+splitItems[22]+":"+splitItems[23]+":"+splitItems[24]+":"+splitItems[25];
 window.localStorage.setItem("memalloc",sequencevalue);
 $scope.removeSheets();
 $state.go('complaints');
 };

 //Paediatrics consultation
 $scope.paediatrics = function(){
 var sequence = window.localStorage.getItem("memalloc");
 var splitItems = sequence.split(":");
 var SET = "1";
 var CLEAR = "0";
 splitItems[2] = CLEAR;
 splitItems[6] = CLEAR;
 splitItems[7] = SET;
 var sequencevalue = splitItems[0]+":"+splitItems[1]+":"+splitItems[2]+":"+splitItems[3]+":"+splitItems[4]+":"+splitItems[5]+":"+splitItems[6]+":"+splitItems[7]+":"+splitItems[8]+":"+splitItems[9]+":"+splitItems[10]+":"+splitItems[11]+":"+splitItems[12]+":"+splitItems[13]+":"+splitItems[14]+":"+splitItems[15]+":"+splitItems[16]+":"+splitItems[17]+":"+splitItems[18]+":"+splitItems[19]+":"+splitItems[20]+":"+splitItems[21]+":"+splitItems[22]+":"+splitItems[23]+":"+splitItems[24]+":"+splitItems[25];
 window.localStorage.setItem("memalloc",sequencevalue);
 $scope.removeSheets();
 $state.go('complaints');
 };

 //Psychiatry consultation
 $scope.psychiatry = function(){
 var sequence = window.localStorage.getItem("memalloc");
 var splitItems = sequence.split(":");
 var SET = "1";
 var CLEAR = "0";
 splitItems[3] = CLEAR;
 splitItems[14] = CLEAR;
 var sequencevalue = splitItems[0]+":"+splitItems[1]+":"+splitItems[2]+":"+splitItems[3]+":"+splitItems[4]+":"+splitItems[5]+":"+splitItems[6]+":"+splitItems[7]+":"+splitItems[8]+":"+splitItems[9]+":"+splitItems[10]+":"+splitItems[11]+":"+splitItems[12]+":"+splitItems[13]+":"+splitItems[14]+":"+splitItems[15]+":"+splitItems[16]+":"+splitItems[17]+":"+splitItems[18]+":"+splitItems[19]+":"+splitItems[20]+":"+splitItems[21]+":"+splitItems[22]+":"+splitItems[23]+":"+splitItems[24]+":"+splitItems[25];
 window.localStorage.setItem("memalloc",sequencevalue);
 $scope.removeSheets();
 $state.go('complaints');
 };

 //Ear Nose Throat consultation
 $scope.ENT = function(){
 var sequence = window.localStorage.getItem("memalloc");
 var splitItems = sequence.split(":");
 var SET = "1";
 var CLEAR = "0";
 splitItems[8] = CLEAR;
 splitItems[9] = CLEAR;
 var sequencevalue = splitItems[0]+":"+splitItems[1]+":"+splitItems[2]+":"+splitItems[3]+":"+splitItems[4]+":"+splitItems[5]+":"+splitItems[6]+":"+splitItems[7]+":"+splitItems[8]+":"+splitItems[9]+":"+splitItems[10]+":"+splitItems[11]+":"+splitItems[12]+":"+splitItems[13]+":"+splitItems[14]+":"+splitItems[15]+":"+splitItems[16]+":"+splitItems[17]+":"+splitItems[18]+":"+splitItems[19]+":"+splitItems[20]+":"+splitItems[21]+":"+splitItems[22]+":"+splitItems[23]+":"+splitItems[24]+":"+splitItems[25];
 window.localStorage.setItem("memalloc",sequencevalue);
 $scope.removeSheets();
 $state.go('complaints');
 };

 //Opthalmology consultation
 $scope.opthalmology = function(){
 var sequence = window.localStorage.getItem("memalloc");
 var splitItems = sequence.split(":");
 var SET = "1";
 var CLEAR = "0";
 splitItems[12] = CLEAR;
 var sequencevalue = splitItems[0]+":"+splitItems[1]+":"+splitItems[2]+":"+splitItems[3]+":"+splitItems[4]+":"+splitItems[5]+":"+splitItems[6]+":"+splitItems[7]+":"+splitItems[8]+":"+splitItems[9]+":"+splitItems[10]+":"+splitItems[11]+":"+splitItems[12]+":"+splitItems[13]+":"+splitItems[14]+":"+splitItems[15]+":"+splitItems[16]+":"+splitItems[17]+":"+splitItems[18]+":"+splitItems[19]+":"+splitItems[20]+":"+splitItems[21]+":"+splitItems[22]+":"+splitItems[23]+":"+splitItems[24]+":"+splitItems[25];
 window.localStorage.setItem("memalloc",sequencevalue);
 $scope.removeSheets();
 $state.go('complaints');
 };

 //Orthopaedics consultation
 $scope.orthopaedics = function(){
 var sequence = window.localStorage.getItem("memalloc");
 var splitItems = sequence.split(":");
 var SET = "1";
 var CLEAR = "0";
 splitItems[13] = CLEAR;
 var sequencevalue = splitItems[0]+":"+splitItems[1]+":"+splitItems[2]+":"+splitItems[3]+":"+splitItems[4]+":"+splitItems[5]+":"+splitItems[6]+":"+splitItems[7]+":"+splitItems[8]+":"+splitItems[9]+":"+splitItems[10]+":"+splitItems[11]+":"+splitItems[12]+":"+splitItems[13]+":"+splitItems[14]+":"+splitItems[15]+":"+splitItems[16]+":"+splitItems[17]+":"+splitItems[18]+":"+splitItems[19]+":"+splitItems[20]+":"+splitItems[21]+":"+splitItems[22]+":"+splitItems[23]+":"+splitItems[24]+":"+splitItems[25];
 window.localStorage.setItem("memalloc",sequencevalue);
 $scope.removeSheets();
 $state.go('complaints');
 };

 //Add a note
 $scope.note = function(){
 var sequence = window.localStorage.getItem("memalloc");
 var splitItems = sequence.split(":");
 var SET = "1";
 var CLEAR = "0";
 splitItems[18] = CLEAR;
 var sequencevalue = splitItems[0]+":"+splitItems[1]+":"+splitItems[2]+":"+splitItems[3]+":"+splitItems[4]+":"+splitItems[5]+":"+splitItems[6]+":"+splitItems[7]+":"+splitItems[8]+":"+splitItems[9]+":"+splitItems[10]+":"+splitItems[11]+":"+splitItems[12]+":"+splitItems[13]+":"+splitItems[14]+":"+splitItems[15]+":"+splitItems[16]+":"+splitItems[17]+":"+splitItems[18]+":"+splitItems[19]+":"+splitItems[20]+":"+splitItems[21]+":"+splitItems[22]+":"+splitItems[23]+":"+splitItems[24]+":"+splitItems[25];
 window.localStorage.setItem("memalloc",sequencevalue);
 $scope.removeSheets();
 $state.go('complaints');
 };

})

//Handle diagnosis addons
app.controller('ICDcontroller',function($http,$scope,$ionicPopup,$state,smarthealth){

  //Azure diagnostics table configurations
  //var client = new WindowsAzure.MobileServiceClient('https://smarthealthsolutions.azure-mobile.net/', 'nrFwbzJBHoGRjhHkBQvRnOxEWwsdVu91'),
  //diagnosticsTable = client.getTable('smarthealthdiagnosis');

  //Temporary buffer for selected diagnosis
  var selected_diagnosis;
  $scope.icd = {};

  $scope.contents = [];

  //Pull ICD-10 items from custom JSON local file named "icd.js"
  $http.get('clinicalmodule/icd.js').success(function(response){
   angular.forEach(response.feed, function(child){
     $scope.contents.push(child);
   });

  });

  //Load selected item into searchbar
  $scope.retrievedItem = function(inputVal){
  //document.getElementById('searchbar').value = inputVal;
  $scope.icd.finder = inputVal;
  selected_diagnosis = inputVal;
  };

  //Doctor clicked on "Add Diagnosis" button
  //Perform diagnosis insertion into Azure diagnostics database
  $scope.addDiagnosis = function () {


var firebase_reference = new Firebase(smarthealth.DATABASE_URL_SMARTHEALTHDIAGNOSIS());
var registration_object = firebase_reference.child(window.localStorage.getItem('patientid')).push();
registration_object.set({
  commonid:window.localStorage.getItem('commonid'),
  doctorID:window.localStorage.getItem('doctorid'),
  diagnosis:selected_diagnosis,
  patientID:window.localStorage.getItem('patientid')
});
//Go back to saveconsultationcontroller after showing success message
  var alertPopup = $ionicPopup.alert({
  title: 'ICD-10 Diagnostics',
  template: 'Diagnosis successfully added. Click OK to continue'
});

alertPopup.then(function(res) {
  $state.go('saveconsultation');
});

};

})//END of ICDcontroller

//Handle medications addons
app.controller('addmedicationscontroller',function($scope, $ionicModal, $timeout, $state,$ionicPopup,ionicTimePicker,smarthealth){
 //Initialize azure server database for smarthealthsolutions medications
  //var client = new WindowsAzure.MobileServiceClient('https://smarthealthsolutions.azure-mobile.net/', 'nrFwbzJBHoGRjhHkBQvRnOxEWwsdVu91'),
  //medicationsTable = client.getTable('smarthealthprescriptions');

//--------------------------MODALITY IN DAYS/WEEKS/MONTHS/YEARS-----------------------------------//
//Reset durationslider to 0 position
$scope.durationslider = { 'volume' : '0' };
//Default to days

$scope.$watch('durationslider.volume', function() {
var durationslider_position = document.getElementById('addmedications.durationslider').value;

if(durationslider_position>0 && durationslider_position<=2){document.getElementById('addmedications.modality').innerHTML = "days";}
if(durationslider_position>2 && durationslider_position<=4){document.getElementById('addmedications.modality').innerHTML = "weeks";}
if(durationslider_position>4 && durationslider_position<=6){document.getElementById('addmedications.modality').innerHTML = "months";}
if(durationslider_position>6 && durationslider_position<=8){document.getElementById('addmedications.modality').innerHTML = "years";}
});
//--------------------------MODALITY IN DAYS/WEEKS/MONTHS/YEARS----------------------------------//

//--------------------DOSEFREQUENCY IN OD/BD/TDS/QID/5 times/day/PRN-----------------------------//
//Reset dosefreqslider to 0 position
$scope.dosefreqslider = { 'volume' : '0' };
//Default to days

$scope.$watch('dosefreqslider.volume', function() {
var dosefreqslider_position = document.getElementById('addmedications.dosefreqslider').value;

if(dosefreqslider_position>0 && dosefreqslider_position<=2){
  document.getElementById('addmedications.dosefreq').innerHTML = "OD";
  //Change button states according to drug frequency
  document.getElementById('addmedications.firstbutton').innerHTML = "Set first dose";
  document.getElementById('addmedications.secondbutton').innerHTML = "";
  document.getElementById('addmedications.thirdbutton').innerHTML = "";
  document.getElementById('addmedications.fourthbutton').innerHTML = "";
  document.getElementById('addmedications.fifthbutton').innerHTML = "";


}
if(dosefreqslider_position>2 && dosefreqslider_position<=4){
  document.getElementById('addmedications.dosefreq').innerHTML = "BD";
  //Change button states according to drug frequency
  document.getElementById('addmedications.firstbutton').innerHTML = "Set first dose";
  document.getElementById('addmedications.secondbutton').innerHTML = "Set second dose";
  document.getElementById('addmedications.thirdbutton').innerHTML = "";
  document.getElementById('addmedications.fourthbutton').innerHTML = "";
  document.getElementById('addmedications.fifthbutton').innerHTML = "";
}
if(dosefreqslider_position>4 && dosefreqslider_position<=6){
  document.getElementById('addmedications.dosefreq').innerHTML = "TDS";
  //Change button states according to drug frequency
  document.getElementById('addmedications.firstbutton').innerHTML = "Set first dose";
  document.getElementById('addmedications.secondbutton').innerHTML = "Set second dose";
  document.getElementById('addmedications.thirdbutton').innerHTML = "Set third dose";
  document.getElementById('addmedications.fourthbutton').innerHTML = "";
  document.getElementById('addmedications.fifthbutton').innerHTML = "";
}
if(dosefreqslider_position>6 && dosefreqslider_position<=8){
  document.getElementById('addmedications.dosefreq').innerHTML = "QID";
  //Change button states according to drug frequency
  document.getElementById('addmedications.firstbutton').innerHTML = "Set first dose";
  document.getElementById('addmedications.secondbutton').innerHTML = "Set second dose";
  document.getElementById('addmedications.thirdbutton').innerHTML = "Set third dose";
  document.getElementById('addmedications.fourthbutton').innerHTML = "Set fourth dose";
  document.getElementById('addmedications.fifthbutton').innerHTML = "";

}
if(dosefreqslider_position>8 && dosefreqslider_position<=10){
  document.getElementById('addmedications.dosefreq').innerHTML = "5 times/day";
  //Change button states according to drug frequency
  document.getElementById('addmedications.firstbutton').innerHTML = "Set first dose";
  document.getElementById('addmedications.secondbutton').innerHTML = "Set second dose";
  document.getElementById('addmedications.thirdbutton').innerHTML = "Set third dose";
  document.getElementById('addmedications.fourthbutton').innerHTML = "Set fourth dose";
  document.getElementById('addmedications.fifthbutton').innerHTML = "Set fifth dose";
}
if(dosefreqslider_position>10 && dosefreqslider_position<=12){
  document.getElementById('addmedications.dosefreq').innerHTML = "PRN";
  //Change button states according to drug frequency
  document.getElementById('addmedications.firstbutton').innerHTML = "";
  document.getElementById('addmedications.secondbutton').innerHTML = "";
  document.getElementById('addmedications.thirdbutton').innerHTML = "";
  document.getElementById('addmedications.fourthbutton').innerHTML = "";
  document.getElementById('addmedications.fifthbutton').innerHTML = "";
}
});
//--------------------DOSEFREQUENCY IN OD/BD/TDS/QID/5 times/day/PRN-----------------------------//

//----------------------------ROUTE OF ADMINISTRATION--------------------------------------------//
//Reset dosefreqslider to 0 position
$scope.modeslider = { 'volume' : '0' };
//Default to days

$scope.$watch('modeslider.volume', function() {
var modeslider_position = document.getElementById('addmedications.modeslider').value;

    if(modeslider_position>0 && modeslider_position<=2){document.getElementById('addmedications.mode').innerHTML = "ORAL";}
    if(modeslider_position>2 && modeslider_position<=4){document.getElementById('addmedications.mode').innerHTML = "IM";}
    if(modeslider_position>4 && modeslider_position<=6){document.getElementById('addmedications.mode').innerHTML = "IV";}
    if(modeslider_position>6 && modeslider_position<=8){document.getElementById('addmedications.mode').innerHTML = "S/C";}
    if(modeslider_position>8 && modeslider_position<=10){document.getElementById('addmedications.mode').innerHTML = "PR";}
    if(modeslider_position>10 && modeslider_position<=12){document.getElementById('addmedications.mode').innerHTML = "S/L";}
    if(modeslider_position>12 && modeslider_position<=14){document.getElementById('addmedications.mode').innerHTML = "NASAL";}
    if(modeslider_position>14 && modeslider_position<=16){document.getElementById('addmedications.mode').innerHTML = "OCULAR";}
    if(modeslider_position>16 && modeslider_position<=18){document.getElementById('addmedications.mode').innerHTML = "AURICULAR";}
    if(modeslider_position>18 && modeslider_position<=20){document.getElementById('addmedications.mode').innerHTML = "TOPICAL";}
});
//----------------------------ROUTE OF ADMINISTRATION--------------------------------------------//

//Add zeros where needed
function addZeros(input){
  var output = input;;
  if(input.length==1){
    output = "0"+input;
  }
  return output;
}

//First button clicked
$scope.firstbuttonclick = function(){
  var ipObj1 = {
    callback: function (val) {      //Mandatory

    var selectedTime = new Date(val*1000);
    document.getElementById('addmedications.firstbutton').innerHTML = addZeros(selectedTime.getUTCHours().toString())+":"+addZeros(selectedTime.getUTCMinutes().toString());
    },
    inputTime: 50400,   //Optional
    format: 12,         //Optional
    step: 15,           //Optional
    setLabel: 'Set time'    //Optional
  };

  ionicTimePicker.openTimePicker(ipObj1);
};

//Second button clicked
$scope.secondbuttonclick = function(){
    var ipObj1 = {
    callback: function (val) {      //Mandatory

    var selectedTime = new Date(val*1000);
    document.getElementById('addmedications.secondbutton').innerHTML = addZeros(selectedTime.getUTCHours()).toString()+":"+addZeros(selectedTime.getUTCMinutes().toString());
    },
    inputTime: 50400,   //Optional
    format: 12,         //Optional
    step: 15,           //Optional
    setLabel: 'Set time'    //Optional
  };

  ionicTimePicker.openTimePicker(ipObj1);
};

//Third button clicked
$scope.thirdbuttonclick = function(){
    var ipObj1 = {
    callback: function (val) {      //Mandatory

    var selectedTime = new Date(val*1000);
    document.getElementById('addmedications.thirdbutton').innerHTML = addZeros(selectedTime.getUTCHours()).toString()+":"+addZeros(selectedTime.getUTCMinutes().toString());
    },
    inputTime: 50400,   //Optional
    format: 12,         //Optional
    step: 15,           //Optional
    setLabel: 'Set time'    //Optional
  };

  ionicTimePicker.openTimePicker(ipObj1);
};

//Fourth button clicked
$scope.fourthbuttonclick = function(){
    var ipObj1 = {
    callback: function (val) {      //Mandatory

    var selectedTime = new Date(val*1000);
    document.getElementById('addmedications.fourthbutton').innerHTML = addZeros(selectedTime.getUTCHours()).toString()+":"+addZeros(selectedTime.getUTCMinutes().toString());
    },
    inputTime: 50400,   //Optional
    format: 12,         //Optional
    step: 15,           //Optional
    setLabel: 'Set time'    //Optional
  };

  ionicTimePicker.openTimePicker(ipObj1);
};

//Fifth button clicked
$scope.fifthbuttonclick = function(){
    var ipObj1 = {
    callback: function (val) {      //Mandatory

    var selectedTime = new Date(val*1000);
    document.getElementById('addmedications.fifthbutton').innerHTML = addZeros(selectedTime.getUTCHours()).toString()+":"+addZeros(selectedTime.getUTCMinutes().toString());
    },
    inputTime: 50400,   //Optional
    format: 12,         //Optional
    step: 15,           //Optional
    setLabel: 'Set time'    //Optional
  };

  ionicTimePicker.openTimePicker(ipObj1);
};

   Date.prototype.yyyymmdd = function() {
   var yyyy = this.getFullYear().toString();
   var mm = (this.getMonth()+1).toString(); // getMonth() is zero-based
   var dd  = this.getDate().toString();
   return yyyy +"-"+ (mm[1]?mm:"0"+mm[0]) +"-"+(dd[1]?dd:"0"+dd[0]); // padding
  };


//Doctor wants to go back to saveconsultationcontroller
$scope.gobacktoconsultation = function(){

if(document.getElementById('addmedications.medication').value===""||
document.getElementById('addmedications.dose').value===""||
document.getElementById('addmedications.modality').value===""||
document.getElementById('addmedications.mode').value===""||
document.getElementById('addmedications.dosefreq').value===""){
   var alertPopup = $ionicPopup.alert({
     title: 'Add Medications',
     template: 'Please fill in all details or choose cancel on the right side'
   });

   alertPopup.then(function(res) {

   });

}else{

/*
Do basic checking to avoid users from not entering doses
This is a necessary check to avoid crashing patient apps
*/

var state_add_med = true;

if(document.getElementById('addmedications.dosefreq').innerHTML==="OD" && document.getElementById('addmedications.firstbutton').innerHTML==="Set first dose"){
state_add_med = false;
}

if(document.getElementById('addmedications.dosefreq').innerHTML==="BD" && ((document.getElementById('addmedications.firstbutton').innerHTML==="Set first dose")||document.getElementById('addmedications.secondbutton').innerHTML==="Set second dose")){
state_add_med = false;
}

if(document.getElementById('addmedications.dosefreq').innerHTML==="TDS" && (document.getElementById('addmedications.firstbutton').innerHTML==="Set first dose"||document.getElementById('addmedications.secondbutton').innerHTML==="Set second dose"||document.getElementById('addmedications.secondbutton').innerHTML==="Set second dose"||document.getElementById('addmedications.thirdbutton').innerHTML==="Set third dose")){
state_add_med = false;
}

if(document.getElementById('addmedications.dosefreq').innerHTML==="QID" && (document.getElementById('addmedications.firstbutton').innerHTML==="Set first dose"||document.getElementById('addmedications.secondbutton').innerHTML==="Set second dose"||document.getElementById('addmedications.secondbutton').innerHTML==="Set second dose"||document.getElementById('addmedications.thirdbutton').innerHTML==="Set third dose"||document.getElementById('addmedications.fourthbutton').innerHTML==="Set fourth dose")){
state_add_med = false;
}

if(document.getElementById('addmedications.dosefreq').innerHTML==="5 times/day" && (document.getElementById('addmedications.firstbutton').innerHTML==="Set first dose"||document.getElementById('addmedications.secondbutton').innerHTML==="Set second dose"||document.getElementById('addmedications.secondbutton').innerHTML==="Set second dose"||document.getElementById('addmedications.thirdbutton').innerHTML==="Set third dose"||document.getElementById('addmedications.fourthbutton').innerHTML==="Set fourth dose"||document.getElementById('addmedications.fifthbutton').innerHTML==="Set fifth dose")){
state_add_med = false;
}

if(state_add_med){

//Validation ok for insertion of medication
var duration_value = document.getElementById('addmedications.duration').value;
var calculate_days = duration_value;

if(document.getElementById('addmedications.modality').innerHTML==="days"){calculate_days = (duration_value*1);}
if(document.getElementById('addmedications.modality').innerHTML==="weeks"){calculate_days = (duration_value*7);}
if(document.getElementById('addmedications.modality').innerHTML==="months"){calculate_days = (duration_value*31);}
if(document.getElementById('addmedications.modality').innerHTML==="years"){calculate_days = (duration_value*365);}

//Date today
var today = new Date();
var start_date = new Date();
start_date.setDate(start_date.getDate() + calculate_days);
var end_date = new Date(
    start_date.getUTCFullYear(),
    start_date.getUTCMonth(),
    start_date.getUTCDate(),
    start_date.getUTCHours(),
    start_date.getUTCMinutes(),
    start_date.getUTCSeconds()
  );

var firebase_reference = new Firebase(smarthealth.DATABASE_URL_SMARTHEALTHPRESCRIPTIONS());
var registration_object = firebase_reference.child(window.localStorage.getItem('patientid')).push();
registration_object.set({
  commonid:window.localStorage.getItem('commonid'),
  medication:document.getElementById('addmedications.medication').value,
  dosage:document.getElementById('addmedications.dose').value,
  firstdose:document.getElementById('addmedications.firstbutton').innerHTML,
  key_patientid:window.localStorage.getItem('patientid'),
  seconddose:document.getElementById('addmedications.secondbutton').innerHTML,
  thirddose:document.getElementById('addmedications.thirdbutton').innerHTML,
  fourthdose:document.getElementById('addmedications.fourthbutton').innerHTML,
  fifthdose:document.getElementById('addmedications.fifthbutton').innerHTML,
  posology:document.getElementById('addmedications.dosefreq').innerHTML,
  duration:document.getElementById('addmedications.modality').innerHTML,
  modeofadministration:document.getElementById('addmedications.mode').innerHTML,
  durationvalue:document.getElementById('addmedications.duration').value,
  startdate:today.yyyymmdd().toString(),
  enddate:end_date.yyyymmdd().toString()

});
//Go back to saveconsultationcontroller after showing success message
  var alertPopup = $ionicPopup.alert({
  title: 'Smart Health',
  template: 'Medication successfully added. Click OK to continue'
});

alertPopup.then(function(res) {
  $state.go('saveconsultation');
});
}//STATE CHECK ENDS HERE

else{
    var alertPopup = $ionicPopup.alert({
     title: 'Smart Health',
     template: 'You need to set the doses of medications'
   });

   alertPopup.then(function(res) {

   });
}


}
};

//Cancel changes and go back to saveconsultationcontroller
$scope.overridebacktoconsultation = function(){
  $state.go('saveconsultation');
};

})//END of addmedicationscontroller

//Save consultation endpoint
app.controller('saveconsultationcontroller',function($scope, $ionicModal, $timeout,$http, $state,$ionicPopup,ionicDatePicker,smarthealth){

  $scope.diagnosisbuffer = [];
  $scope.saveconsultation = {};

  $scope.addItem = function(input){


    $scope.diagnosisbuffer.push(JSON.parse("{item:'"+input+"'}"));

};
  function getItems(){return $scope.diagnosisbuffer;};

  //Azure database initialization
  /*var clienta = new WindowsAzure.MobileServiceClient('https://smarthealthsolutions.azure-mobile.net/', 'nrFwbzJBHoGRjhHkBQvRnOxEWwsdVu91'),
  diagnosticsTable = clienta.getTable('smarthealthdiagnosis');
  var clientb = new WindowsAzure.MobileServiceClient('https://smarthealthsolutions.azure-mobile.net/', 'nrFwbzJBHoGRjhHkBQvRnOxEWwsdVu91'),
  medicationsTable = clientb.getTable('smarthealthprescriptions');
  var clientc = new WindowsAzure.MobileServiceClient('https://smarthealthsolutions.azure-mobile.net/', 'nrFwbzJBHoGRjhHkBQvRnOxEWwsdVu91'),
  consultationsTable = clientc.getTable('smarthealthconsultations');*/

  window.localStorage.setItem('diagnosisbuffer','');
  window.localStorage.setItem('treatmentbuffer','');

$scope.radioclicked = function(){console.log($scope.saveconsultation.choice);};
  function refreshDiagnosisItems() {

$('#tags-diagnosis').empty();
var todoItems;
var object_buffer;
var listItems;
var firebase_reference = new Firebase(smarthealth.DATABASE_URL_SMARTHEALTHDIAGNOSIS());
//BUFFER CONSULTATION TREATMENT
var logic_treatment = false;

$scope.bufferitems = [];
$scope.diagnosis = [];
var registration_object = firebase_reference.child(window.localStorage.getItem('patientid'));
registration_object.on("child_added", function(snapshot, prevChildKey) {
todoItems = snapshot.val();
if(todoItems!=null && todoItems.commonid===window.localStorage.getItem('commonid')){

  var block_item = todoItems.diagnosis;



$('#tags-diagnosis').append($('<li>')
.attr('diagnosis-id', snapshot.name())
.append($('<button class="item-diagnosis-delete">Delete</button>'))
.append($('<tags-input class="diagnosis" ng-model="diagnosis" replace-spaces-with-dashes="false">').text(block_item)));

//BUFFER CONSULTATION DIAGNOSTICS
var logic_diagnostics = false;
var inputchk = window.localStorage.getItem('diagnosisbuffer').split(window.localStorage.getItem('commonid'));
var diagnosis_ = todoItems.diagnosis;

for(var x = 0; x < inputchk.length; x++){

    if(inputchk===diagnosis_){
      //Exists do not do anything to prevent duplication
      logic_diagnostics = false;
     window.localStorage.setItem('diagnosisbuffer','');

    }
    else{logic_diagnostics = true;}

  }//END for loop

  if(logic_diagnostics==true){

  if(window.localStorage.getItem('diagnosisbuffer')===''){
  var output2 = diagnosis_;
  window.localStorage.setItem('diagnosisbuffer',output2);
  }
  else{
  var output1 = window.localStorage.getItem('diagnosisbuffer').concat(window.localStorage.getItem('commonid'));
  var output2 = output1.concat(diagnosis_);
  window.localStorage.setItem('diagnosisbuffer',output2);
  }

}

//END BUFFERING FOR CONSULTATION DIAGNOSTICS
}
});
};

  function refreshTreatmentItems(){

  $('#tags-treatment').empty();
  var todoItems;
  var object_buffer;
  var listItems;
  var firebase_reference = new Firebase(smarthealth.DATABASE_URL_SMARTHEALTHPRESCRIPTIONS());
  //BUFFER CONSULTATION TREATMENT
  var logic_treatment = false;

  $scope.bufferitems = [];
  $scope.treatments = [];
  var registration_object = firebase_reference.child(window.localStorage.getItem('patientid'));
  registration_object.on("child_added", function(snapshot, prevChildKey) {
  todoItems = snapshot.val();
  if(todoItems!=null && todoItems.commonid===window.localStorage.getItem('commonid')){

    var med = todoItems.medication;
    var dose = todoItems.dosage;
    var posology = todoItems.posology;
    var mode = todoItems.modeofadministration;
    var block_item = med+" "+dose+" "+posology+" "+mode;

  $('#tags-treatment').append($('<li>')
  .attr('treatment-id', snapshot.name())
  .append($('<button class="item-treatment-delete">Delete</button>'))
  .append($('<tags-input class="treatment" ng-model="treatment" replace-spaces-with-dashes="false">').text(block_item)));

  var treatment_ = todoItems.medication+" "+todoItems.dosage+" "+todoItems.posology+" "+todoItems.modeofadministration;

  var inputchk = window.localStorage.getItem('treatmentbuffer').split(window.localStorage.getItem('commonid'));

for(var x = 0; x < inputchk.length; x++){

  if(inputchk===treatment_){
  //Exists do not do anything to prevent duplication
  logic_treatment = false;
  window.localStorage.setItem('treatmentbuffer','');

  }
  else{logic_treatment = true;}

}//End for loop

  if(logic_treatment==true){

  if(window.localStorage.getItem('treatmentbuffer')===''){
  var output2 = treatment_;
  window.localStorage.setItem('treatmentbuffer',output2);
  }
  else{
  var output1 = window.localStorage.getItem('treatmentbuffer').concat(window.localStorage.getItem('commonid'));
  var output2 = output1.concat(treatment_);
  window.localStorage.setItem('treatmentbuffer',output2);}
  }
  }//END todoitems null check

  });

//END BUFFERING FOR CONSULTATION TREATMENT


};//END refreshTreatmentItems()

  function refreshDiagnosisType(){

  var todoItems;
  var object_buffer;
  var listItems;
  var diagnosis_type;
  var firebase_reference = new Firebase(smarthealth.DATABASE_URL_SMARTHEALTHCONSULTATIONS());
  //BUFFER CONSULTATION TREATMENT
  var logic_treatment = false;

  $scope.bufferitems = [];
  $scope.treatments = [];
  var registration_object = firebase_reference.child(window.localStorage.getItem('patientid'));
  registration_object.on("child_added", function(snapshot, prevChildKey) {
  todoItems = snapshot.val();
  if(todoItems!=null && todoItems.commonid===window.localStorage.getItem('commonid')){

  diagnosis_type = todoItems.provisionaldiagnosis;


  }//END todoitems null check
  $scope.saveconsultation.choice = diagnosis_type;

  });

//END BUFFERING FOR CONSULTATION TREATMENT


};//END refreshDiagnosisType()

//Refresh tags
$scope.refreshContents = function(){
  $scope.saveconsultation.choice = "Provisional Diagnosis";
  window.localStorage.setItem('diagnosisbuffer','');
  window.localStorage.setItem('treatmentbuffer','');
  refreshDiagnosisItems();
  refreshTreatmentItems();
  refreshDiagnosisType();
};


$scope.$on('$ionicView.enter', function() {
//DEFAULT REFRESH
$scope.refreshContents();
document.getElementById('saveconsultation.consultationtitle').value = window.localStorage.getItem('consultationtitle');
document.getElementById('saveconsultation.othertreatment').value = window.localStorage.getItem('othertreatment');
});

//Switch from provisional to final diagnosis and vice-versa
 $scope.$watch('toggle', function(){
        $scope.toggleText = $scope.toggle ? 'Final Diagnosis' : 'Provisional Diagnosis';
    })
if(window.localStorage.getItem('savemode')==='readonly'){
//Notify doctor that consultation is in readonly mode
     var alertPopup = $ionicPopup.alert({
     title: 'Consultation options',
     template: 'Consultation is in readonly mode.'
   });

   alertPopup.then(function(res) {
     //Do nothing
   });

//Set save consultation button to readonly mode
document.getElementById('saveconsultation.saveconsultation').innerHTML = "Consultation is in read-only mode";
}
if(window.localStorage.getItem('savemode')==='update'){document.getElementById('saveconsultation.saveconsultation').innerHTML = "Update consultation";}

if(window.localStorage.getItem('savemode')==='create'){document.getElementById('saveconsultation.saveconsultation').innerHTML = "Save consultation";}



function getDiagnosisID(formElement) {return $(formElement).closest('li').attr('diagnosis-id');}

function getTreatmentID(formElement) {return $(formElement).closest('li').attr('treatment-id');}

$(document.body).on('click', '.item-diagnosis-delete', function () {
  var firebase_reference = new Firebase(smarthealth.DATABASE_URL_SMARTHEALTHDIAGNOSIS());

var delete_obj = firebase_reference.child(window.localStorage.getItem('patientid')).child(getDiagnosisID(this));
delete_obj.remove();
refreshDiagnosisItems();});


$(document.body).on('click', '.item-treatment-delete', function () {
  var firebase_reference = new Firebase(smarthealth.DATABASE_URL_SMARTHEALTHPRESCRIPTIONS());

var delete_obj = firebase_reference.child(window.localStorage.getItem('patientid')).child(getTreatmentID(this));
delete_obj.remove();
refreshTreatmentItems();});

//If any of the fields return null, handle exception by returning " "

$scope.applyFilter = function(inputData){
  var output;
  if(inputData==null){output = " ";}else{output = inputData;}
  return output;
};

//Save consultation
$scope.saveconsultation = function(){
  var firebase_reference = new Firebase(smarthealth.DATABASE_URL_SMARTHEALTHCONSULTATIONS());
  var registration_object = firebase_reference.child(window.localStorage.getItem('patientid'));

if(window.localStorage.getItem('savemode')==='create'){
//---------------------------------------------------------------------//
//END INSERT STATEMENT -- USED FOR SAVING TO AZURE CONSULTATIONS DATABASE
//---------------------------------------------------------------------//
var date_time = new Date();
//consultationsTable.insert({
registration_object.push().set({
//Insert statements
patientname:$scope.applyFilter(window.localStorage.getItem('patientname')),
commonid:$scope.applyFilter(window.localStorage.getItem('commonid')),
key_patientfile_uniqueid:$scope.applyFilter(window.localStorage.getItem('patientid')),
consultationtitle:document.getElementById('saveconsultation.consultationtitle').value,
othertreatment:document.getElementById('saveconsultation.othertreatment').value,
sequenceofpages:$scope.applyFilter(window.localStorage.getItem('memalloc')),
doctorid:$scope.applyFilter(window.localStorage.getItem('doctorid')),
time:date_time.toString(),
lmp:$scope.applyFilter(window.localStorage.getItem('lmp')),
gravindex:$scope.applyFilter(window.localStorage.getItem('gravindex')),
marital:$scope.applyFilter(window.localStorage.getItem('marital')),
pastobstetric:$scope.applyFilter(window.localStorage.getItem('pastobstetric')),
menstrual:$scope.applyFilter(window.localStorage.getItem('menstrual')),
informant:$scope.applyFilter(window.localStorage.getItem('informant')),
birthhistory:$scope.applyFilter(window.localStorage.getItem('birthhistory')),
socioeconomic:$scope.applyFilter(window.localStorage.getItem('socioeconomic')),
developmental:$scope.applyFilter(window.localStorage.getItem('developmental')),
immunization:$scope.applyFilter(window.localStorage.getItem('immunization')),
childhood:$scope.applyFilter(window.localStorage.getItem('childhood')),adolescence:$scope.applyFilter(window.localStorage.getItem('adolescence')),academics:$scope.applyFilter(window.localStorage.getItem('academics')),otherpsyfindings:$scope.applyFilter(window.localStorage.getItem('otherpsyfindings')),personalitybeforeillness:$scope.applyFilter(window.localStorage.getItem('personalitybeforeillness')),socialcircumstances:$scope.applyFilter(window.localStorage.getItem('socialcircumstances')),
presentingone:$scope.applyFilter(window.localStorage.getItem('presentingone')),presentingtwo:$scope.applyFilter(window.localStorage.getItem('presentingtwo')),presentingthree:$scope.applyFilter(window.localStorage.getItem('presentingthree')),historyone:$scope.applyFilter(window.localStorage.getItem('historyone')),historytwo:$scope.applyFilter(window.localStorage.getItem('historytwo')),
historythree:$scope.applyFilter(window.localStorage.getItem('historythree')),dmstate:$scope.applyFilter(window.localStorage.getItem('dmstate')),dmtext:$scope.applyFilter(window.localStorage.getItem('dmtext')),hbpstate:$scope.applyFilter(window.localStorage.getItem('hbpstate')),hbptext:$scope.applyFilter(window.localStorage.getItem('hbptext')),asthmastate:$scope.applyFilter(window.localStorage.getItem('asthmastate')),asthmatext:$scope.applyFilter(window.localStorage.getItem('asthmatext')),
othersstate:$scope.applyFilter(window.localStorage.getItem('othersstate')),otherstext:$scope.applyFilter(window.localStorage.getItem('otherstext')),pastsurgical:$scope.applyFilter(window.localStorage.getItem('pastsurgical')),drughistory:$scope.applyFilter(window.localStorage.getItem('drughistory')),
allergytext:$scope.applyFilter(window.localStorage.getItem('allergytext')), drugone:$scope.applyFilter(window.localStorage.getItem('drugone')),drugtwo:$scope.applyFilter(window.localStorage.getItem('drugtwo')),drugthree:$scope.applyFilter(window.localStorage.getItem('drugthree')),
familyhistory:$scope.applyFilter(window.localStorage.getItem('familyhistory')),smokingtext:$scope.applyFilter(window.localStorage.getItem('smokingtext')),alcoholtext:$scope.applyFilter(window.localStorage.getItem('alcoholtext')),drugabusetext:$scope.applyFilter(window.localStorage.getItem('drugabusetext')),
traveltext:$scope.applyFilter(window.localStorage.getItem('traveltext')),sexualtext:$scope.applyFilter(window.localStorage.getItem('sexualtext')),allergystate:$scope.applyFilter(window.localStorage.getItem('allergystate')),smokingstate:$scope.applyFilter(window.localStorage.getItem('smokingstate')),
alcoholstate:$scope.applyFilter(window.localStorage.getItem('alcoholstate')),drugabusestate:$scope.applyFilter(window.localStorage.getItem('drugabusestate')),travelstate:$scope.applyFilter(window.localStorage.getItem('travelstate')),sexualstate:$scope.applyFilter(window.localStorage.getItem('sexualstate')),
jugularpressure:$scope.applyFilter(window.localStorage.getItem('jugularpressure')),consciousness:$scope.applyFilter(window.localStorage.getItem('consciousness')),pulse:$scope.applyFilter(window.localStorage.getItem('pulse')),bloodpressure:$scope.applyFilter(window.localStorage.getItem('bloodpressure')),
temperature:$scope.applyFilter(window.localStorage.getItem('temperature')),skincondition:$scope.applyFilter(window.localStorage.getItem('skincondition')),otherpaedsfindings:$scope.applyFilter(window.localStorage.getItem('otherpaedsfindings')),
thyroidgland:$scope.applyFilter(window.localStorage.getItem('thyroidgland')),arthropometry:$scope.applyFilter(window.localStorage.getItem('arthropometry')),paedscomments:$scope.applyFilter(window.localStorage.getItem('paedscomments')),
respiratoryrate:$scope.applyFilter(window.localStorage.getItem('respiratoryrate')),spotwo:$scope.applyFilter(window.localStorage.getItem('spotwo')),pallortext:$scope.applyFilter(window.localStorage.getItem('pallortext')),cyanosistext:$scope.applyFilter(window.localStorage.getItem('cyanosistext')),
jaundicetext:$scope.applyFilter(window.localStorage.getItem('jaundicetext')),clubbingtext:$scope.applyFilter(window.localStorage.getItem('clubbingtext')),othervitalfindings:$scope.applyFilter(window.localStorage.getItem('othervitalfindings')),
pallorstate:$scope.applyFilter(window.localStorage.getItem('pallorstate')),cyanosisstate:$scope.applyFilter(window.localStorage.getItem('cyanosisstate')),jaundicestate:$scope.applyFilter(window.localStorage.getItem('jaundicestate')),clubbingstate:$scope.applyFilter(window.localStorage.getItem('clubbingstate')),
preauricular:$scope.applyFilter(window.localStorage.getItem('preauricular')),pinna:$scope.applyFilter(window.localStorage.getItem('pinna')),postauricular:$scope.applyFilter(window.localStorage.getItem('postauricular')),externalearcanal:$scope.applyFilter(window.localStorage.getItem('externalearcanal')),
tympanicmembrane:$scope.applyFilter(window.localStorage.getItem('tympanicmembrane')), noseexternalexamination:$scope.applyFilter(window.localStorage.getItem('noseexternalexamination')),nasalairway:$scope.applyFilter(window.localStorage.getItem('nasalairway')),
anteriorrhinoscopy:$scope.applyFilter(window.localStorage.getItem('anteriorrhinoscopy')),posteriorrhinoscopy:$scope.applyFilter(window.localStorage.getItem('posteriorrhinoscopy')),orodental:$scope.applyFilter(window.localStorage.getItem('orodental')),
oralcavity:$scope.applyFilter(window.localStorage.getItem('oralcavity')),tonsilspillars:$scope.applyFilter(window.localStorage.getItem('tonsilspillars')),posteriorpharynx:$scope.applyFilter(window.localStorage.getItem('posteriorpharynx')),
directlaryngoscopy:$scope.applyFilter(window.localStorage.getItem('directlaryngoscopy')),indirectlaryngoscopy:$scope.applyFilter(window.localStorage.getItem('indirectlaryngoscopy')),otherentfindings:$scope.applyFilter(window.localStorage.getItem('otherentfindings')),
pelvicexamination:$scope.applyFilter(window.localStorage.getItem('pelvicexamination')),externalgenitalia:$scope.applyFilter(window.localStorage.getItem('externalgenitalia')),speculum:$scope.applyFilter(window.localStorage.getItem('speculum')),bimanual:$scope.applyFilter(window.localStorage.getItem('bimanual')),
obsinspection:$scope.applyFilter(window.localStorage.getItem('obsinspection')),fundalheight:$scope.applyFilter(window.localStorage.getItem('fundalheight')), fundalgrip:$scope.applyFilter(window.localStorage.getItem('fundalgrip')),rightlateral:$scope.applyFilter(window.localStorage.getItem('rightlateral')),
leftlateral:$scope.applyFilter(window.localStorage.getItem('leftlateral')),pawlik:$scope.applyFilter(window.localStorage.getItem('pawlik')),deeppelvic:$scope.applyFilter(window.localStorage.getItem('deeppelvic')),foetalheartsound:$scope.applyFilter(window.localStorage.getItem('foetalheartsound')),
vaginalexam:$scope.applyFilter(window.localStorage.getItem('vaginalexam')),  visualacuity:$scope.applyFilter(window.localStorage.getItem('visualacuity')),headposture:$scope.applyFilter(window.localStorage.getItem('headposture')),eyebrowslids:$scope.applyFilter(window.localStorage.getItem('eyebrowslids')),
lacrimal:$scope.applyFilter(window.localStorage.getItem('lacrimal')),conjunctiva:$scope.applyFilter(window.localStorage.getItem('conjunctiva')),sclera:$scope.applyFilter(window.localStorage.getItem('sclera')),cornea:$scope.applyFilter(window.localStorage.getItem('cornea')),
anteriorchamber:$scope.applyFilter(window.localStorage.getItem('anteriorchamber')),lens:$scope.applyFilter(window.localStorage.getItem('lens')),fundus:$scope.applyFilter(window.localStorage.getItem('fundus')),otheropthalfindings:$scope.applyFilter(window.localStorage.getItem('otheropthalfindings')),
orthoinspection:$scope.applyFilter(window.localStorage.getItem('orthoinspection')),orthopalpation:$scope.applyFilter(window.localStorage.getItem('orthopalpation')),orthomovements:$scope.applyFilter(window.localStorage.getItem('orthomovements')),
orthomeasurements:$scope.applyFilter(window.localStorage.getItem('orthomeasurements')),otherorthofindings:$scope.applyFilter(window.localStorage.getItem('otherorthofindings')),appearance:$scope.applyFilter(window.localStorage.getItem('appearance')),
behaviour:$scope.applyFilter(window.localStorage.getItem('behaviour')),speech:$scope.applyFilter(window.localStorage.getItem('speech')),thoughtcontent:$scope.applyFilter(window.localStorage.getItem('thoughtcontent')),thoughtinterference:$scope.applyFilter(window.localStorage.getItem('thoughtinterference')),mood:$scope.applyFilter(window.localStorage.getItem('mood')),
delusionstate:$scope.applyFilter(window.localStorage.getItem('delusionstate')),delusiontext:$scope.applyFilter(window.localStorage.getItem('delusiontext')),hallucinationstate:$scope.applyFilter(window.localStorage.getItem('hallucinationstate')),
hallucinationtext:$scope.applyFilter(window.localStorage.getItem('hallucinationtext')),illusionstate:$scope.applyFilter(window.localStorage.getItem('illusionstate')),illusiontext:$scope.applyFilter(window.localStorage.getItem('illusiontext')),cognitive:$scope.applyFilter(window.localStorage.getItem('cognitive')),
insights:$scope.applyFilter(window.localStorage.getItem('insights')),judgement:$scope.applyFilter(window.localStorage.getItem('judgement')),rsinspection:$scope.applyFilter(window.localStorage.getItem('rsinspection')),rspalpation:$scope.applyFilter(window.localStorage.getItem('rspalpation')),
rspercussion:$scope.applyFilter(window.localStorage.getItem('rspercussion')),rsauscultation:$scope.applyFilter(window.localStorage.getItem('rsauscultation')),cvsinspection:$scope.applyFilter(window.localStorage.getItem('cvsinspection')),cvspalpation:$scope.applyFilter(window.localStorage.getItem('cvspalpation')),
cvspercussion:$scope.applyFilter(window.localStorage.getItem('cvspercussion')),cvsauscultation:$scope.applyFilter(window.localStorage.getItem('cvsauscultation')),gitinspection:$scope.applyFilter(window.localStorage.getItem('gitinspection')),
gitpalpation:$scope.applyFilter(window.localStorage.getItem('gitpalpation')),gitpercussion:$scope.applyFilter(window.localStorage.getItem('gitpercussion')),gitauscultation:$scope.applyFilter(window.localStorage.getItem('gitauscultation')),cranialnerve:$scope.applyFilter(window.localStorage.getItem('cranialnerve')),
neurospeech:$scope.applyFilter(window.localStorage.getItem('neurospeech')),motorsystem:$scope.applyFilter(window.localStorage.getItem('motorsystem')),sensorysystem:$scope.applyFilter(window.localStorage.getItem('sensorysystem')),meningealsigns:$scope.applyFilter(window.localStorage.getItem('meningealsigns')),
othermedicalfindings:$scope.applyFilter(window.localStorage.getItem('othermedicalfindings')),fbcstate:$scope.applyFilter(window.localStorage.getItem('fbcstate')),fbctext:$scope.applyFilter(window.localStorage.getItem('fbctext')),uestate:$scope.applyFilter(window.localStorage.getItem('uestate')),
uetext:$scope.applyFilter(window.localStorage.getItem('uetext')),creatininestate:$scope.applyFilter(window.localStorage.getItem('creatininestate')),creatininetext:$scope.applyFilter(window.localStorage.getItem('creatininetext')),fbsstate:$scope.applyFilter(window.localStorage.getItem('fbsstate')),
fbstext:$scope.applyFilter(window.localStorage.getItem('fbstext')),fslstate:$scope.applyFilter(window.localStorage.getItem('fslstate')),fsltext:$scope.applyFilter(window.localStorage.getItem('fsltext')),tgstate:$scope.applyFilter(window.localStorage.getItem('tgstate')),tgtext:$scope.applyFilter(window.localStorage.getItem('tgtext')),
uricstate:$scope.applyFilter(window.localStorage.getItem('uricstate')),urictext:$scope.applyFilter(window.localStorage.getItem('urictext')),imagingstate:$scope.applyFilter(window.localStorage.getItem('imagingstate')),imagingtext:$scope.applyFilter(window.localStorage.getItem('imagingtext')),
otherinvestigationsstate:$scope.applyFilter(window.localStorage.getItem('otherinvestigationsstate')),otherinvestigationstext:$scope.applyFilter(window.localStorage.getItem('otherinvestigationstext')),treatment:$scope.applyFilter(window.localStorage.getItem('treatment')),
patientreview:$scope.applyFilter(window.localStorage.getItem('patientreview')),notetitle:$scope.applyFilter(window.localStorage.getItem('notetitle')),notecontent:$scope.applyFilter(window.localStorage.getItem('notecontent')),cardiovascular:$scope.applyFilter(window.localStorage.getItem('cardiovascular')),
respiratory:$scope.applyFilter(window.localStorage.getItem('respiratory')),gastrointestinal:$scope.applyFilter(window.localStorage.getItem('gastrointestinal')),renal:$scope.applyFilter(window.localStorage.getItem('renal')),centralnervous:$scope.applyFilter(window.localStorage.getItem('centralnervous')),musculoskeletal:$scope.applyFilter(window.localStorage.getItem('musculoskeletal')),obg:$scope.applyFilter(window.localStorage.getItem('obg')),
provisionaldiagnosis:$scope.saveconsultation.choice,
diagnosisbuffer:$scope.applyFilter(window.localStorage.getItem('diagnosisbuffer')),
treatmentbuffer:$scope.applyFilter(window.localStorage.getItem('treatmentbuffer'))

});
//Go back to saveconsultationcontroller after showing success message
  var alertPopup = $ionicPopup.alert({
  title: 'Save consultation',
  template: 'Consultation saved successfully. Click OK to continue'
});

alertPopup.then(function(res) {
$state.go('app.newconsultation');
});


/*.done(function (result) {
   //Go back to saveconsultationcontroller after showing success message
     var alertPopup = $ionicPopup.alert({
     title: 'Save consultation',
     template: 'Consultation saved successfully. Click OK to continue'
   });

alertPopup.then(function(res) {
$state.go('app.newconsultation');
});

}, function (err) {

});*/

//End insert statement
//---------------------------------------------------------------------//
//END INSERT STATEMENT -- USED FOR SAVING TO AZURE CONSULTATIONS DATABASE
//---------------------------------------------------------------------//
}//End savemode -> 'create' verification process

if(window.localStorage.getItem('savemode')==='update'){
//--------------------------------------------------------------------------------------//
// UPDATE STATEMENT -- USED FOR UPDATING CONSULTATION ITEM IN AZURE CONSULTATIONS DATABASE
//--------------------------------------------------------------------------------------//
//consultationsTable.update({
//id: window.localStorage.getItem("azureconsultationid"),
var date_time = new Date();
registration_object.child(window.localStorage.getItem("firebaseconsultationid")).set({
patientname:$scope.applyFilter(window.localStorage.getItem('patientname')),
commonid:$scope.applyFilter(window.localStorage.getItem('commonid')),
key_patientfile_uniqueid:$scope.applyFilter(window.localStorage.getItem('patientid')),
consultationtitle:document.getElementById('saveconsultation.consultationtitle').value,
othertreatment:document.getElementById('saveconsultation.othertreatment').value,
sequenceofpages:$scope.applyFilter(window.localStorage.getItem('memalloc')),
doctorid:$scope.applyFilter(window.localStorage.getItem('doctorid')),
time:date_time.toString(),
lmp:$scope.applyFilter(window.localStorage.getItem('lmp')),
gravindex:$scope.applyFilter(window.localStorage.getItem('gravindex')),
marital:$scope.applyFilter(window.localStorage.getItem('marital')),
pastobstetric:$scope.applyFilter(window.localStorage.getItem('pastobstetric')),
menstrual:$scope.applyFilter(window.localStorage.getItem('menstrual')),
informant:$scope.applyFilter(window.localStorage.getItem('informant')),
birthhistory:$scope.applyFilter(window.localStorage.getItem('birthhistory')),
socioeconomic:$scope.applyFilter(window.localStorage.getItem('socioeconomic')),
developmental:$scope.applyFilter(window.localStorage.getItem('developmental')),
immunization:$scope.applyFilter(window.localStorage.getItem('immunization')),
childhood:$scope.applyFilter(window.localStorage.getItem('childhood')),adolescence:$scope.applyFilter(window.localStorage.getItem('adolescence')),academics:$scope.applyFilter(window.localStorage.getItem('academics')),otherpsyfindings:$scope.applyFilter(window.localStorage.getItem('otherpsyfindings')),personalitybeforeillness:$scope.applyFilter(window.localStorage.getItem('personalitybeforeillness')),socialcircumstances:$scope.applyFilter(window.localStorage.getItem('socialcircumstances')),
presentingone:$scope.applyFilter(window.localStorage.getItem('presentingone')),presentingtwo:$scope.applyFilter(window.localStorage.getItem('presentingtwo')),presentingthree:$scope.applyFilter(window.localStorage.getItem('presentingthree')),historyone:$scope.applyFilter(window.localStorage.getItem('historyone')),historytwo:$scope.applyFilter(window.localStorage.getItem('historytwo')),
historythree:$scope.applyFilter(window.localStorage.getItem('historythree')),dmstate:$scope.applyFilter(window.localStorage.getItem('dmstate')),dmtext:$scope.applyFilter(window.localStorage.getItem('dmtext')),hbpstate:$scope.applyFilter(window.localStorage.getItem('hbpstate')),hbptext:$scope.applyFilter(window.localStorage.getItem('hbptext')),asthmastate:$scope.applyFilter(window.localStorage.getItem('asthmastate')),asthmatext:$scope.applyFilter(window.localStorage.getItem('asthmatext')),
othersstate:$scope.applyFilter(window.localStorage.getItem('othersstate')),otherstext:$scope.applyFilter(window.localStorage.getItem('otherstext')),pastsurgical:$scope.applyFilter(window.localStorage.getItem('pastsurgical')),drughistory:$scope.applyFilter(window.localStorage.getItem('drughistory')),
allergytext:$scope.applyFilter(window.localStorage.getItem('allergytext')), drugone:$scope.applyFilter(window.localStorage.getItem('drugone')),drugtwo:$scope.applyFilter(window.localStorage.getItem('drugtwo')),drugthree:$scope.applyFilter(window.localStorage.getItem('drugthree')),
familyhistory:$scope.applyFilter(window.localStorage.getItem('familyhistory')),smokingtext:$scope.applyFilter(window.localStorage.getItem('smokingtext')),alcoholtext:$scope.applyFilter(window.localStorage.getItem('alcoholtext')),drugabusetext:$scope.applyFilter(window.localStorage.getItem('drugabusetext')),
traveltext:$scope.applyFilter(window.localStorage.getItem('traveltext')),sexualtext:$scope.applyFilter(window.localStorage.getItem('sexualtext')),allergystate:$scope.applyFilter(window.localStorage.getItem('allergystate')),smokingstate:$scope.applyFilter(window.localStorage.getItem('smokingstate')),
alcoholstate:$scope.applyFilter(window.localStorage.getItem('alcoholstate')),drugabusestate:$scope.applyFilter(window.localStorage.getItem('drugabusestate')),travelstate:$scope.applyFilter(window.localStorage.getItem('travelstate')),sexualstate:$scope.applyFilter(window.localStorage.getItem('sexualstate')),
jugularpressure:$scope.applyFilter(window.localStorage.getItem('jugularpressure')),consciousness:$scope.applyFilter(window.localStorage.getItem('consciousness')),pulse:$scope.applyFilter(window.localStorage.getItem('pulse')),bloodpressure:$scope.applyFilter(window.localStorage.getItem('bloodpressure')),
temperature:$scope.applyFilter(window.localStorage.getItem('temperature')),skincondition:$scope.applyFilter(window.localStorage.getItem('skincondition')),otherpaedsfindings:$scope.applyFilter(window.localStorage.getItem('otherpaedsfindings')),
thyroidgland:$scope.applyFilter(window.localStorage.getItem('thyroidgland')),arthropometry:$scope.applyFilter(window.localStorage.getItem('arthropometry')),paedscomments:$scope.applyFilter(window.localStorage.getItem('paedscomments')),
respiratoryrate:$scope.applyFilter(window.localStorage.getItem('respiratoryrate')),spotwo:$scope.applyFilter(window.localStorage.getItem('spotwo')),pallortext:$scope.applyFilter(window.localStorage.getItem('pallortext')),cyanosistext:$scope.applyFilter(window.localStorage.getItem('cyanosistext')),
jaundicetext:$scope.applyFilter(window.localStorage.getItem('jaundicetext')),clubbingtext:$scope.applyFilter(window.localStorage.getItem('clubbingtext')),othervitalfindings:$scope.applyFilter(window.localStorage.getItem('othervitalfindings')),
pallorstate:$scope.applyFilter(window.localStorage.getItem('pallorstate')),cyanosisstate:$scope.applyFilter(window.localStorage.getItem('cyanosisstate')),jaundicestate:$scope.applyFilter(window.localStorage.getItem('jaundicestate')),clubbingstate:$scope.applyFilter(window.localStorage.getItem('clubbingstate')),
preauricular:$scope.applyFilter(window.localStorage.getItem('preauricular')),pinna:$scope.applyFilter(window.localStorage.getItem('pinna')),postauricular:$scope.applyFilter(window.localStorage.getItem('postauricular')),externalearcanal:$scope.applyFilter(window.localStorage.getItem('externalearcanal')),
tympanicmembrane:$scope.applyFilter(window.localStorage.getItem('tympanicmembrane')), noseexternalexamination:$scope.applyFilter(window.localStorage.getItem('noseexternalexamination')),nasalairway:$scope.applyFilter(window.localStorage.getItem('nasalairway')),
anteriorrhinoscopy:$scope.applyFilter(window.localStorage.getItem('anteriorrhinoscopy')),posteriorrhinoscopy:$scope.applyFilter(window.localStorage.getItem('posteriorrhinoscopy')),orodental:$scope.applyFilter(window.localStorage.getItem('orodental')),
oralcavity:$scope.applyFilter(window.localStorage.getItem('oralcavity')),tonsilspillars:$scope.applyFilter(window.localStorage.getItem('tonsilspillars')),posteriorpharynx:$scope.applyFilter(window.localStorage.getItem('posteriorpharynx')),
directlaryngoscopy:$scope.applyFilter(window.localStorage.getItem('directlaryngoscopy')),indirectlaryngoscopy:$scope.applyFilter(window.localStorage.getItem('indirectlaryngoscopy')),otherentfindings:$scope.applyFilter(window.localStorage.getItem('otherentfindings')),
pelvicexamination:$scope.applyFilter(window.localStorage.getItem('pelvicexamination')),externalgenitalia:$scope.applyFilter(window.localStorage.getItem('externalgenitalia')),speculum:$scope.applyFilter(window.localStorage.getItem('speculum')),bimanual:$scope.applyFilter(window.localStorage.getItem('bimanual')),
obsinspection:$scope.applyFilter(window.localStorage.getItem('obsinspection')),fundalheight:$scope.applyFilter(window.localStorage.getItem('fundalheight')), fundalgrip:$scope.applyFilter(window.localStorage.getItem('fundalgrip')),rightlateral:$scope.applyFilter(window.localStorage.getItem('rightlateral')),
leftlateral:$scope.applyFilter(window.localStorage.getItem('leftlateral')),pawlik:$scope.applyFilter(window.localStorage.getItem('pawlik')),deeppelvic:$scope.applyFilter(window.localStorage.getItem('deeppelvic')),foetalheartsound:$scope.applyFilter(window.localStorage.getItem('foetalheartsound')),
vaginalexam:$scope.applyFilter(window.localStorage.getItem('vaginalexam')),  visualacuity:$scope.applyFilter(window.localStorage.getItem('visualacuity')),headposture:$scope.applyFilter(window.localStorage.getItem('headposture')),eyebrowslids:$scope.applyFilter(window.localStorage.getItem('eyebrowslids')),
lacrimal:$scope.applyFilter(window.localStorage.getItem('lacrimal')),conjunctiva:$scope.applyFilter(window.localStorage.getItem('conjunctiva')),sclera:$scope.applyFilter(window.localStorage.getItem('sclera')),cornea:$scope.applyFilter(window.localStorage.getItem('cornea')),
anteriorchamber:$scope.applyFilter(window.localStorage.getItem('anteriorchamber')),lens:$scope.applyFilter(window.localStorage.getItem('lens')),fundus:$scope.applyFilter(window.localStorage.getItem('fundus')),otheropthalfindings:$scope.applyFilter(window.localStorage.getItem('otheropthalfindings')),
orthoinspection:$scope.applyFilter(window.localStorage.getItem('orthoinspection')),orthopalpation:$scope.applyFilter(window.localStorage.getItem('orthopalpation')),orthomovements:$scope.applyFilter(window.localStorage.getItem('orthomovements')),
orthomeasurements:$scope.applyFilter(window.localStorage.getItem('orthomeasurements')),otherorthofindings:$scope.applyFilter(window.localStorage.getItem('otherorthofindings')),appearance:$scope.applyFilter(window.localStorage.getItem('appearance')),
behaviour:$scope.applyFilter(window.localStorage.getItem('behaviour')),speech:$scope.applyFilter(window.localStorage.getItem('speech')),thoughtcontent:$scope.applyFilter(window.localStorage.getItem('thoughtcontent')),thoughtinterference:$scope.applyFilter(window.localStorage.getItem('thoughtinterference')),mood:$scope.applyFilter(window.localStorage.getItem('mood')),
delusionstate:$scope.applyFilter(window.localStorage.getItem('delusionstate')),delusiontext:$scope.applyFilter(window.localStorage.getItem('delusiontext')),hallucinationstate:$scope.applyFilter(window.localStorage.getItem('hallucinationstate')),
hallucinationtext:$scope.applyFilter(window.localStorage.getItem('hallucinationtext')),illusionstate:$scope.applyFilter(window.localStorage.getItem('illusionstate')),illusiontext:$scope.applyFilter(window.localStorage.getItem('illusiontext')),cognitive:$scope.applyFilter(window.localStorage.getItem('cognitive')),
insights:$scope.applyFilter(window.localStorage.getItem('insights')),judgement:$scope.applyFilter(window.localStorage.getItem('judgement')),rsinspection:$scope.applyFilter(window.localStorage.getItem('rsinspection')),rspalpation:$scope.applyFilter(window.localStorage.getItem('rspalpation')),
rspercussion:$scope.applyFilter(window.localStorage.getItem('rspercussion')),rsauscultation:$scope.applyFilter(window.localStorage.getItem('rsauscultation')),cvsinspection:$scope.applyFilter(window.localStorage.getItem('cvsinspection')),cvspalpation:$scope.applyFilter(window.localStorage.getItem('cvspalpation')),
cvspercussion:$scope.applyFilter(window.localStorage.getItem('cvspercussion')),cvsauscultation:$scope.applyFilter(window.localStorage.getItem('cvsauscultation')),gitinspection:$scope.applyFilter(window.localStorage.getItem('gitinspection')),
gitpalpation:$scope.applyFilter(window.localStorage.getItem('gitpalpation')),gitpercussion:$scope.applyFilter(window.localStorage.getItem('gitpercussion')),gitauscultation:$scope.applyFilter(window.localStorage.getItem('gitauscultation')),cranialnerve:$scope.applyFilter(window.localStorage.getItem('cranialnerve')),
neurospeech:$scope.applyFilter(window.localStorage.getItem('neurospeech')),motorsystem:$scope.applyFilter(window.localStorage.getItem('motorsystem')),sensorysystem:$scope.applyFilter(window.localStorage.getItem('sensorysystem')),meningealsigns:$scope.applyFilter(window.localStorage.getItem('meningealsigns')),
othermedicalfindings:$scope.applyFilter(window.localStorage.getItem('othermedicalfindings')),fbcstate:$scope.applyFilter(window.localStorage.getItem('fbcstate')),fbctext:$scope.applyFilter(window.localStorage.getItem('fbctext')),uestate:$scope.applyFilter(window.localStorage.getItem('uestate')),
uetext:$scope.applyFilter(window.localStorage.getItem('uetext')),creatininestate:$scope.applyFilter(window.localStorage.getItem('creatininestate')),creatininetext:$scope.applyFilter(window.localStorage.getItem('creatininetext')),fbsstate:$scope.applyFilter(window.localStorage.getItem('fbsstate')),
fbstext:$scope.applyFilter(window.localStorage.getItem('fbstext')),fslstate:$scope.applyFilter(window.localStorage.getItem('fslstate')),fsltext:$scope.applyFilter(window.localStorage.getItem('fsltext')),tgstate:$scope.applyFilter(window.localStorage.getItem('tgstate')),tgtext:$scope.applyFilter(window.localStorage.getItem('tgtext')),
uricstate:$scope.applyFilter(window.localStorage.getItem('uricstate')),urictext:$scope.applyFilter(window.localStorage.getItem('urictext')),imagingstate:$scope.applyFilter(window.localStorage.getItem('imagingstate')),imagingtext:$scope.applyFilter(window.localStorage.getItem('imagingtext')),
otherinvestigationsstate:$scope.applyFilter(window.localStorage.getItem('otherinvestigationsstate')),otherinvestigationstext:$scope.applyFilter(window.localStorage.getItem('otherinvestigationstext')),treatment:$scope.applyFilter(window.localStorage.getItem('treatment')),
patientreview:$scope.applyFilter(window.localStorage.getItem('patientreview')),notetitle:$scope.applyFilter(window.localStorage.getItem('notetitle')),notecontent:$scope.applyFilter(window.localStorage.getItem('notecontent')),cardiovascular:$scope.applyFilter(window.localStorage.getItem('cardiovascular')),
respiratory:$scope.applyFilter(window.localStorage.getItem('respiratory')),gastrointestinal:$scope.applyFilter(window.localStorage.getItem('gastrointestinal')),renal:$scope.applyFilter(window.localStorage.getItem('renal')),centralnervous:$scope.applyFilter(window.localStorage.getItem('centralnervous')),musculoskeletal:$scope.applyFilter(window.localStorage.getItem('musculoskeletal')),obg:$scope.applyFilter(window.localStorage.getItem('obg')),
provisionaldiagnosis:$scope.saveconsultation.choice,
diagnosisbuffer:$scope.applyFilter(window.localStorage.getItem('diagnosisbuffer')),
treatmentbuffer:$scope.applyFilter(window.localStorage.getItem('treatmentbuffer'))
});
//Go back to saveconsultationcontroller after showing success message
var alertPopup = $ionicPopup.alert({
title: 'Update consultation',
template: 'Consultation updated successfully. Click OK to continue'
});

alertPopup.then(function(res) {
$state.go('app.newconsultation');
});

//--------------------------------------------------------------------------------------//
// UPDATE STATEMENT -- USED FOR UPDATING CONSULTATION ITEM IN AZURE CONSULTATIONS DATABASE
//--------------------------------------------------------------------------------------//
}////End savemode -> 'update' verification process

};//End saveconsultation ng-click function for saveconsultation button

    //Revert back to consultations
    $scope.backtoconsultations = function () {
      $state.go('app.newconsultation');
    };

    //Add an ICD-10/custom diagnosis
    $scope.adddiagnosis = function () {
      $scope.uuidbuilder();

    //Save current consultation title and other treatment textfields data
    window.localStorage.setItem('consultationtitle',document.getElementById('saveconsultation.consultationtitle').value);
    window.localStorage.setItem('othertreatment',document.getElementById('saveconsultation.othertreatment').value);

      $state.go('diagnosticsicd');
    }

    //Add a medication with posology
    $scope.adddrugtreatment = function(){
      $scope.uuidbuilder();
      //Save current consultation title and other treatment textfields data
    window.localStorage.setItem('consultationtitle',document.getElementById('saveconsultation.consultationtitle').value);
    window.localStorage.setItem('othertreatment',document.getElementById('saveconsultation.othertreatment').value);

      $state.go('addmedications');
    };

//COMMON ID GENERATION

//--------------------UUID SECTION------------------------//
function guid() {
  return s4() + s4() + '-' + s4() + '-' + s4() + '-' +
    s4() + '-' + s4() + s4() + s4();
}

function s4() {
  return Math.floor((1 + Math.random()) * 0x10000)
    .toString(16)
    .substring(1);
}

function UUID_FROM_DATE_TIME_UNIQUE_ID(){
var dateObj = new Date();
var hours = dateObj.getUTCHours();
var minutes = dateObj.getUTCMinutes();
var day = dateObj.getUTCDate();
var month = dateObj.getUTCMonth()+1;
var year = dateObj.getUTCFullYear();
var datetime = hours.toString()+minutes.toString()+day.toString()+month.toString()+year.toString();

return guid().toString()+datetime+window.localStorage.getItem('patientid');

}
//--------------------UUID SECTION------------------------//

$scope.uuidbuilder = function () {
//Auto lock uuid generation to avoid saving conflicts
//Lock is reset on creating/updating consultations and at application boot
if(window.localStorage.getItem('uuidlock')==="unlock"){
var generated_common_id = UUID_FROM_DATE_TIME_UNIQUE_ID();
window.localStorage.setItem('commonid',generated_common_id);
window.localStorage.setItem('uuidlock',"lock");
}
};

})//END of saveconsultationcontroller

//Past consultations controller
app.controller('pastconsultationscontroller',function($scope, $timeout,$http, $ionicModal, $state,$ionicPopup,ionicDatePicker,$ionicLoading,smarthealth){
  //var clientc = new WindowsAzure.MobileServiceClient('https://smarthealthsolutions.azure-mobile.net/', 'nrFwbzJBHoGRjhHkBQvRnOxEWwsdVu91'),
  //consultationsTable = clientc.getTable('smarthealthconsultations');
  $scope.consultations = [];
  $scope.bufferitems_consultations = [];


  $scope.$on('$ionicView.enter', function() {
  //LOADS CONSULTATION CARDS INTO LISTVIEW SYSTEM
  //Azure slow to reload -- attempt reload after 1000ms interval
  $scope.loading = $ionicLoading.show({
    content: '<i class="icon ion-loading-c"></i>',
    animation: 'fade-in',
    showBackdrop: true,
    maxWidth: 50,
    showDelay: 0
  });
  $scope.refreshconsultations();
  /*$timeout(function(){$scope.refreshconsultations();
  }, 500);*/
  $ionicLoading.hide();
  });

  $scope.refreshconsultations = function(){

  var firebase_reference = new Firebase(smarthealth.DATABASE_URL_SMARTHEALTHCONSULTATIONS());
  //Clear off consultation items
  for(var i = 0; i < $scope.consultations.length ; i++){
  $scope.consultations.splice(i,$scope.consultations.length);
  }
  /*var query = consultationsTable.where({key_patientfile_uniqueid:window.localStorage.getItem('patientid')})
  query.read().then(function(results) {
  window.localStorage.setItem('consultationsbuffer',JSON.stringify(results));
});*/

var registration_object = firebase_reference.child(window.localStorage.getItem('patientid'));
firebase_reference.child(window.localStorage.getItem('patientid')).on("child_added", function(snapshot, prevChildKey) {
var todoItems = snapshot.val();
$scope.item = [];
item = [{eventcontent:todoItems.commonid,keymap:snapshot.name()}];
$scope.bufferitems_consultations.push(item);
$scope.consultations.push(todoItems);
$scope.$apply();
});

 };//END refreshconsultations

  $scope.buildSheets = function(){
  $scope.consultationitems = [];

   var sequence = window.localStorage.getItem("memalloc");
   var splitItems = sequence.split(":");
   var SET = "1";
   var CLEAR = "0";
   $scope.consultations = [];

   consultations = [
     { title: 'Obstetrics',subtitle:'Obstetric sheet',sheet:'obsinfo',image:'img/mydetails.png' },
     { title: 'Gynaecology',subtitle:'Gynaecology sheet',sheet:'gynaeinfo' ,image:'img/mydetails.png'},
     { title: 'Paediatrics',subtitle:'Paediatric sheet',sheet:'paedsinfo',image:'img/mydetails.png' },
     { title: 'Psychiatry',subtitle:'Psychiatric sheet',sheet:'psyinfo',image:'img/mydetails.png' },
     { title: 'Complaints',subtitle:'Basic sheet',sheet:'complaints',image:'img/mydetails.png' },
     { title: 'Other complaints',subtitle:'Basic sheet',sheet:'othercomplaints',image:'img/mydetails.png' },
     { title: 'Paediatric Vitals',subtitle:'Paediatric sheet',sheet:'paedsgeneralexam' ,image:'img/mydetails.png'},
     { title: 'Vitals',subtitle:'Basic sheet',sheet:'vitals',image:'img/mydetails.png' },
     { title: 'Ear Nose Throat',subtitle:'ENT sheet',sheet:'entone' ,image:'img/mydetails.png'},
     { title: 'Larynx',subtitle:'ENT sheet',sheet:'enttwo' ,image:'img/mydetails.png'},
     { title: 'Gynaecology exam',subtitle:'Gynaecology sheet',sheet:'gynaeexam' ,image:'img/mydetails.png'},
     { title: 'Obstetrics exam',subtitle:'Obstetric sheet',sheet:'obsexam',image:'img/mydetails.png' },
     { title: 'Opthalmology exam',subtitle:'Opthalmology sheet',sheet:'opthalexam',image:'img/mydetails.png' },
     { title: 'Orthopaedics exam',subtitle:'Orthopaedics sheet',sheet:'orthoexam',image:'img/mydetails.png' },
     { title: 'Psychiatric exam',subtitle:'Psychiatric sheet',sheet:'psyexam',image:'img/mydetails.png' },
     { title: 'RS CVS GIT exam',subtitle:'Basic sheet',sheet:'mdpartone',image:'img/mydetails.png' },
     { title: 'CNS exam',subtitle:'Basic sheet',sheet:'mdparttwo' ,image:'img/mydetails.png'},
     { title: 'Investigations',subtitle:'Basic sheet',sheet:'investigations',image:'img/mydetails.png' },
     { title: 'Note',subtitle:'Details sheet',sheet:'note',image:'img/mydetails.png' }
   ];

   if(splitItems[0]===CLEAR){
     //Obstetric info
    for (var i = consultations.length - 1; i >= 0; i--) {
    if (consultations[i].title==='Obstetrics' || consultations[i].title==='Obstetrics exam') {
        consultations.splice(i, 1);
    }
   }//end for loop

   }//clear end

   if(splitItems[1]===CLEAR){
     //Gynaecology info
    for (var i = consultations.length - 1; i >= 0; i--) {
    if (consultations[i].title==='Gynaecology' || consultations[i].title==='Gynaecology exam') {
        consultations.splice(i, 1);
    }
   }//end for loop
   }
   if(splitItems[2]===CLEAR){
     //Paediatric info
    for (var i = consultations.length - 1; i >= 0; i--) {
    if (consultations[i].title==='Paediatrics' || consultations[i].title==='Paediatric Vitals') {
        consultations.splice(i, 1);
    }
   }//end for loop
   }

   if(splitItems[3]===CLEAR){
     //Psychiatry info
       for (var i = consultations.length - 1; i >= 0; i--) {
    if (consultations[i].title==='Psychiatry' || consultations[i].title==='Psychiatric exam') {
        consultations.splice(i, 1);
    }
   }//end for loop
   }

   if(splitItems[4]===CLEAR){
     //Complaints
     var complaints = [{ title: 'Complaints',sheet:'complaints',subtitle:'Basic sheet',image:'img/mydetails.png' }];
     $scope.consultationitems.push(complaints);
   }

   if(splitItems[5]===CLEAR){
     //Other complaints
     var othercomplaints = [{ title: 'Other complaints',subtitle:'Basic sheet',sheet:'othercomplaints',image:'img/mydetails.png' }];
     $scope.consultationitems.push(othercomplaints);
   }

   if(splitItems[6]===CLEAR){
     //Paediatric vitals
     //Do nothing handled elsewhere
   }

   if(splitItems[7]===CLEAR){
     //Vitals
    for (var i = consultations.length - 1; i >= 0; i--) {
    if (consultations[i].title==='Vitals') {
    consultations.splice(i, 1);
    }
   }//end for loop
   }

   if(splitItems[8]===CLEAR){
     //ENTONE
    for (var i = consultations.length - 1; i >= 0; i--) {
    if (consultations[i].title==='Ear Nose Throat' || consultations[i].title==='Larynx') {
        consultations.splice(i, 1);
    }
   }//end for loop
   }

   if(splitItems[9]===CLEAR){
     //ENTTWO
     //Do nothing handled elsewhere
   }

   if(splitItems[10]===CLEAR){
   //Gynaecology exam
   //Do nothing handled elsewhere
   }

   if(splitItems[11]===CLEAR){
   //Obstetric exam
   //Do nothing handled elsewhere

   }

   if(splitItems[12]===CLEAR){
   //Opthalmology exam
   for (var i = consultations.length - 1; i >= 0; i--) {
   if (consultations[i].title==='Opthalmology exam') {
   consultations.splice(i, 1);
   }
   }//end for loop
   }

   if(splitItems[13]===CLEAR){
   //Orthopaedics exam
   for (var i = consultations.length - 1; i >= 0; i--) {
   if (consultations[i].title==='Orthopaedics exam') {
   consultations.splice(i, 1);
   }
   }//end for loop
   }

   if(splitItems[14]===CLEAR){
   //Psychiatric exam
   //Do nothing handled elsewhere
   }

   if(splitItems[15]===CLEAR){
   //CVS RS GIT exam

   }

   if(splitItems[16]===CLEAR){
   //CNS exam

   }

   if(splitItems[17]===CLEAR){
   //Investigations exam

   }

   if(splitItems[18]===CLEAR){
   //Note
   for (var i = consultations.length - 1; i >= 0; i--) {
   if (consultations[i].title==='Note') {
   consultations.splice(i, 1);
   }
   }//end for loop
   }

   //Clear off sidemenu items
  for(var i = 0; i < $scope.items.length ; i++){
  $scope.items.splice(i,$scope.items.length);
  }
  angular.forEach(consultations, function(item){
  $scope.items.push(item);
  });

 }; //END sheet builder

$scope.openconsultation = function(inputID){

//var consultation_entry = JSON.parse(window.localStorage.getItem(inputID));
var consultation_entry = inputID;

var selected_key;
for(var i = 0;i<$scope.bufferitems_consultations.length;i++){
if($scope.bufferitems_consultations[i][0].eventcontent===consultation_entry.commonid){
var selected_key = $scope.bufferitems_consultations[i][0].keymap;
window.localStorage.setItem("firebaseconsultationid",selected_key);

}
}


//COMPLAINTS

window.localStorage.setItem("dmtext",consultation_entry.dmtext);
window.localStorage.setItem("hbptext",consultation_entry.hbptext);
window.localStorage.setItem("asthmatext",consultation_entry.asthmatext);
window.localStorage.setItem("otherstext",consultation_entry.otherstext);
window.localStorage.setItem("pastsurgical",consultation_entry.pastsurgical);
window.localStorage.setItem("presentingone",consultation_entry.presentingone);
window.localStorage.setItem("presentingtwo",consultation_entry.presentingtwo);
window.localStorage.setItem("presentingthree",consultation_entry.presentingthree);
window.localStorage.setItem("historyone",consultation_entry.historyone);
window.localStorage.setItem("historytwo",consultation_entry.historytwo);
window.localStorage.setItem("historythree",consultation_entry.historythree);
window.localStorage.setItem("dmstate",consultation_entry.dmstate);
window.localStorage.setItem("hbpstate",consultation_entry.hbpstate);
window.localStorage.setItem("asthmastate",consultation_entry.asthmastate);
window.localStorage.setItem("othersstate",consultation_entry.othersstate);


//OTHER COMPLAINTS
window.localStorage.setItem("drughistory",consultation_entry.drughistory);
window.localStorage.setItem("allergytext",consultation_entry.allergytext);
window.localStorage.setItem("drugone",consultation_entry.drugone);
window.localStorage.setItem("drugtwo",consultation_entry.drugtwo);
window.localStorage.setItem("drugthree",consultation_entry.drugthree);
window.localStorage.setItem("familyhistory",consultation_entry.familyhistory);
window.localStorage.setItem("smokingtext",consultation_entry.smokingtext);
window.localStorage.setItem("alcoholtext",consultation_entry.alcoholtext);
window.localStorage.setItem("drugabusetext",consultation_entry.drugabusetext);
window.localStorage.setItem("traveltext",consultation_entry.traveltext);
window.localStorage.setItem("sexualtext",consultation_entry.sexualtext);
window.localStorage.setItem("allergystate",consultation_entry.allergystate);
window.localStorage.setItem("smokingstate",consultation_entry.smokingstate);
window.localStorage.setItem("alcoholstate",consultation_entry.alcoholstate);
window.localStorage.setItem("drugabusestate",consultation_entry.drugabusestate);
window.localStorage.setItem("travelstate",consultation_entry.travelstate);
window.localStorage.setItem("sexualstate",consultation_entry.sexualstate);

//VITALS
window.localStorage.setItem("bloodpressure",consultation_entry.bloodpressure);
window.localStorage.setItem("pulse",consultation_entry.pulse);
window.localStorage.setItem("temperature",consultation_entry.temperature);
window.localStorage.setItem("respiratoryrate",consultation_entry.respiratoryrate);
window.localStorage.setItem("spotwo",consultation_entry.spotwo);
window.localStorage.setItem("pallortext",consultation_entry.pallortext);
window.localStorage.setItem("cyanosistext",consultation_entry.cyanosistext);
window.localStorage.setItem("jaundicetext",consultation_entry.jaundicetext);
window.localStorage.setItem("clubbingtext",consultation_entry.clubbingtext);
window.localStorage.setItem("othervitalfindings",consultation_entry.othervitalfindings);
window.localStorage.setItem("pallorstate",consultation_entry.pallorstate);
window.localStorage.setItem("cyanosisstate",consultation_entry.cyanosisstate);
window.localStorage.setItem("jaundicestate",consultation_entry.jaundicestate);
window.localStorage.setItem("clubbingstate",consultation_entry.clubbingstate);

//MDPARTONE
window.localStorage.setItem("rsinspection",consultation_entry.rsinspection);
window.localStorage.setItem("rspalpation",consultation_entry.rspalpation);
window.localStorage.setItem("rspercussion",consultation_entry.rspercussion);
window.localStorage.setItem("rsauscultation",consultation_entry.rsauscultation);
window.localStorage.setItem("cvsinspection",consultation_entry.cvsinspection);
window.localStorage.setItem("cvspalpation",consultation_entry.cvspalpation);
window.localStorage.setItem("cvspercussion",consultation_entry.cvspercussion);
window.localStorage.setItem("cvsauscultation",consultation_entry.cvsauscultation);
window.localStorage.setItem("gitinspection",consultation_entry.gitinspection);
window.localStorage.setItem("gitpalpation",consultation_entry.gitpalpation);
window.localStorage.setItem("gitpercussion",consultation_entry.gitpercussion);
window.localStorage.setItem("gitauscultation",consultation_entry.gitauscultation);

//MDPARTTWO
window.localStorage.setItem("cranialnerve",consultation_entry.cranialnerve);
window.localStorage.setItem("neurospeech",consultation_entry.neurospeech);
window.localStorage.setItem("motorsystem",consultation_entry.motorsystem);
window.localStorage.setItem("sensorysystem",consultation_entry.sensorysystem);
window.localStorage.setItem("meningealsigns",consultation_entry.meningealsigns);
window.localStorage.setItem("othermedicalfindings",consultation_entry.othermedicalfindings);

//INVESTIGATIONS
window.localStorage.setItem("fbctext",consultation_entry.fbctext);
window.localStorage.setItem("uetext",consultation_entry.uetext);
window.localStorage.setItem("creatininetext",consultation_entry.creatininetext);
window.localStorage.setItem("fbstext",consultation_entry.fbstext);
window.localStorage.setItem("fsltext",consultation_entry.fsltext);
window.localStorage.setItem("tgtext",consultation_entry.tgtext);
window.localStorage.setItem("urictext",consultation_entry.urictext);
window.localStorage.setItem("otherinvestigationstext",consultation_entry.otherinvestigationstext);
window.localStorage.setItem("treatment",consultation_entry.treatment);
window.localStorage.setItem("imagingtext",consultation_entry.imagingtext);
window.localStorage.setItem("patientreview",consultation_entry.patientreview);
window.localStorage.setItem("fbcstate",consultation_entry.fbcstate);
window.localStorage.setItem("uestate",consultation_entry.uestate);
window.localStorage.setItem("creatininestate",consultation_entry.creatininestate);
window.localStorage.setItem("fbsstate",consultation_entry.fbsstate);
window.localStorage.setItem("fslstate",consultation_entry.fslstate);
window.localStorage.setItem("tgstate",consultation_entry.tgstate);
window.localStorage.setItem("uricstate",consultation_entry.uricstate);
window.localStorage.setItem("otherinvestigationsstate",consultation_entry.otherinvestigationsstate);
window.localStorage.setItem("imagingstate",consultation_entry.imagingstate);

//OBSINFO
window.localStorage.setItem("lmp",consultation_entry.lmp);
window.localStorage.setItem("gravindex",consultation_entry.gravindex);
window.localStorage.setItem("pastobstetric",consultation_entry.pastobstetric);
window.localStorage.setItem("menstrual",consultation_entry.menstrual);
window.localStorage.setItem("marital",consultation_entry.marital);

//OBSEXAM
window.localStorage.setItem("obsinspection",consultation_entry.obsinspection);
window.localStorage.setItem("fundalheight",consultation_entry.fundalheight);
window.localStorage.setItem("fundalgrip",consultation_entry.fundalgrip);
window.localStorage.setItem("rightlateral",consultation_entry.rightlateral);
window.localStorage.setItem("leftlateral",consultation_entry.leftlateral);
window.localStorage.setItem("pawlik",consultation_entry.pawlik);
window.localStorage.setItem("deeppelvic",consultation_entry.deeppelvic);
window.localStorage.setItem("foetalheartsound",consultation_entry.foetalheartsound);
window.localStorage.setItem("vaginalexam",consultation_entry.vaginalexam);

//GYNAEINFO
window.localStorage.setItem("menstrual",consultation_entry.menstrual);
window.localStorage.setItem("marital",consultation_entry.marital);
window.localStorage.setItem("gravindex",consultation_entry.gravindex);
window.localStorage.setItem("pastobstetric",consultation_entry.pastobstetric);

//GYNAEEXAM
window.localStorage.setItem("pelvicexamination",consultation_entry.pelvicexamination);
window.localStorage.setItem("externalgenitalia",consultation_entry.externalgenitalia);
window.localStorage.setItem("speculum",consultation_entry.speculum);
window.localStorage.setItem("bimanual",consultation_entry.bimanual);

//PAEDSINFO
window.localStorage.setItem("informant",consultation_entry.informant);
window.localStorage.setItem("birthhistory",consultation_entry.birthhistory);
window.localStorage.setItem("socioeconomic",consultation_entry.socioeconomic);
window.localStorage.setItem("developmental",consultation_entry.developmental);
window.localStorage.setItem("immunization",consultation_entry.immunization);

//PAEDS VITALS
window.localStorage.setItem("consciousness",consultation_entry.consciousness);
window.localStorage.setItem("pulse",consultation_entry.pulse);
window.localStorage.setItem("bloodpressure",consultation_entry.bloodpressure);
window.localStorage.setItem("temperature",consultation_entry.temperature);
window.localStorage.setItem("skincondition",consultation_entry.skincondition);
window.localStorage.setItem("arthropometry",consultation_entry.arthropometry);
window.localStorage.setItem("jugularpressure",consultation_entry.jugularpressure);
window.localStorage.setItem("otherpaedsfindings",consultation_entry.otherpaedsfindings);
window.localStorage.setItem("thyroidgland",consultation_entry.thyroidgland);
window.localStorage.setItem("paedscomments",consultation_entry.paedscomments);

//PSY INFO
window.localStorage.setItem("childhood",consultation_entry.childhood);
window.localStorage.setItem("adolescence",consultation_entry.adolescence);
window.localStorage.setItem("academics",consultation_entry.academics);
window.localStorage.setItem("otherpsyfindings",consultation_entry.otherpsyfindings);
window.localStorage.setItem("personalitybeforeillness",consultation_entry.personalitybeforeillness);
window.localStorage.setItem("socialcircumstances",consultation_entry.socialcircumstances);

//PSYEXAM
window.localStorage.setItem("appearance",consultation_entry.appearance);
window.localStorage.setItem("behaviour",consultation_entry.behaviour);
window.localStorage.setItem("speech",consultation_entry.speech);
window.localStorage.setItem("thoughtcontent",consultation_entry.thoughtcontent);
window.localStorage.setItem("mood",consultation_entry.mood);
window.localStorage.setItem("delusiontext",consultation_entry.delusiontext);
window.localStorage.setItem("hallucinationtext",consultation_entry.hallucinationtext);
window.localStorage.setItem("illusiontext",consultation_entry.illusiontext);
window.localStorage.setItem("thoughtinterference",consultation_entry.thoughtinterference);
window.localStorage.setItem("cognitive",consultation_entry.cognitive);
window.localStorage.setItem("insights",consultation_entry.insights);
window.localStorage.setItem("judgement",consultation_entry.judgement);
window.localStorage.setItem("delusionstate",consultation_entry.delusionstate);
window.localStorage.setItem("hallucinationstate",consultation_entry.hallucinationstate);
window.localStorage.setItem("illusionstate",consultation_entry.illusionstate);

//ENT ONE
window.localStorage.setItem("preauricular",consultation_entry.preauricular);
window.localStorage.setItem("pinna",consultation_entry.pinna);
window.localStorage.setItem("postauricular",consultation_entry.postauricular);
window.localStorage.setItem("externalearcanal",consultation_entry.externalearcanal);
window.localStorage.setItem("tympanicmembrane",consultation_entry.tympanicmembrane);
window.localStorage.setItem("noseexternalexamination",consultation_entry.noseexternalexamination);
window.localStorage.setItem("nasalairway",consultation_entry.nasalairway);
window.localStorage.setItem("anteriorrhinoscopy",consultation_entry.anteriorrhinoscopy);
window.localStorage.setItem("posteriorrhinoscopy",consultation_entry.posteriorrhinoscopy);
window.localStorage.setItem("orodental",consultation_entry.orodental);
window.localStorage.setItem("oralcavity",consultation_entry.oralcavity);
window.localStorage.setItem("tonsilspillars",consultation_entry.tonsilspillars);
window.localStorage.setItem("posteriorpharynx",consultation_entry.posteriorpharynx);

//ENT TWO
window.localStorage.setItem("directlaryngoscopy",consultation_entry.directlaryngoscopy);
window.localStorage.setItem("indirectlaryngoscopy",consultation_entry.indirectlaryngoscopy);
window.localStorage.setItem("otherentfindings",consultation_entry.otherentfindings);

//OPTHALEXAM
window.localStorage.setItem("visualacuity",consultation_entry.visualacuity);
window.localStorage.setItem("headposture",consultation_entry.headposture);
window.localStorage.setItem("eyebrowslids",consultation_entry.eyebrowslids);
window.localStorage.setItem("lacrimal",consultation_entry.lacrimal);
window.localStorage.setItem("conjunctiva",consultation_entry.conjunctiva);
window.localStorage.setItem("sclera",consultation_entry.sclera);
window.localStorage.setItem("cornea",consultation_entry.cornea);
window.localStorage.setItem("anteriorchamber",consultation_entry.anteriorchamber);
window.localStorage.setItem("lens",consultation_entry.lens);
window.localStorage.setItem("fundus",consultation_entry.fundus);
window.localStorage.setItem("otheropthalfindings",consultation_entry.otheropthalfindings);

//ORTHOEXAM
window.localStorage.setItem("orthoinspection",consultation_entry.orthoinspection);
window.localStorage.setItem("orthopalpation",consultation_entry.orthopalpation);
window.localStorage.setItem("orthomovements",consultation_entry.orthomovements);
window.localStorage.setItem("orthomeasurements",consultation_entry.orthomeasurements);
window.localStorage.setItem("otherorthofindings",consultation_entry.otherorthofindings);

//NOTE
window.localStorage.setItem("notetitle",consultation_entry.notetitle);
window.localStorage.setItem("notecontent",consultation_entry.notecontent);

//Set saveconsultationcontroller to "readonly"
window.localStorage.setItem('savemode','readonly');

//Set consultations sheet sequence into memory stack
window.localStorage.setItem('memalloc',consultation_entry.sequenceofpages);

//Set commonid pointer to memory stack
window.localStorage.setItem('commonid',consultation_entry.commonid);

//Saveconsultation parameters
window.localStorage.setItem('consultationtitle',consultation_entry.consultationtitle);
window.localStorage.setItem('othertreatment',consultation_entry.othertreatment);

//Go to first consultation sheet of the series

//Comparator logic sequence
//obsinfo -> gynaeinfo -> paedsinfo -> psyinfo -> static complaints (default)
var splitItems = consultation_entry.sequenceofpages.split(":");
var SET = "1";
var CLEAR = "0";
var first_sheet = "complaints"; //Default -- if all are off this will be the first sheet

if(splitItems[0]===CLEAR){
//Not obsinfo
}else if(splitItems[0]===SET){first_sheet="obsinfo";}

if(splitItems[1]===CLEAR){
//Not gynaeinfo
}else if(splitItems[1]===SET){first_sheet="gynaeinfo";}

if(splitItems[2]===CLEAR){
//Not paedsinfo
}else if(splitItems[2]===SET){first_sheet="paedsinfo";}

if(splitItems[3]===CLEAR){
//Not psyinfo
}else if(splitItems[1]===SET){first_sheet="psyinfo";}

$scope.buildSheets();
if(first_sheet==='complaints'){$state.go('complaints');}
if(first_sheet==='obsinfo'){$state.go('app.obsinfo');}
if(first_sheet==='gynaeinfo'){$state.go('app.gynaeinfo');}
if(first_sheet==='paedsinfo'){$state.go('app.paedsinfo');}
if(first_sheet==='psyinfo'){$state.go('app.psyinfo');}

};//END open consultation into memory stack

$scope.updateconsultation = function(inputID){

  //var consultation_entry = JSON.parse(window.localStorage.getItem(inputID));
  var consultation_entry = inputID;

  var selected_key;
  for(var i = 0;i<$scope.bufferitems_consultations.length;i++){
  if($scope.bufferitems_consultations[i][0].eventcontent===consultation_entry.commonid){
  var selected_key = $scope.bufferitems_consultations[i][0].keymap;
  window.localStorage.setItem("firebaseconsultationid",selected_key);
  }
  }

if(consultation_entry.doctorid===window.localStorage.getItem('doctorid')){
//Doctor ID matches -- consultation updating is allowed
//Load consultation items into memory stack

//Lock UUID Generator for future updates handling
window.localStorage.setItem("uuidlock","lock");

//COMPLAINTS
window.localStorage.setItem("dmtext",consultation_entry.dmtext);
window.localStorage.setItem("hbptext",consultation_entry.hbptext);
window.localStorage.setItem("asthmatext",consultation_entry.asthmatext);
window.localStorage.setItem("otherstext",consultation_entry.otherstext);
window.localStorage.setItem("pastsurgical",consultation_entry.pastsurgical);
window.localStorage.setItem("presentingone",consultation_entry.presentingone);
window.localStorage.setItem("presentingtwo",consultation_entry.presentingtwo);
window.localStorage.setItem("presentingthree",consultation_entry.presentingthree);
window.localStorage.setItem("historyone",consultation_entry.historyone);
window.localStorage.setItem("historytwo",consultation_entry.historytwo);
window.localStorage.setItem("historythree",consultation_entry.historythree);
window.localStorage.setItem("dmstate",consultation_entry.dmstate);
window.localStorage.setItem("hbpstate",consultation_entry.hbpstate);
window.localStorage.setItem("asthmastate",consultation_entry.asthmastate);
window.localStorage.setItem("othersstate",consultation_entry.othersstate);

//OTHER COMPLAINTS
window.localStorage.setItem("drughistory",consultation_entry.drughistory);
window.localStorage.setItem("allergytext",consultation_entry.allergytext);
window.localStorage.setItem("drugone",consultation_entry.drugone);
window.localStorage.setItem("drugtwo",consultation_entry.drugtwo);
window.localStorage.setItem("drugthree",consultation_entry.drugthree);
window.localStorage.setItem("familyhistory",consultation_entry.familyhistory);
window.localStorage.setItem("smokingtext",consultation_entry.smokingtext);
window.localStorage.setItem("alcoholtext",consultation_entry.alcoholtext);
window.localStorage.setItem("drugabusetext",consultation_entry.drugabusetext);
window.localStorage.setItem("traveltext",consultation_entry.traveltext);
window.localStorage.setItem("sexualtext",consultation_entry.sexualtext);
window.localStorage.setItem("allergystate",consultation_entry.allergystate);
window.localStorage.setItem("smokingstate",consultation_entry.smokingstate);
window.localStorage.setItem("alcoholstate",consultation_entry.alcoholstate);
window.localStorage.setItem("drugabusestate",consultation_entry.drugabusestate);
window.localStorage.setItem("travelstate",consultation_entry.travelstate);
window.localStorage.setItem("sexualstate",consultation_entry.sexualstate);

//VITALS
window.localStorage.setItem("bloodpressure",consultation_entry.bloodpressure);
window.localStorage.setItem("pulse",consultation_entry.pulse);
window.localStorage.setItem("temperature",consultation_entry.temperature);
window.localStorage.setItem("respiratoryrate",consultation_entry.respiratoryrate);
window.localStorage.setItem("spotwo",consultation_entry.spotwo);
window.localStorage.setItem("pallortext",consultation_entry.pallortext);
window.localStorage.setItem("cyanosistext",consultation_entry.cyanosistext);
window.localStorage.setItem("jaundicetext",consultation_entry.jaundicetext);
window.localStorage.setItem("clubbingtext",consultation_entry.clubbingtext);
window.localStorage.setItem("othervitalfindings",consultation_entry.othervitalfindings);
window.localStorage.setItem("pallorstate",consultation_entry.pallorstate);
window.localStorage.setItem("cyanosisstate",consultation_entry.cyanosisstate);
window.localStorage.setItem("jaundicestate",consultation_entry.jaundicestate);
window.localStorage.setItem("clubbingstate",consultation_entry.clubbingstate);

//MDPARTONE
window.localStorage.setItem("rsinspection",consultation_entry.rsinspection);
window.localStorage.setItem("rspalpation",consultation_entry.rspalpation);
window.localStorage.setItem("rspercussion",consultation_entry.rspercussion);
window.localStorage.setItem("rsauscultation",consultation_entry.rsauscultation);
window.localStorage.setItem("cvsinspection",consultation_entry.cvsinspection);
window.localStorage.setItem("cvspalpation",consultation_entry.cvspalpation);
window.localStorage.setItem("cvspercussion",consultation_entry.cvspercussion);
window.localStorage.setItem("cvsauscultation",consultation_entry.cvsauscultation);
window.localStorage.setItem("gitinspection",consultation_entry.gitinspection);
window.localStorage.setItem("gitpalpation",consultation_entry.gitpalpation);
window.localStorage.setItem("gitpercussion",consultation_entry.gitpercussion);
window.localStorage.setItem("gitauscultation",consultation_entry.gitauscultation);

//MDPARTTWO
window.localStorage.setItem("cranialnerve",consultation_entry.cranialnerve);
window.localStorage.setItem("neurospeech",consultation_entry.neurospeech);
window.localStorage.setItem("motorsystem",consultation_entry.motorsystem);
window.localStorage.setItem("sensorysystem",consultation_entry.sensorysystem);
window.localStorage.setItem("meningealsigns",consultation_entry.meningealsigns);
window.localStorage.setItem("othermedicalfindings",consultation_entry.othermedicalfindings);

//INVESTIGATIONS
window.localStorage.setItem("fbctext",consultation_entry.fbctext);
window.localStorage.setItem("uetext",consultation_entry.uetext);
window.localStorage.setItem("creatininetext",consultation_entry.creatininetext);
window.localStorage.setItem("fbstext",consultation_entry.fbstext);
window.localStorage.setItem("fsltext",consultation_entry.fsltext);
window.localStorage.setItem("tgtext",consultation_entry.tgtext);
window.localStorage.setItem("urictext",consultation_entry.urictext);
window.localStorage.setItem("otherinvestigationstext",consultation_entry.otherinvestigationstext);
window.localStorage.setItem("treatment",consultation_entry.treatment);
window.localStorage.setItem("imagingtext",consultation_entry.imagingtext);
window.localStorage.setItem("patientreview",consultation_entry.patientreview);
window.localStorage.setItem("fbcstate",consultation_entry.fbcstate);
window.localStorage.setItem("uestate",consultation_entry.uestate);
window.localStorage.setItem("creatininestate",consultation_entry.creatininestate);
window.localStorage.setItem("fbsstate",consultation_entry.fbsstate);
window.localStorage.setItem("fslstate",consultation_entry.fslstate);
window.localStorage.setItem("tgstate",consultation_entry.tgstate);
window.localStorage.setItem("uricstate",consultation_entry.uricstate);
window.localStorage.setItem("otherinvestigationsstate",consultation_entry.otherinvestigationsstate);
window.localStorage.setItem("imagingstate",consultation_entry.imagingstate);

//OBSINFO
window.localStorage.setItem("lmp",consultation_entry.lmp);
window.localStorage.setItem("gravindex",consultation_entry.gravindex);
window.localStorage.setItem("pastobstetric",consultation_entry.pastobstetric);
window.localStorage.setItem("menstrual",consultation_entry.menstrual);
window.localStorage.setItem("marital",consultation_entry.marital);

//OBSEXAM
window.localStorage.setItem("obsinspection",consultation_entry.obsinspection);
window.localStorage.setItem("fundalheight",consultation_entry.fundalheight);
window.localStorage.setItem("fundalgrip",consultation_entry.fundalgrip);
window.localStorage.setItem("rightlateral",consultation_entry.rightlateral);
window.localStorage.setItem("leftlateral",consultation_entry.leftlateral);
window.localStorage.setItem("pawlik",consultation_entry.pawlik);
window.localStorage.setItem("deeppelvic",consultation_entry.deeppelvic);
window.localStorage.setItem("foetalheartsound",consultation_entry.foetalheartsound);
window.localStorage.setItem("vaginalexam",consultation_entry.vaginalexam);

//GYNAEINFO
window.localStorage.setItem("menstrual",consultation_entry.menstrual);
window.localStorage.setItem("marital",consultation_entry.marital);
window.localStorage.setItem("gravindex",consultation_entry.gravindex);
window.localStorage.setItem("pastobstetric",consultation_entry.pastobstetric);

//GYNAEEXAM
window.localStorage.setItem("pelvicexamination",consultation_entry.pelvicexamination);
window.localStorage.setItem("externalgenitalia",consultation_entry.externalgenitalia);
window.localStorage.setItem("speculum",consultation_entry.speculum);
window.localStorage.setItem("bimanual",consultation_entry.bimanual);

//PAEDSINFO
window.localStorage.setItem("informant",consultation_entry.informant);
window.localStorage.setItem("birthhistory",consultation_entry.birthhistory);
window.localStorage.setItem("socioeconomic",consultation_entry.socioeconomic);
window.localStorage.setItem("developmental",consultation_entry.developmental);
window.localStorage.setItem("immunization",consultation_entry.immunization);

//PAEDS VITALS
window.localStorage.setItem("consciousness",consultation_entry.consciousness);
window.localStorage.setItem("pulse",consultation_entry.pulse);
window.localStorage.setItem("bloodpressure",consultation_entry.bloodpressure);
window.localStorage.setItem("temperature",consultation_entry.temperature);
window.localStorage.setItem("skincondition",consultation_entry.skincondition);
window.localStorage.setItem("arthropometry",consultation_entry.arthropometry);
window.localStorage.setItem("jugularpressure",consultation_entry.jugularpressure);
window.localStorage.setItem("otherpaedsfindings",consultation_entry.otherpaedsfindings);
window.localStorage.setItem("thyroidgland",consultation_entry.thyroidgland);
window.localStorage.setItem("paedscomments",consultation_entry.paedscomments);

//PSY INFO
window.localStorage.setItem("childhood",consultation_entry.childhood);
window.localStorage.setItem("adolescence",consultation_entry.adolescence);
window.localStorage.setItem("academics",consultation_entry.academics);
window.localStorage.setItem("otherpsyfindings",consultation_entry.otherpsyfindings);
window.localStorage.setItem("personalitybeforeillness",consultation_entry.personalitybeforeillness);
window.localStorage.setItem("socialcircumstances",consultation_entry.socialcircumstances);

//PSYEXAM
window.localStorage.setItem("appearance",consultation_entry.appearance);
window.localStorage.setItem("behaviour",consultation_entry.behaviour);
window.localStorage.setItem("speech",consultation_entry.speech);
window.localStorage.setItem("thoughtcontent",consultation_entry.thoughtcontent);
window.localStorage.setItem("mood",consultation_entry.mood);
window.localStorage.setItem("delusiontext",consultation_entry.delusiontext);
window.localStorage.setItem("hallucinationtext",consultation_entry.hallucinationtext);
window.localStorage.setItem("illusiontext",consultation_entry.illusiontext);
window.localStorage.setItem("thoughtinterference",consultation_entry.thoughtinterference);
window.localStorage.setItem("cognitive",consultation_entry.cognitive);
window.localStorage.setItem("insights",consultation_entry.insights);
window.localStorage.setItem("judgement",consultation_entry.judgement);
window.localStorage.setItem("delusionstate",consultation_entry.delusionstate);
window.localStorage.setItem("hallucinationstate",consultation_entry.hallucinationstate);
window.localStorage.setItem("illusionstate",consultation_entry.illusionstate);

//ENT ONE
window.localStorage.setItem("preauricular",consultation_entry.preauricular);
window.localStorage.setItem("pinna",consultation_entry.pinna);
window.localStorage.setItem("postauricular",consultation_entry.postauricular);
window.localStorage.setItem("externalearcanal",consultation_entry.externalearcanal);
window.localStorage.setItem("tympanicmembrane",consultation_entry.tympanicmembrane);
window.localStorage.setItem("noseexternalexamination",consultation_entry.noseexternalexamination);
window.localStorage.setItem("nasalairway",consultation_entry.nasalairway);
window.localStorage.setItem("anteriorrhinoscopy",consultation_entry.anteriorrhinoscopy);
window.localStorage.setItem("posteriorrhinoscopy",consultation_entry.posteriorrhinoscopy);
window.localStorage.setItem("orodental",consultation_entry.orodental);
window.localStorage.setItem("oralcavity",consultation_entry.oralcavity);
window.localStorage.setItem("tonsilspillars",consultation_entry.tonsilspillars);
window.localStorage.setItem("posteriorpharynx",consultation_entry.posteriorpharynx);

//ENT TWO
window.localStorage.setItem("directlaryngoscopy",consultation_entry.directlaryngoscopy);
window.localStorage.setItem("indirectlaryngoscopy",consultation_entry.indirectlaryngoscopy);
window.localStorage.setItem("otherentfindings",consultation_entry.otherentfindings);

//OPTHALEXAM
window.localStorage.setItem("visualacuity",consultation_entry.visualacuity);
window.localStorage.setItem("headposture",consultation_entry.headposture);
window.localStorage.setItem("eyebrowslids",consultation_entry.eyebrowslids);
window.localStorage.setItem("lacrimal",consultation_entry.lacrimal);
window.localStorage.setItem("conjunctiva",consultation_entry.conjunctiva);
window.localStorage.setItem("sclera",consultation_entry.sclera);
window.localStorage.setItem("cornea",consultation_entry.cornea);
window.localStorage.setItem("anteriorchamber",consultation_entry.anteriorchamber);
window.localStorage.setItem("lens",consultation_entry.lens);
window.localStorage.setItem("fundus",consultation_entry.fundus);
window.localStorage.setItem("otheropthalfindings",consultation_entry.otheropthalfindings);

//ORTHOEXAM
window.localStorage.setItem("orthoinspection",consultation_entry.orthoinspection);
window.localStorage.setItem("orthopalpation",consultation_entry.orthopalpation);
window.localStorage.setItem("orthomovements",consultation_entry.orthomovements);
window.localStorage.setItem("orthomeasurements",consultation_entry.orthomeasurements);
window.localStorage.setItem("otherorthofindings",consultation_entry.otherorthofindings);

//NOTE
window.localStorage.setItem("notetitle",consultation_entry.notetitle);
window.localStorage.setItem("notecontent",consultation_entry.notecontent);

//Set consultations sheet sequence into memory stack
window.localStorage.setItem('memalloc',consultation_entry.sequenceofpages);

//Set saveconsultationcontroller to "update"
window.localStorage.setItem('savemode','update');
//Set consultations sheet sequence into memory stack
window.localStorage.setItem('memalloc',consultation_entry.sequenceofpages);

//Set commonid pointer to memory stack
window.localStorage.setItem('commonid',consultation_entry.commonid);

//Since this consultation is in update mode -- set consultation azure id to memory stack
window.localStorage.setItem('azureconsultationid',consultation_entry.id);

//Saveconsultation parameters
window.localStorage.setItem('consultationtitle',consultation_entry.consultationtitle);
window.localStorage.setItem('othertreatment',consultation_entry.othertreatment);

//Go to first consultation sheet of the series

//Comparator logic sequence
//obsinfo -> gynaeinfo -> paedsinfo -> psyinfo -> static complaints (default)
var splitItems = consultation_entry.sequenceofpages.split(":");
var SET = "1";
var CLEAR = "0";
var first_sheet = "complaints"; //Default -- if all are off this will be the first sheet

if(splitItems[0]===CLEAR){
//Not obsinfo
}else if(splitItems[0]===SET){first_sheet="obsinfo";}

if(splitItems[1]===CLEAR){
//Not gynaeinfo
}else if(splitItems[1]===SET){first_sheet="gynaeinfo";}

if(splitItems[2]===CLEAR){
//Not paedsinfo
}else if(splitItems[2]===SET){first_sheet="paedsinfo";}

if(splitItems[3]===CLEAR){
//Not psyinfo
}else if(splitItems[1]===SET){first_sheet="psyinfo";}

$scope.buildSheets();
if(first_sheet==='complaints'){$state.go('complaints');}
if(first_sheet==='obsinfo'){$state.go('app.obsinfo');}
if(first_sheet==='gynaeinfo'){$state.go('app.gynaeinfo');}
if(first_sheet==='paedsinfo'){$state.go('app.paedsinfo');}
if(first_sheet==='psyinfo'){$state.go('app.psyinfo');}

//End load consultation into memory stack
}
  else{
    //Doctor ID does not match -- disable updating consultation && warn user
  var alertPopup = $ionicPopup.alert({
  title: 'Past Consultations',
  template: 'You cannot update this consultation since you did not create this consultation'
  });
  alertPopup.then(function(res) {
  //Do nothing - operation cancelled
  });
  }

  };//End update consultation
})



app.controller('appointmentscontroller',function($scope, $ionicPopup,$state,$timeout,$ionicActionSheet,smarthealth) {

//Fetch and display selected date appointments -(if existing)
    $scope.loadAppointmentsForSelectedDate = function(year,month,day){
        if(window.localStorage.getItem('dashboardtype')==='doctor'){
            $scope.appts = [];

            $scope.buffer_doctor_appts = [];

            var firebase_reference = new Firebase(smarthealth.DATABASE_URL_SMARTHEALTHAPPOINTMENTS());
            var registration_object = firebase_reference;
            registration_object.on("child_added", function(snapshot, prevChildKey) {
                var data = snapshot.val();
                var combined = data.key_year.toString()+data.key_month.toString()+data.key_day_of_month.toString()+data.key_patientfile_unique_id+data.key_hour_of_day+data.key_minute;

                if(data.key_doctor===window.localStorage.getItem('doctorid')&&data.key_month.toString()===month.toString()&&data.key_year.toString()===year.toString()&&data.key_day_of_month.toString()===day.toString()){
                    $scope.buffer_doctor_appts.push([{eventcontent:combined,keymap:snapshot.name()}]);
                    //Save retrieved doctor id for later referencing
                    window.localStorage.setItem('apptdoctor',data.key_doctor);
                    $scope.appts.push(data);
                }
            });


        }//END dashboardtype doctor

        if(window.localStorage.getItem('dashboardtype')==='patient'){
            $scope.appts = [];

            $scope.buffer_patient_appts = [];
            var firebase_reference = new Firebase(smarthealth.DATABASE_URL_SMARTHEALTHAPPOINTMENTS());
            var registration_object = firebase_reference;
            registration_object.on("child_added", function(snapshot, prevChildKey) {
                var data = snapshot.val();
                var combined = data.key_year.toString()+data.key_month.toString()+data.key_day_of_month.toString()+data.key_patientfile_unique_id+data.key_hour_of_day+data.key_minute;
                if(data.key_doctor===window.localStorage.getItem('doctorid')&&data.key_month.toString()===month.toString()&&data.key_year.toString()===year.toString()&&data.key_day_of_month.toString()===day.toString()){
                    $scope.buffer_patient_appts.push([{eventcontent:combined,keymap:snapshot.name()}]);
                    //Save retrieved doctor id for later referencing
                    window.localStorage.setItem('apptdoctor',data.key_doctor);
                    $scope.appts.push(data);
                }
            });//END dashboardtype patient

        }//END loadAppointmentsForSelectedDate()

//Add zeros where needed
        function addZeros(input){
            var output = input;;
            if(input.length==1){
                output = "0"+input;
            }
            return output;
        }

//Get listed appointment click azure id for update/delete operations
        $scope.listclicked = function(input){
            var list_object = input;
            if(window.localStorage.getItem('doctorid')===window.localStorage.getItem('apptdoctor')){
                var combined = list_object.key_year.toString()+list_object.key_month.toString()+list_object.key_day_of_month.toString()+list_object.key_patientfile_unique_id+list_object.key_hour_of_day+list_object.key_minute;;
                var selected_key;
                if(window.localStorage.getItem('dashboardtype')==='patient'){
                    for(var i = 0;i<$scope.buffer_patient_appts.length;i++){
                        if($scope.buffer_patient_appts[i][0].eventcontent===combined){
                            var selected_key = $scope.buffer_patient_appts[i][0].keymap;
                            window.localStorage.setItem("firebaseapptid",selected_key);

                        }
                    }
                }
                if(window.localStorage.getItem('dashboardtype')==='doctor'){
                    for(var i = 0;i<$scope.buffer_doctor_appts.length;i++){
                        if($scope.buffer_doctor_appts[i][0].eventcontent===combined){
                            var selected_key = $scope.buffer_doctor_appts[i][0].keymap;
                            window.localStorage.setItem("firebaseapptid",selected_key);

                        }
                    }
                }



                //Doctor using the application has previously created this appointment
                //Allow updating/deleting this appointment
                $ionicActionSheet.show({
                    buttons: [
                        { text: 'Change appointment' },
                        { text: 'Remove appointment' }
                    ],
                    titleText: 'Options',
                    cancelText: 'Cancel',
                    cancel: function() {
                        // add cancel code..
                    },
                    buttonClicked: function(index) {

                        if(index==0){
                            //Change appointment
                            //window.localStorage.setItem('azureapptid',azure_appt_id);
                            //Set saveappointmentscontroller to "UPDATE" mode
                            window.localStorage.setItem('saveapptmode','update');
                            smarthealth.set_appointmentobject(list_object);
                            $state.go('app.saveappointments');
                        }

                        if(index==1){
                            //Remove appointment
                            var firebase_reference = new Firebase(smarthealth.DATABASE_URL_SMARTHEALTHAPPOINTMENTS());
                            var delete_ref = firebase_reference.child(window.localStorage.getItem("firebaseapptid"));
                            delete_ref.remove();
                            //Inform that appointment has been deleted
                            var alertPopup = $ionicPopup.alert({
                                title: 'Appointment options',
                                template: 'Appointment has been deleted successfully. Click OK to continue.'
                            });
                            alertPopup.then(function(res) {
                                $scope.appts=[];
                                $scope.$apply;
                            });
                        }

                        return true;
                    }
                });

            }
            else{
                //Doctor did not create this appointment
                //Disable by default updating/deleting this appointment
                var alertPopup = $ionicPopup.alert({
                    title: 'Appointment options',
                    template: 'You did not create this appointment hence cannot modify it'
                });
                alertPopup.then(function(res) {
//Do nothing - operation cancelled
                });
            }

        };
    };//END loadAppointmentsForSelectedDate method
  "use strict";
  $scope.$on('$ionicView.enter', function() {$scope.appts=[];});
    UIkit.notification('Click on a date to view its appointments', {pos: 'top-right'});


  // With "use strict", Dates can be passed ONLY as strings (ISO format: YYYY-MM-DD)
  $scope.options = {
    dayNamesLength: 3, // 1 for "M", 2 for "Mo", 3 for "Mon"; 9 will show full day names. Default is 1.
    mondayIsFirstDay: true,//set monday as first day of week. Default is false
    eventClick: function(date) { // called before dateClick and only if clicked day has events

    },
    dateClick: function(date) { // called every time a day is clicked

      //Save selected date into memory stack
      window.localStorage.setItem('appointmentsyear',date.year);
      window.localStorage.setItem('appointmentsmonth',(date.month+1).toString());
      window.localStorage.setItem('appointmentsday',date.day);
      window.localStorage.setItem('combineddate',getFormattedDate(date.year,date.month,date.day));

      //Fetch and display selected date appointments -(if existing)
      $scope.loadAppointmentsForSelectedDate(date.year,(date.month+1),date.day);
      /*$timeout(function(){$scope.loadAppointmentsForSelectedDate(date.year,(date.month+1),date.day);
      }, 500);*/

    },
    changeMonth: function(month, year) {

    },
    filteredEventsChange: function(filteredEvents) {

    },
  }//END options configuration

  var buff = getToday().split("-");
  var current_year = buff[0];
  var current_month = buff[1];
  var current_day = buff[2];

    $scope.loadAppointmentsForSelectedDate(current_year,current_month,current_day);


  //Returns date today in ISO format: YYYY-MM-DD
  function getToday(){
  var date = new Date();
  var yyyy = date.getFullYear().toString();
  var mm = (date.getMonth()+1).toString(); // getMonth() is zero-based
  var dd  = (date.getDate()).toString();
  return yyyy +"-"+ (mm[1]?mm:"0"+mm[0]) +"-"+ (dd[1]?dd:"0"+dd[0]);
  }

  //Returns selected date in ISO format: YYYY-MM-DD
  function getFormattedDate(param_year,param_month,param_day){
  param_year = param_year.toString();
  param_month = (param_month+1).toString();
  param_day = param_day.toString();
  return (param_day[1]?param_day:"0"+param_day[0])+"-"+ (param_month[1]?param_month:"0"+param_month[0])+"-"+param_year;
};

  //Create appointments confirmation dialogbox
  $scope.confirmCreateAppointment = function() {
   var option_selected = $ionicPopup.confirm({
     title: 'Create appointment',
     template: 'Do you want to add an appointment?',
     cancelText: 'Cancel',
     okText: 'Continue'
   });

   option_selected.then(function(res) {
     if(res) {
     //Set saveappointmentscontroller to "CREATE" mode
     window.localStorage.setItem('saveapptmode','create');
     $state.go('app.saveappointments');
     } else {
     //Do nothing - operation cancelled
     }
   });
 };

//Go to save consultations controller after confirmation
$scope.gotosaveconsultations = function(){$scope.confirmCreateAppointment();}


})//END appointmentscontroller

app.controller('saveappointmentscontroller',function($scope,smarthealth,$http,$state,$ionicModal, $ionicPopup, $timeout,ionicTimePicker,$ionicLoading) {
 //Azure database initialization
 //var clienta = new WindowsAzure.MobileServiceClient('https://smarthealthsolutions.azure-mobile.net/', 'nrFwbzJBHoGRjhHkBQvRnOxEWwsdVu91'),
 //appointmentsTable = clienta.getTable('smarthealthappointments');

var firebase_reference = new Firebase(smarthealth.DATABASE_URL_SMARTHEALTHAPPOINTMENTS());

//Go back to appointments manager
$scope.gotoappointments = function(){$state.go('app.appointments');};

var UPDATE_OBJECT;

$scope.$on('$ionicView.enter', function() {

UPDATE_OBJECT = smarthealth.get_appointmentobject();

console.log(UPDATE_OBJECT);

if(window.localStorage.getItem('saveapptmode')==='create'){
//On loading HTML assign date to appointments date parameter
angular.element(document).ready(function () {
  $timeout(function(){document.getElementById('saveappointments.date').innerHTML = "Appointment date:  "+window.localStorage.getItem('combineddate');
}, 500);
});}

if(window.localStorage.getItem('saveapptmode')==='update'){
var firebase_reference = new Firebase(smarthealth.DATABASE_URL_SMARTHEALTHAPPOINTMENTS());
firebase_reference.child(window.localStorage.getItem("firebaseapptid")).on("value", function(snapshot) {
  var data = snapshot.val();

//Update parameters
document.getElementById('saveappointments.date').innerHTML = "Appointment date:  "+addZeros(data.key_day_of_month)+"-"+addZeros(data.key_month)+"-"+data.key_year;
document.getElementById('appointments.timeselector').innerHTML = data.key_timebuffer;
document.getElementById('appointments.title').value = data.key_appointment_title;
  
});
}//END saveapptmode update

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
          var dataset = snapshot.val();
          if(dataset!=null){
              $ionicLoading.hide();
              dataset.calculateage = smarthealth.get_age(dataset.dateofbirthyear,dataset.dateofbirthmonth,dataset.dateofbirthday);
              dataset.datetime = smarthealth.get_localtime(dataset.datetime);
              $scope.activepatients.push(dataset);
              $scope.$apply();}
          else{$ionicLoading.hide();}
      });

      firebase_reference.once("value", function(snap) {
          $ionicLoading.hide();
      });

});

//Open time selector to choose time for appointment
$scope.openTimeSelector = function(){
    var ipObj1 = {
    callback: function (val) {      //Mandatory

    var selectedTime = new Date(val*1000);
    document.getElementById('appointments.timeselector').innerHTML = addZeros(selectedTime.getUTCHours().toString())+":"+addZeros(selectedTime.getUTCMinutes().toString());
    //Save to memory stack
    window.localStorage.setItem('appointmenthours',selectedTime.getUTCHours().toString());
    window.localStorage.setItem('appointmentminutes',selectedTime.getUTCMinutes().toString());
    },
    inputTime: 50400,    //Optional
    format: 12,          //Optional
    step: 15,            //Optional
    setLabel: 'Set time' //Optional
  };

  ionicTimePicker.openTimePicker(ipObj1);
};

    //Popup initialisation
    $scope.mainpopup={};
    $ionicModal.fromTemplateUrl('clinicalmodule/tblactivepatientspopup.html', {
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

//Save entered appointment into azure server
$scope.saveappointment = function(){
  if(window.localStorage.getItem('saveapptmode')==='create'&& window.localStorage.getItem('dashboardtype')==='doctor'){
  $scope.data = {};
  $scope.showPopup();
  }
  else if(window.localStorage.getItem('saveapptmode')==='create'&& window.localStorage.getItem('dashboardtype')==='patient'){
  $scope.data = {};

  window.localStorage.setItem('patientnid',window.localStorage.getItem('patientid'));

  $scope.insertAppointment();
  }
  if(window.localStorage.getItem('saveapptmode')==='update' && window.localStorage.getItem('dashboardtype')==='doctor'){
    $scope.data = {};
      if(window.localStorage.getItem('saveapptmode')==='create'&& window.localStorage.getItem('dashboardtype')==='doctor'){ $scope.showPopup();}
      if(window.localStorage.getItem('saveapptmode')==='update' && window.localStorage.getItem('dashboardtype')==='doctor'){$scope.updateAppointment();}
      UIkit.notification('Select a patient', {pos: 'top-right'});

  }
  else if(window.localStorage.getItem('saveapptmode')==='update' && window.localStorage.getItem('dashboardtype')==='patient'){
    $scope.data = {};
  window.localStorage.setItem('patientnid',window.localStorage.getItem('patientid'));

  $scope.updateAppointment();

  }

  $scope.showDetails = function (data) {
      window.localStorage.setItem('patientnid',data.mrn);
      $scope.closePopup();

      //Confirm patient selection

      var confirmPopup = $ionicPopup.confirm({
          title: 'Patient Selection',
          template: 'Confirm for patient: '+data.firstname+' '+data.lastname
      });

      confirmPopup.then(function(res) {
          if(res) {
              window.localStorage.setItem('patientname',data.firstname+' '+data.lastname);
              window.localStorage.setItem('patientnid',data.mrn);
              $scope.insertAppointment();
          } else {

          }
      });




  }
};//END save appointment

//Add zeros where needed
function addZeros(input){
  var output = input;;
  if(input.length==1){
    output = "0"+input;
  }
  return output;
}

//Returns a human-readable time
function getHumanReadableTime(){
  var hours = window.localStorage.getItem('appointmenthours');
  var minutes = window.localStorage.getItem('appointmentminutes');
  var AM_PM=" AM";
  if(hours>12){hours = hours-12;AM_PM=" PM";}
return addZeros(hours)+":"+addZeros(minutes)+AM_PM;

};

//Insert appointment into azure server
$scope.insertAppointment = function(){

//appointmentsTable.insert({
firebase_reference.push().set({
key_patientfile_unique_id:window.localStorage.getItem('patientnid'),
key_month:window.localStorage.getItem('appointmentsmonth'),
key_year:window.localStorage.getItem('appointmentsyear'),
key_day_of_month:window.localStorage.getItem('appointmentsday'),
key_hour_of_day:window.localStorage.getItem('appointmenthours'),
key_minute:window.localStorage.getItem('appointmentminutes'),
key_status:"Active",
key_appointment_title:document.getElementById('appointments.title').value,
key_editcount:"nul",
key_state:"KEY_NEW",
key_doctorname:window.localStorage.getItem('doctorname'),
key_doctor:window.localStorage.getItem('doctorid'),
key_patientname:window.localStorage.getItem('patientname'),
key_timebuffer:getHumanReadableTime(),
});
//On appointment azure save notify success and return to appointments manager
var alertPopup = $ionicPopup.alert({
title: 'Save Appointment',
template: 'Appointment saved successfully. Click OK to continue'
});
alertPopup.then(function(res) {
$state.go('app.appointments');
});

};//END insertAppointment

//Update appointment upon request
$scope.updateAppointment = function(){

window.localStorage.setItem('appointmenthours',UPDATE_OBJECT.key_hour_of_day);
window.localStorage.setItem('appointmentminutes',UPDATE_OBJECT.key_minute);

//appointmentsTable.update({
firebase_reference.child(window.localStorage.getItem('firebaseapptid')).set({
key_patientfile_unique_id:UPDATE_OBJECT.key_patientfile_unique_id,
key_month:UPDATE_OBJECT.key_month,
key_year:UPDATE_OBJECT.key_year,
key_day_of_month:UPDATE_OBJECT.key_day_of_month,
key_hour_of_day:UPDATE_OBJECT.key_hour_of_day,
key_minute:UPDATE_OBJECT.key_minute,
key_status:UPDATE_OBJECT.key_status,
key_appointment_title:document.getElementById('appointments.title').value,
key_editcount:"nul",
key_state:"KEY_UPDATED",
key_doctorname:UPDATE_OBJECT.key_doctorname,
key_doctor:UPDATE_OBJECT.key_doctor,
key_patientname:UPDATE_OBJECT.key_patientname,
key_timebuffer:getHumanReadableTime(),
});
//On appointment azure save notify success and return to appointments manager
var alertPopup = $ionicPopup.alert({
title: 'Update Appointment',
template: 'Appointment updated successfully. Click OK to continue'
});
alertPopup.then(function(res) {
$state.go('app.appointments');
});
};//END updateAppointment

})//END saveappointmentscontroller

//---------------------------TOOLKIT CONTROLLERS--------------------------------//
app.controller('abbreviationscontroller',function($scope,$state,$http,smarthealth) {

//Go back to toolkit menu
$scope.gototools = function(){$state.go('app.toolkit')};

  $scope.contents = [];

  //Pull abbreviations from custom JSON local file named "abbreviationsdata.js"
  $http.get('abbreviationsdata.js').success(function(response){
   angular.forEach(response.feed, function(child){
     $scope.contents.push(child);
   });

  });

})//END abbreviationscontroller

app.controller('creatinineclearancecontroller',function($scope,$state,$http) {

//Go back to toolkit menu
$scope.gototools = function(){$state.go('app.toolkit')};

//User hits the creatinine calculate button
$scope.calculatecreatinine = function () {
var gender = document.getElementById('creat.gender').value;
var weight = document.getElementById('creat.weightselector').value;
var creatinine_selector = document.getElementById('creat.creatselector').value;

if(gender==='Male'){
  //Male

  if(creatinine_selector==='mg/dL'){
  //mg/dL

  if(weight==='kg'){
  //kg
  var CL =  ((140-parseInt(document.getElementById('creat.age').value, 10)) * (parseInt(document.getElementById('creat.weight').value,10))/ (72 *parseInt(document.getElementById('creat.creatinine').value)));
  var numout = Math.ceil(CL*100);
  numout = numout/100;
  var result = numout.toFixed(2);
  document.getElementById('creat.results').innerHTML = "Creatinine clearance:  "+result+ " mL/min";
  }

  if(weight==='lb'){
  //lb
  var CL =  ((140-parseInt(document.getElementById('creat.age').value, 10)) * (parseInt(document.getElementById('creat.weight').value,10)*0.453592)/ (72 *parseInt(document.getElementById('creat.creatinine').value)));
  var numout = Math.ceil(CL*100);
  numout = numout/100;
  var result = numout.toFixed(2);
  document.getElementById('creat.results').innerHTML = "Creatinine clearance:  "+result+ " mL/min";
  }

  if(weight==='g'){
  //g
  var CL =  ((140-parseInt(document.getElementById('creat.age').value, 10)) * (parseInt(document.getElementById('creat.weight').value,10)*1000)/ (72 *parseInt(document.getElementById('creat.creatinine').value)));
  var numout = Math.ceil(CL*100);
  numout = numout/100;
  var result = numout.toFixed(2);
  document.getElementById('creat.results').innerHTML = "Creatinine clearance:  "+result+ " mL/min";
  }

  }

  if(creatinine_selector==='uMol/L'){
  //uMol/L

  if(weight==='kg'){
  //kg
  var CL =  ((140-parseInt(document.getElementById('creat.age').value, 10)) * (1.23*parseInt(document.getElementById('creat.weight').value,10))/ (parseInt(document.getElementById('creat.creatinine').value)));
  var numout = Math.ceil(CL*100);
  numout = numout/100;
  var result = numout.toFixed(2);
  document.getElementById('creat.results').innerHTML = "Creatinine clearance:  "+result+ " mL/min";
  }

  if(weight==='lb'){
  //lb
  var CL =  ((140-parseInt(document.getElementById('creat.age').value, 10)) * (1.23*parseInt(document.getElementById('creat.weight').value,10)*0.453592)/ (parseInt(document.getElementById('creat.creatinine').value)));
  var numout = Math.ceil(CL*100);
  numout = numout/100;
  var result = numout.toFixed(2);
  document.getElementById('creat.results').innerHTML = "Creatinine clearance:  "+result+ " mL/min";
  }

  if(weight==='g'){
  //g
  var CL =  ((140-parseInt(document.getElementById('creat.age').value, 10)) * (1.23*parseInt(document.getElementById('creat.weight').value,10)*1000)/ (parseInt(document.getElementById('creat.creatinine').value)));
  var numout = Math.ceil(CL*100);
  numout = numout/100;
  var result = numout.toFixed(2);
  document.getElementById('creat.results').innerHTML = "Creatinine clearance:  "+result+ " mL/min";
  }

  }
}

if(gender==='Female'){
  //Female

  if(creatinine_selector==='mg/dL'){
  //mg/dL

  if(weight==='kg'){
  //kg
  var CL =  ((140-parseInt(document.getElementById('creat.age').value, 10)) * (parseInt(document.getElementById('creat.weight').value,10)*0.85)/ (72 *parseInt(document.getElementById('creat.creatinine').value)));
  var numout = Math.ceil(CL*100);
  numout = numout/100;
  var result = numout.toFixed(2);
  document.getElementById('creat.results').innerHTML = "Creatinine clearance:  "+result+ " mL/min";
  }

  if(weight==='lb'){
  //lb
  var CL =  ((140-parseInt(document.getElementById('creat.age').value, 10)) * (parseInt(document.getElementById('creat.weight').value,10)*0.453592*0.85)/ (72 *parseInt(document.getElementById('creat.creatinine').value)));
  var numout = Math.ceil(CL*100);
  numout = numout/100;
  var result = numout.toFixed(2);
  document.getElementById('creat.results').innerHTML = "Creatinine clearance:  "+result+ " mL/min";
  }

  if(weight==='g'){
  //g
  var CL =  ((140-parseInt(document.getElementById('creat.age').value, 10)) * (parseInt(document.getElementById('creat.weight').value,10)*1000*0.85)/ (72 *parseInt(document.getElementById('creat.creatinine').value)));
  var numout = Math.ceil(CL*100);
  numout = numout/100;
  var result = numout.toFixed(2);
  document.getElementById('creat.results').innerHTML = "Creatinine clearance:  "+result+ " mL/min";
  }

  }

  if(creatinine_selector==='uMol/L'){
  //uMol/L

  if(weight==='kg'){
  //kg
  var CL =  ((140-parseInt(document.getElementById('creat.age').value, 10)) * (1.04*parseInt(document.getElementById('creat.weight').value,10))/ (parseInt(document.getElementById('creat.creatinine').value)));
  var numout = Math.ceil(CL*100);
  numout = numout/100;
  var result = numout.toFixed(2);
  document.getElementById('creat.results').innerHTML = "Creatinine clearance:  "+result+ " mL/min";
  }

  if(weight==='lb'){
  //lb
  var CL =  ((140-parseInt(document.getElementById('creat.age').value, 10)) * (1.04*parseInt(document.getElementById('creat.weight').value,10)*0.453592)/ (parseInt(document.getElementById('creat.creatinine').value)));
  var numout = Math.ceil(CL*100);
  numout = numout/100;
  var result = numout.toFixed(2);
  document.getElementById('creat.results').innerHTML = "Creatinine clearance:  "+result+ " mL/min";
  }

  if(weight==='g'){
  //g
  var CL =  ((140-parseInt(document.getElementById('creat.age').value, 10)) * (1.04*parseInt(document.getElementById('creat.weight').value,10)*1000)/ (parseInt(document.getElementById('creat.creatinine').value)));
  var numout = Math.ceil(CL*100);
  numout = numout/100;
  var result = numout.toFixed(2);
  document.getElementById('creat.results').innerHTML = "Creatinine clearance:  "+result+ " mL/min";
  }

  }
}

};//END calculate button clicked

})//END creatinineclearancecontroller

app.controller('qtccontroller',function($scope,$state,$http) {
//Go back to toolkit menu
$scope.gototools = function(){$state.go('app.toolkit')};

//Calculate QTC
$scope.calculateqtc = function () {
var QTC = parseInt(document.getElementById('qtc.interval').value, 10)/Math.sqrt(60/parseInt(document.getElementById('qtc.heartrate').value, 10));
var num_qtc = Math.ceil(QTC*100);
num_qtc = num_qtc/100;
document.getElementById('qtc.results').innerHTML = "Corrected QT Interval: "+num_qtc+" msec";
};

})//END qtccontroller

app.controller('maintainancecontroller',function($scope,$state,$http) {
//Go back to toolkit menu
$scope.gototools = function(){$state.go('app.toolkit')};

$scope.calculatemaintainance = function () {
var weight = document.getElementById('maintainance.weightselector').value;


  if(weight==='kg'){
  //kg
  var val = parseInt(document.getElementById('maintainance.weight').value,10);
  if(val<=10){
  var output_maintain = (val*4);
  var output_bolus = (val*20);
  document.getElementById('maintainance.bolus').innerHTML = "Bolus: " + output_maintain + " mL";
  document.getElementById('maintainance.maintain').innerHTML = "Maintainance: " +output_bolus + " mL/hr";
  }

  if(val>10 && val<=20){
  var output_maintain = ((val-10)*2)+40;
  var output_bolus = (val*20);
  document.getElementById('maintainance.bolus').innerHTML = "Bolus: " + output_maintain + " mL";
  document.getElementById('maintainance.maintain').innerHTML = "Maintainance: " +output_bolus + " mL/hr";
  }

  if(val>20){
  var output_maintain = ((val-20)*1)+60;
  var output_bolus = (val*20);
  document.getElementById('maintainance.bolus').innerHTML = "Bolus: " + output_maintain + " mL";
  document.getElementById('maintainance.maintain').innerHTML = "Maintainance: " +output_bolus + " mL/hr";
  }

  }

  if(weight==='lb'){
  //lb
  var val = parseInt(document.getElementById('maintainance.weight').value,10)*0.453592;
  if(val<=10){
  var output_maintain = (val*4);
  var output_bolus = (val*20);
  document.getElementById('maintainance.bolus').innerHTML = "Bolus: " + output_maintain + " mL";
  document.getElementById('maintainance.maintain').innerHTML = "Maintainance: " +output_bolus + " mL/hr";
  }

  if(val>10 && val<=20){
  var output_maintain = ((val-10)*2)+40;
  var output_bolus = (val*20);
  document.getElementById('maintainance.bolus').innerHTML = "Bolus: " + output_maintain + " mL";
  document.getElementById('maintainance.maintain').innerHTML = "Maintainance: " +output_bolus + " mL/hr";
  }

  if(val>20){
  var output_maintain = ((val-20)*1)+60;
  var output_bolus = (val*20);
  document.getElementById('maintainance.bolus').innerHTML = "Bolus: " + output_maintain + " mL";
  document.getElementById('maintainance.maintain').innerHTML = "Maintainance: " +output_bolus + " mL/hr";
  }
  }

  if(weight==='g'){
  //g
  var val = parseInt(document.getElementById('maintainance.weight').value,10)/1000;
  if(val<=10){
  var output_maintain = (val*4);
  var output_bolus = (val*20);
  document.getElementById('maintainance.bolus').innerHTML = "Bolus: " + output_maintain + " mL";
  document.getElementById('maintainance.maintain').innerHTML = "Maintainance: " +output_bolus + " mL/hr";
  }

  if(val>10 && val<=20){
  var output_maintain = ((val-10)*2)+40;
  var output_bolus = (val*20);
  document.getElementById('maintainance.bolus').innerHTML = "Bolus: " + output_maintain + " mL";
  document.getElementById('maintainance.maintain').innerHTML = "Maintainance: " +output_bolus + " mL/hr";
  }

  if(val>20){
  var output_maintain = ((val-20)*1)+60;
  var output_bolus = (val*20);
  document.getElementById('maintainance.bolus').innerHTML = "Bolus: " + output_maintain + " mL";
  document.getElementById('maintainance.maintain').innerHTML = "Maintainance: " +output_bolus + " mL/hr";
  }
  }
};//END calculatemaintainance

})//END maintainancecontroller

app.controller('osmolalitycontroller',function($scope,$state,$http) {
//Go back to toolkit menu
$scope.gototools = function(){$state.go('app.toolkit')};

$scope.calculateosmo = function () {
  var selector = document.getElementById('osmo.selector').value;

  if(selector==='SI'){
  //SI
  var osm = (2 * parseInt(document.getElementById('osmo.sodium').value)) + (parseInt(document.getElementById('osmo.urea').value)) + (parseInt(document.getElementById('osmo.glucose').value));
  var outnum = Math.ceil(osm*100);
  outnum = outnum/100;
  document.getElementById('osmo.results').innerHTML = "Serum osmolality: "+ outnum+" mOsm/kg";
  }

  if(selector==='US'){
  //US
  var osm = (2 * parseInt(document.getElementById('osmo.sodium').value)) + (parseInt(document.getElementById('osmo.urea').value)/ 2.8)+ (parseInt(document.getElementById('osmo.glucose').value)/18);
  var outnum = Math.ceil(osm*100);
  outnum = outnum/100;
  document.getElementById('osmo.results').innerHTML = "Serum osmolality: "+ outnum+" mOsm/kg";
  }
};
})//END osmolalitycontroller

app.controller('burnscontroller',function($scope,$state,$http) {
$scope.gototools = function(){$state.go('app.toolkit')};

$scope.calculateburns = function () {
var selector = document.getElementById('burns.selector').value;

if(selector==='kg'){
var burn = (parseInt(document.getElementById('burns.body').value) * parseInt(document.getElementById('burns.weight').value)*4)/1000;
var output_burns = Math.ceil(burn*100);
output_burns = output_burns/100;
document.getElementById('burns.results').innerHTML = "Total fluid requirements: "+output_burns+" L";
}

if(selector==='lb'){
var burn = (parseInt(document.getElementById('burns.body').value) * parseInt(document.getElementById('burns.weight').value)*4*0.453592)/1000;
var output_burns = Math.ceil(burn*100);
output_burns = output_burns/100;
document.getElementById('burns.results').innerHTML = "Total fluid requirements: "+output_burns+" L";
}

if(selector==='g'){
var burn = (((parseInt(document.getElementById('burns.body').value) * parseInt(document.getElementById('burns.weight').value))/1000)*4)/1000;
var output_burns = Math.ceil(burn*100);
output_burns = output_burns/100;
document.getElementById('burns.results').innerHTML = "Total fluid requirements: "+output_burns+" L";
}

};
})//END burnscontroller

app.controller('mapcontroller',function($scope,$state,$http) {
$scope.gototools = function(){$state.go('app.toolkit')};

$scope.calculatemap = function () {
var map = ((parseInt(document.getElementById('map.sbp').value)/3)+(parseInt(document.getElementById('map.dbp').value)*2)/3);
map = Math.ceil(map*100);
map = map/100;
document.getElementById('map.results').innerHTML = "Mean Arterial Pressure: "+map+" mm Hg";
};

})//END mapcontroller

app.controller('bicarbonatecontroller',function($scope,$state,$http) {
$scope.gototools = function(){$state.go('app.toolkit')};

$scope.calculatebicarbonate = function () {
var selector = document.getElementById('bicarbonate.selector').value;

if(selector==='kg'){
var bicarbs = 0.4*parseInt(document.getElementById('bicarbonate.weight').value)*(24-parseInt(document.getElementById('bicarbonate.level').value));
var output = Math.ceil(bicarbs*100);
output = output/100;
document.getElementById('bicarbonate.results').innerHTML = "Bicarbonate deficit: " +output+ " mEq/L";
}

if(selector==='lb'){
var bicarbs = 0.4*0.453592*parseInt(document.getElementById('bicarbonate.weight').value)*(24-parseInt(document.getElementById('bicarbonate.level').value));
var output = Math.ceil(bicarbs*100);
output = output/100;
document.getElementById('bicarbonate.results').innerHTML = "Bicarbonate deficit: " +output+ " mEq/L";
}

if(selector==='g'){
var bicarbs = (0.4*parseInt(document.getElementById('bicarbonate.weight').value)*(24-parseInt(document.getElementById('bicarbonate.level').value)))/1000;
var output = Math.ceil(bicarbs*100);
output = output/100;
document.getElementById('bicarbonate.results').innerHTML = "Bicarbonate deficit: " +output+ " mEq/L";
}

};

})//END bicarbonatecontroller


app.controller('energycontroller',function($scope,$state,$http) {
$scope.gototools = function(){$state.go('app.toolkit')};

$scope.calculateenergy = function () {
var gender = document.getElementById('energy.gender').value;
var weightselector = document.getElementById('energy.weightselector').value;

if(gender==='Male'){

if(weightselector==='kg'){
var energy = 66.5 + (13.75*parseInt(document.getElementById('energy.weight').value,10)) + (5.003*parseInt(document.getElementById('energy.height').value,10)) - (parseInt(document.getElementById('energy.age').value,10)*6.775);
var numout_ = Math.ceil(energy*100);
numout_ = numout_/100;
document.getElementById('energy.results').innerHTML = "Men's Basal Energy Expenditure: "+numout_+" kcal/day";
}

if(weightselector==='lb'){
var energy = 66.5 + (13.75*parseInt(document.getElementById('energy.weight').value,10)*0.453592) + (5.003*parseInt(document.getElementById('energy.height').value,10)) - (parseInt(document.getElementById('energy.age').value,10)*6.775);
var numout_ = Math.ceil(energy*100);
numout_ = numout_/100;
document.getElementById('energy.results').innerHTML = "Men's Basal Energy Expenditure: "+numout_+" kcal/day";
}

if(weightselector==='g'){
var energy = 66.5 + (13.75*parseInt(document.getElementById('energy.weight').value,10)/1000) + (5.003*parseInt(document.getElementById('energy.height').value,10)) - (parseInt(document.getElementById('energy.age').value,10)*6.775);
var numout_ = Math.ceil(energy*100);
numout_ = numout_/100;
document.getElementById('energy.results').innerHTML = "Men's Basal Energy Expenditure: "+numout_+" kcal/day";
}
}//END male

if(gender==='Female'){
if(weightselector==='kg'){
var energy = 655.1 + (9.563*parseInt(document.getElementById('energy.weight').value,10)) + (1.850*parseInt(document.getElementById('energy.height').value,10)) - (parseInt(document.getElementById('energy.age').value,10)*4.676);
var numout_ = Math.ceil(energy*100);
numout_ = numout_/100;
document.getElementById('energy.results').innerHTML = "Men's Basal Energy Expenditure: "+numout_+" kcal/day";
}

if(weightselector==='lb'){
var energy = 655.1 + (9.563*parseInt(document.getElementById('energy.weight').value,10)*0.453592) + (1.850*parseInt(document.getElementById('energy.height').value,10)) - (parseInt(document.getElementById('energy.age').value,10)*4.676);
var numout_ = Math.ceil(energy*100);
numout_ = numout_/100;
document.getElementById('energy.results').innerHTML = "Men's Basal Energy Expenditure: "+numout_+" kcal/day";
}

if(weightselector==='g'){
var energy = 655.1 + (9.563*parseInt(document.getElementById('energy.weight').value,10)/1000) + (1.850*parseInt(document.getElementById('energy.height').value,10)) - (parseInt(document.getElementById('energy.age').value,10)*4.676);
var numout_ = Math.ceil(energy*100);
numout_ = numout_/100;
document.getElementById('energy.results').innerHTML = "Men's Basal Energy Expenditure: "+numout_+" kcal/day";
}
}//END female

};

})//END energycontroller

app.controller('gapcontroller',function($scope,$state,$http) {
$scope.gototools = function(){$state.go('app.toolkit')};

$scope.calculategap = function () {
var out_gap = parseInt(document.getElementById('gap.sodium').value)-(parseInt(document.getElementById('gap.chloride').value)+parseInt(document.getElementById('gap.bicarbonate').value));
out_gap = Math.ceil(out_gap*100);
out_gap = out_gap/100;
document.getElementById('gap.results').innerHTML = "Anion gap: "+out_gap+" mEq/L";
};

})//END gapcontroller

app.controller('bsacontroller',function($scope,$state,$http) {
$scope.gototools = function(){$state.go('app.toolkit')};

$scope.calculatebsa= function () {
var weightselector = document.getElementById('bsa.selector').value;

if(weightselector==='kg'){
var bsa = Math.sqrt((parseInt(document.getElementById('bsa.height').value,10)*(parseInt(document.getElementById('bsa.weight').value,10))/3600));
var bmi = (parseInt(document.getElementById('bsa.weight').value,10))/(((parseInt(document.getElementById('bsa.height').value,10))/100)*((parseInt(document.getElementById('bsa.height').value,10))/100));
var output_ = Math.ceil(bsa*100);
output_ = output_/100;
var output_2 = Math.ceil(bmi*100);
output_2 = output_2/100;
document.getElementById('bsa.resultsone').innerHTML = "BSA: "+output_;
document.getElementById('bsa.resultstwo').innerHTML = "BMI: "+output_2;
}

if(weightselector==='lb'){
var bsa = Math.sqrt((parseInt(document.getElementById('bsa.height').value,10)*(parseInt(document.getElementById('bsa.weight').value,10)*0.453592)/3600));
var bmi = (parseInt(document.getElementById('bsa.weight').value,10)*0.453592)/(((parseInt(document.getElementById('bsa.height').value,10))/100)*((parseInt(document.getElementById('bsa.height').value,10))/100));
var output_ = Math.ceil(bsa*100);
output_ = output_/100;
var output_2 = Math.ceil(bmi*100);
output_2 = output_2/100;
document.getElementById('bsa.resultsone').innerHTML = "BSA: "+output_;
document.getElementById('bsa.resultstwo').innerHTML = "BMI: "+output_2;
}

if(weightselector==='g'){
var bsa = Math.sqrt((parseInt(document.getElementById('bsa.height').value,10)*(parseInt(document.getElementById('bsa.weight').value,10))/3600))/1000;
var bmi = ((parseInt(document.getElementById('bsa.weight').value,10))/(((parseInt(document.getElementById('bsa.height').value,10))/100)*((parseInt(document.getElementById('bsa.height').value,10))/100))/1000);
var output_ = Math.ceil(bsa*100);
output_ = output_/100;
var output_2 = Math.ceil(bmi*100);
output_2 = output_2/100;
document.getElementById('bsa.resultsone').innerHTML = "BSA: "+output_;
document.getElementById('bsa.resultstwo').innerHTML = "BMI: "+output_2;
}

};

})//END bsacontroller

app.controller('pregcontroller',function($scope,$state,$http,ionicDatePicker) {
$scope.gototools = function(){$state.go('app.toolkit')};
var pog = document.getElementById('preg.pog').value;

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

//Set retrieved date on LMP button
document.getElementById('preg.lmp').innerHTML = day+" "+month+" "+year;

//CALCULATIONS LOGIC

//Count from LMP to EDD generating POG alongside
var date = new Date(val);
date.setDate(date.getDate() + 280);
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

//Set EDD value to EDD button
document.getElementById('preg.edd').innerHTML = (date.getUTCDate()+1).toString() + " " + month[date.getUTCMonth()]+" "+date.getUTCFullYear().toString();

//Calculate the POG
var today = new Date();
var selected_lmp = new Date(val);
var timeDiff = Math.abs(today.getTime() - selected_lmp.getTime());
//Difference in weeks
var diffWeeks = Math.ceil(timeDiff / (1000 * 3600 * 24 * 7));

//Set POG value to POG textfield
document.getElementById('preg.pog').innerHTML = diffWeeks+ " weeks";


//CALCULATIONS LOGIC

},

      from: new Date(2015, 1, 1), //Optional
      to: new Date(2100, 10, 30), //Optional
      inputDate: new Date(),      //Optional
      mondayFirst: true,          //Optional
      disableWeekdays: [0],       //Optional
      closeOnSelect: false,       //Optional
      templateType: 'popup'       //Optional
};

var ipObj2 = {
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

//Set retrieved date on EDD button
document.getElementById('preg.edd').innerHTML = day+" "+month+" "+year;

//CALCULATIONS LOGIC

//Count from EDD to LMP generating POG alongside
var date = new Date(val);
date.setDate(date.getDate() - 280);
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

//Set EDD value to EDD button
document.getElementById('preg.lmp').innerHTML = (date.getUTCDate()+1).toString() + " " + month[date.getUTCMonth()]+" "+date.getUTCFullYear().toString();

//Calculate the POG
var today = new Date();
var timeDiff = Math.abs(today.getTime() - date.getTime());
//Difference in weeks
var diffWeeks = Math.ceil(timeDiff / (1000 * 3600 * 24 * 7));

//Set POG value to POG textfield
document.getElementById('preg.pog').innerHTML = diffWeeks+ " weeks";


//CALCULATIONS LOGIC

},

      from: new Date(2015, 1, 1), //Optional
      to: new Date(2100, 10, 30), //Optional
      inputDate: new Date(),      //Optional
      mondayFirst: true,          //Optional
      disableWeekdays: [0],       //Optional
      closeOnSelect: false,       //Optional
      templateType: 'popup'       //Optional
};

 //Open datepicker upon request
 $scope.openDatePicker = function(){
 ionicDatePicker.openDatePicker(ipObj1);
 };

  //Open datepicker upon request
 $scope.openDatePicker2 = function(){
 ionicDatePicker.openDatePicker(ipObj2);
 };

$scope.LMP = function () {
$scope.openDatePicker();
};

$scope.EDD = function () {
$scope.openDatePicker2();
};

})//END pregcontroller

//---------------------------TOOLKIT CONTROLLERS--------------------------------//

app.controller('summarycontroller',function($scope, $ionicLoading, $ionicModal, $timeout, $state,$ionicPopup,ionicDatePicker,smarthealth) {
  //var clientc = new WindowsAzure.MobileServiceClient('https://smarthealthsolutions.azure-mobile.net/', 'nrFwbzJBHoGRjhHkBQvRnOxEWwsdVu91'),
  //consultationsTable = clientc.getTable('smarthealthconsultations');
  $scope.consultations = [];
  $scope.summary = {};
    var firebase_reference = new Firebase(smarthealth.DATABASE_URL_SMARTHEALTHCONSULTATIONS());


$scope.$on('$ionicView.enter', function() {
  $scope.loading = $ionicLoading.show({
    content: '<i class="icon ion-loading-c"></i>',
    animation: 'fade-in',
    showBackdrop: true,
    maxWidth: 50,
    showDelay: 0
  });
  $scope.load_summary();
  $timeout(function(){
  $scope.load_summary();
  }, 1000);
  $ionicLoading.hide();

});//End ionicView onEnter

$scope.load_summary = function(){
firebase_reference.child(window.localStorage.getItem('patientid')).on("child_added", function(snapshot, prevChildKey) {
var summary_object = snapshot.val();
$scope.summary.dmcheck = summary_object.dmstate;
$scope.summary.dmtext = summary_object.dmtext;
$scope.summary.hbpcheck = summary_object.hbpstate;
$scope.summary.hbptext = summary_object.hbptext;
$scope.summary.asthmacheck = summary_object.asthmastate;
$scope.summary.asthmatext = summary_object.asthmatext;
$scope.summary.otherscheck = summary_object.othersstate;
$scope.summary.otherstext = summary_object.otherstext;
$scope.summary.pastsurgicaltext = summary_object.pastsurgical;
$scope.summary.allergycheck = summary_object.allergystate;
$scope.summary.allergytext = summary_object.allergytext;
$scope.summary.drugone = summary_object.drugone;
$scope.summary.drugtwo = summary_object.drugtwo;
$scope.summary.drugthree = summary_object.drugthree;
$scope.summary.familyhistory = summary_object.familyhistory;
$scope.summary.smokingcheck = summary_object.smokingstate;
$scope.summary.smokingtext = summary_object.smokingtext;
$scope.summary.alcoholcheck = summary_object.alcoholstate;
$scope.summary.alcoholtext = summary_object.alcoholtext;
$scope.summary.drugabusecheck = summary_object.drugabusestate;
$scope.summary.drugabusetext = summary_object.drugabusetext;
$scope.summary.travelcheck = summary_object.travelstate;
$scope.summary.traveltext= summary_object.traveltext;
$scope.summary.sexualcheck = summary_object.sexualstate;
$scope.summary.sexualtext = summary_object.sexualtext;
});

};//End load_summary

})//END summarycontroller

app.controller('inbuiltbrowsercontroller',function($scope,$state,$http,$window) {
$scope.redirect = function(){
window.open("https://www.nice.org.uk/guidance/published?type=cg", '_blank');
window.focus();
};
})//END inbuiltbrowsercontroller

app.controller('patientfilecontroller',function($scope,$state,$http) {

//Close patient file and go back to doctor dashboard
$scope.closepatientfile = function(){

window.localStorage.setItem('dashboardtype','doctor');

//Clear off sidemenu items
for(var i = 0; i < $scope.items.length ; i++){
$scope.items.splice(i,$scope.items.length);
}
$scope.itemsxz = [];

itemsxz = [
{title:'News Feed',subtitle:'Popular medications',sheet:'newsfeed',image:'img/newsfeed.png'},
{title:'My details',subtitle:'Basic information',sheet:'doctordetails',image:'img/mydetails.png'},
{title:'Patient Manager',subtitle:'Access patient data',sheet:'patientmanager',image:'img/search.png'},
{title:'Appointments',subtitle:'Agenda manager',sheet:'appointments',image:'img/myappointments.png'},
{title:'Browser',subtitle:'Stay medically upto date',sheet:'inbuiltbrowser',image:'img/google.png'},
{title:'Logout',subtitle:'Exit main menu',sheet:'mainscreen',image:'img/ic_whats_hot.png'}
];

angular.forEach(itemsxz, function(item){
$scope.items.push(item);
});
//$state.go('app.newsfeed');
$state.go('patientlogout');
};

})//END patientfilecontroller()

app.controller('patientlogoutcontroller',function($scope,$state){
$scope.items = [];
$scope.itemsxo = [];
$scope.logoutok = function(){
$state.go('app.clinicalmodule');
};
})//END patientlogoutcontroller()

app.controller('clearsuccessfulcontroller',function($scope,$state,$ionicHistory,$timeout){
$scope.clearok = function(){
var RESET = "";
var FALSE = "false";

//COMPLAINTS
window.localStorage.setItem("dmtext",RESET);
window.localStorage.setItem("hbptext",RESET);
window.localStorage.setItem("asthmatext",RESET);
window.localStorage.setItem("otherstext",RESET);
window.localStorage.setItem("pastsurgical",RESET);
window.localStorage.setItem("presentingone",RESET);
window.localStorage.setItem("presentingtwo",RESET);
window.localStorage.setItem("presentingthree",RESET);
window.localStorage.setItem("historyone",RESET);
window.localStorage.setItem("historytwo",RESET);
window.localStorage.setItem("historythree",RESET);
window.localStorage.setItem("dmstate",FALSE);
window.localStorage.setItem("hbpstate",FALSE);
window.localStorage.setItem("asthmastate",FALSE);
window.localStorage.setItem("othersstate",FALSE);

//OTHER COMPLAINTS
window.localStorage.setItem("allergytext",RESET);
window.localStorage.setItem("drugone",RESET);
window.localStorage.setItem("drugtwo",RESET);
window.localStorage.setItem("drugthree",RESET);
window.localStorage.setItem("drughistory",RESET);
window.localStorage.setItem("familyhistory",RESET);
window.localStorage.setItem("smokingtext",RESET);
window.localStorage.setItem("alcoholtext",RESET);
window.localStorage.setItem("drugabusetext",RESET);
window.localStorage.setItem("traveltext",RESET);
window.localStorage.setItem("sexualtext",RESET);
window.localStorage.setItem("allergystate",FALSE);
window.localStorage.setItem("smokingstate",FALSE);
window.localStorage.setItem("alcoholstate",FALSE);
window.localStorage.setItem("drugabusestate",FALSE);
window.localStorage.setItem("travelstate",FALSE);
window.localStorage.setItem("sexualstate",FALSE);

//VITALS
window.localStorage.setItem("bloodpressure",RESET);
window.localStorage.setItem("pulse",RESET);
window.localStorage.setItem("temperature",RESET);
window.localStorage.setItem("respiratoryrate",RESET);
window.localStorage.setItem("spotwo",RESET);
window.localStorage.setItem("pallortext",RESET);
window.localStorage.setItem("cyanosistext",RESET);
window.localStorage.setItem("jaundicetext",RESET);
window.localStorage.setItem("clubbingtext",RESET);
window.localStorage.setItem("othervitalfindings",RESET);
window.localStorage.setItem("pallorstate",FALSE);
window.localStorage.setItem("cyanosisstate",FALSE);
window.localStorage.setItem("jaundicestate",FALSE);
window.localStorage.setItem("clubbingstate",FALSE);

//MDPARTONE
window.localStorage.setItem("rsinspection",RESET);
window.localStorage.setItem("rspalpation",RESET);
window.localStorage.setItem("rspercussion",RESET);
window.localStorage.setItem("rsauscultation",RESET);
window.localStorage.setItem("cvsinspection",RESET);
window.localStorage.setItem("cvspalpation",RESET);
window.localStorage.setItem("cvspercussion",RESET);
window.localStorage.setItem("cvsauscultation",RESET);
window.localStorage.setItem("gitinspection",RESET);
window.localStorage.setItem("gitpalpation",RESET);
window.localStorage.setItem("gitpercussion",RESET);
window.localStorage.setItem("gitauscultation",RESET);

//MDPARTTWO
window.localStorage.setItem("cranialnerve",RESET);
window.localStorage.setItem("neurospeech",RESET);
window.localStorage.setItem("motorsystem",RESET);
window.localStorage.setItem("sensorysystem",RESET);
window.localStorage.setItem("meningealsigns",RESET);
window.localStorage.setItem("othermedicalfindings",RESET);

//INVESTIGATIONS
window.localStorage.setItem("fbctext",RESET);
window.localStorage.setItem("uetext",RESET);
window.localStorage.setItem("creatininetext",RESET);
window.localStorage.setItem("fbstext",RESET);
window.localStorage.setItem("fsltext",RESET);
window.localStorage.setItem("tgtext",RESET);
window.localStorage.setItem("urictext",RESET);
window.localStorage.setItem("otherinvestigationstext",RESET);
window.localStorage.setItem("treatment",RESET);
window.localStorage.setItem("imagingtext",RESET);
window.localStorage.setItem("patientreview",RESET);
window.localStorage.setItem("fbcstate",FALSE);
window.localStorage.setItem("uestate",FALSE);
window.localStorage.setItem("creatininestate",FALSE);
window.localStorage.setItem("fbsstate",FALSE);
window.localStorage.setItem("fslstate",FALSE);
window.localStorage.setItem("tgstate",FALSE);
window.localStorage.setItem("uricstate",FALSE);
window.localStorage.setItem("otherinvestigationsstate",FALSE);
window.localStorage.setItem("imagingstate",FALSE);

//OBSINFO
window.localStorage.setItem("lmp",RESET);
window.localStorage.setItem("gravindex",RESET);
window.localStorage.setItem("pastobstetric",RESET);
window.localStorage.setItem("menstrual",RESET);
window.localStorage.setItem("marital",RESET);

//OBSEXAM
window.localStorage.setItem("obsinspection",RESET);
window.localStorage.setItem("fundalheight",RESET);
window.localStorage.setItem("fundalgrip",RESET);
window.localStorage.setItem("rightlateral",RESET);
window.localStorage.setItem("leftlateral",RESET);
window.localStorage.setItem("pawlik",RESET);
window.localStorage.setItem("deeppelvic",RESET);
window.localStorage.setItem("foetalheartsound",RESET);
window.localStorage.setItem("vaginalexam",RESET);

//GYNAEINFO
window.localStorage.setItem("menstrual",RESET);
window.localStorage.setItem("marital",RESET);
window.localStorage.setItem("gravindex",RESET);
window.localStorage.setItem("pastobstetric",RESET);

//GYNAEEXAM
window.localStorage.setItem("pelvicexamination",RESET);
window.localStorage.setItem("externalgenitalia",RESET);
window.localStorage.setItem("speculum",RESET);
window.localStorage.setItem("bimanual",RESET);

//PAEDSINFO
window.localStorage.setItem("informant",RESET);
window.localStorage.setItem("birthhistory",RESET);
window.localStorage.setItem("socioeconomic",RESET);
window.localStorage.setItem("developmental",RESET);
window.localStorage.setItem("immunization",RESET);

//PAEDS VITALS
window.localStorage.setItem("consciousness",RESET);
window.localStorage.setItem("pulse",RESET);
window.localStorage.setItem("bloodpressure",RESET);
window.localStorage.setItem("temperature",RESET);
window.localStorage.setItem("skincondition",RESET);
window.localStorage.setItem("arthropometry",RESET);
window.localStorage.setItem("jugularpressure",RESET);
window.localStorage.setItem("otherpaedsfindings",RESET);
window.localStorage.setItem("thyroidgland",RESET);
window.localStorage.setItem("paedscomments",RESET);

//PSY INFO
window.localStorage.setItem("childhood",RESET);
window.localStorage.setItem("adolescence",RESET);
window.localStorage.setItem("academics",RESET);
window.localStorage.setItem("otherpsyfindings",RESET);
window.localStorage.setItem("personalitybeforeillness",RESET);
window.localStorage.setItem("socialcircumstances",RESET);

//PSYEXAM
window.localStorage.setItem("appearance",RESET);
window.localStorage.setItem("behaviour",RESET);
window.localStorage.setItem("speech",RESET);
window.localStorage.setItem("thoughtcontent",RESET);
window.localStorage.setItem("mood",RESET);
window.localStorage.setItem("delusiontext",RESET);
window.localStorage.setItem("hallucinationtext",RESET);
window.localStorage.setItem("illusiontext",RESET);
window.localStorage.setItem("thoughtinterference",RESET);
window.localStorage.setItem("cognitive",RESET);
window.localStorage.setItem("insights",RESET);
window.localStorage.setItem("judgement",RESET);
window.localStorage.setItem("delusionstate",FALSE);
window.localStorage.setItem("hallucinationstate",FALSE);
window.localStorage.setItem("illusionstate",FALSE);

//ENT ONE
window.localStorage.setItem("preauricular",RESET);
window.localStorage.setItem("pinna",RESET);
window.localStorage.setItem("postauricular",RESET);
window.localStorage.setItem("externalearcanal",RESET);
window.localStorage.setItem("tympanicmembrane",RESET);
window.localStorage.setItem("noseexternalexamination",RESET);
window.localStorage.setItem("nasalairway",RESET);
window.localStorage.setItem("anteriorrhinoscopy",RESET);
window.localStorage.setItem("posteriorrhinoscopy",RESET);
window.localStorage.setItem("orodental",RESET);;
window.localStorage.setItem("oralcavity",RESET);
window.localStorage.setItem("tonsilspillars",RESET);
window.localStorage.setItem("posteriorpharynx",RESET);

//ENT TWO
window.localStorage.setItem("directlaryngoscopy",RESET);
window.localStorage.setItem("indirectlaryngoscopy",RESET);
window.localStorage.setItem("otherentfindings",RESET);

//OPTHALEXAM
window.localStorage.setItem("visualacuity",RESET);
window.localStorage.setItem("headposture",RESET);
window.localStorage.setItem("eyebrowslids",RESET);
window.localStorage.setItem("lacrimal",RESET);
window.localStorage.setItem("conjunctiva",RESET);
window.localStorage.setItem("sclera",RESET);
window.localStorage.setItem("cornea",RESET);
window.localStorage.setItem("anteriorchamber",RESET);
window.localStorage.setItem("lens",RESET);
window.localStorage.setItem("fundus",RESET);
window.localStorage.setItem("otheropthalfindings",RESET);

//ORTHOEXAM
window.localStorage.setItem("orthoinspection",RESET);
window.localStorage.setItem("orthopalpation",RESET);
window.localStorage.setItem("orthomovements",RESET);
window.localStorage.setItem("orthomeasurements",RESET);
window.localStorage.setItem("otherorthofindings",RESET);

//NOTE
window.localStorage.setItem("notetitle",RESET);
window.localStorage.setItem("notecontent",RESET);

//Initialize key sequencing
window.localStorage.setItem("memalloc","0:0:0:0:1:1:0:1:0:0:0:0:0:0:0:1:1:1:0:0:0:0:0:0:1:1");

$state.go('app.newconsultation');
};
})

;//END angular controller
