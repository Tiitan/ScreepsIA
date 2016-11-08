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
                if (_.sum(creep.carry) == creep.carryCapacity) {
                   creep.memory.state = 'drop'; 
                }
                break;
                
            case 'drop':
                if (_.sum(creep.carry) == 0) {
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
	        
	        // Repair my container if no one does.
	        var nearbyContainer = creep.memory.containerId ? Game.getObjectById(creep.memory.containerId) : findAndSaveNearbyContainer();
	        if (nearbyContainer && nearbyContainer.hits < nearbyContainer.hitsMax) {
                if(creep.repair(nearbyContainer) == ERR_NOT_IN_RANGE) {
                    creep.moveTo(nearbyContainer);
                }
	        }
	        else if (nearbyContainer && nearbyContainer.store[RESOURCE_ENERGY] < nearbyContainer.storeCapacity)
            {
                harvest();
                if(creep.transfer(nearbyContainer, RESOURCE_ENERGY) == ERR_NOT_IN_RANGE) {
                    creep.moveTo(nearbyContainer);
                }
            }
            else {
                creep.drop(RESOURCE_ENERGY);
                harvest();
            }
	    }
	    
	    function findAndSaveNearbyContainer() {
            var targets = creep.pos.findInRange(FIND_STRUCTURES, 2, {
                filter: (structure) => {
                    return structure.structureType == STRUCTURE_CONTAINER;
                }
            });
            if (targets.length > 0) {
                targets = _.sortBy(targets, t => creep.pos.getRangeTo(t));
                creep.memory.containerId = targets[0].id;
                return targets[0];
            }
            return null;
	    }
	    
	    function harvest() {
	       
	        var targets = Memory.rooms[creep.memory.mainRoom].sources.filter((source) => source.task == creep.memory.task);
	        if (targets.length > 0) {
	            var targetPosition = require('helper').getRoomPosition(targets[0].serializedPos);
	            if (creep.pos.isNearTo(targetPosition)) {
	                var res = creep.harvest(Game.getObjectById(targets[0].id));
	            }
	            else if (_.sum(creep.carry) == 0) //harvest also called by the drop function to not waste a cycle, so only move if empty
	                creep.moveTo(targetPosition);
	        }
	    }
    }
};

module.exports = roleHarvester;