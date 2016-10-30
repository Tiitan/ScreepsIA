var roleHauler = {

    getSpawnInfo: function(mainRoom, creeps) {
        
        if (!require('helper').shouldSpawn(creeps, 2, 30))
            return null;
            
        // Define task
        var task = 0;
        if (creeps.length == 1 && creeps[0].memory.task == 0) {
            task = 1;
        }
        else if (creeps.length == 2) {
            task = creeps[0].ticksToLive < creeps[1].ticksToLive ? creeps[0].memory.task : creeps[1].memory.task;
        }
        
        if (mainRoom.energyCapacityAvailable < 550) // RCL 1
            var body = [CARRY, CARRY, CARRY, MOVE, MOVE, MOVE];
        else if (mainRoom.energyCapacityAvailable < 800) // RCL 2
            var body = [CARRY, CARRY, CARRY, MOVE, MOVE, MOVE];
        else { // RCL 3+
            // Choose body based on task. TODO: choose based on distance.
            var body = [CARRY, CARRY, CARRY, CARRY, CARRY, CARRY, MOVE, MOVE, MOVE];
            if (task == 1)
                body.push(CARRY, CARRY, MOVE, CARRY, MOVE);
        }
            
        return { body: body, role: 'hauler', task: task };
    },

    run: function(creep) {

        if(creep.memory.upgrading && creep.carry.energy < 30) {
            creep.memory.upgrading = false;
            creep.say('To depot');
	    }
	    if(!creep.memory.upgrading && creep.carry.energy >= creep.carryCapacity - 30) {
	        creep.memory.upgrading = true;
	        creep.say('Carrying');
	    }

	    if(creep.memory.upgrading) 
	    {
            findDropLocation();
        }
        else {
            findEnergy();
        }
	
	
    	function findDropLocation() {
    	    // Fill spawn & controller depot
            var targets = creep.room.find(FIND_STRUCTURES, {
                filter: (structure) => {
                    return (((structure.structureType == STRUCTURE_EXTENSION ||structure.structureType == STRUCTURE_SPAWN) && structure.energy < structure.energyCapacity) || 
                            (structure.structureType == STRUCTURE_CONTAINER && structure.pos.inRangeTo(creep.room.controller, 3) && structure.store[RESOURCE_ENERGY] + creep.carryCapacity < structure.storeCapacity));
                }
            });
            if(targets.length > 0) {
                targets = _.sortBy(targets, t => creep.pos.getRangeTo(t))
                if(creep.transfer(targets[0], RESOURCE_ENERGY) == ERR_NOT_IN_RANGE) {
                    creep.moveTo(targets[0]);
                }
                return;
            }

            // Fill turret
            target = creep.pos.findClosestByRange(FIND_MY_STRUCTURES, {
                filter: (structure) => {
                    return structure.structureType == STRUCTURE_TOWER && structure.energy + creep.carryCapacity <= structure.energyCapacity;
                }
            });
            if(target) {
                if(creep.transfer(target, RESOURCE_ENERGY) == ERR_NOT_IN_RANGE) {
                    creep.moveTo(target);
                }
                return;
            }
            
            // Default: storage
            if(creep.transfer(creep.room.storage, RESOURCE_ENERGY) == ERR_NOT_IN_RANGE) {
                creep.moveTo(creep.room.storage);
            }
    	}
	
    	function findEnergy() {
    	    
    	    // Loot
            var targets = creep.pos.findInRange(FIND_DROPPED_ENERGY, 2, {
                filter: (dropppedEnergy) => { return dropppedEnergy.energy > 10;
                }
            });
            if (targets.length > 0) {
                targets = _.sortBy(targets, t => creep.pos.getRangeTo(t))
                if(creep.pickup(targets[0]) == ERR_NOT_IN_RANGE) {
                    creep.moveTo(targets[0]);
                }
                return;
            }
            
    	    // Withdraw task container
    	    var sources = creep.room.find(FIND_SOURCES);
            targets = sources[creep.memory.task].pos.findInRange(FIND_STRUCTURES, 2, {
                filter: (structure) => {
                    return structure.structureType == STRUCTURE_CONTAINER;
                }
            });

            if (targets.length > 0)
            {
                if(creep.withdraw(targets[0], RESOURCE_ENERGY) == ERR_NOT_IN_RANGE) {
                    creep.moveTo(targets[0]);
                }
                return;
            }

            // default: move to source
            if (!creep.pos.inRangeTo(sources[creep.memory.task], 2))
                creep.moveTo(sources[creep.memory.task]);
    	}
    }
};

module.exports = roleHauler;