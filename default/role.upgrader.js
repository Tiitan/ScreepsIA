module.exports = {

    getSpawnInfo: function(mainRoom, creeps) {
        var helper = require("helper");
        var upgraderCount = mainRoom.memory.upgraderCount ? mainRoom.memory.upgraderCount : 2;
        if (!helper.shouldSpawn(creeps, upgraderCount, 30))
            return null;
        
        if (mainRoom.energyCapacityAvailable < 550) // RCL 1
            var body = helper.getBody({[WORK]: 1, [CARRY]:1, [MOVE]: 2});
        else if (mainRoom.energyCapacityAvailable < 800) // RCL 2
            var body = helper.getBody({[WORK]: 3, [CARRY]:2, [MOVE]: 3});
        else if (mainRoom.energyCapacityAvailable < 1300) // RCL 3
            var body = helper.getBody({[WORK]: 5, [CARRY]:2, [MOVE]: 4});
        else  if (mainRoom.energyCapacityAvailable < 1800) // RCL 4
            var body = helper.getBody({[WORK]: 6, [CARRY]:2, [MOVE]: 4});
        else { // RCL 5+ (6=>2300)
            var body = helper.getBody({[WORK]: 8, [CARRY]:2, [MOVE]: 4});
            if (mainRoom.storage && mainRoom.storage.store[RESOURCE_ENERGY] > 50000)
                body = helper.getBody({[WORK]: 11, [CARRY]:5, [MOVE]: 8});
        }
        return { body: body, role: 'upgrader', task: null };
    },

    run: function(creep) {

        if(creep.memory.upgrading && creep.carry.energy == 0) {
            creep.memory.upgrading = false;
            creep.say('To depot');
	    }
	    if(!creep.memory.upgrading && creep.carry.energy > creep.carryCapacity - 30) {
	        creep.memory.upgrading = true;
	        creep.say('upgrading');
	    }

	    if(creep.memory.upgrading) {
            if(creep.upgradeController(creep.room.controller) == ERR_NOT_IN_RANGE) {
                creep.moveTo(creep.room.controller)
            }
        }
        else {
            findEnergy();
        }

	
    	function findEnergy()
    	{
    	    // Loot
            var targets = creep.pos.findInRange(FIND_DROPPED_ENERGY, 10, {
                filter: (dropppedEnergy) => { return dropppedEnergy.energy > 500; }
            });
            if (targets.length > 0) {
                targets = _.sortBy(targets, t => creep.pos.getRangeTo(t))
                if(creep.pickup(targets[0]) == ERR_NOT_IN_RANGE) {
                    creep.moveTo(targets[0]);
                }
                return;
            }
            
    	    // Withdraw controller container
            targets = creep.room.controller.pos.findInRange(FIND_STRUCTURES, 2, {
                filter: (structure) => {
                    return structure.structureType == STRUCTURE_CONTAINER && structure.store[RESOURCE_ENERGY] > 0;
                }
            });
            if (targets.length > 0)
            {
                if(creep.withdraw(targets[0], RESOURCE_ENERGY) == ERR_NOT_IN_RANGE) {
                    creep.moveTo(targets[0]);
                }
                return;
            }
            
            
            // Default if storage: storage
            if (creep.room.storage) {
                if(creep.withdraw(creep.room.storage, RESOURCE_ENERGY) == ERR_NOT_IN_RANGE) {
                    creep.moveTo(creep.room.storage);
                }
                return;
            }
            
            // Default if no storage: spawn (if full)
            var target = creep.pos.findClosestByRange(FIND_STRUCTURES, {
                filter: (structure) => {
                    return structure.structureType == STRUCTURE_SPAWN;
                }
            });
            if (target)
            {
                if(target.energy != target.energyCapacity || creep.withdraw(target, RESOURCE_ENERGY) == ERR_NOT_IN_RANGE) {
                    creep.moveTo(target);
                }
                return;
            }
    	}
    }
};