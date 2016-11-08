module.exports = {

    run: function(tower) {
        if (tower.energy < 10)
            return;
            
        // Attack ennemy
        var closestHostile = tower.pos.findClosestByRange(FIND_HOSTILE_CREEPS);
        if(closestHostile) 
        {
            tower.attack(closestHostile);
            
            // trigger safe mode if walls are too damaged
            if (closestHostile.owner.username != 'Invader' && findDamagedWalls(tower.room, 35000).length > 0) {
                tower.room.controller.activateSafeMode();
                var message = "Safe mode activated in " + tower.room.name + ", attacker: " + closestHostile.owner.username;
                console.log(message)
                Game.notify(message);
            }
            
            return;
        }
        
        // Repair building
        var damagedStructures = tower.room.find(FIND_STRUCTURES, {
            filter: (structure) => structure.structureType != STRUCTURE_WALL && structure.structureType != STRUCTURE_RAMPART &&
                                    structure.hits / structure.hitsMax < 0.9
        });
        damagedStructures = _.sortBy(damagedStructures, t => t.hits)
        if(damagedStructures.length > 0) {
            tower.repair(damagedStructures[0]);
            return;
        }
        
        // Repair defenses
        damagedStructures = findDamagedWalls(tower.room, 100000);
        if(damagedStructures.length > 0) {
                damagedStructures = _.sortBy(damagedStructures, t => t.hits);

            tower.repair(damagedStructures[0]);
        }
    }
};

function findDamagedWalls(room, minimum) {
    return room.find(FIND_STRUCTURES, {
            filter: (structure) => (structure.structureType == STRUCTURE_WALL || structure.structureType == STRUCTURE_RAMPART) &&
                                    structure.hits < minimum
        });
    damagedStructures = _.sortBy(damagedStructures, t => t.hits);
    return damagedStructures;
}