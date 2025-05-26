import { Doctor } from "../models/doctor.model.js";
import { ApiError } from "../utils/ApiError.js";
import { ApiResponse } from "../utils/ApiResponse.js";
import { asyncHandler } from "../utils/asyncHandler.js";

const createDoctor=asyncHandler(async(req,res)=>{
    const userId=req.user._id;
    const {specialization,experience}=req.body

    if(!specialization.trim() || !experience){
        throw new ApiError(400,"all fields are required");
    }
    const doctor=Doctor.create({
        userId,
        specialization,
        experience
    })

})