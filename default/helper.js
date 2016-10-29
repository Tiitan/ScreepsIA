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
};

module.exports = helper;