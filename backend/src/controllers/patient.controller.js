import { Patient } from "../models/patient.model.js";
import { ApiError } from "../utils/ApiError.js";
import { ApiResponse } from "../utils/ApiResponse.js";
import { asyncHandler } from "../utils/asyncHandler.js";

//!AUTHORIZE ROLE MIDDLEWARE ALREADY CHECKS IF ROLE IS PATIENT SO WE DONT HAVE TO CHECK IT IN ANY OF CONTROLLERS

const createPatient=asyncHandler(async(req,res)=>{
    const {gender,dob}=req.body
    const userId=req.user._id;

    if(!gender.trim() || !dob){
        throw new ApiError(400,"all fields are required");
    }

    const patient=await Patient.create(
        {
            user: userId,
            gender,
            dob
        }
    )

    const createdPatient = await Patient.findById(patient._id)
    if (!createdPatient) {
        throw new ApiError(500, "Something went wrong while making patient profile")
    }

    return res.status(201).json(
        new ApiResponse(200, createdPatient, "patient profile created succesfully")
    )

});

const getPatientDetails = asyncHandler(async (req, res) => {
    const userId = req.user._id;

    const patient = await Patient.findOne({ user: userId }).populate("user", "-password -refreshToken");

    if (!patient) {
        throw new ApiError(404, "Patient profile not found");
    }

    res.status(200).json(new ApiResponse(200, patient, "Patient profile fetched successfully"));
});

const appointmentList=asyncHandler(async(req,res)=>{
    const userId = req.user._id;

    const patient = await Patient.findOne({ user: userId });

    if (!patient) {
        throw new ApiError(404, "Patient profile not found");
    }

})


export {
    createPatient,
    getPatientDetails,
}