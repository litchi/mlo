/*jslint browser: true es5: true*/
/*global Util, DataAccess, Sql, SeedData, bb, log, console, UIConfig, openDatabase, AppSql, AppConfig, UIListController, UIEditFormController*/
var UIActionBarController = (function () {
    "use strict";
    return {
        openTaskByMetaPage : function (metaName, toastMsg) {
            UIListController.switchDisplayToMode(UIConfig.singleDisplayMode);
            UIListController.fillTasksToGroupByMetaInfo(SeedData.GtdMetaTypeName, metaName);
            if (Util.notEmpty) {
                Util.showToast(toastMsg);
            }
        },

        openTaskByStatusPage : function (statusKey) {
            UIListController.switchDisplayToMode(UIConfig.singleDisplayMode);
            UIListController.fillTasksToGroupByStatusKey(statusKey);
        },

        openTaskGroupByMetaPage : function (metaTypeName, metaName, toastMsg) {
            UIListController.switchDisplayToMode(UIConfig.masterDetailDisplayMode);
            UIListController.fillMetaListToPanelByTypeName(metaTypeName, UIConfig.taskByPagePrefix);
            if (Util.isEmpty(metaName)) {
                UIListController.fillTasksToGroupByMetaInfo(metaTypeName, Sql.FilterAllMeta);
            } else {
                UIListController.fillTasksToGroupByMetaInfo(metaTypeName, metaName);
            }
            if (Util.notEmpty) {
                Util.showToast(toastMsg);
            }
        },

        openMetaGroupByTypePage : function (metaTypeId) {
            UIListController.switchDisplayToMode(UIConfig.masterDetailDisplayMode);
            UIListController.fillMetaTypeToPanel();
            if (Util.isEmpty(metaTypeId)) {
                UIListController.fillAllMetaToPanel(UIConfig.metaByPagePrefix);
            } else {
                UIListController.fillMetaListToPanel(metaTypeId, UIConfig.metaByPagePrefix);
            }
        }
    };
}());
