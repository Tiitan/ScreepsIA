var structureSpawn = {

    run: function(spawn) {

        if (spawn.spawning)
            return;
        
        var roles = ['hauler', 'harvester', 'upgrader', 'builder', 'repairer', 'thief', 'attacker', 'scoot'];
            
        for(var i = 0; i < roles.length; i++) {
            try {
                roleList = _.filter(Game.creeps, (creep) => creep.memory.role == roles[i])
                var spawnInfo = require('role.' + roles[i]).getSpawnInfo(spawn.room, roleList);
                if (spawnInfo) {
                    trySpawn(spawnInfo);
                    break;
                }
            }
            catch(error) { require('exceptionHandler').print(error); }
        }
        
        function trySpawn(spawnInfo) {
            var newName = spawn.createCreep(spawnInfo.body, undefined, {role: spawnInfo.role, task: spawnInfo.task, mainRoom: spawn.room.name});
            console.log('Spawning new ' + spawnInfo.role + ': ' + newName);
        }
    }
};

module.exports = structureSpawn;