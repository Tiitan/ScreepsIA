var roleScoot = {

    getSpawnInfo: function(mainRoom, creeps) {
        if (!require("helper").shouldSpawn(creeps, 1, 0) || !Game.flags['ScootTarget'])
            return null;
            
        return { body: [MOVE], role: 'scoot', task: null };
    },

    run: function(creep) {
        if (Game.flags['ScootTarget'])
            creep.moveTo(Game.flags['ScootTarget']);
        //else
            //console.log('scootIdle');    
    }
};

module.exports = roleScoot;