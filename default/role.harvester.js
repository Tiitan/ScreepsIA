var roleHarvester = {

    getSpawnInfo: function(mainRoom, creeps) {
        var helper = require('helper');
        
        var source = helper.getAvailableSource(mainRoom, creeps, 45, 'harvester');
        if (source != null) {
            var energyAvailable = creeps.length == 0 ? mainRoom.energyAvailable : mainRoom.energyCapacityAvailable;
            if (energyAvailable < 550) // RCL 1
                var body = [WORK, WORK, CARRY, MOVE];
            else if (energyAvailable < 800) // RCL 2
                var body = [WORK, WORK, WORK, CARRY, CARRY, MOVE, MOVE, MOVE];
            else // RCL 3+
                var body = [WORK, WORK, WORK, WORK, WORK, WORK, CARRY, CARRY, MOVE, MOVE];
                
            return { body: body, role: 'harvester', task: source.task };
        }
        
        if (mainRoom.find(STRUCTURE_EXTRACTOR) && _.filter(Game.creeps, (creep) => creep.memory.task == "mineral").length == 0) {
            var body = helper.getBody({[WORK]: 10, [CARRY]:2, [MOVE]: 5});
            //return { body: body, role: 'harvester', task: "mineral" };
        }
        
        return null;
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
                if (_.sum(creep.carry) < 10) {
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
	        if (creep.energy > 0 && _.filter(Game.creeps, (findCreep) => findCreep.memory.role == 'hauler' && findCreep.memory.mainRoom == creep.memory.mainRoom).length == 0) {
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
	        
	        // Repair my container if it's not empty or if there is an emergency.
	        var nearbyContainer = creep.memory.containerId ? Game.getObjectById(creep.memory.containerId) : findAndSaveNearbyContainer();
	        if (nearbyContainer && creep.energy > 0 && ((nearbyContainer.hits < nearbyContainer.hitsMax && _.sum(nearbyContainer.store) > 50) || 
	            nearbyContainer.hits < (nearbyContainer.hitsMax / 10))) {
                if(creep.repair(nearbyContainer) == ERR_NOT_IN_RANGE) {
                    creep.moveTo(nearbyContainer);
                }
	        }
	        else if (nearbyContainer && _.sum(nearbyContainer.store) < nearbyContainer.storeCapacity)
            {
                harvest();
                if (creep.pos.isNearTo(nearbyContainer)) {
                    for(var resourceType in creep.carry)
	                    creep.transfer(nearbyContainer, resourceType);
                }
                else
                    creep.moveTo(nearbyContainer);
            }
            else {
                for(var resourceType in creep.carry) {
                	creep.drop(resourceType);
                }
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
           
            if (creep.memory.task != "mineral")
                var targets = Memory.rooms[creep.memory.mainRoom].sources.filter((source) => source.task == creep.memory.task);
            else {
                var targets = Game.rooms[creep.memory.mainRoom].find(LOOK_MINERALS);
            }
            
            if (targets.length > 0) {
                var targetPosition = targets[0].serializedPos ? require('helper').getRoomPosition(targets[0].serializedPos) : targets[0].pos;
                if (creep.pos.isNearTo(targetPosition)) {
                    var res = creep.harvest(targets[0].serializedPos ? Game.getObjectById(targets[0].id) : targets[0]);
                }
                else if (_.sum(creep.carry) == 0) //harvest also called by the drop function to not waste a cycle, so only move if empty
                    creep.moveTo(targetPosition);
            }
        }
    }
};

module.exports = roleHarvester;