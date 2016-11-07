module.exports = {

    printError: function(error) {
        if (error.stack) error = error.stack;
        console.log(error);
        Game.notify(error);
    },
    
    print: function(message) {
        console.log(message);
        Game.notify(message);
    }
};