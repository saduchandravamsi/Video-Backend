import mongoose, { Schema } from "mongoose";
const subscriptionSchema = new Schema({
    subscriber: { //One who is subscribing 
        type: Schema.Types.ObjectId,
        ref: "User"
    },
    owner: { //one to whom the subscriber is subscribing
        type: Schema.Types.ObjectId,
        ref: "User"

    }
}, {
    timmestamps: true
})
export const Subscription = mongoose.model("Subscription", subscriptionSchema)