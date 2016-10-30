var roleRepairer = {

    getSpawnInfo: function(mainRoom, creeps) {
        var targets = mainRoom.find(FIND_STRUCTURES, { filter: function(object){ return (object.structureType === STRUCTURE_TOWER); } });
        if (require("helper").shouldSpawn(creeps, 1, 0) && targets.length == 0)
            return { body: [WORK, CARRY, MOVE], role: 'repairer', task: null };
        return null;
    },

    run: function(creep) {

	    if(creep.memory.building && creep.carry.energy == 0) {
            creep.memory.building = false;
            creep.say('To depot');
	    }
	    if(!creep.memory.building && creep.carry.energy == creep.carryCapacity) {
	        creep.memory.building = true;
	        creep.say('repairing');
	    }

	    if(creep.memory.building) {
	        var targets = creep.room.find(FIND_STRUCTURES, {
                filter: function(object){
                    return (object.structureType === STRUCTURE_ROAD || object.structureType === STRUCTURE_CONTAINER) && (object.hits < object.hitsMax);
                }
            });
	        
	        var sortedTarget = _.sortBy(targets, t => creep.pos.getRangeTo(t))
	        
            if(targets.length) {
                if(creep.repair(sortedTarget[0]) == ERR_NOT_IN_RANGE) {
                    creep.moveTo(sortedTarget[0]);
                }
            }
            else {
                creep.say('Idle');
            }
	    }
	    else {
	        // Find in container
            targets = creep.room.find(FIND_STRUCTURES, {
            filter: (structure) => {
                return structure.structureType == STRUCTURE_CONTAINER && structure.store[RESOURCE_ENERGY] > 0;
            }});
            if (targets.length > 0)
            {
                targets = _.sortBy(targets, t => creep.pos.getRangeTo(t))
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

module.exports = roleRepairer;