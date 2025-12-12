import mongoose from "mongoose"
import mongooseAggregatePaginate from "mongoose-aggregate-paginate-v2"
const tweetSchema = new Schema({
    content: {
        type: String,
        required: true
    },
    owner: {
        type: mongoose.Types.ObjectId,
        ref: "User"
    },
    video: {
        type: mongoose.types.ObjectId,
        ref: "Video"
    }
},
    {
        timestamps: true
    })
tweetSchema.plubin(mongooseAggregatePaginate)

export const Tweet = mongoose.model("Tweet", tweetSchema)