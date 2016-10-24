var structureSpawn = {

    run: function(spawn) {

        if (GetAvailableEnergy(spawn) >= 700)
                trySpawn(spawn);

        function trySpawn(spawn)
        {
            var harvesters = _.filter(Game.creeps, (creep) => creep.memory.role == 'harvester');
            var upgraders = _.filter(Game.creeps, (creep) => creep.memory.role == 'upgrader');
            var builder = _.filter(Game.creeps, (creep) => creep.memory.role == 'builder');
            var repairer = _.filter(Game.creeps, (creep) => creep.memory.role == 'repairer');
            var haulers = _.filter(Game.creeps, (creep) => creep.memory.role == 'hauler');
    
            if(shouldSpawn(harvesters, 2, 30)) {
                spawnHarvester(harvesters);
            }
            else if(shouldSpawn(upgraders, 2, 30)) {
                var newName = spawn.createCreep([WORK, WORK, WORK, WORK, CARRY, CARRY, MOVE, MOVE], undefined, {role: 'upgrader'});
                console.log('Spawning new upgrader: ' + newName);
            }
            else if(builder.length < 1 && spawn.room.find(FIND_CONSTRUCTION_SITES).length > 0) {
                var newName = spawn.createCreep([WORK, WORK, WORK, CARRY, CARRY, MOVE, MOVE, MOVE], undefined, {role: 'builder'});
                console.log('Spawning new builder: ' + newName);
            }
            else if(repairer.length < 0) {
                var newName = spawn.createCreep([WORK, CARRY, MOVE], undefined, {role: 'repairer'});
                console.log('Spawning new repairer: ' + newName);
            }
            else if(haulers.length < 2) {
                spawnHauler(haulers);
            }
        }
        
        function shouldSpawn(roleCreeps, expectedNumber, minLifeTime)
        {
            return (roleCreeps.length < expectedNumber || roleCreeps[0].ticksToLive < minLifeTime || roleCreeps[1].ticksToLive < minLifeTime) && roleCreeps.length < expectedNumber + 1;
        }
        
        function spawnHarvester(harvesters)
        {
            var task = 0;
            if (harvesters.length == 1 && harvesters[0].memory.task == 0)
                task = 1;
            if (harvesters.length == 2)
            {
                task = harvesters[0].ticksToLive < harvesters[1].ticksToLive ? harvesters[0].memory.task : harvesters[1].memory.task;
            }
            
            var newName = spawn.createCreep([WORK, WORK, WORK, WORK, WORK, WORK, CARRY, CARRY, MOVE, MOVE], undefined, {role: 'harvester', task: task});
            console.log('Spawning new harvester: ' + newName);
        }
        
        function spawnHauler(haulers)
        {
            var task = 0;
            if (haulers.length == 1 && haulers[0].memory.task == 0)
                task = 1;
            if (haulers.length == 2)
            {
                task = haulers[0].ticksToLive < haulers[1].ticksToLive ? haulers[0].memory.task : haulers[1].memory.task;
            }
            
            var newName = spawn.createCreep([CARRY, CARRY, CARRY, CARRY, CARRY, CARRY, MOVE, MOVE, MOVE, MOVE, MOVE, MOVE], undefined, {role: 'hauler', task: task});
            console.log('Spawning new hauler: ' + newName);
        }
        
        function GetAvailableEnergy(spawn)
        {
            var totalEnergy = 0;
            var roomStructure = spawn.room.find(FIND_MY_STRUCTURES);
            for(var struct in roomStructure)
                {
                    var energy = roomStructure[struct].energy;
                    if (!isNaN(energy))
                        totalEnergy += roomStructure[struct].energy;
                }
            return totalEnergy; 
        }
    }
};

module.exports = structureSpawn;