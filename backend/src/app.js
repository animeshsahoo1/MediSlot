import express from "express"
import cors from "cors"
import cookieParser from "cookie-parser"

const app=express()

//cors middleware
app.use(cors({
    origin: process.env.CORS_ORIGIN,
    credentials: true
}))


app.use(express.json({limit: "64kb"}))//Parses requests with JSON payloads(convertible to json) and makes the data available under req.body.
app.use(express.urlencoded({extended: true, limit: "32kb"}))//Parses incoming requests with URL-encoded payloads and makes the data available under req.body.
app.use(express.static("public"))
app.use(cookieParser())


import userRouter from './routes/user.route.js'
import patientRouter from "./routes/patient.route.js"


app.use("/api/v1/users", userRouter)
app.use("/api/v1/users/patient", patientRouter)



export { app }