/*jslint browser: true es5: true*/
/*global DataAccess, Sql, SeedData, bb, log, console, UIConfig, UIFragments, Util, UITaskUtil*/
var UIMetaUtil = (function () {
    "use strict";

    function getUiLabel(metaTypeName) {
        var result;
        if (SeedData.GtdMetaTypeName === metaTypeName) {
            result = 'in List';
        } else if (SeedData.DueMetaTypeName === metaTypeName) {
            result = 'with Due';
        } else {
            result = 'All ' + metaTypeName + '(s)';
        }
        return result;
    }

    return {
        setMetaTypeFields : function (metaTypeName) {
            DataAccess.metaType.getByName(metaTypeName, function (tx, result, resultObj) {
                Util.setValue('v_meta_type_name', metaTypeName);
                if (null !== resultObj && (resultObj.length > 0) &&
                        null !== resultObj[0] && null !== resultObj[0][Sql.Meta.Cols.Id]) {
                    Util.setValue('v_meta_type_id', resultObj[0][Sql.MetaType.Cols.Id]);
                } else {
                    console.warn("Meta Type with name '%s' not found", metaTypeName);
                }
            }, function (tx, error) {
                log.logSqlError("Error getting metaType[" + metaTypeName + "]", error);
            });
        },

        setMetaFields : function (metaName) {
            DataAccess.meta.getByName(metaName, function (tx, result, resultObj) {
                Util.setValue('v_meta_name', metaName);
                if (null !== resultObj && (resultObj.length > 0) &&
                        null !== resultObj[0] && null !== resultObj[0][Sql.Meta.Cols.Id]) {
                    Util.setValue('v_meta_id', resultObj[0][Sql.Meta.Cols.Id]);
                } else {
                    console.warn("Meta with name '%s' not found", metaName);
                }
            }, function (tx, error) {
                log.logSqlError("Error getting meta[" + metaName + "]", error);
            });
        },

        makeMetaTypeDefaultList : function (metaTypeName, callback) {
            var taskNumber = [],
                item = document.createElement('div'),
                title = getUiLabel(metaTypeName);
            UITaskUtil.getTaskNumberOfMetaType(metaTypeName, function (result) {
                taskNumber[metaTypeName] = result;
                item.setAttribute('data-bb-type', 'item');
                item.setAttribute('data-bb-style', 'stretch');
                item.setAttribute('title', '<span class="default-master-detail master-title">' + title + '</span>');
                item.setAttribute('data-bb-title',  '<span class="default-master-detail master-title">' + title + '</span>' + UITaskUtil.decorateTaskNumber(taskNumber, metaTypeName));
                item.setAttribute('id', metaTypeName);
                item.setAttribute(
                    'onclick',
                    "UIListController.fillTaskAndMarkGroup('" + metaTypeName + "', '" + metaTypeName + "', '" + Sql.FilterAllMeta + "');"
                );
                if (Util.isFunction(callback)) {
                    callback(item);
                }
            });
        },

        getMetaListElement : function (pageType) {
            var metaList;
            if (UIConfig.taskByPagePrefix === pageType) {
                metaList = document.getElementById('group-list');
                if (Util.isEmpty(metaList)) {
                    console.error("Meta List(id: [%s]) is empty or null[%s]", 'group-list', metaList);
                }
            } else if (UIConfig.metaByPagePrefix === pageType) {
                metaList = document.getElementById(UIConfig.detailListElementId);
                if (Util.isEmpty(metaList)) {
                    console.error("Meta List(id: [%s]) is empty or null[%s]", UIConfig.detailListElementId, metaList);
                }
            }
            return metaList;
        },

        getMetaUiId : function (id) {
            return 'meta-' + id;
        }

    };

}());
