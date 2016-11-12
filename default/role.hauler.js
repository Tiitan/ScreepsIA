module.exports = {

    getSpawnInfo: function(mainRoom, creeps) {
        
        var helper = require('helper');

        var source = helper.getAvailableSource(mainRoom, _.filter(creeps, (creep) => Number.isInteger(creep.memory.task)), 30, 'hauler');
        // source available for hauler and harvested
        if (source != null && _.filter(Game.creeps, (creep) => creep.memory.role == 'harvester' && creep.memory.mainRoom == mainRoom.name && creep.memory.task == source.task).length > 0) {
            var energyAvailable = creeps.length == 0 ? mainRoom.energyAvailable : mainRoom.energyCapacityAvailable;
            if (energyAvailable < 550) // RCL 1
                var body = [CARRY, CARRY, CARRY, MOVE, MOVE, MOVE];
            else if (energyAvailable < 800) // RCL 2
                var body = [CARRY, CARRY, CARRY, MOVE, MOVE, MOVE];
            else { // RCL 3+
                // TODO: choose body based on distance.
                var bodyMultiplier = 3;
                if (source.carryNeeded) 
                    bodyMultiplier = source.carryNeeded / 2;
                var body = [];
                for (var i = 0; i < bodyMultiplier; i++)
                    Array.prototype.push.apply(body, [CARRY, CARRY, MOVE]);
                    
                if (source.serializedPos.roomName != mainRoom.name) {
                    Array.prototype.push.apply(body, [WORK, WORK, MOVE]);
                }
            }
                
            return { body: body, role: 'hauler', task: source.task };
        }
        
        if (mainRoom.storage && mainRoom.storage.store[RESOURCE_ENERGY] > 200000 && _.filter(creeps, (creep) => creep.memory.role == 'hauler' && creep.memory.task == "storage").length < 1) {
            body = helper.getBody({[CARRY]:10, [MOVE]: 5});
            return { body: body, role: 'hauler', task: "storage" };
        }
        
        return null;
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
    	    
    	    // if outside main room, repair nerby road
    	    if (creep.room.name != creep.memory.mainRoom && creep.body.find(b => b.type == WORK)) {
    	        var targets = creep.pos.findInRange(FIND_STRUCTURES, 2, {
                    filter: function(object){ return object.structureType === STRUCTURE_ROAD && (object.hits < object.hitsMax - 800); }
                });
                
                if(targets.length > 0) {
        	        var sortedTarget = _.sortBy(targets, t => creep.pos.getRangeTo(t));
                    if(creep.repair(sortedTarget[0]) == ERR_NOT_IN_RANGE) {
                        creep.moveTo(sortedTarget[0]);
                    }
                    return;
                }
    	    }
    	    // Fill nearest spawn/extension & controller depot & turret 
            var targets = getDropTarget();
            if(targets) {
                var transferResult = creep.transfer(targets[0], RESOURCE_ENERGY);
                if(transferResult == ERR_NOT_IN_RANGE) {
                    creep.moveTo(targets[0]);
                }
                else if (transferResult == OK && targets.length > 1 && _.sum(creep.carry) > getAvailableCapacity(targets[0])) {
                    creep.moveTo(targets[1]);
                }
                return;
            }
            
            // Default: storage
            if (creep.memory.task != "storage") {
                if(creep.transfer(Game.rooms[creep.memory.mainRoom].storage, RESOURCE_ENERGY) == ERR_NOT_IN_RANGE) {
                    creep.moveTo(Game.rooms[creep.memory.mainRoom].storage);
                }
            }
            
            function getAvailableCapacity(object) {
                if (object.energyCapacity)
                    return object.energyCapacity - object.energy;
                else
                    return object.storeCapacity - _.sum(object.store);
            }
            
            function getDropTarget() {
                // Only fill tower if there is at least 2 haulers for safety
                var haulers = _.filter(Game.creeps, (otherCreep) => otherCreep.memory.role == 'hauler' && creep.memory.mainRoom == otherCreep.memory.mainRoom);

                var targets = Game.rooms[creep.memory.mainRoom].find(FIND_STRUCTURES, {
                    filter: (structure) => {
                        return (((structure.structureType == STRUCTURE_EXTENSION ||structure.structureType == STRUCTURE_SPAWN) && structure.energy < structure.energyCapacity) || 
                                (structure.structureType == STRUCTURE_CONTAINER && structure.pos.inRangeTo(creep.room.controller, 3) && structure.store[RESOURCE_ENERGY] + creep.carryCapacity < structure.storeCapacity) ||
                                (structure.structureType == STRUCTURE_TOWER && structure.energy + creep.carryCapacity <= structure.energyCapacity && haulers.length > 1));
                    }
                });
                if(targets.length > 0) {
                    targets = _.sortBy(targets, t => creep.pos.getRangeTo(t));
                    return targets;
                }
                return null;
            }
    	}
	
    	function findEnergy() {
    	    
    	    // Loot
            var targets = creep.pos.findInRange(FIND_DROPPED_ENERGY, 3, {
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
    	    if (creep.memory.task != "storage")
    	        var target = Memory.rooms[creep.memory.mainRoom].sources.filter((source) => source.task == creep.memory.task)[0];
    	    else
    	        var target = Game.rooms[creep.memory.mainRoom].storage;
	        
	        if (target) {
	            // TODO remove lookup for storage
	            var targetPosition = target.serializedPos ? require('helper').getRoomPosition(target.serializedPos) : target.pos;
	            if (creep.pos.inRangeTo(targetPosition, 2)) {
                    var targets = creep.pos.findInRange(FIND_STRUCTURES, 3, {
                        filter: (structure) => {
                            return structure.structureType == STRUCTURE_CONTAINER || structure.structureType == STRUCTURE_STORAGE;
                        }
                    });
                    if (targets.length > 0) {
                        if(creep.withdraw(targets[0], RESOURCE_ENERGY) == ERR_NOT_IN_RANGE) {
                            creep.moveTo(targets[0]);
                        }
                        return;
                    }
	            }
	            else
	                creep.moveTo(targetPosition)
	        }
    	}
    }
};