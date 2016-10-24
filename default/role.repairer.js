var roleRepairer = {

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
            else
            {
                creep.moveTo(Game.flags['IdleFlag']);
            }
	    }
	    else {
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
            }
            else
                creep.moveTo(Game.flags['IdleFlag'].pos);
	    }
	}
};

module.exports = roleRepairer;