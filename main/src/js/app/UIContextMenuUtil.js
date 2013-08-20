/*jslint browser: true es5: true*/
/*global DataAccess, Sql, SeedData, bb, log, console, UIConfig, UIFragments, Util*/
var UIContextMenuUtil = (function () {
    "use strict";

    return {
        filterContextMenu : function (items) {
            var index, menuItems, menuItem, loopItem,
                contextMenu = document.getElementById('task-oper-menu');
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
                loopItem = document.getElementById(items[index]);
                if (Util.notEmpty(loopItem)) {
                    loopItem.style.display = 'inline';
                }
            }
        },

        setMetaContextMenuAction : function (item, metaTypeName, metaId, metaName, metaDesc) {
	    item.onclick = function () {
		bb.pushScreen('edit-meta.html', UIConfig.editMetaPagePrefix, {'metaId' : metaId});
	    }
	}

    };

}());
