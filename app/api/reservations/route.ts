import { prisma } from "@/lib/prisma";
import { NextResponse } from "next/server";

export async function POST(req: Request) {
  try {
    const body = await req.json();

    const { quantity } = body;

    const inventory = await prisma.inventory.findFirst();

    if (!inventory) {
      return NextResponse.json(
        { error: "No inventory found" },
        { status: 404 }
      );
    }

    const availableStock =
      inventory.totalStock - inventory.reservedStock;

    if (availableStock < quantity) {
      return NextResponse.json(
        { error: "Not enough stock available" },
        { status: 409 }
      );
    }

    await prisma.inventory.update({
      where: {
        id: inventory.id,
      },
      data: {
        reservedStock: inventory.reservedStock + quantity,
      },
    });

    const reservation = await prisma.reservation.create({
      data: {
        productId: inventory.productId,
        warehouseId: inventory.warehouseId,
        quantity,
        status: "pending",
        expiresAt: new Date(Date.now() + 10 * 60 * 1000),
      },
    });

    return NextResponse.json({
      success: true,
      reservation,
    });

  } catch (error) {
    console.error(error);

    return NextResponse.json(
      { error: "Reservation failed" },
      { status: 500 }
    );
  }
}