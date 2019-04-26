var mongoose = require('mongoose');
var Schema = mongoose.Schema;

mongoose.connect(process.env.DB, { useNewUrlParser: true } );
mongoose.set('useCreateIndex', true);
//  schema
var CommentSchema = new Schema({
   comment: {
        type: String,
        required: true,
        unique: false
    },
    title: {
        type: String,
         unique:false
    },
    rate: {
       type: Number,
        min: 1,
        max: 5,
        required: true,
        unique:false
    },
    user:{
       type: String,
        required: true,
        unique: false
    }
});
// return the model
module.exports = mongoose.model('Comments', CommentSchema);