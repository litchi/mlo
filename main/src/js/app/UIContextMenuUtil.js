/*jslint browser: true es5: true*/
/*global DataAccess, Sql, SeedData, bb, log, console, UIConfig, UIFragments, Util*/
var UIContextMenuUtil = (function () {
    "use strict";

    return {
        filterContextMenu : function (items) {
            var index, menuItems, menuItem,
                contextMenu = document.getElementById('task-operation-context-menu');
            if (Util.isEmpty(items)) {
                console.warn("Want to display no item in the context map?");
                return;
            }
            if (Util.isEmpty(contextMenu)) {
                console.warn("Context menu with id[%s] in UI is undefined", 'task-operation-context-menu');
                return;
            }
            menuItems = contextMenu.getElementsByTagName('div');
            if (Util.isEmpty(menuItems)) {
                console.warn("There's no child element defined in div with id[%s]", 'task-operation-context-menu');
                return;
            }
            for (index = 0; index < menuItems.length; index += 1) {
                menuItem = menuItems[index];
                if (Util.notEmpty(menuItem) && Util.notEmpty(menuItem.getAttribute('id'))) {
                    menuItem.style.display = 'none';
                    menuItem.setAttribute('data-bb-pin', 'false');
                }
            }
            for (index = 0; index < items.length; index += 1) {
                document.getElementById(items[index]).style.display = 'block';
            }
        },

        setMetaContextMenuAction : function (item, metaTypeName, metaId, metaName, metaDesc) {
            if (Util.isEmpty(metaDesc)) {
                metaDesc = UIConfig.emptyString;
            }
            item.innerHTML = metaDesc;
            item.setAttribute(
                'onclick',
                "document.getElementById('task-operation-context-menu').menu.peek({ title : '" + metaName + " : "  + metaTypeName + "', description : '" + metaDesc + "', selected : '" + metaId + "'});"
            );
        }

    };

}());
