var helper = {

    getRoomPosition: function(serializedRoomPosition) {
        return new RoomPosition(serializedRoomPosition.x, serializedRoomPosition.y, serializedRoomPosition.roomName);
    }
};

module.exports = helper;