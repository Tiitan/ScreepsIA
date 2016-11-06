var roleHarvester = {

    getSpawnInfo: function(mainRoom, creeps) {
        
        var source = require('helper').getAvailableSource(mainRoom, creeps, 45, 'harvester');
        if (source == null) {
            return null;
        }
        
        var energyAvailable = creeps.length == 0 ? mainRoom.energyAvailable : mainRoom.energyCapacityAvailable;
        if (energyAvailable < 550) // RCL 1
            var body = [WORK, WORK, CARRY, MOVE];
        else if (energyAvailable < 800) // RCL 2
            var body = [WORK, WORK, WORK, CARRY, CARRY, MOVE, MOVE, MOVE];
        else // RCL 3+
            var body = [WORK, WORK, WORK, WORK, WORK, WORK, CARRY, CARRY, MOVE, MOVE];
            
        return { body: body, role: 'harvester', task: source.task };
    },

    run: function(creep) {
        
        //transition
        switch (creep.memory.state) {
            case 'harvest':
                if (creep.carry.energy == creep.carryCapacity) {
                   creep.memory.state = 'drop'; 
                }
                break;
                
            case 'drop':
                if (creep.carry.energy < creep.carryCapacity) {
                   creep.memory.state = 'harvest'; 
                }
                break;
                
            default:
                creep.memory.state = 'harvest'; 
        }
        
        // action
        switch (creep.memory.state) {
            case 'harvest': harvest(); break;
            case 'drop': drop(); break;
        }

	    function drop() {
	        // room start, no hauler left: carry myself
	        if (_.filter(Game.creeps, (findCreep) => findCreep.memory.role == 'hauler' && findCreep.memory.mainRoom == creep.memory.mainRoom).length == 0) {
                var targets = creep.room.find(FIND_STRUCTURES, {
                    filter: (structure) => { return (structure.structureType == STRUCTURE_EXTENSION || structure.structureType == STRUCTURE_SPAWN) && structure.energy < structure.energyCapacity; }
                });
                if(targets.length > 0) {
                    targets = _.sortBy(targets, t => creep.pos.getRangeTo(t))
                    if(creep.transfer(targets[0], RESOURCE_ENERGY) == ERR_NOT_IN_RANGE) {
                        creep.moveTo(targets[0]);
                    }
                    return;
                }
	        }
	        
            var targets = creep.pos.findInRange(FIND_STRUCTURES, 2, {
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
	    
	    function harvest() {
	       
	        var targets = Memory.rooms[creep.memory.mainRoom].sources.filter((source) => source.task == creep.memory.task);
	        if (targets.length > 0) {
	            var targetPosition = require('helper').getRoomPosition(targets[0].serializedPos);
	            if (creep.pos.isNearTo(targetPosition)) {
	                var res = creep.harvest(Game.getObjectById(targets[0].id));
	            }
	            else
	                creep.moveTo(targetPosition)
	        }
	    }
    }
};

module.exports = roleHarvester;