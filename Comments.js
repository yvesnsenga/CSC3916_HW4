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
        enum:['1', '2', '3', '4', '5'],
        required: true,
        unique:false
    },
    user:{
       type: String,
        required: true,
        unique: true
    }
});
// return the model
module.exports = mongoose.model('Comments', CommentSchema);