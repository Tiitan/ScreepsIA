module.exports = {

    print: function(error) {
        if (error.stack) error = error.stack;
        console.log(error);
        Game.notify(error);
    }
};