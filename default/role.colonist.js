module.exports = {

    getSpawnInfo: function(mainRoom, creeps) {
        var flag = Game.flags['newColony'];
        if (flag && flag.memory.colonist == null)
            return { body: [CLAIM, MOVE], role: 'colonist', task: null };
        
        if (mainRoom.memory.reserved) {
            for (var roomName in mainRoom.memory.reserved) {
                if (mainRoom.memory.reserved[roomName].colonist == null && Game.rooms[roomName] &&
                    (!Game.rooms[roomName].controller.reservation || Game.rooms[roomName].controller.reservation.ticksToEnd < 2000))
                    return { body: [CLAIM, MOVE, CLAIM, MOVE], role: 'colonist', task: roomName };
            }
        }
        return null;
    },

    initialize: function(creep) {
        if (creep.memory.task) {
            // reservation
            Game.rooms[creep.memory.mainRoom].memory.reserved[creep.memory.task].colonist = creep.name;
        }
        else {
            // new colony
            var flag = Game.flags['newColony'];
            flag.memory.colonist = creep.name;
        }
        
    },

    onCreepDied: function(creepName) {
        var creepMemory = Memory.creeps[creepName];
        if (creepMemory && creepMemory.task && Game.rooms[creepMemory.mainRoom].memory.reserved[creepMemory.task].colonist == creepName) {
            Game.rooms[creepMemory.mainRoom].memory.reserved[creepMemory.task].colonist = null;
        }
        
        if (creepMemory && !creepMemory.task) {
            var flag = Game.flags['newColony'];
            if (flag && flag.memory.colonist == creepName)
                flag.memory.colonist = null;
        }
    },

    run: function(creep) {
        
        var targetRoomName = null;
        var flag = Game.flags['newColony'];
        
        if (creep.memory.task)
            targetRoomName = creep.memory.task;
        else if (flag) {
            targetRoomName = flag.pos.roomName;
        }
        
        if (targetRoomName) {
            // Go to destination room
            if (targetRoomName != creep.room.name) {
                
                if (!creep.memory.path)
                    creep.memory.path = Game.map.findRoute(creep.room.name, targetRoomName, {routeCallback: require('helper').roomHeuristic});
                if (creep.memory.path) {
                    var pathIndex = creep.memory.path.findIndex(x => x.room == creep.room.name);
                    creep.moveTo(creep.pos.findClosestByRange(creep.memory.path[pathIndex + 1].exit));
                }
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