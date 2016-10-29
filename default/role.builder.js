module.exports = {

    getSpawnInfo: function(mainRoom, creeps) {
        
        // Local builder
        // TODO multiroom FIND_CONSTRUCTION_SITES
        if (require("helper").shouldSpawn(creeps, 1, 30) && mainRoom.find(FIND_CONSTRUCTION_SITES).length > 0) {
            return { body: [WORK, WORK, WORK, WORK, CARRY, CARRY, MOVE, MOVE, MOVE, MOVE], role: 'builder', task: null };
        }
        
        // Send builder to colony
        var flag = Game.flags['newColony'];
        if (flag && !flag.memory.builderCount)
            flag.memory.builderCount = 0;
        if (flag && flag.memory.builderCount < 2) {
            return { body: [WORK, WORK, WORK, WORK, CARRY, CARRY, MOVE, MOVE, MOVE, MOVE, MOVE, MOVE], role: 'builder', task: 'newColony' };
        }
        
        return null;
    },

    initialize: function(creep) {
        if (creep.memory.task) {
            var flag = Game.flags[creep.memory.task];
            if (flag) {
                creep.memory.mainRoom = flag.pos.roomName;
                flag.memory.builderCount++;
            }
        }
    },

    onCreepDied: function(creepName) {
        var creepMemory = Memory.creeps[creepName];
        if (creepMemory && creepMemory.task) {
            var flag = Game.flags[creepMemory.task];
            if (flag && flag.memory.builderCount > 0)
              flag.memory.builderCount--;
        }
    },

    run: function(creep) {
	    switch(creep.memory.state) {
	        case 'building': 
	            if (building())
	                creep.memory.state = 'findRessource';
	            break;
            case 'goToTask': 
                if (goToTask())
                    creep.memory.state = 'building';
                break;
            case 'findRessource': 
                if (findRessources()) {
                    if (creep.memory.task && Game.flags[creep.memory.task] && creep.room.name != Game.flags[creep.memory.task].pos.roomName)
                        creep.memory.state = 'goToTask';
                    else
                        creep.memory.state = 'building';
                }
                    
                break;
            default:
                creep.memory.state = 'findRessource';
	    }
	    
        function building() {
            // just arrived at task destination but the spawn construction site is not yet defined.
            if (creep.memory.task && !creep.room.spawns && Game.flags['newColony']) {
                var spawnConstructionSite = Game.spawns.Spawn1.room.find(FIND_CONSTRUCTION_SITES, {
                    filter: { structureType: STRUCTURE_SPAWN }
                });
                if (spawnConstructionSite.length == 0) {
                    creep.room.createConstructionSite(Game.flags['newColony'].pos, STRUCTURE_SPAWN);
                    creep.moveTo(Game.flags['newColony']);
                    //return false; FIXME
                }
            }
            
            // build closest structure
            // TODO: define priority
	        var targets = creep.room.find(FIND_CONSTRUCTION_SITES);
	        targets = _.sortBy(targets, t => creep.pos.getRangeTo(t))
            if(targets.length) {
                if(creep.build(targets[0]) == ERR_NOT_IN_RANGE) {
                    creep.moveTo(targets[0]);
                }
            }
            else {
                if(creep.upgradeController(creep.room.controller) == ERR_NOT_IN_RANGE) {
                    creep.moveTo(creep.room.controller)
                }
            }
            
            // transition
            if (creep.carry.energy == 0)
                return true;
            return false;
        }
        
        function goToTask() {
            var flag = Game.flags[creep.memory.task];
            if (flag) {
                // Go to destination room
                if (!creep.pos.inRangeTo(Game.flags[creep.memory.task].pos, 10)) {
                    return false;
                }
            }

            // arrived
            return true;
        }
        
        function findRessources() {
            if(!lootEnergyNerby(creep) &&
                !findEnergyInClosestContainers(creep) &&
                !harvestClosestSource(creep)) {
                creep.say('Idle');
            }
            
            // Transition
            if (creep.carry.energy == creep.carryCapacity)
                return true;
            return false;
        }
	}
};

function lootEnergyNerby(creep) {
    var targets = creep.pos.findInRange(FIND_DROPPED_ENERGY, 2, {
        filter: (dropppedEnergy) => { return dropppedEnergy.energy > 10;
        }
    });
    if (targets.length > 0) {
        targets = _.sortBy(targets, t => creep.pos.getRangeTo(t))
        if(creep.pickup(targets[0]) == ERR_NOT_IN_RANGE) {
            creep.moveTo(targets[0]);
        }
        return true;
    }
    return false
}

function findEnergyInClosestContainers(creep) {
    targets = creep.room.find(FIND_STRUCTURES, {
    filter: (structure) => {
        return (structure.structureType == STRUCTURE_CONTAINER || structure.structureType == STRUCTURE_STORAGE) && structure.store[RESOURCE_ENERGY] > 300;
    }});
    if (targets.length > 0)
    {
        targets = _.sortBy(targets, t => creep.pos.getRangeTo(t))
        if(creep.withdraw(targets[0], RESOURCE_ENERGY) == ERR_NOT_IN_RANGE) {
            creep.moveTo(targets[0]);
        }
        return true;
    }
    return false;
}

function harvestClosestSource(creep) {
    targets = creep.room.find(FIND_SOURCES);
    if (targets.length > 0) {
        targets = _.sortBy(targets, t => creep.pos.getRangeTo(t));
        if (creep.harvest(targets[0]) == ERR_NOT_IN_RANGE) {
            creep.moveTo(targets[0]);
        }
        return true;
    }
    return false;
}