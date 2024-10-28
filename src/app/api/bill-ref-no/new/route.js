import BILLREFNO from "@/model/BILLREFNO";
import { NextResponse } from "next/server";
import mongoose from "mongoose";
import connectDB from "@/utils/db";

// this is for checking the connection to our mongo database
const checkConnection = async () => {
  if (mongoose.connections[0].readyState === 0) {
    try {
      await connectDB();
      console.log("DB Connected!");
    } catch (error) {
      console.log("DB Not Connected!", error);
    }
  } else {
    console.log("DB Already Connected!");
  }
};

export const GET = async () => {
  checkConnection();
  try {
    // Find the document with the highest index
    const lastBillRef = await BILLREFNO.findOne().sort({ index: -1 });

    // Determine the new index value (if no documents exist, start from 1)
    const newIndex = lastBillRef ? lastBillRef.index + 1 : 1;

    // Create a new label using the incremented index
    const newLabel = await BILLREFNO.create({
      name: `APP/${newIndex}/SERIES`, // Example name using the desired format
      index: newIndex,
      isUsed: false,
    });

    return NextResponse.json({ newLabel: newLabel.label }, { status: 200 });
  } catch (error) {
    console.error("Error while creating new label:", error);
    return new NextResponse("Error while creating new label!", { status: 500 });
  }
};
