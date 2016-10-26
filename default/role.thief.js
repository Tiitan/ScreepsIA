var roleThief = {

    run: function(creep) {
        
        if(creep.memory.upgrading && creep.carry.energy < 30) {
            creep.memory.upgrading = false;
            creep.say('To depot');
	    }
	    if(!creep.memory.upgrading && creep.carry.energy >= creep.carryCapacity) {
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
    	    // Fill spawn
            var target = creep.room.storage
            if(target) {
                if(creep.transfer(target, RESOURCE_ENERGY) == ERR_NOT_IN_RANGE) {
                    creep.moveTo(target);
                }
                return;
            }
            
            // Default: return to flag
            creep.moveTo(Game.flags['IdleFlag']);
    	}
	
    	function findEnergy() {
    	    if (!Game.flags['DepotThiefFlag'])
    	        return;
    	    
    	    if (creep.pos.getRangeTo(Game.flags['DepotThiefFlag']) > 100)
    	    {
    	        creep.moveTo(Game.flags['DepotThiefFlag']);
    	        return;
    	    }
    	    else
    	    {
    	        // Steal
    	        var targets = Game.flags['DepotThiefFlag'].pos.findInRange(FIND_STRUCTURES, 10, {
                    filter: (structure) => {
                        return (structure.structureType == STRUCTURE_SPAWN || structure.structureType == STRUCTURE_EXTENSION) && 
                            structure.energy >= 50;
                    }
                });
                if (targets.length > 0) {
    	            targets = _.sortBy(targets, t => creep.pos.getRangeTo(t))
    	            
        	        if (creep.withdraw(targets[0], RESOURCE_ENERGY)  == ERR_NOT_IN_RANGE)
                        creep.moveTo(targets[0]);
                        return;
                }
                
                // loot
                var targets = creep.room.find(FIND_DROPPED_ENERGY, {
                    filter: (dropppedEnergy) => { return dropppedEnergy.energy > 50;
                    }
                });
                if (targets.length > 0) {
                    targets = _.sortBy(targets, t => Game.flags['DepotThiefFlag'].pos.getRangeTo(t))
                    if(creep.pickup(targets[0]) == ERR_NOT_IN_RANGE) {
                        creep.moveTo(targets[0]);
                    }
                    return;
                }
    	    }
    	}
    }
};

module.exports = roleThief;