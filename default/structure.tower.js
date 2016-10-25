var structureTower = {

    run: function(tower) {
        if (tower.energy < 10)
            return;
            
        // Attack ennemy
        var closestHostile = tower.pos.findClosestByRange(FIND_HOSTILE_CREEPS);
        if(closestHostile) 
        {
            tower.attack(closestHostile);
            return;
        }
        
        // Repair building
        var damagedStructures = tower.room.find(FIND_STRUCTURES, {
            filter: (structure) => structure.structureType != STRUCTURE_WALL && structure.structureType != STRUCTURE_RAMPART &&
                                    structure.hits + 300 < structure.hitsMax
        });
        damagedStructures = _.sortBy(damagedStructures, t => t.hits)
        if(damagedStructures.length > 0) {
            tower.repair(damagedStructures[0]);
            return;
        }
        
        // Repair defenses
        damagedStructures = tower.room.find(FIND_STRUCTURES, {
            filter: (structure) => (structure.structureType == STRUCTURE_WALL || structure.structureType == STRUCTURE_RAMPART) &&
                                    structure.hits < 60000
        });
        damagedStructures = _.sortBy(damagedStructures, t => t.hits)
        if(damagedStructures.length > 0) {
            tower.repair(damagedStructures[0]);
        }
    }
};

module.exports = structureTower;