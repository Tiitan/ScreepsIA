module.exports = {

    run: function(room) {
        room.memory.mainRoom = true;
        // find room source (initialisation)
        if (!room.memory.sources) {
            room.memory.sources = [];
            var sources = room.find(FIND_SOURCES);
            for (var i = 0; i < sources.length; i++) {
                room.memory.sources.push(new source(i, sources[i].pos, sources[i].id, getMiningSlot(sources[i].pos))); 
            }
        }
    },
    
    registerNewSource: function(mainRoomName, newSource) {
        var roomMemory = Memory.rooms[mainRoomName];
        if (!roomMemory.sources.some((source) => newSource.id == source.id)) {
            console.log('add source to main room list: ' + newSource.id);
            roomMemory.sources.push(new source(null, newSource.pos, newSource.id, getMiningSlot(newSource.pos)));
        }
    },
    
    getNearestmainRoom: function(position) {
        var nearestRoomName;
        var nearestDistance = Number.POSITIVE_INFINITY;
        for (var roomName in Memory.rooms) {
            if (!Memory.rooms[roomName].mainRoom)
                continue;
            var distance = Game.map.getRoomLinearDistance(roomName, position.roomName);
            if (distance < nearestDistance) {
                nearestRoomName = roomName;
                nearestDistance = distance;
            }
        }
        return nearestRoomName;
    }
};

function source(task, pos, id, slot) {
    this.id = id;
    this.serializedPos = pos;
    this.slot = slot;
    this.task = task;
}

function getMiningSlot(pos) {
    var terrainArray = Game.rooms[pos.roomName].lookForAtArea(LOOK_TERRAIN, pos.y - 1, pos.x - 1, pos.y + 1, pos.x + 1, true);
    return terrainArray.filter((t) => t.terrain == 'plain' || t.terrain == 'swamp').length;
}