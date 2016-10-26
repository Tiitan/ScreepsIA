var mainRoom = {

    run: function(room) {
        if (!room.memory.sources) {
            room.memory.sources = [];
            var sources = room.find(FIND_SOURCES);
            for (var i = 0; i < sources.length; i++) {
                room.memory.sources.push(new source(i, sources[i].pos, sources[i].id)); 
            }
        }
        
        function source(task, pos, id) {
            this.task = task;
            this.serializedPos = pos;
            this.id = id;
        }
    }
};

module.exports = mainRoom;