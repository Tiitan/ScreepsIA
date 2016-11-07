var structureSpawn = {

    run: function(spawn) {

        if (spawn.hits < spawn.hitsMax) {
            var closestHostile = tower.pos.findClosestByRange(FIND_HOSTILE_CREEPS);
            if (closestHostile) {
                spawn.room.controller.activateSafeMode();
                
                var message = "Safe mode activated in " + spawn.room.name + ", attacker: " + closestHostile.owner.username;
                console.log(message)
                Game.notify(message);
            }
        }

        if (spawn.spawning)
            return;
        
        var roles = ['protector', 'hauler', 'harvester', 'upgrader', 'builder', 'repairer', 'thief', 'colonist', 'scoot', 'attacker'];
            
        for(var i = 0; i < roles.length; i++) {
            try {
                var roleFile = require('role.' + roles[i]);
                var spawnInfo = roleFile.getSpawnInfo(spawn.room, _.filter(Game.creeps, (creep) => creep.memory.role == roles[i] && creep.memory.mainRoom == spawn.room.name));
                if (spawnInfo) {
                    var name = trySpawn(spawnInfo);
                    if (Game.creeps[name] && roleFile.initialize)
                        roleFile.initialize(Game.creeps[name]);
                    break;
                }
            }
            catch(error) { require('logger').printError(error); }
        }
        
        function trySpawn(spawnInfo) {
            var newName = spawn.createCreep(spawnInfo.body, undefined, {role: spawnInfo.role, task: spawnInfo.task, mainRoom: spawn.room.name});
            if (newName != ERR_NOT_ENOUGH_ENERGY)
                console.log('Spawning new ' + spawnInfo.role + ': ' + newName + ' in ' + spawn.name + '(' + spawn.room.name + '), task: ' + spawnInfo.task);
            return newName;
        }
    }
};

module.exports = structureSpawn;