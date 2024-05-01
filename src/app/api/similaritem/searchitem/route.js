import connectDB from "@/utils/db";
import { NextResponse } from "next/server";
import SimilarItem from "@/model/SimilarItem";
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

        const searchItem = bodyData.searchItem.toUpperCase();

        console.log(searchItem);

        const item = await SimilarItem.findOne({ 'similarList.itemName': searchItem }).select('itemName');

        return NextResponse.json(item, { status: 200 });

    } catch (error) {
        console.log(error);
        return NextResponse.json({ message: "Server failure" }, { status: 500 });
    }
};

export const GET = async () => {
    try {
        // checkConnection();
        // const result = await SimilarItem.find();
        // if (result) {
        //     return NextResponse.json(result, { status: 200 });
        // } else {
        //     return NextResponse.json({ message: "Data not found!" }, { status: 404 });
        // }

        return NextResponse.json({ message: "Do a post request instead." }, { status: 200 });
    } catch (error) {
        console.log(error);
        return NextResponse.json({ message: "Server failure" }, { status: 500 });
    }
};


