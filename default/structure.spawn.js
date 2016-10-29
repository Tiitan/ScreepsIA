var structureSpawn = {

    run: function(spawn) {

        if (spawn.spawning)
            return;
        
        var roles = ['hauler', 'harvester', 'upgrader', 'builder', 'repairer', 'thief', 'attacker', 'colonist', 'scoot'];
            
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
            catch(error) { require('exceptionHandler').print(error); }
        }
        
        function trySpawn(spawnInfo) {
            var newName = spawn.createCreep(spawnInfo.body, undefined, {role: spawnInfo.role, task: spawnInfo.task, mainRoom: spawn.room.name});
            console.log('Spawning new ' + spawnInfo.role + ': ' + newName);
            return newName;
        }
    }
};

module.exports = structureSpawn;