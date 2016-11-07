module.exports = {

    getRoomPosition: function(serializedRoomPosition) {
        return new RoomPosition(serializedRoomPosition.x, serializedRoomPosition.y, serializedRoomPosition.roomName);
    },
    
    shouldSpawn: function (roleCreeps, expectedNumber, minLifeTime) {
        var hasDyingCreep = false;
        for (i = 0; i < roleCreeps.length; i++) { 
            hasDyingCreep |= roleCreeps[i].ticksToLive < minLifeTime;
        }
        
        return (roleCreeps.length < expectedNumber || hasDyingCreep) && roleCreeps.length < expectedNumber + 1;
    },
    
    getAvailableSource: function(mainRoom, creeps, minLifeTime, type) {
        var sources = mainRoom.memory.sources.filter((x) => x.task != null);
        
        // init match
        var sourceMatch = {};
        for (var i = 0; i < sources.length; i++) {
            sourceMatch[sources[i].task] = 0;
        }
        
        // count creeps on each task
        for (var name in creeps) {
            var creep = creeps[name];
            if (creep.ticksToLive > minLifeTime) {
                sourceMatch[creep.memory.task] += 1;
            }
        }
        
        // return the first available task
        for (var task in sourceMatch) {
            var source = sources.find((x) => x.task == task);
            
            // skip task if room unsafe.
            if (source.serializedPos.roomName != mainRoom.name && Memory.rooms[source.serializedPos.roomName] && 
                    Memory.rooms[source.serializedPos.roomName].invader && Memory.rooms[source.serializedPos.roomName].invader > 0)
                continue;
            
            if (sourceMatch[task] < (((type + 'Count') in source) ? source[type + 'Count'] : 1))
                return source;
        }
        return null;
    },
    
    getBody: function(bodyHash) {
        var body = [];
        for (var part in bodyHash) {
            for (var i = 0; i < bodyHash[part]; i++)
                body.push(part);
        }
        return body;
    },
        
    getBodyCost: function(body) {
        var cost = 0;
        for (var i = 0; i < body.length; i++) {
            cost += BODYPART_COST[body[i]];
        }
        return cost;
    },
    
    getRoomCoordinate: function(roomName) {
        if (roomName.length != 6)
            throw(new Error("Invalid room name in splitRoomName"));
        
        return { 
            qx: roomName.substr(0, 1), 
            x: parseInt(roomName.substr(1, 2)),
            qy: roomName.substr(3, 1), 
            y: parseInt(roomName.substr(4, 2))
        }
    }, 
    
    roomHeuristic: function (roomName, previousRoomName) {
        var forbiddenRooms = [];
        var OWNED_COST = 1;
        var OUTSIDE_SECTOR_COST = 1;
        var INNER_SECTOR_COST = 2;
        
        if (forbiddenRooms.includes(roomName))
            return Infinity;
        
        for (var ownedRoomName in Memory.rooms) {
            if (ownedRoomName == roomName || (Memory.rooms[ownedRoomName].reserved && Memory.rooms[ownedRoomName].reserved[roomName]))
                return OWNED_COST;
        }
        
        var roomCoordinate = require('helper').getRoomCoordinate(roomName);
        if (roomCoordinate.x % 10 == 0 || roomCoordinate.y % 10 == 0)
            return OUTSIDE_SECTOR_COST;
        return INNER_SECTOR_COST;
    }
};