var helper = {

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
    
    getAvailableSource: function(mainRoom, creeps, minLifeTime) {
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
            if (sourceMatch[task] == 0)
                return sources.find((x) => x.task == task);
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
    }
};

module.exports = helper;