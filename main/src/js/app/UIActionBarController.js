/*jslint browser: true es5: true*/
/*global Util, DataAccess, Sql, SeedData, bb, log, console, UIConfig, openDatabase, AppSql, AppConfig, UIListController, UIEditFormController, UITaskUtil, $*/
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
        }
    };
}());
