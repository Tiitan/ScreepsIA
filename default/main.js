var roleHarvester = require('role.harvester');
var roleUpgrader = require('role.upgrader');
var roleBuilder = require('role.builder');
var roleRepairer = require('role.repairer');
var roleHauler = require('role.hauler');

var roleThief = require('role.thief');
var roleAttacker = require('role.attacker');

var structureSpawn = require('structure.spawn');
var structureTower = require('structure.tower');

module.exports.loop = function () {

    for(var name in Memory.creeps) {
        if(!Game.creeps[name]) {
            delete Memory.creeps[name];
            console.log('Clearing non-existing creep memory:', name);
        }
    }

    for(var structId in Game.structures) {
        var structure = Game.structures[structId];
        switch (structure.structureType) {
            case STRUCTURE_SPAWN: structureSpawn.run(structure); break;
            case STRUCTURE_TOWER: structureTower.run(structure); break;
        }
    }

    for(var name in Game.creeps) {
        var creep = Game.creeps[name];
        
        switch (creep.memory.role) {
            case 'harvester': roleHarvester.run(creep); break;
            case 'upgrader':  roleUpgrader.run(creep); break;
            case 'builder':   roleBuilder.run(creep); break;
            case 'repairer':  roleRepairer.run(creep); break;
            case 'hauler':    roleHauler.run(creep); break;
            case 'thief':     roleThief.run(creep); break;
            case 'attacker':  roleAttacker.run(creep); break;
        }
    }
}