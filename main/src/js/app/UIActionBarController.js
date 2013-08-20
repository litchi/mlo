/*jslint browser: true es5: true*/
/*global SettingUtil, Util, DataAccess, Sql, SeedData, bb, log, console, UIConfig, openDatabase, AppSql, AppConfig, UIListController, UIEditFormController, UITaskUtil, $*/

var UIActionBarController = (function () {
    "use strict";

    return {

        openTaskByStatusPage : function (statusKey) {
            UITaskUtil.setTaskDetailPanelDisplay('none');
            UIListController.switchDisplayToMode(UIConfig.singleDisplayMode);
            UIListController.fillTasksToGroupByStatusKey(statusKey);
            $("[id^=add-meta-link-]").remove();
        },

        openTaskGroupByMetaPage : function (metaTypeName, metaName, toastMsg) {
            UITaskUtil.setTaskDetailPanelDisplay('none');
            UIListController.switchDisplayToMode(UIConfig.masterDetailDisplayMode);
            UIListController.fillMetaListToPanelByTypeName(metaTypeName, UIConfig.taskByPagePrefix, function () {
                if (Util.isEmpty(metaName) || Sql.FilterAllMeta === metaName) {
                    UIListController.fillTaskAndMarkGroup(metaTypeName, metaTypeName, Sql.FilterAllMeta);
                } else {
                    UIListController.fillTaskAndMarkGroupNoId(metaTypeName, metaName);
                }
                if (Util.notEmpty) {
                    Util.showToast(toastMsg);
                }
            });
            $("[id^=add-meta-link-]").remove();
        },
 
        openMetaGroupByTypePage : function (metaTypeId) {
            UITaskUtil.setTaskDetailPanelDisplay('none');
            UIListController.switchDisplayToMode(UIConfig.masterDetailDisplayMode);
            UIListController.fillMetaTypeToPanel(metaTypeId);
            if (Util.isEmpty(metaTypeId)) {
                UIListController.fillAllMetaToPanel(UIConfig.metaByPagePrefix);
            } else {
                UIListController.fillMetaListToPanel(metaTypeId, UIConfig.metaByPagePrefix);
            }
        },


        openSettingsPage : function () {
            if (SettingUtil.isLogin()) {
                $('#login-info-panel').css('display', 'block');
                $('#logout-info-panel').css('display', 'none');
                $('#login-info').text('Login as ' + SettingUtil.getCurrentUser());
            } else {
                $('#login-info-panel').css('display', 'none');
                $('#logout-info-panel').css('display', 'block');
                $('#login-signup-link-panel').css('display', 'block');
                document.getElementById('setting-page-reminder-toggle').disable();
            }
            $('#login-form-panel').css('display', 'none');
            $('#signup-form-panel').css('display', 'none');
            $('.close-login-signup-panel-icon').css('display', 'none');
        },

        openHelpPage : function () {
        }
    };
}());
