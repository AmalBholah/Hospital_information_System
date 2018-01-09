var app = angular.module('starter', ['ionic','ionic-datepicker','ionic-timepicker','percentCircle-directive','ngTagsInput','flexcalendar']);


/**
 * Manages user login
 */
app.controller('logincontroller', function($scope,$ionicLoading,$ionicActionSheet,$ionicModal,ionicDatePicker, $timeout, $state,$ionicPopup,Utilities,smarthealth) {


    $scope.login = {};

    $scope.$on("$ionicView.enter",function(){
    $scope.login = {};
    });//END $ionicView.enter

    //Detect enter key press on login form
    $scope.myFunct = function(keyEvent) {
        if (keyEvent.which === 13){
            var login = ({username:$scope.login.username,password:$scope.login.password});
            $scope.dologin(login);
        }


    }


    /**
     * Login form has been submitted
     */
    $scope.dologin = function (login) {
    var IS_REGISTERED = false;
      if(login.username==""||login.username==null||login.password==""||login.password==null){
          UIkit.notification("Please fill in all fields", {pos: 'top-right'});
      }else{
        //Submitted Form seems correct -- verify access in tbluseraccess
          $scope.loading = $ionicLoading.show({
              content: '<i class="icon ion-loading-c"></i>',
              animation: 'fade-in',
              showBackdrop: true,
              maxWidth: 50,
              showDelay: 0
          });

          //Load user access rights
          var DATABASE_ROOT_URL = "https://medisave-a4903.firebaseio.com";
          var firebase_url = DATABASE_ROOT_URL + "/tbluseraccess";
          var firebase_reference = new Firebase(firebase_url);

          firebase_reference.on("child_added", function(snapshot, prevChildKey) {
              var data = snapshot.val();

              if(data==null){
                  $ionicLoading.hide();
              }else{

                  if(login.username == data.username && login.password == data.password){
                      $ionicLoading.hide();
                      IS_REGISTERED = true;

                      if( (data.clinicalmodule==null||data.clinicalmodule==false)&&
                          (data.patientregistration==null||data.patientregistration==false)&&
                          (data.wardmanager==null||data.wardmanager==false)&&
                          (data.goodsreceivednote==null||data.goodsreceivednote==false)&&
                          (data.stockstransfer==null||data.stockstransfer==false)&&
                          (data.dispenser==null||data.dispenser==false)&&
                          (data.laboratory==null||data.laboratory==false)&&
                          (data.secretary==null||data.secretary==false)&&
                          (data.cashier==null||data.cashier==false)&&
                          (data.accountant==null||data.accountant==false)&&
                          (data.adminpanel==null||data.adminpanel==false)&&
                          (data.radiology==null||data.radiology==false)){

UIkit.modal.dialog('<div class="uk-modal-header"><h2 class="uk-modal-title">Smart Health HIS</h2></div><div class="uk-modal-body" uk-overflow-auto><dd>You are already registered as a user but have not been granted access to the HIS Modules. Please contact your administrator/director to obtain required access. Thank you</dd></div>');



                      }else{
                        //User does have access to certain/all modules
                          smarthealth.set_moduleaccess(data);}}}});

          firebase_reference.once("value", function(snap) {
              $ionicLoading.hide();
              if(!IS_REGISTERED){UIkit.notification("You are not registered.", {pos: 'top-right'});}
              if(IS_REGISTERED){

                  smarthealth.set_usercredentials(login.username,login.password);
                  window.localStorage.setItem('doctorid',login.username);
                  window.localStorage.setItem('doctorname',login.username);
                  UIkit.notification("Welcome back "+smarthealth.get_moduleaccess().username + " !", {pos: 'top-right'});
                    document.cookie = JSON.stringify(smarthealth.get_moduleaccess());

                    //Incremental order verification and transfer to view
                  if(smarthealth.get_moduleaccess().clinicalmodule){$state.go('app.clinicalmodule');}else if
                  (smarthealth.get_moduleaccess().patientregistration){$state.go('app.registerpatient');}else if
                  (smarthealth.get_moduleaccess().wardmanager){$state.go('app.wardmanagermain');}else if
                  (smarthealth.get_moduleaccess().goodsreceivednote){$state.go('app.inventorymain');}else if
                  (smarthealth.get_moduleaccess().stockstransfer){$state.go('app.stockstransfermain');}else if
                  (smarthealth.get_moduleaccess().dispenser){$state.go('app.dispensermain');}else if
                  (smarthealth.get_moduleaccess().laboratory){$state.go('app.laboratorymain');}else if
                  (smarthealth.get_moduleaccess().radiology){$state.go('app.radiologymain');}else if
                  (smarthealth.get_moduleaccess().secretary){$state.go('app.secretaryactivepatients');}else if
                  (smarthealth.get_moduleaccess().cashier){$state.go('app.cashieractivepatients');}else if
                  (smarthealth.get_moduleaccess().accountant){$state.go('app.searchgl');}else if
                  (smarthealth.get_moduleaccess().adminpanel){$state.go('app.adminmain');}
              }
          });

      }



    }//END dologin()


    /**
     * User wants to visit our website
     */
    $scope.gotowebsite = function () {
        var win = window.open("https://www.smarthealth.mu/", '_blank');
        win.focus();
    }//END gotowebsite() https://www.smarthealth.mu/

})//END logincontroller()

/**
 * Manages navigation sidemenu view hierarchy
 */
app.controller('navigationcontroller', function($scope,$rootScope,$ionicLoading,$ionicActionSheet,$ionicModal,ionicDatePicker, $timeout, $state,$ionicPopup,Utilities,smarthealth) {

  $scope.items = [];

  $scope.run_navigationconfiguration = function () {
        /**
         * Repetitive codeblock
         * @type {CODEBLOCK}
         */


        $scope.items = [];

        if(smarthealth.get_moduleaccess()!=null){

            if(smarthealth.get_moduleaccess().clinicalmodule){$scope.items.push(({title:'Clinical Module',subtitle:'Medical EMR',sheet:'clinicalmodule',image:'img/mydetails.png'}));}
            if(smarthealth.get_moduleaccess().patientregistration){$scope.items.push(({title:'Patient Registration',subtitle:'Register/search patients',sheet:'registerpatient',image:'img/mydetails.png'}));}
            if(smarthealth.get_moduleaccess().wardmanager){$scope.items.push(({title:'Ward Manager',subtitle:'Manages Inpatients',sheet:'wardmanagermain',image:'img/mydetails.png'}));}
            if(smarthealth.get_moduleaccess().goodsreceivednote){$scope.items.push(({title:'Goods Received Note',subtitle:'Create stock items',sheet:'inventorymain',image:'img/mydetails.png'}));}
            if(smarthealth.get_moduleaccess().stockstransfer){$scope.items.push(({title:'Stocks Transfer',subtitle:'Transfer stock items',sheet:'stockstransfermain',image:'img/mydetails.png'}));}
            if(smarthealth.get_moduleaccess().dispenser){$scope.items.push(({title:'Dispenser',subtitle:'Dispense stock items',sheet:'dispensermain',image:'img/mydetails.png'}));}
            if(smarthealth.get_moduleaccess().laboratory){$scope.items.push(({title:'Laboratory',subtitle:'Laboratory Billing',sheet:'laboratorymain',image:'img/mydetails.png'}));}

            if(smarthealth.get_moduleaccess().radiology){$scope.items.push(({title:'Radiology',subtitle:'Radiological Billing',sheet:'radiologymain',image:'img/mydetails.png'}));}

            if(smarthealth.get_moduleaccess().secretary){$scope.items.push(({title:'Secretary',subtitle:'Adds other bills',sheet:'secretaryactivepatients',image:'img/mydetails.png'}));}
            if(smarthealth.get_moduleaccess().cashier){$scope.items.push(({title:'Cashier',subtitle:'Handles payments',sheet:'cashieractivepatients',image:'img/mydetails.png'}));}
            if(smarthealth.get_moduleaccess().accountant){$scope.items.push(({title:'Accountant',subtitle:'Accountant Manager',sheet:'searchgl',image:'img/mydetails.png'}));}
            if(smarthealth.get_moduleaccess().adminpanel){$scope.items.push(({title:'Admin Panel',subtitle:'Perform admin tasks',sheet:'adminmain',image:'img/mydetails.png'}));}

            //Rudimentary option -- no access verification needed
            $scope.items.push(({title:'Logout',subtitle:'Closes this session',sheet:'logout',image:'img/logout.png'}));

            $scope.$apply();
        }

        /**
         * END CODEBLOCK
         */
    }

    $scope.$on("$ionicView.enter",function(){
        //Gets called each time a tab is clicked on the sidemenu
        //var blob = JSON.parse(smarthealth.cleanCookie(document.cookie));
        //smarthealth.set_moduleaccess(blob);
        $scope.run_navigationconfiguration();

    });//END $ionicView.enter

    /**
     * Prevent duplication across modules
     *@clearCache
     */
$scope.clearCache = function(){smarthealth.set_object(null);};

})//END navigationcontroller()

/**
 * Manages user session logout
 */
app.controller('logoutcontroller', function($scope,$ionicLoading,$ionicActionSheet,$ionicModal,ionicDatePicker, $timeout, $state,$ionicPopup,Utilities,smarthealth) {

$scope.dologout = function () {
    UIkit.notification('Logged out successfully', {pos: 'top-right'});
    $state.go('login');
}//END dologout()

})//END logoutcontroller()

app.run(function($ionicPlatform) {
  $ionicPlatform.ready(function() {
    // Hide the accessory bar by default (remove this to show the accessory bar above the keyboard
    // for form inputs)
    if (window.cordova && window.cordova.plugins.Keyboard) {
      cordova.plugins.Keyboard.hideKeyboardAccessoryBar(true);
      cordova.plugins.Keyboard.disableScroll(true);

    }
    if (window.StatusBar) {
      // org.apache.cordova.statusbar required
      StatusBar.styleDefault();
    }
  });
})

app.config(function($stateProvider, $urlRouterProvider) {
  $stateProvider

  .state('app', {
    url: '/app',
    abstract: true,
    templateUrl: 'templates/menu.html',
    controller: 'navigationcontroller'
  })

      .state('app.tblactivepatients', {
          url: '/tblactivepatients',
          views: {
              'menuContent': {
                  templateUrl: 'clinicalmodule/tblactivepatients.html',
                  controller:'tblactivepatientscontroller'
              }
          }
      })

      .state('app.clinicalmodule', {
          url: '/clinicalmodule',
          views: {
              'menuContent': {
                  templateUrl: 'clinicalmodule/clinicalmodule.html',
                  controller:'clinicalmodulecontroller'
              }
          }
      })

  /**
   * PATIENT REGISTRATION CONTROLLERS
  */

  .state('app.registerpatient', {
    url: '/registerpatient',
    views: {
      'menuContent': {
    templateUrl: 'patientregistration/registerpatient.html',
    controller:'registerpatientcontroller'
      }
    }
  })
  .state('searchpatient', {
    url: '/searchpatient',
    templateUrl: 'patientregistration/searchpatient.html',
    controller:'searchpatientcontroller'

  })
    .state('viewclockedinpatients', {
    url: '/viewclockedinpatients',
    templateUrl: 'patientregistration/viewclockedinpatients.html',
    controller:'viewclockedinpatientscontroller'
  })

    .state('searchdoctors', {
    url: '/searchdoctors',
    templateUrl: 'patientregistration/searchdoctors.html',
    controller:'searchdoctorscontroller'
  })

  .state('pastpatients', {
      url: '/pastpatients',
      templateUrl: 'patientregistration/pastpatients.html',
      controller:'pastpatientscontroller'
   })

  /**
   * INVENTORY CONTROLLERS
   */

  .state('app.inventorymain', {
    url: '/inventorymain',
    views: {
      'menuContent': {
    templateUrl: 'inventory/inventorymain.html',
    controller:'inventorymaincontroller'
      }
    }
  })

    .state('inventorysearchstock', {
    url: '/inventorysearchstock',
    templateUrl: 'inventory/inventorysearchstock.html',
    controller:'inventorysearchstockcontroller'
  })

  /**
   * STOCKS TRANSFER CONTROLLERS
   */

  .state('app.stockstransfermain', {
    url: '/stockstransfermain',
    views: {
      'menuContent': {
    templateUrl: 'stockstransfer/stockstransfermain.html',
    controller:'stockstransfermaincontroller'
      }
    }
  })

    .state('searchstockstransfer', {
    url: '/searchstockstransfer',
    templateUrl: 'stockstransfer/searchstockstransfer.html',
    controller:'searchstockstransfercontroller'
  })

    .state('viewstockstransfer', {
    url: '/viewstockstransfer',
    templateUrl: 'stockstransfer/viewstockstransfer.html',
    controller:'viewstockstransfercontroller'
  })

  /**
   * DISPENSER CONTROLLERS
   */

  .state('app.dispensermain', {
    url: '/dispensermain',
    views: {
      'menuContent': {
    templateUrl: 'dispenser/dispensermain.html',
    controller:'dispensermaincontroller'
      }
    }
  })

    .state('dispenseractivepatients', {
    url: '/dispenseractivepatients',
    templateUrl: 'dispenser/dispenseractivepatients.html',
    controller:'dispenseractivepatientscontroller'
  })

    .state('dispensersearchstock', {
    url: '/dispensersearchstock',
    templateUrl: 'dispenser/dispensersearchstock.html',
    controller:'dispensersearchstockcontroller'
  })

    .state('dispenserconsumeditems', {
    url: '/dispenserconsumeditems',
    templateUrl: 'dispenser/dispenserconsumeditems.html',
    controller:'dispenserconsumeditemscontroller'
  })

  /**
   * WARD MANAGER CONTROLLERS
   */
    .state('app.wardmanagermain', {
    url: '/wardmanagermain',
    views: {
    'menuContent': {
    templateUrl: 'wardmanager/wardmanagermain.html',
    controller:'wardmanagermaincontroller'
      }
    }
  })

  .state('wardconfig', {
    url: '/wardconfig',
    templateUrl: 'wardmanager/wardconfig.html',
    controller:'wardconfigcontroller'
  })

  .state('wardactivepatients', {
    url: '/wardactivepatients',
    templateUrl: 'wardmanager/wardactivepatients.html',
    controller:'wardactivepatientscontroller'
  })

  .state('wardviewpatients', {
    url: '/wardviewpatients',
    templateUrl: 'wardmanager/wardviewpatients.html',
    controller:'wardviewpatientscontroller'
  })

  /**
   * LABORATORY CONTROLLERS
   */

  .state('app.laboratorymain', {
    url: '/laboratorymain',
    views: {
    'menuContent': {
    templateUrl: 'laboratory/laboratorymain.html',
    controller:'laboratorymaincontroller'
      }
    }
  })

 .state('laboratoryactivepatients', {
    url: '/laboratoryactivepatients',
    templateUrl: 'laboratory/laboratoryactivepatients.html',
    controller:'laboratoryactivepatientscontroller'

  })

   .state('viewlabtests', {
    url: '/viewlabtests',
    templateUrl: 'laboratory/viewlabtests.html',
    controller:'viewlabtestscontroller'

  })

  /**
   * SECRETARY CONTROLLERS
   */

  .state('app.secretaryactivepatients', {
    url: '/secretaryactivepatients',
    views: {
    'menuContent': {
    templateUrl: 'secretary/secretaryactivepatients.html',
    controller:'secretaryactivepatientscontroller'
    }}
  })

  .state('secretarypatientbill', {
  url: '/secretarypatientbill',
  templateUrl: 'secretary/secretarypatientbill.html',
  controller:'secretarypatientbillcontroller'
  })

  .state('secretarymovementbook', {
  url: '/secretarymovementbook',
  templateUrl: 'secretary/secretarymovementbook.html',
  controller:'secretarymovementbookcontroller'
})

/**
* RADIOLOGY SERVICES
*/

  .state('app.radiologymain', {
    url: '/radiologymain',
    views: {
    'menuContent': {
    templateUrl: 'radiology/radiologymain.html',
    controller:'radiologymaincontroller'
      }
    }
  })

  .state('radiologyactivepatients', {
  url: '/radiologyactivepatients',
  templateUrl: 'radiology/radiologyactivepatients.html',
  controller:'radiologyactivepatientscontroller'
  })

  .state('viewradiologytests', {
  url: '/viewradiologytests',
  templateUrl: 'radiology/viewradiologytests.html',
  controller:'viewradiologytestscontroller'
  })

/**
 * CASHIER CONTROLLERS
 */

  .state('app.cashieractivepatients', {
    url: '/cashieractivepatients',
    views: {
    'menuContent': {
    templateUrl: 'cashier/cashieractivepatients.html',
    controller:'cashieractivepatientscontroller'
    }
  }
  })

  /**
   * ACCOUNTANT CONTROLLERS
   */

  .state('app.searchgl', {
    url: '/searchgl',
    views: {
    'menuContent': {
    templateUrl: 'accountant/searchgl.html',
    controller:'searchglcontroller'
    }
  }
  })

  .state('creategl', {
    url: '/creategl',
    templateUrl: 'accountant/creategl.html',
    controller:'createglcontroller'
  })

  .state('accountcategory', {
    url: '/accountcategory',
    templateUrl: 'accountant/accountcategory.html',
    controller:'accountcategorycontroller'
  })

  .state('viewaccounts', {
    url: '/viewaccounts',
    templateUrl: 'accountant/viewaccounts.html',
    controller:'viewaccountscontroller'
  })

  /**
   * ADMIN PANEL CONTROLLERS
   */

  .state('app.adminmain', {
    url: '/adminmain',
    views: {
    'menuContent': {
    templateUrl: 'adminpanel/adminmain.html',
    controller:'adminmaincontroller'
    }
  }
  })

  .state('facilitymanager', {
    url: '/facilitymanager',
    templateUrl: 'adminpanel/facilitymanager.html',
    controller:'facilitymanagercontroller'
  })

  .state('useraccess', {
    url: '/useraccess',
    templateUrl: 'adminpanel/useraccess.html',
    controller:'useraccesscontroller'
  })

  .state('servicesmanager', {
    url: '/servicesmanager',
    templateUrl: 'adminpanel/servicesmanager.html',
    controller:'servicesmanagercontroller'
  })

  .state('suppliermanager', {
    url: '/suppliermanager',
    templateUrl: 'adminpanel/suppliermanager.html',
    controller:'suppliermanagercontroller'
  })

  .state('bankmanager', {
    url: '/bankmanager',
    templateUrl: 'adminpanel/bankmanager.html',
    controller:'bankmanagercontroller'
  })

  .state('parameters', {
    url: '/parameters',
    templateUrl: 'adminpanel/parameters.html',
    controller:'parameterscontroller'
  })

  .state('mra', {
    url: '/mra',
    templateUrl: 'adminpanel/mra.html',
    controller:'mracontroller'
  })

    /***
     * LOGIN CONTROLLER
     */

      .state('login', {
          url: '/login',
          templateUrl: 'templates/login.html',
          controller:'logincontroller'
      })

     /**
     * LOGOUT CONTROLLER
     */
      .state('app.logout', {
          url: '/logout',
          views: {
              'menuContent': {
                  templateUrl: 'templates/logout.html',
                  controller:'logoutcontroller'
              }
          }
      })


      /**
       * CLINICAL MODULE
       */

.state('app.saveappointments', {
    url: '/saveappointments',
    views: {
        'menuContent': {
          templateUrl: 'clinicalmodule/saveappointments.html',
          controller: 'saveappointmentscontroller'
        }
      }
  })

    .state('mainscreen',{
    url: "/mainscreen",
    templateUrl: "clinicalmodule/mainscreen.html",
    controller: 'AppCtrl'
  })


    .state('reactivatesubscription', {
    url: '/reactivatesubscription',
    templateUrl: 'clinicalmodule/reactivatesubscription.html',
    controller: 'reactivatesubscriptioncontroller'

  })

  .state('notsubscribed',{
    url: "/notsubscribed",
    templateUrl: "clinicalmodule/notsubscribed.html",
    controller: 'notsubscribedcontroller'
  })

    .state('clearsuccessful',{
    url: "/clearsuccessful",
    templateUrl: "clinicalmodule/clearsuccessful.html",
    controller: 'clearsuccessfulcontroller'
  })

  .state('saveconsultation',{
    url: "/saveconsultation",
    templateUrl: "clinicalmodule/saveconsultation.html",
    controller: 'saveconsultationcontroller'
  })

  .state('diagnosticsicd',{
    url: "/diagnosticsicd",
    templateUrl: "clinicalmodule/diagnosticsicd.html",
    controller: 'ICDcontroller'
  })

  .state('addmedications',{
    url: "/addmedications",
    templateUrl: "clinicalmodule/addmedications.html",
    controller: 'addmedicationscontroller'
  })

    .state('registerdoctor',{
    url: "/registerdoctor",
    templateUrl: "clinicalmodule/registerdoctor.html",
    controller: 'AppCtrl'
  })

  .state('app.registerclinicalpatient', {
    url: '/registerclinicalpatient',
    views: {
      'menuContent': {
        templateUrl: 'clinicalmodule/registerclinicalpatient.html',
        controller: 'registerclinicalpatientcontroller'
      }
    }
  })

    .state('assignid',{
    url: "/assignid",
    templateUrl: "clinicalmodule/assignid.html",
  })

  .state('app.search', {
    url: '/search',
    views: {
      'menuContent': {
        templateUrl: 'clinicalmodule/search.html'
      }
    }
  })

  .state('app.browse', {
      url: '/browse',
      views: {
        'menuContent': {
          templateUrl: 'clinicalmodule/browse.html'
        }
      }
    })

    .state('app.playlists', {
      url: '/playlists',
      views: {
        'menuContent': {
          templateUrl: 'clinicalmodule/playlists.html',
          controller: 'PlaylistsCtrl'
        }
      }
    })

    .state('app.subscriptionmanager', {
      url: '/subscriptionmanager',
      views: {
        'menuContent': {
          templateUrl: 'clinicalmodule/subscriptionmanager.html',
          controller: 'suspendsubscriptioncontroller'
        }
      }
    })

    .state('app.newsfeed', {
      url: '/newsfeed',
      views: {
        'menuContent': {
          templateUrl: 'clinicalmodule/newsfeed.html',
          controller: 'newsfeedcontroller'
        }
      }
    })

    .state('app.doctordetails', {
      url: '/doctordetails',
      views: {
        'menuContent': {
          templateUrl: 'clinicalmodule/doctordetails.html',
          controller: 'biodatacontroller'
        }
      }
    })

    .state('app.appointments', {
      url: '/appointments',
      views: {
        'menuContent': {
          templateUrl: 'clinicalmodule/appointments.html',
          controller: 'appointmentscontroller'
        }
      }
    })


  .state('app.downloads', {
      url: '/downloads',
      views: {
        'menuContent': {
          templateUrl: 'clinicalmodule/downloads.html',

        }
      }
    })

  .state('app.closepatientfile', {
      url: '/closepatientfile',
      views: {
        'menuContent': {
          templateUrl: 'clinicalmodule/closepatientfile.html',
          controller: 'patientfilecontroller'
        }
      }
    })
      .state('patientlogout', {
      url: '/patientlogout',
      templateUrl: 'clinicalmodule/patientlogout.html',
    })

      .state('app.inbuiltbrowser', {
      url: '/inbuiltbrowser',
      views: {
        'menuContent': {
          templateUrl: 'clinicalmodule/inbuiltbrowser.html',
          controller: 'inbuiltbrowsercontroller'

        }
      }
    })

    .state('app.patientmanager', {
      url: '/patientmanager',
      views: {
        'menuContent': {
          templateUrl: 'clinicalmodule/patientmanager.html',
          controller: 'patientbiodata'
        }
      }
    })

      .state('app.settings', {
      url: '/settings',
      views: {
        'menuContent': {
          templateUrl: 'clinicalmodule/settings.html',
          controller: 'PlaylistsCtrl'
        }
      }
    })

 .state('app.single', {
    url: '/playlists/:playlistId',
    views: {
      'menuContent': {
        templateUrl: 'clinicalmodule/playlist.html',
        controller: 'PlaylistCtrl'
      }
    }
  })


 //--------------------------------------------------------------------------//
 //--------------------------PATIENT MENU NAVIGATOR--------------------------//
 //--------------------------------------------------------------------------//

.state('app.patientbiodata', {
      url: '/patientbiodata',
      views: {
        'menuContent': {
          templateUrl: 'clinicalmodule/patientbiodata.html',
          controller: 'patientbiodatacontroller'
        }
      }
})

.state('app.patientsummary', {
      url: '/patientsummary',
      views: {
        'menuContent': {
          templateUrl: 'clinicalmodule/patientsummary.html',
          controller: 'summarycontroller'
        }
      }
})

.state('app.newconsultation', {
      url: '/newconsultation',
       views: {
        'menuContent': {
      templateUrl: 'clinicalmodule/newconsultation.html',
      controller: 'newconsultationcontroller'
        }
       }
})

.state('app.removeconsultations', {
    url: '/removeconsultations',
    views: {
      'menuContent': {
        templateUrl: 'clinicalmodule/removeconsultations.html',
        controller: 'removeconsultationscontroller'
      }
    }
  })

.state('app.pastconsultations', {
      url: '/pastconsultations',
      views: {
        'menuContent': {
          templateUrl: 'clinicalmodule/pastconsultations.html',
          controller:'pastconsultationscontroller'
        }
      }
})

.state('app.patientappointment', {
      url: '/patientappointment',
      views: {
        'menuContent': {
          templateUrl: 'clinicalmodule/patientappointment.html',

        }
      }
})


 //--------------------------------------------------------------------------//
 //--------------------------CONSULTATION NAVIGATOR--------------------------//
 //--------------------------------------------------------------------------//

//COMPLAINTS
.state('complaints', {
      url: '/complaints',
         templateUrl: 'clinicalmodule/complaints.html',
         controller: 'complaintscontroller'
})

//OTHER COMPLAINTS
.state('othercomplaints', {
      url: '/othercomplaints',
          templateUrl: 'clinicalmodule/othercomplaints.html',
          controller:'othercomplaintscontroller'

})

//VITALS
.state('vitals', {
      url: '/vitals',
      templateUrl: 'clinicalmodule/vitals.html',
      controller: 'vitalscontroller'

})

//MDPARTONE
.state('mdpartone', {
      url: '/mdpartone',
          templateUrl: 'clinicalmodule/mdpartone.html',
          controller:'mdpartonecontroller'

})

//MDPARTTWO
.state('mdparttwo', {
      url: '/mdparttwo',
          templateUrl: 'clinicalmodule/mdparttwo.html',
          controller: 'mdparttwocontroller'
})

//INVESTIGATIONS
.state('investigations', {
      url: '/investigations',
          templateUrl: 'clinicalmodule/investigations.html',
          controller: 'investigationscontroller'
})

//OBS INFO
.state('obsinfo', {
      url: '/obsinfo',
          templateUrl: 'clinicalmodule/obsinfo.html',
          controller:'obsinfocontroller'
})

//GYNAE INFO
.state('gynaeinfo', {
      url: '/gynaeinfo',
          templateUrl: 'clinicalmodule/gynaeinfo.html',
          controller:'gynaeinfocontroller'
})

//PAEDS INFO
.state('paedsinfo', {
      url: '/paedsinfo',
          templateUrl: 'clinicalmodule/paedsinfo.html',
          controller:'paedsinfocontroller'
})

//PSY INFO
.state('psyinfo', {
      url: '/psyinfo',
          templateUrl: 'clinicalmodule/psyinfo.html',
          controller:'psyinfocontroller'
})

//PAEDS VITALS
.state('paedsgeneralexam', {
      url: '/paedsgeneralexam',
          templateUrl: 'clinicalmodule/paedsgeneralexam.html',
          controller:'paedsvitalscontroller'
})

//ENT ONE
.state('entone', {
      url: '/entone',
          templateUrl: 'clinicalmodule/entone.html',
          controller:'entonecontroller'
})

//ENT TWO
.state('enttwo', {
      url: '/enttwo',
          templateUrl: 'clinicalmodule/enttwo.html',
          controller:'enttwocontroller'
})

//GYNAE EXAM
.state('gynaeexam', {
      url: '/gynaeexam',
          templateUrl: 'clinicalmodule/gynaeexam.html',
          controller:'gynaeexamcontroller'
})

//OBS EXAM
.state('obsexam', {
      url: '/obsexam',
          templateUrl: 'clinicalmodule/obsexam.html',
          controller:'obsexamcontroller'
})

//OPTHAL EXAM
.state('opthalexam', {
      url: '/opthalexam',
          templateUrl: 'clinicalmodule/opthalexam.html',
          controller:'opthalexamcontroller'
})

//ORTHO EXAM
.state('orthoexam', {
      url: '/orthoexam',
          templateUrl: 'clinicalmodule/orthoexam.html',
          controller:'orthoexamcontroller'
})

//PSY EXAM
.state('psyexam', {
      url: '/psyexam',
          templateUrl: 'clinicalmodule/psyexam.html',
          controller:'psyexamcontroller'
})

//NOTE
.state('note', {
      url: '/note',
          templateUrl: 'clinicalmodule/note.html',
          controller:'notecontroller'
})

/*
*RADIOLOGY MODULE
*/

//-----------------------TOOLKIT-------------------------------//

  .state('app.toolkit', {
    url: '/toolkit',
     views: {
        'menuContent': {
    templateUrl: 'clinicalmodule/toolkit.html',
      }
      }
  })
    .state('app.abbreviations', {
    url: '/abbreviations',
     views: {
        'menuContent': {
    templateUrl: 'clinicalmodule/abbreviations.html',
    controller:'abbreviationscontroller'
          }
      }
  })

  .state('app.creatinineclearance', {
    url: '/creatinineclearance',
     views: {
        'menuContent': {
    templateUrl: 'clinicalmodule/creatinineclearance.html',
    controller: 'creatinineclearancecontroller'
          }
      }
  })

  .state('app.qtc', {
    url: '/qtc',
     views: {
        'menuContent': {
    templateUrl: 'clinicalmodule/qtc.html',
    controller: 'qtccontroller'
          }
      }
  })

  .state('app.maintainance', {
    url: '/maintainance',
     views: {
        'menuContent': {
    templateUrl: 'clinicalmodule/maintainance.html',
    controller:'maintainancecontroller'
          }
      }
  })

 .state('app.osmolality', {
    url: '/osmolality',
     views: {
        'menuContent': {
    templateUrl: 'clinicalmodule/osmolality.html',
    controller: 'osmolalitycontroller'
          }
      }
  })

  .state('app.burns', {
    url: '/burns',
     views: {
        'menuContent': {
    templateUrl: 'clinicalmodule/burns.html',
    controller: 'burnscontroller'
          }
      }
  })

  .state('app.map', {
    url: '/map',
     views: {
        'menuContent': {
    templateUrl: 'clinicalmodule/map.html',
    controller:'mapcontroller'
          }
      }
  })

  .state('app.bicarbonate', {
    url: '/bicarbonate',
     views: {
        'menuContent': {
    templateUrl: 'clinicalmodule/bicarbonate.html',
    controller: 'bicarbonatecontroller'
          }
      }
  })

  .state('app.energy', {
    url: '/energy',
     views: {
        'menuContent': {
    templateUrl: 'clinicalmodule/energy.html',
    controller: 'energycontroller'
          }
      }
  })

  .state('app.gap', {
    url: '/gap',
     views: {
        'menuContent': {
    templateUrl: 'clinicalmodule/gap.html',
    controller: 'gapcontroller'
          }
      }
  })

  .state('app.bsa', {
    url: '/bsa',
     views: {
        'menuContent': {
    templateUrl: 'clinicalmodule/bsa.html',
    controller: 'bsacontroller'
          }
      }
  })

  .state('app.preg', {
    url: '/preg',
     views: {
        'menuContent': {
    templateUrl: 'clinicalmodule/preg.html',
    controller: 'pregcontroller'
          }
      }
  })
//-----------------------TOOLKIT-------------------------------//



      /**
       * END CLINICAL MODULE
       */


  //END CONTROLLERS
    $urlRouterProvider.otherwise('/login');
  //$urlRouterProvider.otherwise('/app/registerpatient');



})

/**
 * Custom service routine
 */

app.service("Utilities", function () {

  //Define ID parameter
  var ID;

  //Define FLAG parameter
  var FLAG_STATE = false;

    //NULL filter prevents empty text
    this.NullFilter = function(input) {
    var out = "";
    if(input==null){out = "";}else{out = input;}

    return out;
    };

    //Set User Instance ID
    this.setID = function(input_id){
      ID = input_id;
    }

    //Get User Instance ID
    this.getID = function(){return ID;}

    this.setUpdateFlag = function(){FLAG_STATE = true;};
    this.clearUpdateFlag = function(){FLAG_STATE = false;};
    this.getFlagState = function(){return FLAG_STATE;};

})

app.directive('barcodeScanner', function() {
  return {
    restrict: 'A',
    scope: {
        callback: '=barcodeScanner',
      },
    link:    function postLink(scope, iElement, iAttrs){
        // Settings
        var zeroCode = 48;
        var nineCode = 57;
        var enterCode = 13;
        var minLength = 3;
        var delay = 300; // ms

        // Variables
        var pressed = false;
        var chars = [];
        var enterPressedLast = false;

        // Timing
        var startTime = undefined;
        var endTime = undefined;

        jQuery(document).keypress(function(e) {
            if (chars.length === 0) {
                startTime = new Date().getTime();
            } else {
                endTime = new Date().getTime();
            }

            // Register characters and enter key
            /*if (e.which >= zeroCode && e.which <= nineCode) {
                chars.push(String.fromCharCode(e.which));
            }*/
            chars.push(String.fromCharCode(e.which));
            enterPressedLast = (e.which === enterCode);

            if (pressed == false) {
                setTimeout(function(){
                    if (chars.length >= minLength && enterPressedLast) {
                        var barcode = chars.join('');
                        //console.log('barcode : ' + barcode + ', scan time (ms): ' + (endTime - startTime));

                        if (angular.isFunction(scope.callback)) {
                            scope.$apply(function() {
                                scope.callback(barcode.trim());
                            });
                        }
                    }
                    chars = [];
                    pressed = false;
                },delay);
            }
            pressed = true;
        });
    }
  };
})
app.service("smarthealth", function ($ionicLoading,$timeout,$state,$ionicPopup,$ionicModal,$q) {

  /**
   * CLINICAL MODULE
   */

    var DATABASE_ROOT_URL = "https://medisave-a4903.firebaseio.com";

    this.DATABASE_ROOT_URL = "https://medisave-a4903.firebaseio.com";

    this.DATABASE_URL_DOCTORLOGIN = function () {return DATABASE_ROOT_URL + "/doctorlogin";}

    this.DATABASE_URL_SMARTHEALTHBIODATA = function () {return DATABASE_ROOT_URL + "/smarthealthbiodata";}

    this.DATABASE_URL_PATIENTLOGIN = function () {return DATABASE_ROOT_URL + "/patientlogin";}

    this.DATABASE_URL_SMARTHEALTHDIAGNOSIS = function () {return DATABASE_ROOT_URL + "/smarthealthdiagnosis";}

    this.DATABASE_URL_SMARTHEALTHPRESCRIPTIONS = function () {return DATABASE_ROOT_URL + "/smarthealthprescriptions";}

    this.DATABASE_URL_SMARTHEALTHCONSULTATIONS = function () {return DATABASE_ROOT_URL + "/smarthealthconsultations";}

    this.DATABASE_URL_SMARTHEALTHAPPOINTMENTS = function () {return DATABASE_ROOT_URL + "/smarthealthappointments";}


    //--------------------------------------------------------------------------------------//
    //----------------------------------COMMON LOGIC----------------------------------------//
    //--------------------------------------------------------------------------------------//
    this.handleNext = function(items,position){
        var itm = [];
        itm = items;

        //No next sheets -- limit reached
        if(position+1==itm.length){noNextSheets();}
        if(position+1<itm.length){
            sheet_item = itm[position+1].title;
            navigate();}};

    this.handlePrevious = function(items,position){
        var itm = [];
        itm = items;

        //No previous sheets -- limit reached


        if(position-1 <0){noPreviousSheets();}else
        {
            sheet_item = itm[position-1].title;
            navigate();}};

function navigate() {
    if(sheet_item==='Obstetrics'){$state.go('obsinfo');}
    if(sheet_item==='Gynaecology'){$state.go('gynaeinfo');}
    if(sheet_item==='Paediatrics'){$state.go('paedsinfo');}
    if(sheet_item==='Psychiatry'){$state.go('psyinfo');}
    if(sheet_item==='Complaints'){$state.go('complaints');}
    if(sheet_item==='Other complaints'){$state.go('othercomplaints');}
    if(sheet_item==='Paediatric Vitals'){$state.go('paedsgeneralexam');}
    if(sheet_item==='Vitals'){$state.go('vitals');}
    if(sheet_item==='Ear Nose Throat'){$state.go('entone');}
    if(sheet_item==='Larynx'){$state.go('enttwo');}
    if(sheet_item==='Gynaecology exam'){$state.go('gynaeexam');}
    if(sheet_item==='Obstetrics exam'){$state.go('obsexam');}
    if(sheet_item==='Opthalmology exam'){$state.go('opthalexam');}
    if(sheet_item==='Orthopaedics exam'){$state.go('orthoexam');}
    if(sheet_item==='Psychiatric exam'){$state.go('psyexam');}
    if(sheet_item==='RS CVS GIT exam'){$state.go('mdpartone');}
    if(sheet_item==='CNS exam'){$state.go('mdparttwo');}
    if(sheet_item==='Investigations'){$state.go('investigations');}
    if(sheet_item==='Note'){$state.go('note');}
}


    //No previous sheets alert
    function noPreviousSheets() {
        var alertPopup = $ionicPopup.alert({
            title: 'Consultation Sheets',
            template: 'No previous sheets'
        });

    };
    //No next sheets
    function noNextSheets() {
        var alertPopup = $ionicPopup.alert({
            title: 'Consultation Sheets',
            template: 'No other sheets'
        });

    };

    this.cleanCookie = function (input) {
        return input.split(";")[1];
    }


    var consultation_nav;

    this.set_consultationnavigator = function(data){
        consultation_nav = data;
    }

    this.get_consultationnavigator = function () {
        return consultation_nav;
    }

    var appointment_object;

    this.set_appointmentobject = function (item) {
        appointment_object = item;
    }

    this.get_appointmentobject = function () {
        return appointment_object;
    }

//--------------------------------------------------------------------------------------//
//----------------------------------COMMON LOGIC----------------------------------------//
//--------------------------------------------------------------------------------------//
/**
 * END CLINICAL MODULE
 */


  var PATIENTNAME;
  var PATIENTGENDER;
  var UNIQUE_ID;
  var OBJECT_ITEM;
  var transferfrom;
  var transferto;
  var buffer;
  var mainpopup_buffer;
  var temp;
  var DELIM;
  var WARD;
  var AMT;
  var DOD;
  var DOCTOR;
  var ID;
  var FLAG_STATE = false;
  var FORM_CONTENTS;
  var PWD;
  var SUPPLIERS;
  var PATIENT;
  var MODULE_ACCESS;


    var wardmanager_contents;
    this.set_wardmanagercontents = function(wards){wardmanager_contents = wards;}
    this.get_wardmanagercontents = function(){return wardmanager_contents;};

    this.set_moduleaccess = function (moduleaccess) {
        MODULE_ACCESS = moduleaccess;
    }

    this.get_moduleaccess = function () {
        return MODULE_ACCESS;
    }

    this.set_patient = function(input_id){PATIENT = input_id;}

    this.get_patient = function(){return PATIENT;}

    this.set_formcontents = function(input_id){FORM_CONTENTS = input_id;}

    this.get_formcontents = function(){return FORM_CONTENTS;}

    //Set User Instance ID
    this.setID = function(input_id){
      ID = input_id;
    }


    this.get_MRA_doctors = function(){
      /*
      firebase_reference = firebase_reference.push();
      firebase_reference.set({
        parameter:"TDS Deduction for doctors",
        value:"3",
        parameterkey:firebase_reference.key(),
        identifier:"70001000"
      });
      console.log('pushed MRA');*/
      return "70001000";
    }

    //Get User Instance ID
    this.getID = function(){return ID;}

    this.setUpdateFlag = function(){FLAG_STATE = true;};
    this.clearUpdateFlag = function(){FLAG_STATE = false;};
    this.getFlagState = function(){return FLAG_STATE;};

    this.NullFilter = function(input) {
    var out = "";
    if(input==null){out = "";}else{out = input;}

    return out;
  };

  function format1(n, currency) {
      return currency + " " + n.toFixed(2).replace(/./g, function(c, i, a) {
          return i > 0 && c !== "." && (a.length - i) % 3 === 0 ? "," + c : c;
      });
  }

     this.get_with_commas = function(inputstring){
       return format1(parseFloat(inputstring),"");
     }

     this.get_currentutc = function(){
       var date = new Date();
       return date.toUTCString();
     }

      this.set_dod = function(input_id){
      DOD = input_id;
    }

    this.get_dod = function(input_id){
      return DOD;
    }

    this.set_delimiter = function(input_id){
      DELIM = input_id;
    }

    this.get_delimiter = function(input_id){
      return DELIM;
    }

    this.setPatientName = function(input_id){
      PATIENTNAME = input_id;
    }

    this.getPatientName = function(input_id){
      return PATIENTNAME;
    }

    this.setPatientGender = function(input_id){
      PATIENTGENDER = input_id;
    }

    this.getPatientGender = function(input_id){
      return PATIENTGENDER;
    }

    this.set_object = function(input_id){
      OBJECT_ITEM = input_id;
    }

    this.get_object = function(input_id){
      return OBJECT_ITEM;
    }

    this.set_uniqueid = function(input_id){
      UNIQUE_ID = input_id;
    }

    this.get_uniqueid = function(input_id){
      return UNIQUE_ID;
    }

    this.set_transferfrom = function(input_id){
      transferfrom = input_id;
    }

    this.get_transferfrom = function(){
      return transferfrom;
    }

    this.set_transferto = function(input_id){
      transferto = input_id;
    }

    this.get_transferto = function(){
      return transferto;
    }

    this.set_buffer = function(input_id){
      buffer = input_id;
    }

    this.get_buffer = function(){
      return buffer;
    }

    this.set_mainpopupbuffer = function(input_id){
      mainpopup_buffer = input_id;
    }

    this.get_mainpopupbuffer = function(){
      return mainpopup_buffer;
    }

    this.set_temp = function(input_id){
      temp = input_id;
    }

    this.get_temp = function(){
      return temp;
    }

    this.set_ward = function(input_id){
      WARD = input_id;
    }

    this.get_ward = function(input_id){
      return WARD;
    }


    this.set_amount = function(input_id){
      AMT = input_id;
    }

    this.get_amount = function(input_id){
      return AMT;
    }

    this.set_doctor = function(input_id){
      DOCTOR = input_id;
    }

    this.get_doctor = function(input_id){
      return DOCTOR;
    }

this.numberWithCommas = function(x) {

    if (x.indexOf('.') > -1)
{
  var parts = x.toString().split(".");
  parts[0] = parts[0].replace(/\B(?=(\d{3})+(?!\d))/g, ",");
  return parts.join(".");
}
else{
  return x.replace(/\B(?=(\d{3})+(?!\d))/g, ",");
}

}

    this.generateInvoiceNumber = function(){

    var min = Math.ceil(1);
    var max = Math.floor(10000000);
    return "MED"+Math.floor(Math.random() * (max - min)) + min;

  }

  /**
   * Takes YEARS, MONTHS , DAYS as input
   * @Returns age in years months days -- autocalibrated
   */
  this.get_age = function(YEARS,MONTHS,DAYS){
      var AGE = "";

      if(MONTHS=="JANUARY"){MONTHS = '1';}
      if(MONTHS=="FEBRUARY"){MONTHS = '2';}
      if(MONTHS=="MARCH"){MONTHS = '3';}
      if(MONTHS=="APRIL"){MONTHS = '4';}
      if(MONTHS=="MAY"){MONTHS = '5';}
      if(MONTHS=="JUNE"){MONTHS = '6';}
      if(MONTHS=="JULY"){MONTHS = '7';}
      if(MONTHS=="AUGUST"){MONTHS = '8';}
      if(MONTHS=="SEPTEMBER"){MONTHS = '9';}
      if(MONTHS=="OCTOBER"){MONTHS = '10';}
      if(MONTHS=="NOVEMBER"){MONTHS = '11';}
      if(MONTHS=="DECEMBER"){MONTHS = '12';}

      var yearThen = parseInt(YEARS);
        var monthThen = parseInt(MONTHS);
        var dayThen = parseInt(DAYS);

        var today = new Date();
        var birthday = new Date(yearThen, monthThen-1, dayThen);

        var differenceInMilisecond = today.valueOf() - birthday.valueOf();

        var year_age = Math.floor(differenceInMilisecond / 31536000000);
        var day_age = Math.floor((differenceInMilisecond % 31536000000) / 86400000);

        var month_age = Math.floor(day_age/30);

        day_age = day_age % 30;

       if(year_age==0&&month_age==0){AGE = day_age + ' days old';}
       if(year_age==0&&month_age>0){AGE = month_age + ' months ' +day_age+ ' days old';}
       if(year_age>0&&month_age>=0){AGE =  year_age + ' years ' +month_age+ ' months old';}


    return AGE;
  }

  function formatAMPM(date) {
  var hours = date.getHours();
  var minutes = date.getMinutes();
  var ampm = hours >= 12 ? 'pm' : 'am';
  hours = hours % 12;
  hours = hours ? hours : 12; // the hour '0' should be '12'
  minutes = minutes < 10 ? '0'+minutes : minutes;
  var strTime = hours + ':' + minutes + ' ' + ampm;
  return strTime;
}

/**
 * Gets a UTC Time and converts it to days/months/years
 * @Human readable format
 */
this.get_localtime = function(datestring){
var dateout = "";
var date = new Date(datestring);
var MONTHS = "";
if(date.getMonth()==0){MONTHS='JANUARY';}
if(date.getMonth()==1){MONTHS='FEBRUARY';}
if(date.getMonth()==2){MONTHS='MARCH';}
if(date.getMonth()==3){MONTHS='APRIL';}
if(date.getMonth()==4){MONTHS='MAY';}
if(date.getMonth()==5){MONTHS='JUNE';}
if(date.getMonth()==6){MONTHS='JULY';}
if(date.getMonth()==7){MONTHS='AUGUST';}
if(date.getMonth()==8){MONTHS='SEPTEMBER';}
if(date.getMonth()==9){MONTHS='OCTOBER';}
if(date.getMonth()==10){MONTHS='NOVEMBER';}
if(date.getMonth()==11){MONTHS='DECEMBER';}

dateout = date.getDate().toString() +' '+ MONTHS + ' '+date.getFullYear().toString()+' at '+formatAMPM(date);

return dateout;
}

/**
 * Verify database if useraccess is correct/existing
 */
this.get_useraccess = function(parameter){
var state = false;
    var deferred = $q.defer();
PWD = 'Click here to identify yourself';
var firebase_url = DATABASE_ROOT_URL + "/tbluseraccess"
var firebase_reference = new Firebase(firebase_url);
firebase_reference.on("child_added", function(snapshot, prevChildKey) {
var data = snapshot.val();



if(data.password.trim()===parameter.trim()){
UIkit.notification('Identification successful', {pos: 'top-right'});
PWD = data.password;
    deferred.resolve(PWD);
state = true;
}

});

firebase_reference.on('value', function(snapshot) {
   if(!state){UIkit.notification('No access rights', {pos: 'top-right'});}
});

//return PWD;
    return deferred.promise;
}

this.get_pwd = function(){return PWD;}

this.get_supplieraccount = function(){return '800100';}

this.get_bankaccount = function(){return '400100';}

this.get_doctoraccount = function(){return '950100';}

this.remove_separators = function(input){

if(input.length>1){
var delim = input.split(',');
if(delim==null){return parseFloat(input);}
else{
  return parseFloat(input.replace(/,/g, ''));
}
}else return Number(input);

}//END remove_separators()

var username;
var password;
this.set_usercredentials = function (usr,pwd) {
    username = usr;
    password = pwd;
}

this.get_usercredentials_pwd = function () {return password;}
this.get_usercredentials_user = function () {return username;}

this.get_2DP = function(input){
  return parseFloat(Math.round(input * 100) / 100).toFixed(2);
}

this.get_date = function(){
  var date = new Date();
  return date.toUTCString();
}

//Generate an MRN based on currentDate()
this.generate_mrn = function () {
var mrn = "MRN-";
var currentDate = new Date();
var YYYY = currentDate.getFullYear().toString().substr(-2);
var MM = currentDate.getMonth();
var DD = currentDate.getDay();
var HH = currentDate.getHours();
var MIN = currentDate.getMinutes();
var SEC = currentDate.getSeconds();
return mrn+DD.toString()+MM.toString()+YYYY.toString()+HH.toString()+MIN.toString()+SEC.toString();

}

/**
 * INSERT IN CONTROLLER
 *
 * smarthealth.get_useraccess('B200');
    $timeout(function() {
      document.getElementById('mainmenu.identifystockperson').innerHTML = smarthealth.get_pwd();
    }, 2000);
 */

this.return_boolean = function(INPUT){
  if(INPUT==null||INPUT==""){return false;}else{return INPUT;}
}

this.toWords = function(n) {

    var string = n.toString(), units, tens, scales, start, end, chunks, chunksLen, chunk, ints, i, word, words, and = 'and';

  /* Is number zero? */
    if( parseInt( string ) === 0 ) {
        return 'zero';
    }

  /* Array of units as words */
    units = [ '', 'one', 'two', 'three', 'four', 'five', 'six', 'seven', 'eight', 'nine', 'ten', 'eleven', 'twelve', 'thirteen', 'fourteen', 'fifteen', 'sixteen', 'seventeen', 'eighteen', 'nineteen' ];

  /* Array of tens as words */
    tens = [ '', '', 'twenty', 'thirty', 'forty', 'fifty', 'sixty', 'seventy', 'eighty', 'ninety' ];

  /* Array of scales as words */
    scales = [ '', 'thousand', 'million', 'billion', 'trillion', 'quadrillion', 'quintillion', 'sextillion', 'septillion', 'octillion', 'nonillion', 'decillion', 'undecillion', 'duodecillion', 'tredecillion', 'quatttuor-decillion', 'quindecillion', 'sexdecillion', 'septen-decillion', 'octodecillion', 'novemdecillion', 'vigintillion', 'centillion' ];

  /* Split user arguemnt into 3 digit chunks from right to left */
    start = string.length;
    chunks = [];
    while( start > 0 ) {
        end = start;
        chunks.push( string.slice( ( start = Math.max( 0, start - 3 ) ), end ) );
    }

  /* Check if function has enough scale words to be able to stringify the user argument */
    chunksLen = chunks.length;
    if( chunksLen > scales.length ) {
        return '';
    }

  /* Stringify each integer in each chunk */
    words = [];
    for( i = 0; i < chunksLen; i++ ) {

        chunk = parseInt( chunks[i] );

        if( chunk ) {

          /* Split chunk into array of individual integers */
            ints = chunks[i].split( '' ).reverse().map( parseFloat );

          /* If tens integer is 1, i.e. 10, then add 10 to units integer */
            if( ints[1] === 1 ) {
                ints[0] += 10;
            }

          /* Add scale word if chunk is not zero and array item exists */
            if( ( word = scales[i] ) ) {
                words.push( word );
            }

          /* Add unit word if array item exists */
            if( ( word = units[ ints[0] ] ) ) {
                words.push( word );
            }

          /* Add tens word if array item exists */
            if( ( word = tens[ ints[1] ] ) ) {
                words.push( word );
            }

          /* Add 'and' string after units or tens integer if: */
            if( ints[0] || ints[1] ) {

              /* Chunk has a hundreds integer or chunk is the first of multiple chunks */
                if( ints[2] || ! i && chunksLen ) {
                    words.push( and );
                }

            }

          /* Add hundreds word if array item exists */
            if( ( word = units[ ints[2] ] ) ) {
                words.push( word + ' hundred' );
            }

        }

    }

    return words.reverse().join( ' ' );

}//END toWords()

this.return_medisave_logo = function(){
  return "data:image/jpeg;base64,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cAAA/////////////////////////////wPoAAAAAP////////////////////////////8D6AAAAAD/////////////////////////////A+gAAAAA/////////////////////////////wPoAAA4QklNBAgAAAAAABAAAAABAAACQAAAAkAAAAAAOEJJTQQeAAAAAAAEAAAAADhCSU0EGgAAAAADRQAAAAYAAAAAAAAAAAAAALIAAAFRAAAACABtAGUAZABpAHMAYQB2AGUAAAABAAAAAAAAAAAAAAAAAAAAAAAAAAEAAAAAAAAAAAAAAVEAAACyAAAAAAAAAAAAAAAAAAAAAAEAAAAAAAAAAAAAAAAAAAAAAAAAEAAAAAEAAAAAAABudWxsAAAAAgAAAAZib3VuZHNPYmpjAAAAAQAAAAAAAFJjdDEAAAAEAAAAAFRvcCBsb25nAAAAAAAAAABMZWZ0bG9uZwAAAAAAAAAAQnRvbWxvbmcAAACyAAAAAFJnaHRsb25nAAABUQAAAAZzbGljZXNWbExzAAAAAU9iamMAAAABAAAAAAAFc2xpY2UAAAASAAAAB3NsaWNlSURsb25nAAAAAAAAAAdncm91cElEbG9uZwAAAAAAAAAGb3JpZ2luZW51bQAAAAxFU2xpY2VPcmlnaW4AAAANYXV0b0dlbmVyYXRlZAAAAABUeXBlZW51bQAAAApFU2xpY2VUeXBlAAAAAEltZyAAAAAGYm91bmRzT2JqYwAAAAEAAAAAAABSY3QxAAAABAAAAABUb3AgbG9uZwAAAAAAAAAATGVmdGxvbmcAAAAAAAAAAEJ0b21sb25nAAAAsgAAAABSZ2h0bG9uZwAAAVEAAAADdXJsVEVYVAAAAAEAAAAAAABudWxsVEVYVAAAAAEAAAAAAABNc2dlVEVYVAAAAAEAAAAAAAZhbHRUYWdURVhUAAAAAQAAAAAADmNlbGxUZXh0SXNIVE1MYm9vbAEAAAAIY2VsbFRleHRURVhUAAAAAQAAAAAACWhvcnpBbGlnbmVudW0AAAAPRVNsaWNlSG9yekFsaWduAAAAB2RlZmF1bHQAAAAJdmVydEFsaWduZW51bQAAAA9FU2xpY2VWZXJ0QWxpZ24AAAAHZGVmYXVsdAAAAAtiZ0NvbG9yVHlwZWVudW0AAAARRVNsaWNlQkdD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ZGY6YWJvdXQ9IiIgeG1sbnM6eG1wTU09Imh0dHA6Ly9ucy5hZG9iZS5jb20veGFwLzEuMC9tbS8iIHhtbG5zOnN0RXZ0PSJodHRwOi8vbnMuYWRvYmUuY29tL3hhcC8xLjAvc1R5cGUvUmVzb3VyY2VFdmVudCMiIHhtbG5zOmRjPSJodHRwOi8vcHVybC5vcmcvZGMvZWxlbWVudHMvMS4xLyIgeG1sbnM6cGhvdG9zaG9wPSJodHRwOi8vbnMuYWRvYmUuY29tL3Bob3Rvc2hvcC8xLjAvIiB4bWxuczp4bXA9Imh0dHA6Ly9ucy5hZG9iZS5jb20veGFwLzEuMC8iIHhtcE1NOkRvY3VtZW50SUQ9ImFkb2JlOmRvY2lkOnBob3Rvc2hvcDoyZmExOTc2My0xNzBjLTExN2EtODU0Ni1jMTY2NjI1ZTNmYWQiIHhtcE1NOkluc3RhbmNlSUQ9InhtcC5paWQ6Y2UzODkwYjYtYjdjMC00MzdkLWE1OWEtY2RhNDllMjVlOTJmIiB4bXBNTTpPcmlnaW5hbERvY3VtZW50SUQ9IjQ1RTkzRkZBOEQ3ODdCQUU3RkJCQTcyNzkxRTQ0QkE3IiBkYzpmb3JtYXQ9ImltYWdlL2pwZWciIHBob3Rvc2hvcDpDb2xvck1vZGU9IjMiIHhtcDpDcmVhdGVEYXRlPSIyMDE2LTEyLTIzVDA4OjQ0OjU0KzA0OjAwIiB4bXA6TW9kaWZ5RGF0ZT0iMjAxNy0wMS0wOVQxOToxMDo0MiswNDowMCIgeG1wOk1ldGFkYXRhRGF0ZT0iMjAxNy0wMS0wOVQxOToxMDo0MiswNDowMCI+IDx4bXBNTTpIaXN0b3J5PiA8cmRmOlNlcT4gPHJkZjpsaSBzdEV2dDphY3Rpb249InNhdmVkIiBzdEV2dDppbnN0YW5jZUlEPSJ4bXAuaWlkOmZhMDIxMGIyLTJhYmYtNDJkNS04MjI5LTg1N2I1NDRkZDAxOSIgc3RFdnQ6d2hlbj0iMjAxNy0wMS0wOVQxOToxMDo0MiswNDowMCIgc3RFdnQ6c29mdHdhcmVBZ2VudD0iQWRvYmUgUGhvdG9zaG9wIENDIDIwMTUgKE1hY2ludG9zaCkiIHN0RXZ0OmNoYW5nZWQ9Ii8iLz4gPHJkZjpsaSBzdEV2dDphY3Rpb249InNhdmVkIiBzdEV2dDppbnN0YW5jZUlEPSJ4bXAuaWlkOmNlMzg5MGI2LWI3YzAtNDM3ZC1hNTlhLWNkYTQ5ZTI1ZTkyZiIgc3RFdnQ6d2hlbj0iMjAxNy0wMS0wOVQxOToxMDo0MiswNDowMCIgc3RFdnQ6c29mdHdhcmVBZ2VudD0iQWRvYmUgUGhvdG9zaG9wIENDIDIwMTUgKE1hY2ludG9zaCkiIHN0RXZ0OmNoYW5nZWQ9Ii8iLz4gPC9yZGY6U2VxPiA8L3htcE1NOkhpc3Rvcnk+IDwvcmRmOkRlc2NyaXB0aW9uPiA8L3JkZjpSREY+IDwveDp4bXBtZXRhPiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIDw/eHBhY2tldCBlbmQ9InciPz7/7gAmQWRvYmUAZEAAAAABAwAVBAMGCg0AAAAAAAAAAAAAAAAAAAAA/9sAhAABAQEBAQEBAQEBAQEBAQEBAQEBAQEBAQEBAQEBAQEBAQEBAQEBAQEBAQEBAgICAgICAgICAgIDAwMDAwMDAwMDAQEBAQEBAQEBAQECAgECAgMDAwMDAwMDAwMDAwMDAwMDAwMDAwMDAwMDAwMDAwMDAwMDAwMDAwMDAwMDAwMDAwP/wgARCACyAVEDAREAAhEBAxEB/8QBRQABAAEEAwEBAAAAAAAAAAAAAAkBAwcIAgQGBQoBAQAABwEBAAAAAAAAAAAAAAABAgMFBgcIBAkQAAAGAQICBwYFAwQDAAAAAAECAwQFBgcAESASEDAhMRMUCFBBIjIVFkAjJDQlcEI2MzUXN2AmJxEAAQMCAwMFCggGDAkNAAAAAgEDBBIFABEGISITMUEyQhQgUWGBUmJyIxUHEDBxkYKSMyShokNTYxZQ8LFzg5OjNER0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";
}

})//END APP SERVICE

//END app.js;
