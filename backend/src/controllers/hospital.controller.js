import { ApiError } from "../utils/ApiError.js";
import { ApiResponse } from "../utils/ApiResponse.js";
import { asyncHandler } from "../utils/asyncHandler.js";
import {Hospital} from "../models/hospital.model.js"
import { getCoordinatesFromAddress } from "../utils/getCoordinates.js";

const createHospital=asyncHandler(async(req,res)=>{
    const { name, street, city, state, country, postcode, contactNumber,HRN }=req.body
    if ([name, street, city, state, country, postcode, contactNumber,HRN].some((field) => field?.trim() === "")){
            throw new ApiError(400, "All fields are required")
        }
    //check for existing user
    const existedHospital = await Hospital.findOne({ HRN });
    if (existedHospital) {
        throw new ApiError(400, "Hospital registration number already exists");
    }
    
    const userId=req.user._id
    const address={name, street, city, state, country, postcode}
    const {lon,lat}=await getCoordinatesFromAddress(address)

    const hospital=await Hospital.create({
        userId,
        name,
        address,
        location: {
            type: "Point",
            coordinates: [lon, lat]
        },
        contactNumber,
        HRN
    })

    if (!hospital) {
        throw new ApiError(500, "Something went wrong while making hospital profile")
    }

    return res.status(201).json(
        new ApiResponse(200, hospital, "hospital profile created succesfully")
    )
    
})

export{
    createHospital,
}