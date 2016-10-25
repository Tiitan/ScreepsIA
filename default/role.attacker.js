var roleAttacker = {

    run: function(creep) {

	    if (!creep.pos.isNearTo(Game.flags['AttackFlag']))
	    {
	        creep.moveTo(Game.flags['AttackFlag']);
	    }
	    else
	    {
	        var targets = Game.flags['AttackFlag'].pos.findInRange(FIND_STRUCTURES, 0);
	        creep.attack(targets[0]);
	    }
    }
};

module.exports = roleAttacker;