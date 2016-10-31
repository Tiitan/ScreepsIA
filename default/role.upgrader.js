module.exports = {

    getSpawnInfo: function(mainRoom, creeps) {
        if (!require("helper").shouldSpawn(creeps, 2, 30))
            return null;
        
        if (mainRoom.energyCapacityAvailable < 550) // RCL 1
            var body = [WORK, CARRY, MOVE, MOVE];
        else if (mainRoom.energyCapacityAvailable < 800) // RCL 2
            var body = [WORK, WORK, WORK, CARRY, CARRY, MOVE, MOVE, MOVE];
        else if (mainRoom.energyCapacityAvailable < 1300) // RCL 3
            var body = [WORK, WORK, WORK, WORK, WORK, CARRY, CARRY, MOVE, MOVE, MOVE, MOVE];
        else // RCL 4+
            var body = [WORK, WORK, WORK, WORK, WORK, WORK, CARRY, CARRY, MOVE, MOVE, MOVE, MOVE];
            
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
            var targets = creep.pos.findInRange(FIND_DROPPED_ENERGY, 2);
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