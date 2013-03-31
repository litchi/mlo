/*jslint browser: true */
/*global Util, DataAccess, Sql, SeedData, bb, log, console, UIConfig, UIEditFormController, UIActionBarController, UIMetaUtil*/
var UITaskContextUtil = (function () {
    "use strict";
    var selectedContextIds = {};

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

        prepareContextData : function (tx, taskId, contexts) {
            var i, max, contextContainer = document.getElementById('contextContainer'),
                tempDiv = document.createElement('div');
            contextContainer.style.display = 'none';
            DataAccess.runSqlDirectly(tx,
                'select meta_id, meta_name from meta_view where meta_type_name = ?',
                [SeedData.ContextMetaTypeName],
                function (tx, result, obj) {
                    var metaId, metaName, finalCallback;
                    if (null !== result && null !== result.rows && null !== result.rows.item) {
                        for (i = 0, max = result.rows.length; i < max; i += 1) {
                            metaId = result.rows.item(i).meta_id;
                            metaName = result.rows.item(i).meta_name;
                            finalCallback = (i !== max - 1) ? null :  Util.copyInnerHTMLAndShowContainer;
                            UIMetaUtil.createMetaSpan(contextContainer, tempDiv,
                                metaId, metaName, contexts, selectedContextIds,
                                UITaskContextUtil.unSelectClickCallback,
                                UITaskContextUtil.selectClickCallback,
                                finalCallback);
                        }
                    }
                });
        },

        saveContextPopScreen : function (tx, taskId) {
            DataAccess.runSqlDirectly(tx, Sql.TaskMeta.DeleteByMetaTypeName, [taskId, SeedData.ContextMetaTypeName]);
            UIMetaUtil.saveTaskMetaToDb(tx, taskId, selectedContextIds);
            Util.refreshCurrentPage(UIConfig.msgForSuccessfulTaskUpdate);
        }

    };

}());
