module.exports = {
    
    getSpawnInfo: function(mainRoom, creeps) {
        
        for(var roomName in Memory.rooms) {
            if (Memory.rooms[roomName].invader > 0 && !Memory.rooms[roomName].protector && 
                require('mainRoom').getNearestmainRoom(roomName) == mainRoom.name && Game.map.getRoomLinearDistance(roomName, mainRoom.name) < 2) {
                return { body: [TOUGH, ATTACK, ATTACK, ATTACK, ATTACK, ATTACK, MOVE, MOVE, MOVE, MOVE, MOVE, MOVE], role: 'protector', task: roomName };
            }
        }
        
        return null;
    },

    initialize: function(creep) {
        Memory.rooms[creep.memory.task].protector++;
    },

    onCreepDied: function(creepName) {
        var creepMemory = Memory.creeps[creepName];
        if (Memory.rooms[creepMemory.task].protector > 0)
            Memory.rooms[creepMemory.task].protector--;
    },

    run: function(creep) {
        // Move to ennemy location
        if (creep.room.name != creep.memory.task) {
            creep.moveTo(require('helper').getRoomPosition(Memory.rooms[creep.memory.task].invaderSerializedPos));
        }
        else {
            // Engage
            var hostiles = creep.room.find(FIND_HOSTILE_CREEPS);
            if (hostiles.length > 0) {
                hostiles = _.sortBy(hostiles, t => creep.pos.getRangeTo(t))
                creep.attack(hostiles[0]);
                creep.moveTo(hostiles[0]);
            }
            else {
                // room secured
                delete creep.room.memory.invaderSerializedPos;
                delete creep.room.memory.invader;
                creep.memory.recycle = true;
            }
        }
    }
};



