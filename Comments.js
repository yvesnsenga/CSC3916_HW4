var mongoose = require('mongoose');
var Schema = mongoose.Schema;

mongoose.connect(process.env.DB, { useNewUrlParser: true } );
mongoose.set('useCreateIndex', true);
//  schema
var CommentSchema = new Schema({
   comment: {
        type: String,
        required: true,
    },
    title: {
        type: String,
        required: true
    },
    rate: {
       type: Number,
        enum:['1', '2', '3', '4', '5'],
        required: true
    },
    user:{
       type: String,
        required: true,
        index:{unique:true}
    }
});
// return the model
module.exports = mongoose.model('Comments', CommentSchema);