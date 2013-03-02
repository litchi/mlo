/*jslint browser: true es5: true*/
/*global Util, DataAccess, Sql, SeedData, bb, log, console, UIConfig, openDatabase, AppSql, AppConfig, UIListController, UIEditFormController, UITaskUtil*/
var UIActionBarController = (function () {
    "use strict";
    return {
        openTaskByMetaPage : function (metaName, toastMsg) {
            UITaskUtil.setTaskDetailPanelDisplay('none');
            UIListController.switchDisplayToMode(UIConfig.masterDetailDisplayMode);
            UIListController.fillMetaListToPanelByTypeName(SeedData.GtdMetaTypeName, UIConfig.taskByPagePrefix, function () {
                UIListController.fillTaskAndMarkGroupNoId(SeedData.GtdMetaTypeName, metaName);
                if (Util.notEmpty) {
                    Util.showToast(toastMsg);
                }
            });
        },

        openTaskByStatusPage : function (statusKey) {
            UITaskUtil.setTaskDetailPanelDisplay('none');
            UIListController.switchDisplayToMode(UIConfig.singleDisplayMode);
            UIListController.fillTasksToGroupByStatusKey(statusKey);
        },

        openTaskGroupByMetaPage : function (metaTypeName, metaName, toastMsg) {
            UITaskUtil.setTaskDetailPanelDisplay('none');
            UIListController.switchDisplayToMode(UIConfig.masterDetailDisplayMode);
            UIListController.fillMetaListToPanelByTypeName(metaTypeName, UIConfig.taskByPagePrefix, function () {
                if (Util.isEmpty(metaName)) {
                    UIListController.fillTaskAndMarkGroup(metaTypeName, metaTypeName, Sql.FilterAllMeta);
                } else {
                    UIListController.fillTaskAndMarkGroupNoId(metaTypeName, metaName);
                }
                if (Util.notEmpty) {
                    Util.showToast(toastMsg);
                }
            });
        },

        openMetaGroupByTypePage : function (metaTypeId) {
            UITaskUtil.setTaskDetailPanelDisplay('none');
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
