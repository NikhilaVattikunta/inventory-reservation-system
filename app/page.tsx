"use client";

import { useEffect, useState } from "react";

export default function Home() {
  const [products, setProducts] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);
  const [expiry, setExpiry] = useState("");
  const [timer, setTimer] = useState("");
  const [reservationId, setReservationId] = useState("");

  async function fetchProducts() {
    try {
      const res = await fetch("/api/products");

      const data = await res.json();

      setProducts(data);
    } catch (error) {
      console.error(error);
    }
  }

  async function reserveStock() {
    try {
      setLoading(true);

      const res = await fetch("/api/reservations", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          quantity: 1,
        }),
      });

      const data = await res.json();

      if (data.success) {
        alert("Reservation Successful!");

        setExpiry(data.reservation.expiresAt);

        setReservationId(data.reservation.id);

        fetchProducts();
      } else {
        alert(data.error || "Reservation Failed");
      }
    } catch (error) {
      console.error(error);

      alert("Something went wrong");
    } finally {
      setLoading(false);
    }
  }

  async function confirmPurchase() {
    try {
      if (!reservationId) {
        alert("No reservation found");
        return;
      }

      const res = await fetch("/api/confirm", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          reservationId,
        }),
      });

      const data = await res.json();

      if (data.success) {
        alert("Purchase Confirmed!");

        setTimer("");

        fetchProducts();
      } else {
        alert(data.error || "Confirmation Failed");
      }
    } catch (error) {
      console.error(error);

      alert("Something went wrong");
    }
  }

  useEffect(() => {
    fetchProducts();
  }, []);

  useEffect(() => {
    if (!expiry) return;

    const interval = setInterval(() => {
      const now = new Date().getTime();

      const end = new Date(expiry).getTime();

      const distance = end - now;

      if (distance <= 0) {
        setTimer("Expired");

        clearInterval(interval);

        return;
      }

      const minutes = Math.floor(
        (distance % (1000 * 60 * 60)) / (1000 * 60)
      );

      const seconds = Math.floor(
        (distance % (1000 * 60)) / 1000
      );

      setTimer(`${minutes}m ${seconds}s`);
    }, 1000);

    return () => clearInterval(interval);
  }, [expiry]);

  return (
    <main className="min-h-screen bg-black text-white p-10">
      <div className="mb-10">
        <h1 className="text-5xl font-bold">
          Smart Inventory Reservation System
        </h1>

        <p className="text-gray-400 mt-3">
          Reserve products in real-time with automatic stock tracking.
        </p>
      </div>

      {timer && (
        <div className="mb-6 p-4 border border-green-500 rounded-xl text-green-400 flex items-center justify-between">
          <span>
            Reservation expires in: {timer}
          </span>

          <button
            onClick={confirmPurchase}
            className="bg-green-600 hover:bg-green-700 px-4 py-2 rounded-lg text-white"
          >
            Confirm Purchase
          </button>
        </div>
      )}

      <div className="grid gap-6">
        {products.map((item) => (
          <div
            key={item.inventoryId}
            className="border border-gray-700 rounded-2xl p-6 shadow-lg"
          >
            <h2 className="text-2xl font-semibold">
              {item.productName}
            </h2>

            <p className="mt-2 text-gray-300">
              Warehouse: {item.warehouseName}
            </p>

            <p className="mt-1 text-gray-300">
              Available Stock: {item.availableStock}
            </p>

            <button
              onClick={reserveStock}
              disabled={loading}
              className="mt-4 bg-white text-black px-5 py-2 rounded-lg font-medium hover:bg-gray-200"
            >
              {loading ? "Reserving..." : "Reserve Now"}
            </button>
          </div>
        ))}
      </div>
    </main>
  );
}