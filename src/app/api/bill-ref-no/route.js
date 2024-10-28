import connectDB from "@/utils/db";
import { NextResponse } from "next/server";
import Purchase from "../../../model/Purchase";
import BILLREFNO from "@/model/BILLREFNO";
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

export const GET = async () => {
  checkConnection();
  try {
    const billRefList = await BILLREFNO.find().sort({ createdAt: -1 });
    return NextResponse.json({ billRefList }, { status: 200 });
  } catch (error) {
    return new NextResponse("Error while fetching data from server!", {
      status: 500,
    });
  }
};

export const POST = async (request) => {
  checkConnection();
  try {
    const data = await request.json();
    const payload = new BILLREFNO({
      name: data?.name,
      index: data?.index,
    });
    await payload.save();
    return new NextResponse("ok", { status: 200 });
  } catch (error) {
    console.log(error);
    return new NextResponse("not ok", { status: 500 });
  }
};

// This will entirely delete the document

export const PUT = async (request) => {
  checkConnection();
  try {
    const data = await request.json();
    await Purchase.findByIdAndDelete({ _id: data._id });
    return new NextResponse("ok", { status: 200 });
  } catch (error) {
    console.log(error);
    return new NextResponse("not ok", { status: 500 });
  }
};
