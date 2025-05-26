import mongoose,{Schema} from "mongoose";
import { registrationEmailHTML } from "../mailTemplate";

const doctorSchema=Schema({
    //TODO: ADD A SCHEDULE FIELD AS WELL LATER
    user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "User",
    required: true,
    },
    specialization: {
    type: String,
    required: true,
    trim: true,
    },
    experience: {
    type: Number, //in years
    min: 0,
    },
    hospital: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "Hospital",
        required: true,
    },
    hourlyRate: {
        type: Number,
        required: true, // set by hospital
    },
    registrationNumber:{
        type: String,
        required: true,
        unique: true
    },
    verified: {
    type: Boolean,
    default: false,
    },
},{timestamps:true})


export const Doctor=mongoose.model("Doctor", doctorSchema)