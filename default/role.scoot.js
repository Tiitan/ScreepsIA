var roleScoot = {

    getSpawnInfo: function(mainRoom, creeps) {
        if (!require("helper").shouldSpawn(creeps, 0, 0) || !Game.flags['ScootTarget'])
            return null;
            
        return { body: [MOVE], role: 'scoot', task: null };
    },

    initialize: function(creep) {
        creep.memory.reportedRoom = {};
    },

    run: function(creep) {
        if (Game.flags['ScootTarget'])
            creep.moveTo(Game.flags['ScootTarget']);

        if (!creep.memory.reportedRoom[creep.room.name]) {
            var sources = creep.room.find(FIND_SOURCES);
            for (var i = 0; i < sources.length; i++)
                require('mainRoom').registerNewSource(creep.memory.mainRoom, sources[i]);
            creep.memory.reportedRoom[creep.room.name] = {};
        }
    }
};

module.exports = roleScoot;