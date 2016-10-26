var roleAttacker = {

    run: function(creep) {
        if (Game.flags['AttackFlag']) {
    	    if (!creep.pos.isNearTo(Game.flags['AttackFlag']))
    	    {
    	        creep.moveTo(Game.flags['AttackFlag']);
    	    }
    	    else
    	    {
    	        var targets = Game.flags['AttackFlag'].pos.findInRange(FIND_STRUCTURES, 0);
    	        if (targets.length > 0) {
    	            creep.attack(targets[0]);
    	        }
    	        else {
    	            console.log(creep.name + ': target destroyed. (' + Game.flags['AttackFlag'].pos + ')');
    	            if (Game.flags['AttackFlag2']) {
                        Game.flags['AttackFlag2'].pos.createFlag('AttackFlag');
                        Game.flags['AttackFlag2'].remove();
    	            }
    	            else {
    	                Game.flags['AttackFlag'].remove();
    	            }
    	        }
    	    }
        }
        else {
            creep.moveTo(Game.flags['IdleFlag']);
        }
    }
};

module.exports = roleAttacker;