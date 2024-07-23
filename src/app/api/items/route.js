import connectDB from "@/utils/db";
import { NextResponse } from "next/server";
import Item from "@/model/Item";
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


export const dynamic = 'force-dynamic' // defaults to auto
export const GET = async () => {
    try {
        checkConnection();
        const result = await Item.find();
        if (result) {
            return NextResponse.json(result, { status: 200 });
        } else {
            return NextResponse.json({ message: "No data found in Database" }, { status: 404 });
        }
    } catch (error) {
        console.log(error);
        return NextResponse.json({ message: "Server failure" }, { status: 500 });
    }
};


