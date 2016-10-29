var roleBuilder = {

    getSpawnInfo: function(mainRoom, creeps) {
        // TODO multiroom FIND_CONSTRUCTION_SITES
        if (!require("helper").shouldSpawn(creeps, 2, 30) || mainRoom.find(FIND_CONSTRUCTION_SITES).length == 0)
            return null;
            
        return { body: [WORK, WORK, WORK, WORK, CARRY, CARRY, MOVE, MOVE, MOVE, MOVE], role: 'builder', task: null };
    },

    run: function(creep) {

	    if(creep.memory.building && creep.carry.energy == 0) {
            creep.memory.building = false;
            creep.say('To depot');
	    }
	    if(!creep.memory.building && creep.carry.energy == creep.carryCapacity) {
	        creep.memory.building = true;
	        creep.say('building');
	    }

	    if(creep.memory.building) {
	        var targets = creep.room.find(FIND_CONSTRUCTION_SITES);
	        targets = _.sortBy(targets, t => creep.pos.getRangeTo(t))
            if(targets.length) {
                if(creep.build(targets[0]) == ERR_NOT_IN_RANGE) {
                    creep.moveTo(targets[0]);
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
                return (structure.structureType == STRUCTURE_CONTAINER || structure.structureType == STRUCTURE_STORAGE) && structure.store[RESOURCE_ENERGY] > 300;
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

module.exports = roleBuilder;