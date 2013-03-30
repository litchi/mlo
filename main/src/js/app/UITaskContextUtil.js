/*jslint browser: true */
/*global Util, DataAccess, Sql, SeedData, bb, log, console, UIConfig, UIEditFormController, UIActionBarController, UIMetaUtil*/
var UITaskContextUtil = (function () {
    "use strict";
    var selectedContextIds = {};

    function saveContextToDb(tx, taskId) {
        var id, val, data;
        for (id in selectedContextIds) {
            if (selectedContextIds.hasOwnProperty(id)) {
                val = selectedContextIds[id];
                data = [taskId, id];
                log.logSqlStatement(Sql.TaskMeta.Insert, data, DataAccess.logQuerySql);
                DataAccess.runSqlDirectly(tx, Sql.TaskMeta.Insert, data);
            }
        }
    }

    return {

        unSelectClickCallback : function (metaId, metaName) {
            return 'UITaskContextUtil.unSelectContext("' + metaId + '", "' + metaName + '")';
        },

        selectClickCallback : function (metaId, metaName) {
            return 'UITaskContextUtil.selectContext("' + metaId + '", "' + metaName + '")';
        },

        selectContext : function (metaId, metaName) {
            var icon = document.getElementById(Util.genSelectedMetaMarkIconId(metaId)),
                span = document.getElementById(metaId);
            selectedContextIds[metaId] = metaName;
            span.setAttribute('class', 'selectedMeta selectedContext');
            span.setAttribute('onclick', UITaskContextUtil.unSelectClickCallback(metaId, metaName));
            if (Util.isEmpty(icon)) {
                icon = Util.createMetaSelectedIcon(metaId, 'deleteIcon');
            } else {
                icon.style.display = 'inline-block';
            }
            span.appendChild(icon);
        },

        unSelectContext : function (metaId, metaName) {
            var icon = document.getElementById(Util.genSelectedMetaMarkIconId(metaId)),
                span = document.getElementById(metaId);
            delete selectedContextIds[metaId];
            if (Util.notEmpty(icon)) {
                icon.style.display = 'none';
            }
            span.setAttribute('class', 'meta context');
            span.setAttribute('onclick', UITaskContextUtil.selectClickCallback(metaId, metaName));
        },

        prepareContextData : function (taskId) {
            var contextContainer = document.getElementById('contextContainer'), i, max, tempDiv = document.createElement('div');
            contextContainer.style.display = 'none';
            DataAccess.appDb.transaction(function (tx) {
                DataAccess.runSqlDirectly(
                    tx,
                    'select meta_id, meta_name from meta_view where meta_type_name = ?',
                    [SeedData.ContextMetaTypeName],
                    function (tx, result, obj) {
                        if (null !== result && null !== result.rows && null !== result.rows.item) {
                            for (i = 0, max = result.rows.length; i < max; i += 1) {
                                if (i !== max - 1) {
                                    UIMetaUtil.createMetaSpan(contextContainer, tx, tempDiv, taskId,
                                        result.rows.item(i).meta_id, result.rows.item(i).meta_name, selectedContextIds,
                                        UITaskContextUtil.unSelectClickCallback, UITaskContextUtil.selectClickCallback);
                                } else {
                                    UIMetaUtil.createMetaSpan(contextContainer, tx, tempDiv, taskId,
                                        result.rows.item(i).meta_id, result.rows.item(i).meta_name, selectedContextIds,
                                        UITaskContextUtil.unSelectClickCallback, UITaskContextUtil.selectClickCallback, Util.copyInnerHTMLAndShowContainer);
                                }
                            }
                        }
                    }
                );
            });
        },

        saveContextPopScreen : function (tx, taskId) {
            DataAccess.runSqlDirectly(tx, Sql.TaskMeta.DeleteByMetaTypeName, [taskId, SeedData.ContextMetaTypeName]);
            saveContextToDb(tx, taskId);
            Util.refreshCurrentPage(UIConfig.msgForSuccessfulTaskUpdate);
        }

    };

}());
