import mongoose, { Schema } from "mongoose";

const notificationSchema = new Schema({
  recipient: {                    //Who receives this notification
    type: mongoose.Schema.Types.ObjectId,
    ref: "User",
    required: true,
  },
  message: {                 
    type: String,
    required: true,
  },
  read: {                       
    type: Boolean,
    default: false,
  },
  data: {                        //Optional: store any extra info (like appointmentId, URLs)
    type: Schema.Types.Mixed,
    default: {},
  },
}, { timestamps: true });

export const Notification = mongoose.model("Notification", notificationSchema);
