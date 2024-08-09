import connectDB from "@/utils/db";
import { NextResponse } from "next/server";
import DiscountMatrix from "@/model/DiscountMatrix";
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

export const dynamic = "force-dynamic"; // defaults to auto
export const GET = async (request) => {
  checkConnection();
  try {
    const { searchParams } = new URL(request.url);
    const id = searchParams.get("id");
    const doc = await DiscountMatrix.findById(id);
    return NextResponse.json(doc, { status: 200 });
  } catch (error) {
    return new NextResponse("Error while fetching data from server!", {
      status: 500,
    });
  }
};

export const PATCH = async (request) => {
  checkConnection();
  try {
    const body = await request.json();
    const updatedDocument = await DiscountMatrix.findByIdAndUpdate(
      body?.id,
      {
        groupName: body?.groupName,
        partyName: body?.partyName,
        value: body?.value,
      },
      {
        new: true,
      }
    );

    return NextResponse.json(updatedDocument, { status: 200 });
  } catch (error) {
    return new NextResponse("Error while fetching data from server!", {
      status: 500,
    });
  }
};

export const DELETE = async (request) => {
  checkConnection();
  try {
    const body = await request.json();
    await DiscountMatrix.findByIdAndDelete(body?.id);

    return NextResponse.json({ status: 200 });
  } catch (error) {
    return new NextResponse("Error while fetching data from server!", {
      status: 500,
    });
  }
};
