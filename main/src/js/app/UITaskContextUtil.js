/*jslint browser: true */
/*global Util, DataAccess, Sql, SeedData, bb, log, console, UIConfig, UIEditFormController, UIActionBarController*/
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

    function createContextDeleteIcon(metaId) {
        var icon = document.createElement('img');
        icon.setAttribute('id', Util.genSelectedMetaMarkIconId(metaId));
        icon.setAttribute('class', 'deleteIcon');
        icon.setAttribute('src', './resources/image/remove-context.png');
        return icon;
    }


    function createContextSpan(container, tx, tempDiv, taskId, metaId, metaName, callback) {
        var span, count, icon;
        DataAccess.runSqlDirectly(
            tx,
            'select count(*) as c from task_view where task_id = ? and meta_id = ?',
            [taskId, metaId],
            function (tx, result, objs) {
                if (null !== result && null !== result.rows && null !== result.rows.item) {
                    span = document.createElement('span');
                    span.setAttribute('id', metaId);
                    count = result.rows.item(0).c;
                    if (count >= 1) {
                        span.setAttribute('class', 'selectedContext');
                        span.setAttribute('onclick', 'UITaskContextUtil.unSelectContext("' + metaId + '", "' + metaName + '")');
                        selectedContextIds[metaId] = metaName;
                        icon = createContextDeleteIcon(metaId);
                    } else {
                        span.setAttribute('class', 'context');
                        span.setAttribute('onclick', 'UITaskContextUtil.selectContext("' + metaId + '", "' + metaName + '")');
                    }
                    span.innerText = metaName;
                    if (Util.notEmpty(icon)) {
                        span.appendChild(icon);
                    }
                    tempDiv.appendChild(span);
                    if (Util.isFunction(callback)) {
                        callback(container, tempDiv);
                    }
                }
            }
        );
    }

    return {
        selectContext : function (metaId, metaName) {
            var icon = document.getElementById(Util.genSelectedMetaMarkIconId(metaId)),
                span = document.getElementById(metaId);
            selectedContextIds[metaId] = metaName;
            span.setAttribute('class', 'selectedContext');
            span.setAttribute('onclick', 'UITaskContextUtil.unSelectContext("' + metaId + '", "' + metaName + '")');
            if (Util.isEmpty(icon)) {
                icon = createContextDeleteIcon(metaId);
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
            span.setAttribute('class', 'context');
            span.setAttribute('onclick', 'UITaskContextUtil.selectContext("' + metaId + '", "' + metaName + '")');
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
                                    createContextSpan(contextContainer, tx, tempDiv, taskId, result.rows.item(i).meta_id, result.rows.item(i).meta_name);
                                } else {
                                    createContextSpan(contextContainer, tx, tempDiv, taskId, result.rows.item(i).meta_id, result.rows.item(i).meta_name, Util.copyInnerHTMLAndShowContainer);
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
