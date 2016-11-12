module.exports = {
    
    getSpawnInfo: function(mainRoom, creeps) {
        var flag = Game.flags['AttackFlag'];
        if (flag && !flag.memory.creepCount)
            flag.memory.creepCount = 0;
        
        var helper = require("helper");
        var flag = Game.flags['AttackFlag'];
        if (helper.shouldSpawn(creeps, 1, 45) && flag && flag.memory.mainRoom == mainRoom.name && flag.memory.creepCount < 1) {
            var body =  helper.getBody({[WORK]: 6, [CARRY]:6, [MOVE]: 12}); // 1500 (RCL5 = 1800)
            return { body: body, role: 'attacker', task: flag.name };
        }
        return null;
    },

    initialize: function(creep) {
        if (creep.memory.task) {
            var flag = Game.flags[creep.memory.task];
            if (flag) {
                flag.memory.creepCount++;
            }
        }
    },

    onCreepDied: function(creepName) {
        var creepMemory = Memory.creeps[creepName];
        if (creepMemory && creepMemory.task) {
            var flag = Game.flags[creepMemory.task];
            if (flag && flag.memory.creepCount > 0)
              flag.memory.creepCount--;
        }
    },

    run: function(creep) {
        if (creep.carry.energy < creep.carryCapacity) {
            // deconstruct the target
            var flag = Game.flags[creep.memory.task];
            if (flag) {
        	    if (!creep.pos.isNearTo(flag))
        	    {
        	        creep.moveTo(flag);
        	    }
        	    else
        	    {
        	        var targets = flag.pos.findInRange(FIND_HOSTILE_CREEPS, 0);
        	        targets = targets.concat(flag.pos.findInRange(FIND_STRUCTURES, 0));
        	        if (targets.length > 0) {
    	                creep.dismantle(targets[0]);
        	        }
        	        else {
        	            console.log(creep.name + ': target destroyed. (' + flag.pos + ')');
    	                flag.remove();
        	        }
        	    }
            }
            else {
                // finished: recycle.
                creep.memory.recycle = true;
            }
        }
        else {
            // drop if full
            var storage = Memory.rooms[creep.memory.mainRoom].storage;
            if (creep.transfer(storage, RESOURCE_ENERGY) == ERR_NOT_IN_RANGE)
                creep.moveTo(storage);   
        }
    }
};