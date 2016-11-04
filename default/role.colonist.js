module.exports = {

    getSpawnInfo: function(mainRoom, creeps) {
        var flag = Game.flags['newColony'];
        if (require('helper').shouldSpawn(creeps, 1, 0) && flag && !flag.memory.controled)
            return { body: [CLAIM, MOVE], role: 'colonist', task: null };
        
        if (mainRoom.memory.reserved) {
            for (var roomName in mainRoom.memory.reserved) {
                if (mainRoom.memory.reserved[roomName].colonist == null)
                    return { body: [CLAIM, MOVE, CLAIM, MOVE], role: 'colonist', task: roomName };
            }
        }
        return null;
    },

    initialize: function(creep) {
        if (creep.memory.task) {
            Game.rooms[creep.memory.mainRoom].memory.reserved[creep.memory.task].colonist = creep.name;
        }
    },

    onCreepDied: function(creepName) {
        var creepMemory = Memory.creeps[creepName];
        if (creepMemory && creepMemory.task && Game.rooms[creepMemory.mainRoom].memory.reserved[creepMemory.task].colonist == creepName) {
            Game.rooms[creepMemory.mainRoom].memory.reserved[creepMemory.task].colonist = null;
        }
    },

    run: function(creep) {
        var target = null;
        if (creep.memory.task)
            target = new RoomPosition(25, 25, creep.memory.task);
        else if (Game.flags['newColony']) {
            target = Game.flags['newColony'].pos;
        }
        
        if (target) {
            // Go to destination room
            if (target.roomName != creep.room.name) {
                creep.moveTo(target);
                return;
            } 
            
            // Then claim or reserve the controller
            creep.moveTo(creep.room.controller);
            if (!creep.memory.task) {
                if (creep.claimController(creep.room.controller) == OK)
                    flag.memory.controled = true;
            }
            else {
                creep.reserveController(creep.room.controller);
            }
            
        }
    }
};