"use client";

import React, { useState, useEffect } from "react";
import { Heart, Sparkles, Coffee, Sun, Moon, Smile, RefreshCw } from "lucide-react";

const CHEER_MESSAGES = [
  "Chúc vợ yêu một ngày làm việc thật vui vẻ, buôn may bán đắt và luôn cười tươi nhé! 🌸",
  "Hôm nay em trông rất rạng rỡ và tuyệt vời! Cố gắng lên nhé, anh luôn ở bên ủng hộ em! 💕",
  "Mỗi đơn hàng thành công là minh chứng cho sự chăm chỉ của em. Tự hào về vợ nhiều lắm! ✨",
  "Làm việc nhưng nhớ uống đủ nước và nghỉ ngơi đôi mắt xíu nha em yêu! ☕💖",
  "Vợ của anh giỏi nhất trần đời! Chúc kho hàng hôm nay xuất đơn liên tục vèo vèo nhé! 🚀",
  "Cảm ơn em vì đã luôn chu đáo, chăm chút từng món hàng. Yêu em rất nhiều! 💌",
  "Hôm nay bận rộn nhiều rồi, tối về anh mời em món ngon nhé! Thả tim cho vợ nè ❤️",
];

interface FloatingHeart {
  id: number;
  x: number;
  y: number;
  size: number;
  rotation: number;
}

export function CheerUpWidget({ completedOrdersToday = 0 }: { completedOrdersToday?: number }) {
  const [messageIndex, setMessageIndex] = useState(0);
  const [hearts, setHearts] = useState<FloatingHeart[]>([]);
  const [heartCount, setHeartCount] = useState(0);
  const [timeGreeting, setTimeGreeting] = useState({
    icon: Sun,
    text: "Chúc vợ yêu một ngày rực rỡ!",
  });

  useEffect(() => {
    const hour = new Date().getHours();
    if (hour >= 5 && hour < 12) {
      setTimeGreeting({ icon: Coffee, text: "Chào buổi sáng vợ yêu! Năng lượng ngập tràn nhé ☕" });
      setMessageIndex(0);
    } else if (hour >= 12 && hour < 18) {
      setTimeGreeting({ icon: Sun, text: "Buổi chiều suôn sẻ, chốt đơn tới tấp nha em! ☀️" });
      setMessageIndex(1);
    } else {
      setTimeGreeting({ icon: Moon, text: "Buổi tối an lành, làm xong sớm nghỉ ngơi nha vợ yêu 🌙" });
      setMessageIndex(3);
    }
  }, []);

  const handleNextMessage = () => {
    setMessageIndex((prev) => (prev + 1) % CHEER_MESSAGES.length);
  };

  const handleSendHeart = (e: React.MouseEvent<HTMLButtonElement>) => {
    const rect = e.currentTarget.getBoundingClientRect();
    const newHearts: FloatingHeart[] = Array.from({ length: 6 }).map((_, i) => ({
      id: Date.now() + i,
      x: rect.left + rect.width / 2 + (Math.random() * 40 - 20),
      y: rect.top + (Math.random() * 10 - 5),
      size: Math.floor(Math.random() * 12) + 16,
      rotation: Math.floor(Math.random() * 60) - 30,
    }));

    setHearts((prev) => [...prev, ...newHearts]);
    setHeartCount((prev) => prev + 1);

    setTimeout(() => {
      setHearts((prev) => prev.filter((h) => !newHearts.some((nh) => nh.id === h.id)));
    }, 1500);
  };

  const GreetingIcon = timeGreeting.icon;

  return (
    <>
      {/* Floating Hearts Container */}
      <div className="fixed inset-0 pointer-events-none z-50 overflow-hidden">
        {hearts.map((h) => (
          <div
            key={h.id}
            style={{
              left: `${h.x}px`,
              top: `${h.y}px`,
              fontSize: `${h.size}px`,
              transform: `rotate(${h.rotation}deg)`,
            }}
            className="absolute -translate-x-1/2 -translate-y-1/2 animate-float-heart select-none text-rose-500"
          >
            ❤️
          </div>
        ))}
      </div>

      {/* Main Love Cheer Card */}
      <div className="relative overflow-hidden rounded-2xl bg-gradient-to-r from-[#FFF5F5] via-[#FFF0F2] to-[#FAF2EE] border border-[#FCD5D9] p-5 sm:p-6 shadow-claude-xs">
        {/* Subtle Decorative Background Hearts */}
        <div className="absolute right-3 top-3 text-rose-100/60 pointer-events-none select-none text-7xl font-serif">
          ♥
        </div>

        <div className="relative z-10 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div className="space-y-2 max-w-2xl">
            {/* Tagline */}
            <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold bg-white text-rose-700 border border-rose-200 shadow-2xs">
              <GreetingIcon className="w-3.5 h-3.5 text-rose-500" />
              <span>{timeGreeting.text}</span>
            </div>

            {/* Motivational Warm Message */}
            <div className="space-y-1">
              <p className="font-serif text-base sm:text-lg font-bold text-[#191716] leading-snug">
                &ldquo;{CHEER_MESSAGES[messageIndex]}&rdquo;
              </p>
              <p className="text-xs text-[#78716C] font-medium flex items-center gap-1">
                <span>Dành riêng cho cô chủ nhỏ chăm chỉ</span>
                <span>•</span>
                <span className="text-rose-600 font-bold">Chồng yêu của em ❤️</span>
              </p>
            </div>
          </div>

          {/* Interactive Cheer Action Buttons */}
          <div className="flex items-center gap-2.5 shrink-0">
            {/* Đổi câu chúc khác */}
            <button
              onClick={handleNextMessage}
              title="Xem thêm lời chúc khác"
              className="p-2.5 rounded-xl bg-white hover:bg-[#FAF8F5] text-[#57534E] hover:text-[#191716] border border-[#E8E4DC] transition-all shadow-2xs active:scale-95 flex items-center gap-1.5 text-xs font-semibold"
            >
              <RefreshCw className="w-3.5 h-3.5 text-[#CC785C]" />
              <span className="hidden sm:inline">Đổi câu khác</span>
            </button>

            {/* Nút gửi tim ngọt ngào */}
            <button
              onClick={handleSendHeart}
              className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl bg-gradient-to-r from-rose-500 to-rose-600 hover:from-rose-600 hover:to-rose-700 text-white text-xs font-bold shadow-xs transition-all active:scale-95 group"
            >
              <Heart className="w-4 h-4 text-white fill-white group-hover:scale-125 transition-transform" />
              <span>Thêm Năng Lượng! {heartCount > 0 ? `(${heartCount})` : ""}</span>
            </button>
          </div>
        </div>
      </div>
    </>
  );
}
