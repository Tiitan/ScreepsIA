module.exports = {

    getSpawnInfo: function(mainRoom, creeps) {
        var flag = Game.flags['newColony'];

        if (require('helper').shouldSpawn(creeps, 1, 0) && flag && !flag.memory.controled)
            return { body: [CLAIM, MOVE], role: 'colonist', task: null };
        return null;
    },

    run: function(creep) {
        var flag = Game.flags['newColony'];
        if (flag) {
            // Go to destination room
            if (flag.pos.roomName != creep.room.name) {
                creep.moveTo(flag);
                return;
            } 
            
            // Then claim the controller
            creep.moveTo(creep.room.controller);
            if (creep.claimController(creep.room.controller) == OK)
                flag.memory.controled = true;
        }
    }
};