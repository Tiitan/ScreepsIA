var roleHarvester = {

    run: function(creep) {
        
	    if(creep.memory.building && creep.carry.energy < creep.carryCapacity) {
            creep.memory.building = false;
	    }
	    if(!creep.memory.building && creep.carry.energy == creep.carryCapacity) {
	        creep.memory.building = true;
	    }

	    if(creep.memory.building) {
            targets = creep.pos.findInRange(FIND_STRUCTURES, 2, {
            filter: (structure) => {
                return structure.structureType == STRUCTURE_CONTAINER && structure.store[RESOURCE_ENERGY] < structure.storeCapacity;
            }});
            if (targets.length > 0)
            {
                targets = _.sortBy(targets, t => creep.pos.getRangeTo(t))
                if(creep.transfer(targets[0], RESOURCE_ENERGY) == ERR_NOT_IN_RANGE) {
                    creep.moveTo(targets[0]);
                }
            }
	    }
	    else {
	        var targets = creep.room.memory.sources.filter((source) => source.task == creep.memory.task);
	        if (targets.length > 0) {
	            var targetPosition = require('helper').getRoomPosition(targets[0].serializedPos);
	            if (creep.pos.isNearTo(targetPosition))
	                creep.harvest(Game.getObjectById(targets[0].id));
	            else
	                creep.moveTo(targetPosition)
	        }
	    }
    }
};

module.exports = roleHarvester;