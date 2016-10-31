var roleHarvester = {

    getSpawnInfo: function(mainRoom, creeps) {
        
        var task = getAvailableSourceTask(mainRoom, creeps);
        if (task == null) {
            return null;
        }
        
        if (mainRoom.energyCapacityAvailable < 550) // RCL 1
            var body = [WORK, WORK, CARRY, MOVE];
        else if (mainRoom.energyCapacityAvailable < 800) // RCL 2
            var body = [WORK, WORK, WORK, CARRY, CARRY, MOVE, MOVE, MOVE];
        else // RCL 3+
            var body = [WORK, WORK, WORK, WORK, WORK, WORK, CARRY, CARRY, MOVE, MOVE];
            
        return { body: body, role: 'harvester', task: task };
        
        function getAvailableSourceTask(mainRoom, creeps) {
            var sources = mainRoom.memory.sources.filter((x) => x.task != null);
            
            // init match
            var sourceMatch = {};
            for (var i = 0; i < sources.length; i++) {
                sourceMatch[sources[i].task] = 0;
            }
            
            // count creeps on each task
            for (var name in creeps) {
                var creep = creeps[name];
                if (creep.ticksToLive > 45) {
                    sourceMatch[creep.memory.task] += 1;
                }
            }
            
            // return the first available task
            for (var task in sourceMatch) {
                if (sourceMatch[task] == 0)
                    return task;
            }
            return null;
        }
    },

    run: function(creep) {
	    if(creep.memory.building && creep.carry.energy < creep.carryCapacity) {
            creep.memory.building = false;
	    }
	    if(!creep.memory.building && creep.carry.energy == creep.carryCapacity) {
	        creep.memory.building = true;
	    }

	    if(creep.memory.building) {
	        
	        // Drop
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
	        
	        // Harvest
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