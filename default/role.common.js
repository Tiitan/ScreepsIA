module.exports = {
    // Override the custom behavior if true is returned.
    run: function(creep) {
        //Recycle this creep
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
        
        // if creep is civilian, flee if close to an ennemy threat
        if (creep.body.find(b => b.type == CARRY)) {
            var closeHostiles = creep.pos.findInRange(FIND_HOSTILE_CREEPS, 8);
            for (var i in closeHostiles) {
                if (closeHostiles[i].body.find(b => (b.type == ATTACK || b.type == RANGED_ATTACK) && b.hits > 0)) {
                    var spawn = Game.rooms[creep.memory.mainRoom].find(STRUCTURE_SPAWN);
                    if (spawn)
                        creep.moveTo(spawn.pos);
                    return true;
                }
            }
        }
        
        return false;
    }
};