module.exports = {
    run: function(creep) {
        if (creep.memory.recycle) {
            if (!Game.rooms[creep.memory.mainRoom])
                creep.memory.mainRoom = require('mainRoom').getNearestmainRoom(creep.pos);
                
            var spawns = Game.rooms[creep.memory.mainRoom].find(FIND_STRUCTURES, {
                filter: (structure) => {
                    return structure.structureType == STRUCTURE_SPAWN;
                }
            });
            if (spawns.length > 0) {
                creep.moveTo(spawns[0]);
                spawns[0].recycleCreep(creep) 
            }
            return true;
        }
        return false;
    }
};