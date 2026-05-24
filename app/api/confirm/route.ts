import { prisma } from "@/lib/prisma";
import { NextResponse } from "next/server";

export async function POST(req: Request) {
  try {
    const body = await req.json();

    const { reservationId } = body;

    const reservation =
      await prisma.reservation.findUnique({
        where: {
          id: reservationId,
        },
      });

    if (!reservation) {
      return NextResponse.json(
        { error: "Reservation not found" },
        { status: 404 }
      );
    }

    await prisma.reservation.update({
      where: {
        id: reservationId,
      },
      data: {
        status: "confirmed",
      },
    });

    return NextResponse.json({
      success: true,
      message: "Purchase confirmed",
    });

  } catch (error) {
    console.error(error);

    return NextResponse.json(
      { error: "Confirmation failed" },
      { status: 500 }
    );
  }
}