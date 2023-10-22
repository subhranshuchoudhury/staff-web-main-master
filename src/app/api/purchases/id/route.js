import connectDB from "@/utils/db";
import { NextResponse } from "next/server";
import Purchase from "../../../../model/Purchase";
import mongoose from "mongoose";

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

export const GET = async (request) => {
  checkConnection();
  try {
    const { searchParams } = new URL(request.url);
    const id = searchParams.get("id");
    if (id === "latest") {
      const purchases = await Purchase.find().sort({ _id: -1 }).limit(1);
      return NextResponse.json({ purchases }, { status: 200 });
    }
    const purchases = await Purchase.find({ _id: id });
    return NextResponse.json({ purchases }, { status: 200 });
  } catch (error) {
    return new NextResponse("Error while fetching data from server!", {
      status: 500,
    });
  }
};
