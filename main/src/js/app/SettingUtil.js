/*jslint browser: true es5: true*/
/*global Util, DataAccess, Sql, SeedData, bb, log, console, UIConfig, openDatabase, AppSql, AppConfig, UIListController, UIEditFormController, UITaskUtil, $*/
var SettingUtil = (function () {
    "use strict";

    var isLogin = true,
        currentUser = 'smartlitchi@gmail.com',
        isReminderOn = true;

    return {
        isLogin : function () {
            return isLogin;
        },

        getCurrentUser : function () {
            return currentUser;
        },

        isReminderOn : function () {
            return isReminderOn;
        },

        logout : function () {
            isLogin = false;
        },

        login : function () {
            isLogin = true;
        },

        signup : function () {
            currentUser = 'smartlitchi@gmail.com';
        },

        closeLoginSignupForm : function () {
            $("#login-signup-link-panel").css('display', 'block');
            $('#signup-form-panel').css('display', 'none');
            $('#login-form-panel').css('display', 'none');
            $('.close-login-signup-panel-icon').css('display', 'none');
        },

        showLoginForm : function () {
            $("#login-signup-link-panel").css('display', 'none');
            $('#signup-form-panel').css('display', 'none');
            $('#login-form-panel').css('display', 'block');
            $('.close-login-signup-panel-icon').css('display', 'inline');
        },

        showSignupForm : function () {
            $("#login-signup-link-panel").css('display', 'none');
            $('#login-form-panel').css('display', 'none');
            $('#signup-form-panel').css('display', 'block');
            $('.close-login-signup-panel-icon').css('display', 'inline');
        },

        toggleReminderFeature : function (toggleController) {
        }
    };
}());
