export const dynamic = "force-dynamic";
import { prisma } from "@/lib/prisma";
import { NextResponse } from "next/server";

export async function GET() {
  try {
    const inventories = await prisma.inventory.findMany({
      include: {
        product: true,
        warehouse: true,
      },
    });

    const formatted = inventories.map((item) => ({
      inventoryId: item.id,
      productId: item.product.id,
      productName: item.product.name,
      warehouseId: item.warehouse.id,
      warehouseName: item.warehouse.name,
      totalStock: item.totalStock,
      reservedStock: item.reservedStock,
      availableStock: item.totalStock - item.reservedStock,
    }));

    return NextResponse.json(formatted);
  } catch (error) {
    console.error(error);

    return NextResponse.json(
      { error: "Failed to fetch products" },
      { status: 500 }
    );
  }
}