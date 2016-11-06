module.exports.loop = function () {

    var exceptionHandler = require('exceptionHandler');
    
    cleanUp();
    initializeFlags();
    update();
    
    function cleanUp() {
        // Clean flag
        for(var flagName in Memory.flags) {
            if(!Game.flags[flagName]) {
                delete Memory.flags[flagName];
                console.log('Clearing non-existing flag memory:', flagName);
            }
        }
    
        // Clean creep
        for(var name in Memory.creeps) {
            if(!Game.creeps[name]) {
                try {
                    var roleFile = require('role.' + Memory.creeps[name].role);
                    if (roleFile.onCreepDied)
                        roleFile.onCreepDied(name);
                }
                catch(error) { exceptionHandler.print(error) }
                
                delete Memory.creeps[name];
                console.log('Clearing non-existing creep memory:', name);
            }
        }
    }
    
    function initializeFlags() {
        // Initialize new flags
        for (var flagName in Game.flags)
        {
            var flag = Game.flags[flagName];
            if (!flag.memory.mainRoom) {
                try {
                    flag.memory.mainRoom = require('mainRoom').getNearestmainRoom(flag.pos);
                }
                catch(error) { exceptionHandler.print(error) }      
            }
        }
    }
    
    function update() {
        // Update room
        for (var roomName in Game.rooms)
        {
            var room = Game.rooms[roomName];
            if (room.controller && room.controller.my && room.controller.level > 0) {
                try {
                    var mainRoom = require('mainRoom');
                    mainRoom.run(room);
                }
                catch(error) { exceptionHandler.print(error) }
            }
            
            // Detect ennemies
            try {
                var hostiles = room.find(FIND_HOSTILE_CREEPS)
                if (hostiles.length > 0) {
                    var nearestMainRoomName = require('mainRoom').getNearestmainRoom(roomName);
                    if (Game.map.getRoomLinearDistance(roomName, nearestMainRoomName) < 2) {
                        room.memory.invader = hostiles.length;
                        room.memory.invaderSerializedPos = hostiles[0].pos;
                    }
                }
            }
            catch(error) { exceptionHandler.print(error) }
            
        }
    
        // Update structure
        for(var structId in Game.structures) {
            try {
                var structure = Game.structures[structId];
                switch (structure.structureType) {
                    case STRUCTURE_SPAWN:  require('structure.spawn').run(structure); break;
                    case STRUCTURE_TOWER:  require('structure.tower').run(structure); break;
                }
            }
            catch(error) { exceptionHandler.print(error) }
        }
    
        // Update creep
        for(var name in Game.creeps) {
            try {
                var creep = Game.creeps[name];
                if (!creep.spawning) {
                    if (!require('role.common').run(creep))
                        require('role.' + creep.memory.role).run(creep);
                }
            }
            catch(error) { exceptionHandler.print(error) }
        }
    }
}