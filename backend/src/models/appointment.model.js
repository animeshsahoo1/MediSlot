import mongoose,{Schema} from "mongoose";
import mongooseAggregatePaginate from "mongoose-aggregate-paginate-v2";

const appointmentSchema=Schema({
    patient: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "User",
    required: true,
    },
    doctor: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "Doctor",
        required: true,
    },
    hospital: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "Hospital",
        required: true,
    },
    startTime: {
        type: Date,
        required: true,
    },
    endTime: {
        type: Date,
        required: true,
    },
    fee: {
        type: Number,
        required: true,
    },
    status: {
        type: String,
        enum: ["booked", "completed", "cancelled"],
        default: "booked",
    }
},{timestamps:true})

appointmentSchema.plugin(mongooseAggregatePaginate)//?allows you to use pagination on this schema cntrollers
export const Appointment=mongoose.model("Appointment", appointmentSchema)