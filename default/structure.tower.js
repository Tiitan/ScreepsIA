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
            filter: (structure) => structure.hits + 300 < structure.hitsMax
        });
        damagedStructures = _.sortBy(damagedStructures, t => t.hits)
        if(damagedStructures.length > 0) {
            tower.repair(damagedStructures[0]);
        }
    }
};

module.exports = structureTower;