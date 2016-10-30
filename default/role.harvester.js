var roleHarvester = {

    getSpawnInfo: function(mainRoom, creeps) {
        if (!require("helper").shouldSpawn(creeps, 2, 45))
            return null;
            
        var task = 0;
        if (creeps.length == 1 && creeps[0].memory.task == 0)
            task = 1;
        if (creeps.length == 2 && creeps[0].memory.task != creeps[1].memory.task)
        {
            task = creeps[0].ticksToLive < creeps[1].ticksToLive ? creeps[0].memory.task : creeps[1].memory.task;
        }
        
        if (mainRoom.energyCapacityAvailable < 550) // RCL 1
            var body = [WORK, WORK, CARRY, MOVE];
        else if (mainRoom.energyCapacityAvailable < 800) // RCL 2
            var body = [WORK, WORK, WORK, CARRY, CARRY, MOVE, MOVE, MOVE];
        else // RCL 3+
            var body = [WORK, WORK, WORK, WORK, WORK, WORK, CARRY, CARRY, MOVE, MOVE];
            
        return { body: body, role: 'harvester', task: task };
    },

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
            else {
                creep.drop(RESOURCE_ENERGY);
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