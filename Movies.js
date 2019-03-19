var mongoose = require('mongoose');
var Schema = mongoose.Schema;

mongoose.connect(process.env.DB, { useNewUrlParser: true } );
mongoose.set('useCreateIndex', true);

mongoose.connection.once('open', function () {
    console.log('Connection have been made');
});
// movie schema
var MoviesSchema = new Schema({
    title: {
        type: String,
        required: true,
        index: {unique: true}
        },
    YearRelease:
        {
            type: Number,
            required: true,
        },
    genre: {type: String,
            enum: ['Action', 'Adventure', 'Comedy', 'Drama', 'Fantasy', 'Horror', 'Mystery', 'Thriller', 'Western', 'Fiction'],
            required: true,
            },
    Actors:
        {
            type: Array,
            required: true,
        },
});
// return the model
module.exports = mongoose.model('Movies', MoviesSchema);