module.exports = {
    
    getSpawnInfo: function(mainRoom, creeps) {
        
        for(var roomName in Memory.rooms) {
            if (Memory.rooms[roomName].invader > 0 && !Memory.rooms[roomName].protector && 
                require('mainRoom').getNearestmainRoom(roomName) == mainRoom.name && Game.map.getRoomLinearDistance(roomName, mainRoom.name) < 2) {
                    
                if (mainRoom.energyCapacityAvailable < 550) // RCL 1
                    var body = helper.getBody({[TOUGH]: 1, [ATTACK]:2, [MOVE]: 3});
                else if (mainRoom.energyCapacityAvailable < 800) // RCL 2
                    var body = helper.getBody({[TOUGH]: 1, [ATTACK]:4, [MOVE]: 5});
                else if (mainRoom.energyCapacityAvailable < 1300) // RCL 3
                    var body = helper.getBody({[TOUGH]: 1, [ATTACK]:8, [MOVE]: 9});
                else  if (mainRoom.energyCapacityAvailable < 1800) // RCL 4
                    var body = helper.getBody({[TOUGH]: 2, [ATTACK]:12, [MOVE]: 14});
                else // RCL 5+ (6=>2300)
                    var body = helper.getBody({[TOUGH]: 2, [ATTACK]:12, [MOVE]: 14});
                    
                return { body: body, role: 'protector', task: roomName };
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



