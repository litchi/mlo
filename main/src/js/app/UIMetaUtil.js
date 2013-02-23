/*jslint browser: true es5: true*/
/*global DataAccess, Sql, SeedData, bb, log, console, UIConfig, UIFragments, Util*/
var UIMetaUtil = (function () {
    "use strict";

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

        makeMetaTypeDefaultList : function (metaTypeName) {
            var item = document.createElement('div'),
                title = 'All ' + metaTypeName + 's';
            item.setAttribute('data-bb-type', 'item');
            item.setAttribute('data-bb-style', 'stretch');
            item.setAttribute('title', title);
            item.setAttribute('data-bb-title', title);
            item.setAttribute('id', metaTypeName);
            item.setAttribute(
                'onclick',
                "UIListController.fillTaskAndMarkGroup('" + metaTypeName + "', '" + metaTypeName + "', '" + Sql.FilterAllMeta + "');"
            );
            return item;
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
        }

    };

}());
