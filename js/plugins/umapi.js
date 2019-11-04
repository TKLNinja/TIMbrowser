'use strict';
/*:
 * @author William Ramsey
 * @plugindesc Touch api for events!
 * 
 * @param Disable ttm by default
 * @desc Disables the touch-to-move by default. can be re-enabled later.
 * @default false
 * 
 * @help
 * 
 * ---PLUGIN COMMANDS---
 * There are 2 plugin commands.
 * enableTtm - Enabels touch-to-move
 * disableTtm - Disables touch-to-move
 * 
 * --- SCRIPT FUNCTIONS ---
 * This plugin lets you enable or disable the default touch
 * to move in game, as well as allows you to create events
 * that detect mouse clicks! If you're making a game with
 * no playable character for example, you can make pictures
 * clickable using this API.
 * 
 * Written Guide:
 * There are several functions you can use. First off,
 * we'll be creating an event! So, go ahead and make
 * a blank event somewhere. Make sure to set it's
 * trigger to parallel. Now, create a "Conditional Branch",
 * and select the 4th tab to select "Script".
 * 
 * The conditions you can use for this are:
 * umapi.touch(x, y, width, height) -
 * this determines if a part of the screen
 * has been clicked. (Not linked to map location)
 * 
 * umapi.mtouch(x, y, width, height) -
 * The same as before, but is linked to map
 * location, so you can use this to have a hotspot
 * on the map. for example, you can select where
 * a house is (in pixels, not tiles), and have that
 * house be clickable.
 * 
 * umapi.gtouch(x, y) - 
 * This will happen when you click or touch a tile
 * specified by the x/y coords.
 * 
 * ---
 * 
 * Useful functions:
 * You can get an events location
 * by typing umapi.eventX()/eventY() inside of the condition.
 * In addition, there's realEventX()/realEventY(), which will
 * tell the true x/y of the event instead of tile based.
 * For example, if you wanted to make a taller event
 * (such as a crystal) clickable, you can use this following
 * condition in the conditional branch:
 * 
 * -
 * umapi.mtouch(umapi.realEventX(4), umapi.realEventY(4)-umapi.tileHeight(), umapi.tileWidth(), umapi.tileHeight()*2)
 * -
 * 
 * 4 would be the event id of the crystal graphic. It'd be different for you.
 * Notice how we subtract the y position by umapi.tileHeight(),
 * this grabs the height of the tile (even if it's changed by another plugin).
 * Same goes for umapi.tileWidth();. We also multiply umapi.tileHeight()*2,
 * meaning the clickable section are 2 tiles thick in height.
 * 
 * ---
 * 
 * Additional function List:
 * umapi.mapX() - gets the X position of the map.
 * umapi.mapY() - gets the Y position of the map.
 * umapi.tileWidth() - returns the default tile width.
 * umapi.tileHeight() - returns the default tile height.
 * umapi.eventX(id) - gets the X tile of the event specified
 * umapi.eventY(id) - gets the Y tile of the event specified
 * umapi.realEventX(id) - gets the real x position of the event specified.
 * umapi.realEventY(id) - gets the real y position of the event specified.
 * umapi.block() - Stops the ability to touch-to-move on the map.
 * umapi.restore() - Re-enables the ability to touch-to-move on the map.
 * 
 * Using block/restore should be done via the event command "script",
 * optionally, there are plugin commands you can use as well.
*/
let umapi = new class {
    /**
     * @function constructor
     * @desc
     * Sets a backup of the current Scene_Map touch system. 
     * Also grabs the information needed for the param settings.
    */
    constructor() {
        this.backupTouch = Scene_Map.prototype.processMapTouch;

        this.setParamData();
        this.setPluginCommands();
    }

    /**
     * @function setParamData
     * @desc
     * Sets params defined by the user.
    */
    setParamData() {
        this.params = PluginManager.parameters("umapi");
        Scene_Map.prototype.processMapTouch = (this.params['Disable ttm by default']=="true") ? function() {} : Scene_Map.prototype.processMapTouch
    }

    /**
     * @function setPluginCommands
     * @desc
     * Sets the plugin commands.
    */
    setPluginCommands() {
        var $ = this;
        
        var pCommands = Game_Interpreter.prototype.pluginCommand
        Game_Interpreter.prototype.pluginCommand = function(command, args) {
            pCommands.apply(this, arguments);

            if(command == "disableTtm") {
                $.block();
            }

            if(command == "enableTtm") {
                $.restore();
            }
        }
    }

    /**
     * @function tileWidth
     * @desc
     * Returns the default width and height of
     * tiles.
    */
    tileWidth() {
        return Game_Map.prototype.tileWidth();
    }

    /**
     * @function tileHeight
     * @desc
     * Returns the default height and height of
     * tiles.
    */
    tileHeight() {
        return Game_Map.prototype.tileHeight();
    }

    /**
     * @function mapX
     * @desc
     * returns the X position of the screen.
    */
    mapX() {
        return $gameMap._displayX;
    }

    /**
     * @function mapy
     * @desc
     * returns the Y position of the screen.
    */
    mapY() {
        return $gameMap._displayY;
    }

    /**
     * @function block
     * @desc
     * Disables the use of click-to-move while on
     * map.
    */
    block() {
        Scene_Map.prototype.processMapTouch = function() {};
    }

    /**
     * @function restore
     * @desc
     * Restores the ability to click-to-move while on
     * map.
    */
    restore() {
        Scene_Map.prototype.processMapTouch = this.backupTouch;
    }
    
    /**
     * @function touch
     * @desc
     * Detects screen click (not tied to map location)
     * @param {*} x
     * @param {*} y 
     * @param {*} width 
     * @param {*} height 
    */
    touch(x, y, width, height) {
        if((TouchInput._x >= x && 
            TouchInput._x <= x+width) &&
            (TouchInput._y >= y &&
            TouchInput._y <= y+height) &&
            TouchInput._pressedTime==1) {
            return true;
        } else {
            return false;
        }
    }

    /**
     * @function mtouch
     * @desc
     * Detects if a user has clicked a specified area
     * on the map.
     * @param {*} x 
     * @param {*} y 
     * @param {*} width 
     * @param {*} height 
    */
    mtouch(x, y, width, height) {
        var tx = TouchInput._x + (this.mapX()*this.tileWidth());
        var ty = TouchInput._y + (this.mapY()*this.tileHeight());

        if((tx >= x &&
            tx <= x + width) &&
            (ty >= y &&
            ty <= y + height) &&
            TouchInput._pressedTime==1) {
            return true;
        } else {
            return false;
        }
    }

    /**
     * @function gtouch
     * @desc
     * Same as mtouch, but locked to the tile size.
     * Basically, it allows you to click on a tile
     * specified.
     * @param {*} tx 
     * @param {*} ty 
    */
    gtouch(tx, ty) {
        var width = this.tileWidth();
        var height = this.tileHeight();

        var x = (TouchInput._x/width) + this.mapX();
        var y = (TouchInput._y/height) + this.mapY();
        if((x >= tx &&
            x <= tx + 1) &&
            (y >= ty &&
            y <= ty + 1) &&
            TouchInput._pressedTime==1) {
            return true;
        } else {
            return false;
        }
    }

    /**
     * @function eventX
     * @desc
     * returns the x position of specified event.
     * @param {*} id 
    */
    eventX(id) {
        return this.mapX()+$gameMap._events[id]._x;
    }

    /**
     * @function eventY
     * @desc
     * returns the y position of specified event.
     * @param {*} id 
    */
    eventY(id) {
        return this.mapY()+$gameMap._events[id]._y();
    }

    /**
     * @function realEventX
     * @desc
     * returns the real x position of specified event.
     * @param {*} id 
    */
    realEventX(id) {
        return $gameMap._events[id]._x*this.tileWidth();
    }

    /**
     * @function realEventY
     * @desc
     * returns the real y position of specified event.
     * @param {*} id 
    */
    realEventY(id) {
        return $gameMap._events[id]._y*this.tileHeight();
    }

}();