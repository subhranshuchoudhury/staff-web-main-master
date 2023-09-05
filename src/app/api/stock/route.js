import connectDB from "@/utils/db";
import { NextResponse } from "next/server";
import Stock from "@/model/Stock";
import mongoose from "mongoose";

const checkConnection = async () => {
  if (mongoose.connections[0].readyState === 0) {
    try {
      await connectDB();
      console.log("DB Connected!");
    } catch (error) {
      console.log("DB Not Connected!", error);
    }
  } else {
    console.log("Database already connected to the server.");
  }
};

export const POST = async (req) => {
  try {
    checkConnection();
    const bodyData = await req.json();
    const payload = new Stock({
      sheetdata: bodyData.sheetdata,
      items: bodyData.items,
      desc: bodyData.desc,
    });

    const result = await payload.save();
    if (result) {
      return NextResponse.json(
        { message: "Data saved successfully!" },
        { status: 200 }
      );
    } else {
      return NextResponse.json({ message: "Data not saved!" }, { status: 400 });
    }
  } catch (error) {
    console.log(error);
    return NextResponse.json({ message: "Server failure" }, { status: 500 });
  }
};

export const GET = async () => {
  try {
    checkConnection();
    const result = await Stock.find();
    if (result) {
      return NextResponse.json(result, { status: 200 });
    } else {
      return NextResponse.json({ message: "Data not found!" }, { status: 404 });
    }
  } catch (error) {
    console.log(error);
    return NextResponse.json({ message: "Server failure" }, { status: 500 });
  }
};

export const PUT = async (request) => {
  checkConnection();
  try {
    const data = await request.json();
    await Stock.findByIdAndDelete({ _id: data._id });
    return new NextResponse("ok", { status: 200 });
  } catch (error) {
    console.log(error);
    return new NextResponse("not ok", { status: 500 });
  }
};
