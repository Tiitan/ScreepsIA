module.exports = {
    
    getSpawnInfo: function(mainRoom, creeps) {
        var flag = Game.flags['AttackFlag'];
        if (flag && !flag.memory.creepCount)
            flag.memory.creepCount = 0;
            
        if (require('helper').shouldSpawn(creeps, 1, 45) && Game.flags['AttackFlag'] && flag.memory.creepCount < 1)
            return { body: [ATTACK, ATTACK, ATTACK, ATTACK, MOVE, MOVE, MOVE, MOVE], role: 'attacker', task: flag.name };
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
	                creep.attack(targets[0]);
	                creep.move(targets[0]);
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
};