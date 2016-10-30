var roleScoot = {

    getSpawnInfo: function(mainRoom, creeps) {
        if (require("helper").shouldSpawn(creeps, 1, 0) && Game.flags['ScootTarget'] && Game.flags['ScootTarget'].memory.mainRoom == mainRoom.name)
            return { body: [MOVE], role: 'scoot', task: 'ScootTarget' };
            
        return null;
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